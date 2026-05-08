from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import Q

from ..models import SchoolYear,Level, StudentSchoolYear,Semester,Enrollment
from users.models import CustomUser

# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

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


def get_open_school_year():
    return SchoolYear.objects.filter(status__in=[SchoolYear.Status.ACTIVE,SchoolYear.Status.UPCOMING]).distinct()


def toggle_school_year_lock(school_year: SchoolYear):
    """
    Basculer le verrouillage d'une année scolaire.
    """
    school_year.is_locked = not school_year.is_locked
    school_year.save()

    return school_year

def go_to_first_periode(school_year: SchoolYear):
    if school_year.is_locked:
        raise ValidationError("cette année scolaire est bloqué")
    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError("veillez réessayer avec une année scolaire active")
    school_year.period = SchoolYear.Period.FIRST
    school_year.save()

    if StudentSchoolYear.objects.filter(school_year=school_year).exists():
    
        last_level_order = Semester.objects.order_by("-order").first().order
        firts_period_semesters_order = [order for order in range(1,last_level_order+1) if order % 2 == 1]
        second_periode_semesters_order = [order for order in range(1,last_level_order+1) if order % 2 == 0]

        Enrollment.objects.filter(
            student_school_years__school_year=school_year,
            semester__order__not_in=second_periode_semesters_order
        ).update(is_current=False)
        Enrollment.objects.filter(
            student_school_years__school_year=school_year,
            semester__order__in=firts_period_semesters_order
        ).update(is_current=True)
    return school_year

def go_to_second_periode(school_year: SchoolYear):
    if school_year.is_locked:
        raise ValidationError("cette année scolaire est bloqué")
    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError("veillez réessayer avec une année scolaire active")
    school_year.period = SchoolYear.Period.SECONDE
    school_year.save()

    if StudentSchoolYear.objects.filter(school_year=school_year).exists():
    
        last_level_order = Semester.objects.order_by("-order").first().order
        firts_period_semesters_order = [order for order in range(1,last_level_order+1) if order % 2 == 1]
        second_periode_semesters_order = [order for order in range(1,last_level_order+1) if order % 2 == 0]

        Enrollment.objects.filter(
            student_school_years__school_year=school_year,
            semester__order__in=firts_period_semesters_order
        ).update(is_current=False)
        Enrollment.objects.filter(
            student_school_years__school_year=school_year,
            semester__order__not_in=second_periode_semesters_order
        ).update(is_current=True)
    return school_year
        
        

        
