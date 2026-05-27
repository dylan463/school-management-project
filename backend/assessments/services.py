from .models import (
    Assessment,Grade,EnrollmentResult,Debt,Enrollment
)
from structures.models import SchoolYear,CourseModule
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import Prefetch
from collections import defaultdict
from .query import attend_to_assessment,has_no_grade_in_assessment,promoted_people,people_with_course_debt
from .serializers import AttendantSerializer



# ----------------- enrollment -----------------

@transaction.atomic
def create_enrollment(data: dict):
    if Enrollment.objects.filter(
        student=data["student"],
        school_year=data["school_year"]
    ).exists():
        raise ValidationError({
            "student": "Cet étudiant est déjà inscrit pour cette année scolaire."
        })

    return Enrollment.objects.create(**data)


@transaction.atomic
def change_enrollment_status(enrollment: Enrollment, status: str):
    if status not in Enrollment.Status.values:
        raise ValidationError({
            "status": "Décision invalide."
        })
    active_sy = SchoolYear.objects.filter(status=SchoolYear.Status.ACTIVE).first()

    if not active_sy:
        raise ValidationError({
            "detail":"Modification Impossible : aucune année scolaire active"
        })

    # if active_sy.id == enrollment.school_year.id:
    #     if status == Enrollment.Status.ACTIVE:
    #         Debt.objects.filter(enrollment=enrollment).delete()
    #     else:
    #         resutls = EnrollmentResult.objects.filter(enrollment=enrollment)
    #         debts = []
    #         for result in resutls:
    #             debts.append({})
    # else:
    #     pass

    enrollment.status = status
    enrollment.save()
    return enrollment


@transaction.atomic
def delete_enrollment(enrollment : Enrollment):
    if EnrollmentResult.objects.filter(enrollment=enrollment).exists():
        raise ValidationError({
            'detail':'suppression impossible : des résultat y sont encore référencés'
        })
    enrollment.delete()


@transaction.atomic
def create_assessment(data: dict):
    session = data.get("session")

    course_module = CourseModule.objects.get(
        id=data.get("course_module").id
    )

    school_year = SchoolYear.objects.get(
        id=data.get("school_year").id
    )

    if session == "RETAKE":
        if not Assessment.objects.filter(
            session="NORMAL",
            course_module=course_module,
            school_year=school_year,
            is_published=True
        ).exists():

            raise ValidationError(
                "veillez publier une session normal avant d'entamer un rattrappage"
            )

    return Assessment.objects.create(**data)


def compute_weighted_score(grades):
    weighted = [(g.score, g.assessment.grade_weight) for g in grades]
    total_weight = sum(w for _, w in weighted)
    return sum(s * w for s, w in weighted) / total_weight

@transaction.atomic
def update_results(course_module):
    school_year = SchoolYear.objects.get(status="ACTIVE")
    if school_year is None:
        raise ValidationError("vous ne pouvez publier les résultat que pendant une année scolaire active")

    def get_grades(session):
        assessments = Assessment.objects.filter(
            course_module=course_module, school_year=school_year,
            session=session, is_published=True
        )
        return Grade.objects.filter(assessment__in=assessments).select_related("enrollment", "assessment")

    def group_by_enrollment(grades):
        groups = defaultdict(list)
        for g in grades:
            groups[g.enrollment].append(g)
        return groups

    def process_session(session, validated_status):
        for enrollment, grades in group_by_enrollment(get_grades(session)).items():
            # if session == "RETAKE":
            #     if EnrollmentResult.objects.filter(enrollment=enrollment,status = "VALIDATED").exists():
            #         for grade in grades:
            #             grade.delete()
            #     continue
            score = round(compute_weighted_score(grades), 2)
            status = validated_status if score >= course_module.min_val_score else 'NOT_VALIDATED'
            result, created = EnrollmentResult.objects.get_or_create(
                enrollment=enrollment, course_module=course_module,
                defaults={"final_score": score, "status": status}
            )
            if not created:
                result.final_score = score
                result.status = status
                result.save()

    has_published_assessments = Assessment.objects.filter(
        course_module=course_module, school_year=school_year, is_published=True
    ).exists()

    if has_published_assessments:
        process_session("NORMAL", "VALIDATED")
        process_session("RETAKE", "VALIDATED_AFTER_RETAKE")
    else:
        EnrollmentResult.objects.filter(
            enrollment__in=Enrollment.objects.filter(promoted_people(course_module, school_year)),
            course_module=course_module
        ).delete()

        debt_attendants = Enrollment.objects.filter(
            people_with_course_debt(course_module)
        ).prefetch_related(
            Prefetch("debts", queryset=Debt.objects.filter(course_module=course_module))
        ).prefetch_related(
            Prefetch("enrollment_results", queryset=EnrollmentResult.objects.filter(course_module=course_module))
        )

        for debt_attendant in debt_attendants:
            result = debt_attendant.enrollment_results.first()
            debt = debt_attendant.debts.first()

            if result is not None and debt is not None:
                # Fix #3 : .update() sur instance → assignation + .save()
                result.final_score = debt.original_score
                result.status = debt.original_status
                result.save()



@transaction.atomic
def publish_assessment_result(assessment : Assessment):
    if assessment.session == "RETAKE":
        published_normal_session = Assessment.objects.filter(course_module=assessment.course_module, school_year=assessment.school_year, session="NORMAL", is_published=True)
        if not published_normal_session.exists():
            raise ValidationError("La session normale doit être publiée avant la session de rattrapage")
    else:
        published_retake_session = Assessment.objects.filter(course_module=assessment.course_module, school_year=assessment.school_year, session="RETAKE", is_published=True)
        if published_retake_session.exists():
            raise ValidationError("La session de rattrapage doit être dépubliée avant de publier la session normale")

    query1 = attend_to_assessment(assessment)
    query2 = has_no_grade_in_assessment(assessment)

    if Enrollment.objects.filter(query1 & query2).exists():
        raise ValidationError("certain élève n'ont pas de note a cet examen")
    
    assessment.is_published = True
    assessment.save()
    return assessment


@transaction.atomic
def unpublish_assessment_result(assessment:Assessment):
    assessment.is_published = False
    assessment.save()
    return assessment

def get_attendant_data(enrollments,assessment : Assessment):
    enrollments = enrollments.select_related("student_school_year__student","student_school_year__school_year")
    grades = Grade.objects.select_related("assessment").filter(
        enrollment__in=enrollments,
        assessment=assessment
    )
    grades_map = {grade.enrollment_id: grade for grade in grades}

    debts = Debt.objects.filter(
        enrollment__in=enrollments,
        course_module=assessment.course_module,
        cleared=False
    )
    debts_map = {debt.enrollment_id: debt for debt in debts}

    serializer = AttendantSerializer(
        enrollments,
        many=True,
        context={
            "assessment": assessment,
            "grades_map": grades_map,
            "debts_map": debts_map,
        }
    )
    return serializer.data