from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date
from structures.models import CourseModule, SchoolYear,User,Formation,Semester


class Enrollment(models.Model):
    
    """
    Inscription d'un étudiant à un semestre, une formation et une année scolaire précis.

    """
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE',  'En cours'
        VALIDATED = 'VALIDATED',  'Validé'
        NOT_VALIDATED = 'NOT_VALIDATED',  'Échoué'

    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='enrollments')
    formation = models.ForeignKey(Formation,on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User,on_delete=models.CASCADE, related_name='enrollments')
    school_year = models.ForeignKey(SchoolYear,on_delete=models.PROTECT, related_name='enrollments')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    opened_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student','school_year','semester')
        ordering = ['semester__order','opened_at']




class EnrollmentResult(models.Model):
    class Status(models.TextChoices):
        NOT_VALIDATED = "NOT_VALIDATED", "non validé"
        VALIDATED = "VALIDATED", "validé"
        VALIDATED_AFTER_RETAKE = "VALIDATEDA_AFTER_RETAKE", "validé apres rattrapage"

    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="enrollment_results",
    )
    course_module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="enrollment_results",
    )
    is_repeated = models.BooleanField(default=False)
    final_score = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(choices=Status.choices,default=Status.NOT_VALIDATED)
    comment = models.CharField(max_length=255, blank=True, null=True)


class Assessment(models.Model):
    class Session(models.TextChoices):
        NORMAL = "NORMAL", "normale"
        RETAKE = "RETAKE", "rattrapage"

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    session = models.CharField(
        choices=Session.choices,
        default=Session.NORMAL,
        max_length=10,
    )
    location = models.CharField(max_length=255)

    grade_weight = models.FloatField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )
    date = models.DateField(default=date.today)

    course_module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    school_year = models.ForeignKey(
        SchoolYear,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    is_published = models.BooleanField(default=False)


class Grade(models.Model):
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="grades",
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="grades",
    )
    score = models.FloatField(
        blank=True,
        null=True,
        default=1.0,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
    )
    class Meta:
        unique_together = ("enrollment","assessment")

class Debt(models.Model):
    result = models.ForeignKey(
        EnrollmentResult,
        on_delete=models.CASCADE,
        related_name="debts"
    )
    cleared = models.BooleanField(default=False)
    original_score = models.FloatField()
    original_status = models.CharField(choices=EnrollmentResult.Status.choices)
    last_deliberation = models.ForeignKey(SchoolYear,models.SET_NULL,blank=True,null=True)