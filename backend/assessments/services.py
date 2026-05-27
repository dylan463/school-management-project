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
            "detail": "Modification Impossible : aucune année scolaire active"
        })

    if active_sy.id == enrollment.school_year_id:
        if status == Enrollment.Status.ACTIVE:
            Debt.objects.filter(enrollment=enrollment).delete()
        else:
            # Bug fix : select_related pour éviter N+1 sur course_module
            results = EnrollmentResult.objects.filter(
                enrollment=enrollment
            ).select_related("course_module")

            debts = [
                Debt(
                    enrollment=enrollment,
                    course_module=result.course_module,
                    original_score=result.final_score,
                    original_status=result.status,
                )
                for result in results
                if result.status == EnrollmentResult.Status.NOT_VALIDATED
            ]

            if debts:
                Debt.objects.bulk_create(debts)
    else:
        if status == Enrollment.Status.ACTIVE:
            raise ValidationError({
                "status": "Vous ne pouvez plus activer cette inscription."
            })

        # Bug fix : bulk_update manquant — les modifications n'étaient jamais persistées
        debts = list(
            Debt.objects.filter(enrollment=enrollment, cleared=False)
            .select_related("result")
        )

        to_update = [
            debt
            for debt in debts
            if debt.result.status != EnrollmentResult.Status.NOT_VALIDATED
        ]

        if to_update:
            for debt in to_update:
                debt.cleared = True
            Debt.objects.bulk_update(to_update, ["cleared"])

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


# --------------- Assessments ----------------

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
    # Récupération unique et sécurisée de l'année scolaire active
    school_year = SchoolYear.objects.filter(status="ACTIVE").first()
    if school_year is None:
        raise ValidationError(
            "Vous ne pouvez publier les résultats que pendant une année scolaire active"
        )

    def get_grades(session):
        """Récupère les notes en une seule requête avec les relations nécessaires."""
        return (
            Grade.objects
            .filter(
                assessment__course_module=course_module,
                assessment__school_year=school_year,
                assessment__session=session,
                assessment__is_published=True,
            )
            .select_related("enrollment", "assessment")
        )

    def group_by_enrollment(grades):
        groups = defaultdict(list)
        for g in grades:
            groups[g.enrollment_id].append(g)
        return groups

    def process_session(session, validated_status):
        grades = get_grades(session)
        if not grades.exists():
            return

        # Calcul des scores en Python (évite N requêtes)
        enrollment_data = {}
        for enrollment_id, grade_list in group_by_enrollment(grades).items():
            score = round(compute_weighted_score(grade_list), 2)
            status = (
                validated_status
                if score >= course_module.min_val_score
                else "NOT_VALIDATED"
            )
            enrollment_data[enrollment_id] = (score, status)

        enrollment_ids = list(enrollment_data.keys())

        # Récupérer les résultats existants en une seule requête
        existing_results = {
            r.enrollment_id: r
            for r in EnrollmentResult.objects.filter(
                enrollment_id__in=enrollment_ids,
                course_module=course_module,
            )
        }

        to_create = []
        to_update = []

        for enrollment_id, (score, status) in enrollment_data.items():
            if enrollment_id in existing_results:
                result = existing_results[enrollment_id]
                result.final_score = score
                result.status = status
                to_update.append(result)
            else:
                to_create.append(
                    EnrollmentResult(
                        enrollment_id=enrollment_id,
                        course_module=course_module,
                        final_score=score,
                        status=status,
                    )
                )

        # Deux requêtes bulk au lieu de N×2
        if to_create:
            EnrollmentResult.objects.bulk_create(to_create)
        if to_update:
            EnrollmentResult.objects.bulk_update(to_update, ["final_score", "status"])

    has_published_assessments = Assessment.objects.filter(
        course_module=course_module,
        school_year=school_year,
        is_published=True,
    ).exists()

    if has_published_assessments:
        process_session("NORMAL", "VALIDATED")

        # Suppression en une seule requête
        Grade.objects.filter(
            assessment__course_module=course_module,
            assessment__school_year=school_year,
            assessment__session="RETAKE",
            enrollment__enrollment_results__status="VALIDATED",
        ).delete()

        process_session("RETAKE", "VALIDATED_AFTER_RETAKE")

    else:
        EnrollmentResult.objects.filter(
            enrollment__in=Enrollment.objects.filter(
                promoted_people(course_module, school_year)
            ),
            course_module=course_module,
        ).delete()

        debted_enrollments = Enrollment.objects.filter(
            people_with_course_debt(course_module)
        )

        # Récupération des dettes avec les résultats liés
        debts = list(
            Debt.objects
            .filter(result__enrollment__in=debted_enrollments)
            .select_related("result")
        )

        # Bulk update au lieu de N saves
        results_to_update = []
        for debt in debts:
            debt.result.final_score = debt.original_score
            debt.result.status = debt.original_status
            results_to_update.append(debt.result)

        if results_to_update:
            EnrollmentResult.objects.bulk_update(
                results_to_update, ["final_score", "status"]
            )

@transaction.atomic
def toggle_assessment_publication(assessment: Assessment):
    if assessment.is_published:
        # --- DÉPUBLICATION ---
        # Bloquer si une session RETAKE publiée dépend de cette session NORMAL
        if assessment.session == "NORMAL":
            retake_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="RETAKE",
                is_published=True,
            ).exists()
            if retake_published:
                raise ValidationError(
                    "La session de rattrapage doit être dépubliée avant de dépublier la session normale."
                )

        assessment.is_published = False
        assessment.save(update_fields=["is_published"])

    else:
        # --- PUBLICATION ---
        if assessment.session == "RETAKE":
            normal_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="NORMAL",
                is_published=True,
            ).exists()
            if not normal_published:
                raise ValidationError(
                    "La session normale doit être publiée avant la session de rattrapage."
                )
        else:
            retake_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="RETAKE",
                is_published=True,
            ).exists()
            if retake_published:
                raise ValidationError(
                    "La session de rattrapage doit être dépubliée avant de publier la session normale."
                )

        if Enrollment.objects.filter(
            attend_to_assessment(assessment) & has_no_grade_in_assessment(assessment)
        ).exists():
            raise ValidationError("Certains élèves n'ont pas de note à cet examen.")

        assessment.is_published = True
        assessment.save(update_fields=["is_published"])

    # --- UPDATE DES RÉSULTATS dans les deux cas ---
    update_results(assessment.course_module)

    return assessment

def delete_assessment(assessment : Assessment):
    if assessment.session == Assessment.Session.NORMAL:
        if Assessment.objects.filter(
            course_module=assessment.course_module,
            school_year=assessment.school_year,
            session=Assessment.Session.RETAKE
            ).exists():
            raise ValidationError({"detail":"suppression impossible : des examen session rattrapage éxiste encore"})
        
    update_results(assessment.course_module)

# ---------

def get_attendant_data(enrollments,assessment : Assessment):
    enrollments = enrollments.select_related("student","school_year")
    grades = Grade.objects.select_related("assessment").filter(
        enrollment__in=enrollments,
        assessment=assessment
    )
    grades_map = {grade.enrollment_id: grade for grade in grades}

    debts = Debt.objects.filter(
        result__enrollment__in=enrollments,
        result__course_module=assessment.course_module,
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
    return 