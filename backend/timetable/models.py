# timetable/models.py
from django.db import models
from users.models import TeacherUser, CustomUser
from structures.models import Semester

class TeacherAvailability(models.Model):
    """Un enseignant soumet ses disponibilités."""
    DAY_CHOICES = [
        ('MON', 'Lundi'),
        ('TUE', 'Mardi'),
        ('WED', 'Mercredi'),
        ('THU', 'Jeudi'),
        ('FRI', 'Vendredi'),
        ('SAT', 'Samedi'),
    ]
    teacher    = models.ForeignKey(
        TeacherUser,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    semester   = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    day        = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time   = models.TimeField()

    class Meta:
        ordering = ['day', 'start_time']
        # Un enseignant ne peut pas avoir deux dispo qui se chevauchent
        unique_together = ('teacher', 'semester', 'day', 'start_time')

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_time <= self.start_time:
            raise ValidationError("L'heure de fin doit être après l'heure de début.")

    def __str__(self):
        return f"{self.teacher.username} — {self.day} {self.start_time}-{self.end_time}"


class TimeSlot(models.Model):
    """Un créneau de l'emploi du temps, créé par l'admin."""
    DAY_CHOICES = TeacherAvailability.DAY_CHOICES

    semester          = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name='timeslots'
    )
    course_component  = models.ForeignKey(
        CourseComponent,
        on_delete=models.CASCADE,
        related_name='timeslots'
    )
    teacher           = models.ForeignKey(
        TeacherUser,
        on_delete=models.CASCADE,
        related_name='timeslots'
    )
    day               = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time        = models.TimeField()
    end_time          = models.TimeField()
    room              = models.CharField(max_length=50, blank=True)
    is_published      = models.BooleanField(default=False)

    class Meta:
        ordering = ['day', 'start_time']

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_time <= self.start_time:
            raise ValidationError("L'heure de fin doit être après l'heure de début.")
        # Vérifier que l'enseignant est bien affecté à ce CourseComponent
        if self.course_component.teacher_id != self.teacher.pk:
            raise ValidationError("Ce professeur n'est pas affecté à cet EC.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course_component.name} — {self.day} {self.start_time}"