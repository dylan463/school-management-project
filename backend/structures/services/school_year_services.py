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

    student_school_years = list(
        StudentSchoolYear.objects
        .filter(school_year=school_year)
        .select_related('level')
    )

    if not student_school_years:
        return

    level_ids = {ssy.level_id for ssy in student_school_years}
    semesters = Semester.objects.filter(level_id__in=level_ids).order_by('level_id', 'order')

    semesters_by_level = {}
    for semester in semesters:
        semesters_by_level.setdefault(semester.level_id, []).append(semester)

    enrollment_map = {
        (enrollment.student_school_year_id, enrollment.semester_id): enrollment
        for enrollment in Enrollment.objects.filter(
            student_school_year_id__in=[ssy.id for ssy in student_school_years],
            semester_id__in=[semester.id for semester in semesters]
        )
    }

    updates = []
    for ssy in student_school_years:
        sems = semesters_by_level.get(ssy.level_id)
        if not sems:
            continue

        first_semester = sems[0]
        last_semester = sems[-1]

        enrollment_first = enrollment_map.get((ssy.id, first_semester.id))
        enrollment_last = enrollment_map.get((ssy.id, last_semester.id))

        if enrollment_first:
            enrollment_first.is_current = True
            updates.append(enrollment_first)

        if last_semester != first_semester and enrollment_last:
            enrollment_last.is_current = False
            updates.append(enrollment_last)

    if updates:
        Enrollment.objects.bulk_update(updates, ['is_current'])


def go_to_second_periode(school_year: SchoolYear):
    if school_year.is_locked:
        raise ValidationError("cette année scolaire est bloqué")
    if school_year.status != SchoolYear.Status.ACTIVE:
        raise ValidationError("veillez réessayer avec une année scolaire active")

    student_school_years = list(
        StudentSchoolYear.objects
        .filter(school_year=school_year)
        .select_related('level')
    )

    if not student_school_years:
        return

    level_ids = {ssy.level_id for ssy in student_school_years}
    semesters = Semester.objects.filter(level_id__in=level_ids).order_by('level_id', 'order')

    semesters_by_level = {}
    for semester in semesters:
        semesters_by_level.setdefault(semester.level_id, []).append(semester)

    enrollment_map = {
        (enrollment.student_school_year_id, enrollment.semester_id): enrollment
        for enrollment in Enrollment.objects.filter(
            student_school_year_id__in=[ssy.id for ssy in student_school_years],
            semester_id__in=[semester.id for semester in semesters]
        )
    }

    updates = []
    for ssy in student_school_years:
        sems = semesters_by_level.get(ssy.level_id)
        if not sems:
            continue

        first_semester = sems[0]
        last_semester = sems[-1]

        enrollment_first = enrollment_map.get((ssy.id, first_semester.id))
        enrollment_last = enrollment_map.get((ssy.id, last_semester.id))

        if first_semester == last_semester:
            if enrollment_first:
                enrollment_first.is_current = True
                updates.append(enrollment_first)
        else:
            if enrollment_first:
                enrollment_first.is_current = False
                updates.append(enrollment_first)
            if enrollment_last:
                enrollment_last.is_current = True
                updates.append(enrollment_last)

    if updates:
        Enrollment.objects.bulk_update(updates, ['is_current'])
        
        

        
