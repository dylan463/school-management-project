from .models import (
    Assessment,Grade,EnrollmentResult,Debt
)
from structures.models import Enrollment
from rest_framework.exceptions import ValidationError
from django.db import transaction
from collections import defaultdict
from .query import attend_to_assessment,has_no_grade_in_assessment

def compute_weighted_score(grades):
    weighted = [(g.score, g.assessment.grade_weight) for g in grades]
    total_weight = sum(w for _, w in weighted)
    return sum(s * w for s, w in weighted) / total_weight, weighted


@transaction.atomic
def update_results(course_module, school_year):
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
            score = round(compute_weighted_score(grades), 2)
            status = validated_status if score >= course_module.min_val_score else 'NOT_VALIDATED'
            result, created = EnrollmentResult.objects.get_or_create(
                enrollment=enrollment, course_module=course_module,
                defaults={"final_score": score, "status": status}
            )
            if not created and result.final_score < score:
                result.final_score, result.status = score, status
                result.save()
            if status == validated_status:
                Debt.objects.filter(enrollment=enrollment, course_module=course_module).update(cleared=True)

    process_session("NORMAL", "VALIDATED")
    process_session("RETAKE", "VALIDATED_AFTER_RETAKE")

@transaction.atomic
def publish_assessment_result(assessment : Assessment):
    if assessment.session == "RETAKE":
        published_normal_session = Assessment.objects.filter(course_module=assessment.course_module, school_year=assessment.school_year, session="NORMAL", is_published=True)
        if published_normal_session.exists():
            raise ValidationError("La session normale doit être publiée avant la session de rattrapage")

    query1 = attend_to_assessment(assessment)
    query2 = has_no_grade_in_assessment(assessment)

    if Enrollment.objects.filter(query1 & query2).exists():
        raise ValidationError("certain élève n'ont pas de note a cet examen")
    
    assessment.is_published = True
    assessment.save()
    update_results(query1,assessment.course_module,assessment.school_year)
    return assessment

@transaction.atomic
def delete_assessment(assessment:Assessment):
    assessment.delete()
    update_results(assessment.course_module,assessment.school_year)

@transaction.atomic
def unpublish_assessment_result(assessment:Assessment):
    assessment.is_published = False
    assessment.save()
    update_results(assessment.course_module,assessment.school_year)
    return assessment
