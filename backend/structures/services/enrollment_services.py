from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from ..models import StudentSchoolYear, LevelSemester, Enrollment


# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

def get_semesters_for_level(level):
    """
    Récupère tous les semestres associés à un niveau, ordonnés par ordre.
    """
    return LevelSemester.objects.filter(level=level).order_by('semester__order')


def get_current_enrollment(student_school_year: StudentSchoolYear):
    """
    Récupère l'inscription semestrielle actuellement active.
    """
    return student_school_year.enrollments.filter(is_current=True).first()


def get_next_semester_for_level(level, current_semester=None):
    """
    Récupère le prochain semestre pour un niveau.
    Si current_semester est None, retourne le premier semestre.
    """
    if current_semester:
        next_level_semester = LevelSemester.objects.filter(
            level=level,
            semester__order__gt=current_semester.order
        ).order_by('semester__order').first()
        return next_level_semester.semester if next_level_semester else None
    else:
        first_level_semester = LevelSemester.objects.filter(
            level=level
        ).order_by('semester__order').first()
        return first_level_semester.semester if first_level_semester else None


@transaction.atomic
def create_year_enrollments(student_school_year: StudentSchoolYear):
    """
    Crée automatiquement les enrollments pour tous les semestres de l'année.
    Synchronise le semestre actuel avec les autres étudiants du même niveau.
    """
    semesters = get_semesters_for_level(student_school_year.level)
    
    if not semesters.exists():
        raise ValidationError(
            f"Aucun semestre configuré pour le niveau {student_school_year.level.code}"
        )
    
    # Trouver le semestre actuel des autres étudiants du même niveau et même année scolaire
    current_semester_for_level = get_current_semester_for_level(
        student_school_year.level, 
        student_school_year.school_year
    )
    
    enrollments = []
    first = True

    for level_semester in semesters:
        if current_semester_for_level is None:
            is_current_semester = first
        else:
            is_current_semester = level_semester.semester == current_semester_for_level
        
        enrollment = Enrollment.objects.create(
            student_school_year=student_school_year,
            semester=level_semester.semester,
            decision=Enrollment.Decision.IN_PROGRESS,
            is_current=is_current_semester,
            opened_at=timezone.now() if is_current_semester else None
        )
        enrollments.append(enrollment)
        first = False
    
    return enrollments


def get_current_semester_for_level(level, school_year):
    """
    Détermine le semestre actuel pour un niveau et une année scolaire donnés
    en se basant sur les autres étudiants.
    """
    current_enrollments = Enrollment.objects.filter(
        student_school_year__level=level,
        student_school_year__school_year=school_year,
        is_current=True
    ).first()
    
    return current_enrollments.semester if current_enrollments else None


@transaction.atomic
def activate_next_semester(student_school_year: StudentSchoolYear, last_enrollment_decision=Enrollment.Decision.PASSED):
    """
    Active le semestre suivant et termine le semestre actuel.
    """
    current_enrollment = get_current_enrollment(student_school_year)
    
    if not current_enrollment:
        raise ValidationError("Aucun semestre actif trouvé.")
    
    if current_enrollment.decision != Enrollment.Decision.IN_PROGRESS:
        raise ValidationError("Le semestre actuel n'est pas en cours.")
    
    # Terminer le semestre actuel
    current_enrollment.decision = last_enrollment_decision
    current_enrollment.is_current = False
    current_enrollment.save(update_fields=['decision', 'is_current'])
    
    # Activer le semestre suivant
    next_semester = get_next_semester_for_level(
        student_school_year.level, 
        current_enrollment.semester
    )
    
    if not next_semester:
        # Plus de semestres → fin d'année
        return None
    
    # Vérifier si l'enrollment suivant existe déjà
    next_enrollment, created = Enrollment.objects.get_or_create(
        student_school_year=student_school_year,
        semester=next_semester,
        defaults={
            'decision': Enrollment.Decision.IN_PROGRESS,
            'is_current': True,
            'opened_at': timezone.now(),
        }
    )
    
    if not created:
        next_enrollment.decision = Enrollment.Decision.IN_PROGRESS
        next_enrollment.is_current = True
        next_enrollment.opened_at = timezone.now()
        next_enrollment.save(update_fields=['decision', 'is_current', 'opened_at'])
    
    return next_enrollment


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
    enrollments = student_school_year.enrollments.order_by('semester__order')
    
    summary = {
        'total_semesters': enrollments.count(),
        'completed_semesters': enrollments.filter(decision=Enrollment.Decision.PASSED).count(),
        'failed_semesters': enrollments.filter(decision=Enrollment.Decision.FAILED).count(),
        'current_semester': get_current_enrollment(student_school_year),
        'pending_semesters': enrollments.filter(decision=Enrollment.Decision.IN_PROGRESS),
        'all_enrollments': enrollments
    }
    
    return summary
