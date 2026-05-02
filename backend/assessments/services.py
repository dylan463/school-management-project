from .models import (
    Assessment,Grade,EnrollmentResult
)
from structures.models import CourseModule,SchoolYear,Enrollment
from rest_framework.exceptions import ValidationError
from django.db.models import Prefetch
from django.db import transaction
from collections import defaultdict

@transaction.atomic
def create_assessment(data : dict):
    session = data.get("session")
    course_module = data.get("course_module")
    school_year = data.get("school_year")

    if session == Assessment.Session.RETAKE:
        if not EnrollmentResult.objects.filter(
            enrollment__student_school_year__school_year=school_year
        ).exists():
            raise ValidationError("veillez publier les notes des session normale avant de créer une session de rattrapage.")
    elif session == Assessment.Session.NORMAL:
        if Assessment.objects.filter(
            course_module=course_module,
            school_year = school_year,
            session=Assessment.Session.RETAKE
        ).exists():
            raise ValidationError("vous ne pouvez pas crée des session normal tant que la session rattrapage exist")

    return Assessment.objects.create(**data)

@transaction.atomic
def publish_result_course_module(course_module_id):
    course_module = CourseModule.objects.get(pk=course_module_id)
    school_year = SchoolYear.objects.filter(status=SchoolYear.Status.ACTIVE).first()

    if school_year is None:
        raise ValidationError("aucune année scolaire n'est active en ce moment")
    
    if Assessment.objects.filter(
        course_module=course_module,
        school_year=school_year,
        session=Assessment.Session.RETAKE
    ).exists():
        retake_grades = Grade.objects.filter(
            assessment__session=Assessment.Session.RETAKE,
            assessment__school_year=school_year,
            assessment__course_module=course_module
        ).select_related("enrollment","assessment")

        enrollment_grades = defaultdict(list)
        for grade in retake_grades:
            enrollment_grades[grade.enrollment].append(
                (grade.score,grade.assessment.grade_weight)
            )

        for enrollment,weighted_grade in enrollment_grades.items():
            total_weight = sum(weight for _, weight in weighted_grade)
            final_score = sum(weight*score for score, weight in weighted_grade)/total_weight
            status = 'VALIDATED_AFTER_RETAKE' if final_score >= course_module.min_val_score else 'NOT_VALIDATED'

            result = EnrollmentResult.objects.get(
                enrollment=enrollment,
                course_module=course_module
            )

            if result.final_score < final_score:
                result.final_score = round(final_score,2)
                result.status = status
                result.save()
            
        return {"detail":"retake result published"}
    else:
        normal_grades = Grade.objects.filter(
            assessment__session=Assessment.Session.NORMAL,
            assessment__school_year=school_year,
            assessment__course_module=course_module
        ).select_related("enrollment","assessment")

        enrollment_grades = defaultdict(list)
        for grade in normal_grades:
            enrollment_grades[grade.enrollment].append(
                (grade.score,grade.assessment.grade_weight)
            )

        for enrollment,weighted_grade in enrollment_grades.items():
            total_weight = sum(weight for _, weight in weighted_grade)
            final_score = sum(weight*score for score, weight in weighted_grade)/total_weight
            status = 'VALIDATED' if final_score >= course_module.min_val_score else 'NOT_VALIDATED'

            result = EnrollmentResult.objects.update_or_create(
                enrollment = enrollment,
                course_module = course_module,
                defaults={"final_score":round(final_score,2),"status":status}
            )
        return {"detail":"normal session published"}
