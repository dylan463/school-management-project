from django.db import models
from structures.models import Semester, CourseModule,Formation
from structures.models import User


# 🔹 emploi du temps global
class Schedule(models.Model):
    semester = models.OneToOneField(
        Semester,
        on_delete=models.CASCADE,
        related_name="schedule"
    )
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="schedules")
    created_at = models.DateTimeField(auto_now_add=True)




# 🔹 ligne d'emploi du temps
class ScheduleEntry(models.Model):

    class Day(models.TextChoices):
        MONDAY = "MONDAY", "Monday"
        TUESDAY = "TUESDAY", "Tuesday"
        WEDNESDAY = "WEDNESDAY", "Wednesday"
        THURSDAY = "THURSDAY", "Thursday"
        FRIDAY = "FRIDAY", "Friday"
        SATURDAY = "SATURDAY", "Saturday"

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name="schedule_entries"
    )
    course_module  = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name='schedule_entries'
    )

    day = models.CharField(max_length=10, choices=Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    classroom = models.CharField(blank=True, null=True, max_length=50)

    class Meta:
        ordering = ['day', 'start_time']


class TeacherAvailability(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_availabilities")
    day = models.CharField(max_length=10, choices=ScheduleEntry.Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day', 'start_time']