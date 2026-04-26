# timetable/services/teacher_availability_services.py
from django.core.exceptions import ValidationError
from django.db import transaction
from users.models import TeacherUser
from ..models import TeacherAvailability


def check_availability_conflict(teacher: TeacherUser, semester, day, start_time, end_time, exclude_id=None):
    """
    Vérifie s'il y a un conflit avec les disponibilités existantes.
    """
    query = TeacherAvailability.objects.filter(
        teacher=teacher,
        semester=semester,
        day=day
    ).exclude(id=exclude_id or 0)

    # Vérifier chevauchement
    conflicts = query.filter(
        start_time__lt=end_time,
        end_time__gt=start_time
    )

    if conflicts.exists():
        raise ValidationError("Conflit avec une disponibilité existante.")


@transaction.atomic
def create_teacher_availability(teacher, semester, day, start_time, end_time):
    """
    Crée une nouvelle disponibilité après vérification des conflits.
    """
    check_availability_conflict(teacher, semester, day, start_time, end_time)

    availability = TeacherAvailability.objects.create(
        teacher=teacher,
        semester=semester,
        day=day,
        start_time=start_time,
        end_time=end_time
    )
    return availability


def get_teacher_availabilities(teacher, semester=None):
    """
    Récupère les disponibilités d'un enseignant.
    """
    query = TeacherAvailability.objects.filter(teacher=teacher)
    if semester:
        query = query.filter(semester=semester)
    return query.order_by('day', 'start_time')


def get_availabilities_for_semester(semester):
    """
    Récupère toutes les disponibilités pour un semestre.
    """
    return TeacherAvailability.objects.filter(semester=semester).select_related('teacher')