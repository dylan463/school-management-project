from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import (
    Formation, Semester, SchoolYear,
    Enrollment, CourseUnit, CourseModule,User
)
from django.apps import apps
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
def delete_formation(formation :Formation):
    if CourseUnit.objects.filter(formation=formation).exists():
        raise ValidationError({'detail':'suppression impossible : formation référencé.'})

@transaction.atomic
def toggle_formation_activation(formation: Formation):
    formation.is_active = not formation.is_active
    formation.save()
    return formation
# ----------------- semester -----------------

@transaction.atomic
def create_semester(user: User, data: dict):
    data["mention"] = getMention(user)
    return Semester.objects.create(**data)

@transaction.atomic
def delete_semester(semester :Semester):
    if CourseModule.objects.filter(semester=semester).exists():
        raise ValidationError({'detail':'suppression impossible : semestre référencé.'})

@transaction.atomic
def toggle_semester_activation(semester: Semester):
    semester.is_active = not semester.is_active
    semester.save()
    return semester

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
def delete_school_year(school_year :SchoolYear):
    if Enrollment.objects.filter(school_year=school_year).exists():
        raise ValidationError({'detail':'suppression impossible : inscritption référencé.'})


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
                "mention": "Il existe déjà une année scolaire active pour votre mention."
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


EnrollmentResult = apps.get_model('assessments','EnrollmentResult')
Debt = apps.get_model("assessments",'Debt')
@transaction.atomic
def change_enrollment_status(enrollment: Enrollment, status: str):
    if status not in Enrollment.Status.values:
        raise ValidationError({
            "status": "Décision invalide."
        })
    active_sy = SchoolYear.objects.filter(status=SchoolYear.Status.ACTIVE).first()

    if not active_sy:
        raise ValidationError({
            "detail":"Modification Impossible : aucune année scolaire active"
        })

    # if active_sy.id == enrollment.school_year.id:
    #     if status == Enrollment.Status.ACTIVE:
    #         Debt.objects.filter(enrollment=enrollment).delete()
    #     else:
    #         resutls = EnrollmentResult.objects.filter(enrollment=enrollment)
    #         debts = []
    #         for result in resutls:
    #             debts.append({})
    # else:
    #     pass

    enrollment.status = status
    enrollment.save()
    return enrollment


@transaction.atomic
def delete_enrollment(enrollment : Enrollment):
    if EnrollmentResult.objects.filter(enrollment=enrollment).exists():
        raise ValidationError({
            'detail':'suppression impossible : des résultat y sont encore référencés'
        })
    enrollment.delete()

# ----------------- course unit -----------------

@transaction.atomic
def toggle_course_unit_activation(course_unit: CourseUnit):
    is_active = not course_unit.is_active
    course_unit.is_active = is_active
    modules = CourseModule.objects.filter(course_unit=course_unit)
    modules.update(is_active=is_active)
    course_unit.save()
    return course_unit

@transaction.atomic
def delete_course_unit(course_unit : CourseModule):
    if CourseModule.objects.filter(course_unit=course_unit).exists():
        raise ValidationError({
             'detail':'suppression impossible : des cours y sont encore référencés'
        })
    course_unit.delete()


# ----------------- course module -----------------

@transaction.atomic
def toggle_course_module_activation(course_module: CourseModule):
    course_module.is_active = not course_module.is_active
    course_module.save()
    return course_module