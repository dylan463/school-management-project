from .models import Schedule, ScheduleEntry, TeacherAvailability
from rest_framework.exceptions import ValidationError
from django.db.models import Q


def create_schedule_entry(data: dict) -> ScheduleEntry:
    """
    Crée une ligne d'emploi du temps à partir des données fournies.
    """
    day = data.get("day")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    teacher_availabilities = TeacherAvailability.objects.filter(
        teacher=data["course_module"].teacher,
        day=day,
        start_time__lte=start_time,
        end_time__gte=end_time
    )

    if not teacher_availabilities.exists():
        raise ValidationError({
            "detail":"Le enseignant n'est pas disponible pour cette plage horaire."
            })

    # Vérifier les conflits avec les autres lignes d'emploi du temps du même enseignant
    conflicting_entries = ScheduleEntry.objects.filter(
        course_module__semester=data["course_module"].semester,
        course_module__course_unit__formation=data["course_module"].course_unit.formation,
        day=day,
        start_time__lt=end_time,
        end_time__gt=start_time
    )

    if conflicting_entries.exists():
        raise ValidationError({
            "detail":"Il y a un conflit avec une autre ligne d'emploi du temps."
            })

    entry = ScheduleEntry.objects.create(**data)
    return entry



def create_teacher_availability(data: dict) -> ScheduleEntry:
    day = data.get("day")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    teacher_availabilities = TeacherAvailability.objects.filter(
        teacher=data["course_module"].teacher,
        day=day,
    ).exclude(
        Q(end_time__lte=start_time) | Q(start_time__gte=end_time)
    )

    if teacher_availabilities.exists():
        raise ValidationError({
            "detail": "cette plage horaire est déjà prise"
        })

    ta = TeacherAvailability.objects.create(**data)
    return ta

