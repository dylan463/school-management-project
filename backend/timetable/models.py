from django.db import models
from structures.models import Semester, CourseComponent
from users.models import TeacherUser

# 🔹 emploi du temps global
class Schedule(models.Model):
    semester = models.OneToOneField(
        Semester,
        on_delete=models.CASCADE,
        related_name="schedule"
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Schedule - {self.semester.name}"


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
        related_name="entries"
    )

    course = models.ForeignKey(
        CourseComponent,
        on_delete=models.CASCADE
    )

    teacher = models.ForeignKey(
        TeacherUser,
        on_delete=models.SET_NULL,
        null=True
    )

    day = models.CharField(max_length=10, choices=Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    classroom = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.course.name} - {self.day}"