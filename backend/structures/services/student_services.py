from django.core.exceptions import ValidationError
from django.db import transaction

from ..models import SchoolYear, StudentSchoolYear, FormationLevel
from users.models import CustomUser
from .school_year_services import create_student_school_year


# ─────────────────────────────────────────
# INSCRIPTION ANNUELLE
# ─────────────────────────────────────────

def get_last_closed_student_school_year(student: CustomUser):
    """
    Récupère la dernière inscription annuelle clôturée de l'étudiant
    """

    return (
        StudentSchoolYear.objects
        .filter(
            student=student,
            school_year__status=SchoolYear.Status.CLOSED,
            status__in=[
                StudentSchoolYear.Status.PROMOTED,
                StudentSchoolYear.Status.REPEAT,
                StudentSchoolYear.Status.EXCLUDED
            ]
        )
        .order_by('-school_year__start_date')
        .first()
    )


def is_student_in_active_school_year(student: CustomUser):
    """
    Vérifie si l'étudiant est déjà inscrit dans une année ACTIVE
    """

    return StudentSchoolYear.objects.filter(
        student=student,
        school_year__status=SchoolYear.Status.ACTIVE
    ).exists()


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
    if is_student_in_active_school_year(student):
        raise ValidationError(
            "L'étudiant a déjà une année active."
        )

    last_ssy = get_last_closed_student_school_year(student)

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


# ─────────────────────────────────────────
# INSCRIPTION FORCÉE (ADMIN)
# ─────────────────────────────────────────

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
    if is_student_in_active_school_year(student):
        raise ValidationError(
            "L'étudiant a déjà une année active."
        )

    return create_student_school_year(
        student=student,
        school_year=new_school_year,
        formation=formation,
        level=level,
        status=StudentSchoolYear.Status.ACTIVE
    )
