from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import Q

from ..models import SchoolYear, StudentSchoolYear
from users.models import CustomUser
from .enrollment_services import create_year_enrollments

# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

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


@transaction.atomic
def activate_school_year(school_year: SchoolYear):
    """
    Active une année scolaire.
    - Une seule année ACTIVE autorisée (garantie DB + sécurité ici)
    """
    if school_year.is_locked:
        raise ValidationError(
            "Vous ne pouvez pas activer une année scolaire verrouillée."
        )

    if school_year.status == SchoolYear.Status.CLOSED:
        raise ValidationError(
            "Vous ne pouvez pas activer une année scolaire clôturée."
        )

    if school_year.status == SchoolYear.Status.ACTIVE:
        return school_year  

    school_year.status = SchoolYear.Status.ACTIVE
    school_year.is_locked = True

    try:
        school_year.save()
    except IntegrityError:
        raise ValidationError(
            "Une autre année scolaire est déjà active."
        )

    return school_year


@transaction.atomic
def end_school_year(school_year: SchoolYear):
    """
    Clôture une année scolaire.
    - Doit être ACTIVE
    - Aucun étudiant en attente de délibération
    """
    if school_year.is_locked:
        raise ValidationError(
            "Vous ne pouvez pas clôturer une année scolaire verrouillée."
        )

    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError(
            "Seule une année active peut être clôturée."
        )

    if school_year.has_pending_student_school_years():
        raise ValidationError(
            "Vous devez d'abord délibérer tous les étudiants."
        )

    school_year.status = SchoolYear.Status.CLOSED
    school_year.is_locked = True
    school_year.save()

    return school_year


def toggle_school_year_lock(school_year: SchoolYear):
    """
    Basculer le verrouillage d'une année scolaire.
    """
    school_year.is_locked = not school_year.is_locked
    school_year.save()

    return school_year
