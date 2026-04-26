# timetable/services/timeslot_services.py
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from ..models import TimeSlot


def check_timeslot_conflict(semester, day, start_time, end_time, room='', exclude_id=None):
    """
    Vérifie s'il y a un conflit de créneau (même salle, même horaire).
    """
    if not room:
        return  # Pas de vérification si pas de salle

    query = TimeSlot.objects.filter(
        semester=semester,
        day=day,
        room=room
    ).exclude(id=exclude_id or 0)

    # Vérifier chevauchement horaire
    conflicts = query.filter(
        Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
    )

    if conflicts.exists():
        conflict = conflicts.first()
        raise ValidationError(f"Conflit avec le créneau '{conflict}' dans la salle {room}.")


def check_teacher_assignment(course_component, teacher):
    """
    Vérifie que l'enseignant est bien affecté au composant de cours.
    """
    if course_component.teacher_id != teacher.pk:
        raise ValidationError("Ce professeur n'est pas affecté à cet EC.")


@transaction.atomic
def create_timeslot(semester, course_component, teacher, day, start_time, end_time, room=''):
    """
    Crée un nouveau créneau après vérifications.
    """
    check_teacher_assignment(course_component, teacher)
    check_timeslot_conflict(semester, day, start_time, end_time, room)

    timeslot = TimeSlot.objects.create(
        semester=semester,
        course_component=course_component,
        teacher=teacher,
        day=day,
        start_time=start_time,
        end_time=end_time,
        room=room
    )
    return timeslot


def publish_timeslot(timeslot):
    """
    Publie un créneau.
    """
    timeslot.is_published = True
    timeslot.save()
    return timeslot


def publish_all_timeslots_for_semester(semester):
    """
    Publie tous les créneaux non publiés d'un semestre.
    """
    updated_count = TimeSlot.objects.filter(
        semester=semester,
        is_published=False
    ).update(is_published=True)
    return updated_count


def get_timeslots_for_semester(semester, published_only=False):
    """
    Récupère les créneaux d'un semestre.
    """
    query = TimeSlot.objects.filter(semester=semester)
    if published_only:
        query = query.filter(is_published=True)
    return query.select_related('course_component', 'teacher')


def get_student_timeslots(student, semester):
    """
    Récupère les créneaux publiés pour un étudiant dans un semestre.
    """
    # Cette fonction pourrait être étendue selon la logique d'inscription
    return TimeSlot.objects.filter(
        semester=semester,
        is_published=True
    ).select_related('course_component', 'teacher')


def get_teacher_timeslots(teacher, semester=None):
    """
    Récupère les créneaux d'un enseignant.
    """
    query = TimeSlot.objects.filter(teacher=teacher)
    if semester:
        query = query.filter(semester=semester)
    return query.filter(is_published=True).select_related('course_component', 'semester')