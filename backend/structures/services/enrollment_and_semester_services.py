from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from ..models import StudentSchoolYear, Semester, Enrollment


# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

def get_current_enrollment(student_school_year: StudentSchoolYear):
    """
    Récupère l'inscription semestrielle actuellement active.
    """
    return (
        student_school_year.enrollments
        .select_related('semester')
        .filter(is_current=True)
        .first()
    )


def change_enrollement_decision(enrollment: Enrollment, decision: Enrollment.Decision):
    """
    Change le statut d'un enrollment. 
    util pour changé le résultat
    """
    enrollment.decision = decision
    enrollment.save(update_fields=['decision'])


def get_student_enrollment_summary(student_school_year: StudentSchoolYear):
    """
    Retourne un résumé des enrollments de l'étudiant pour l'année scolaire.
    """
    enrollments = (
        student_school_year.enrollments
        .select_related('semester')
        .order_by('semester__order')
    )
    
    summary = {
        'total_semesters': enrollments.count(),
        'completed_semesters': enrollments.filter(decision=Enrollment.Decision.PASSED).count(),
        'failed_semesters': enrollments.filter(decision=Enrollment.Decision.FAILED).count(),
        'current_semester': get_current_enrollment(student_school_year),
        'pending_semesters': enrollments.filter(decision=Enrollment.Decision.IN_PROGRESS),
        'all_enrollments': enrollments
    }
    
    return summary

