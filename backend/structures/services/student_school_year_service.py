from .enrollment_and_semester_services import *
from django.core.exceptions import ValidationError
from django.db import transaction

from ..models import SchoolYear, StudentSchoolYear, FormationLevel
from users.models import CustomUser



@transaction.atomic
def create_year_enrollments(student_school_year: StudentSchoolYear):
    """
    Crée automatiquement les enrollments pour tous les semestres de l'année.
    Synchronise le semestre actuel avec les autres étudiants du même niveau.
    """
    # Trouver le semestre actuel des autres étudiants du même niveau et même année scolaire
    current_semester_for_level = get_current_semester_for_level(
        student_school_year.level, 
        student_school_year.school_year
    )
    
    enrollments = []
    first = True

    Semesters = Semester.objects.filter(level=student_school_year.level).distinct()

    for semester in semesters:
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


@transaction.atomic
def create_student_school_year(
    student: CustomUser,
    school_year: SchoolYear,
    formation,
    level,
    status=StudentSchoolYear.Status.ACTIVE
    ):
    """
    Méthode centralisée pour créer une inscription annuelle d'étudiant.
    Vérifie les doublons, le verrouillage et crée le StudentSchoolYear avec transaction.
    """
    # Vérification du verrouillage de l'année scolaire
    if school_year.is_locked:
        raise ValidationError(
            "L'année scolaire est verrouillée. Aucune inscription n'est possible."
        )
    
    # Vérification du statut de l'année scolaire
    if school_year.status == SchoolYear.Status.CLOSED:
        raise ValidationError(
            "Impossible d'inscrire un étudiant dans une année scolaire clôturée."
        )

    try:
        student_school_year = StudentSchoolYear.objects.create(
            student=student,
            school_year=school_year,
            formation=formation,
            level=level,
            status=status,
        )
        
        if status in [StudentSchoolYear.Status.ACTIVE,StudentSchoolYear.Status.DELIBERATING]:
            create_year_enrollments(student_school_year)

        return student_school_year
    except IntegrityError:
        raise ValidationError(
            "L'étudiant est déjà inscrit dans cette année scolaire."
        )

def get_last_student_school_year(student: CustomUser):
    """
    Récupère la dernière inscription annuelle clôturée de l'étudiant
    """

    return (
        StudentSchoolYear.objects
        .filter(
            student=student,
        )
        .order_by('-school_year__start_date')
        .first()
    )


def student_has_open_year_enrollement(student: CustomUser):
    """
    Vérifie si l'étudiant a une année scolaire encore ouvert
    """
    
    return StudentSchoolYear.objects.filter(
        status__in=[StudentSchoolYear.Status.ACTIVE,StudentSchoolYear.Status.DELIBERATING],
        student = student
    )

@transaction.atomic
def promote_or_repeat_for_new_school_years(
    student: CustomUser,
    new_school_year: SchoolYear
    ):
    """
    Réinscription automatique :
    - PROMOTED → niveau supérieur
    - REPEAT   → même niveau
    - EXCLUDED → interdit
    """
    if student_has_open_year_enrollement(student):
        raise ValidationError(
            "L'étudiant n'as pas encore terminé sont année."
        )

    last_ssy = get_last_student_school_year(student)

    if not last_ssy:
        raise ValidationError(
            "Aucune inscription précédente trouvée."
        )

    if last_ssy.status == StudentSchoolYear.Status.EXCLUDED:
        raise ValidationError(
            "L'étudiant est exclu et ne peut pas être réinscrit."
        )

    # ───── LOGIQUE PROMOTION ─────

    if last_ssy.status == StudentSchoolYear.Status.PROMOTED:
        next_order = last_ssy.level.order + 1

        new_level = FormationLevel.objects.filter(
            formation=last_ssy.formation,
            level__order=next_order
        ).first()

        if not new_level:
            raise ValidationError(
                f"Aucun niveau supérieur après {last_ssy.level.code}."
            )

    elif last_ssy.status == StudentSchoolYear.Status.REPEAT:
        new_level = last_ssy.level

    else:
        raise ValidationError(
            "La délibération de cet étudiant n'est pas terminée."
        )

    # ───── CRÉATION ─────

    return create_student_school_year(
        student=student,
        school_year=new_school_year,
        formation=last_ssy.formation,
        level=new_level,
        status=StudentSchoolYear.Status.ACTIVE
    )

@transaction.atomic
def force_create_student_school_year_for_new_year(
    student: CustomUser,
    level,
    formation,
    new_school_year: SchoolYear
    ):
    """
    Inscription manuelle par un admin (override logique normale) ignorer la dernière inscription de l'étudiant.
    """    
    if student_has_open_year_enrollement(student):
        raise ValidationError(
            "L'étudiant n'as pas encore terminé sont année."
        )

    return create_student_school_year(
        student=student,
        school_year=new_school_year,
        formation=formation,
        level=level,
        status=StudentSchoolYear.Status.ACTIVE
    )
