from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import Q

from ..models import SchoolYear, StudentSchoolYear,Semester,Enrollment
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
        raise ValidationError("cette année scolaire est bloquée")
    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError("veuillez réessayer avec une année scolaire active")

    student_school_years = StudentSchoolYear.objects.filter(school_year=school_year)

    for ssy in student_school_years:
        level = ssy.level
        semestres = Semester.objects.filter(level=level).order_by("order")

        semester1 = semestres.first()
        semester2 = semestres.last()
       
        enrollment1 = Enrollment.objects.filter(semester=semester1, student_school_year=ssy).first()
        enrollment2 = Enrollment.objects.filter(semester=semester2, student_school_year=ssy).first()

        enrollment1.is_current = True
        enrollment2.is_current = False

        enrollment1.save()
        enrollment2.save()

def go_to_second_periode(school_year: SchoolYear):
    if school_year.is_locked:
        raise ValidationError("cette année scolaire est blocqué")
    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError("veillez réessayer avec une année scolaire active")

    student_school_years = StudentSchoolYear.objects.filter(school_year=school_year)

    for ssy in student_school_years:
        level = ssy.level
        semestres = Semester.objects.filter(level=level).order_by("order")

        semester1 = semestres.first()
        semestre2 = semestres.last()
       
        enrollement1 = Enrollment.objects.filter(semester=semester1,student_school_year=ssy).first()
        enrollement2 = Enrollment.objects.filter(semester=semester2,student_school_year=ssy).first()

        enrollement1.is_current = False
        enrollement2.is_current = True

        enrollement1.save()
        enrollement2.save()
        
        

        
