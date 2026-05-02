from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date
from structures.models import CourseModule, SchoolYear, Enrollment


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
        on_delete=models.PROTECT,
        related_name="enrollment_results",
    )
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
    # pendant un semestre l'etudiant peut avoir plusieurs examens et le grade_weight définit la proportion de la note de cet examen dans le résultat final
    grade_weight = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )
    date = models.DateField(default=date.today)

    course_module = models.ForeignKey(
        CourseModule,
        on_delete=models.PROTECT,
        related_name="assessments",
    )
    school_year = models.ForeignKey(
        SchoolYear,
        on_delete=models.PROTECT,
        related_name="assessments",
    )


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
    score = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
    )

    class Meta:
        unique_together = ("enrollment","assessment")
    