from rest_framework.exceptions import ValidationError
from django.db import transaction

from users.models import User
from .models import (
    Formation, Semester, SchoolYear,
    Enrollment, CourseUnit, CourseModule
)

# ----------------- helper -----------------

def getMention(user: User):
    if not user.mention:
        raise ValidationError({
            "detail": "Vous ne possédez pas de mention."
        })
    return user.mention


# ----------------- formation -----------------

@transaction.atomic
def create_formation(user: User, data: dict):
    data["mention"] = getMention(user)
    return Formation.objects.create(**data)

@transaction.atomic
def delete_formation(user : User,formation :Formation):
    mention = getMention(user)
    formation.delete()

# ----------------- semester -----------------

@transaction.atomic
def create_semester(user: User, data: dict):
    data["mention"] = getMention(user)
    return Semester.objects.create(**data)


# ----------------- school year -----------------

@transaction.atomic
def create_school_year(user: User, data: dict):
    mention = getMention(user)
    data["mention"] = mention

    if SchoolYear.objects.filter(
        mention=mention,
        status="UPCOMING"
    ).exists():
        raise ValidationError({
            "mention": "Une année scolaire à venir existe déjà pour cette mention."
        })

    return SchoolYear.objects.create(**data)


@transaction.atomic
def change_school_year_status(user: User, school_year: SchoolYear, new_status: str):
    mention = getMention(user)

    if new_status not in SchoolYear.Status.values:
        raise ValidationError({
            "status": "Statut invalide."
        })

    if new_status == "UPCOMING":
        raise ValidationError({
            "status": "Vous ne pouvez pas réactiver une année scolaire."
        })

    if new_status == "ACTIVE":
        if school_year.status != "UPCOMING":
            raise ValidationError({
                "status": "Seule une année scolaire à venir peut être activée."
            })

        if SchoolYear.objects.filter(
            mention=mention,
            status="ACTIVE"
        ).exists():
            raise ValidationError({
                "mention": "Il existe déjà une année scolaire active pour cette mention."
            })

    if new_status == "CLOSED":
        if school_year.status != "ACTIVE":
            raise ValidationError({
                "status": "Seule une année scolaire active peut être clôturée."
            })

        if Enrollment.objects.filter(
            school_year=school_year,
            status=Enrollment.Status.ACTIVE
        ).exists():
            raise ValidationError({
                "detail": "Impossible de clôturer : des inscriptions sont encore actives."
            })

        school_year.is_locked = True

    school_year.status = new_status
    school_year.save()
    return school_year


@transaction.atomic
def toggle_school_year_lock(school_year: SchoolYear):
    school_year.is_locked = not school_year.is_locked
    school_year.save()
    return school_year


# ----------------- enrollment -----------------

@transaction.atomic
def create_enrollment(data: dict):
    if Enrollment.objects.filter(
        student=data["student"],
        school_year=data["school_year"]
    ).exists():
        raise ValidationError({
            "student": "Cet étudiant est déjà inscrit pour cette année scolaire."
        })

    return Enrollment.objects.create(**data)


@transaction.atomic
def change_enrollment_decision(enrollment: Enrollment, new_decision: str):
    if new_decision not in Enrollment.Status.values:
        raise ValidationError({
            "status": "Décision invalide."
        })

    enrollment.status = new_decision
    enrollment.save()
    return enrollment


# ----------------- course unit -----------------

@transaction.atomic
def toggle_course_unit_activation(course_unit: CourseUnit):
    course_unit.is_active = not course_unit.is_active
    course_unit.save()
    return course_unit


# ----------------- course module -----------------

@transaction.atomic
def toggle_course_module_activation(course_module: CourseModule):
    course_module.is_active = not course_module.is_active
    course_module.is_active = not course_module.is_active
    course_module.save()
    return course_module