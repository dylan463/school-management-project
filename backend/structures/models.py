from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator,MaxValueValidator

class Formation(models.Model):
    """Filière / programme : Académique, Luban, etc."""
    mention = models.ForeignKey('users.Mention',on_delete=models.PROTECT)
    text = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.code

class Semester(models.Model):
    """Semestre : S1, S2, S3..."""
    mention = models.ForeignKey('users.Mention',on_delete=models.PROTECT)
    code = models.CharField(max_length=50)           # "S1"
    order = models.PositiveIntegerField(unique=True)  # pour savoir lequel suit lequel

    class Meta:
        ordering = ['order']


class SchoolYear(models.Model):
    """
    année scolaire ex : 2025-2026
    """
    class Status(models.TextChoices):
        UPCOMING = "UPCOMING", "Upcoming"       # pas encore commencée
        ACTIVE = "ACTIVE", "Active"             # en cours
        CLOSED = "CLOSED", "Closed"             # terminée proprement

    mention = models.ForeignKey('users.Mention',on_delete=models.PROTECT)
    text = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.UPCOMING
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['status'],
                condition=Q(status="ACTIVE"),
                name='unique_active_school_year'
            ),
            models.UniqueConstraint(
                fields=['status'],
                condition=Q(status="UPCOMING"),
                name='unique_upcoming_school_year'
            ),
        ]


class Enrollment(models.Model):
    
    """
    Inscription d'un étudiant à un semestre précis.

    """
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE',  'En cours'
        VALIDATED = 'VALIDATED',  'Validé'
        NOT_VALIDATED = 'NOT_VALIDATED',  'Échoué'

    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='enrollments')
    formation = models.ForeignKey(Formation,on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey('users.Users',on_delete=models.CASCADE, related_name='enrollments')
    school_year = models.ForeignKey(SchoolYear,on_delete=models.PROTECT, related_name='enrollments')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    opened_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student','school_year')
        ordering = ['semester__order']



class CourseUnit(models.Model):
    """
    Unité d'Enseignement (UE) liée à un semestre et une formation précis.
    Ex : "Mathématiques Fondamentales" en L1 / S1 / Académique
    """
    code = models.CharField(max_length=20, unique=True)  # "UE-MATH-L1S1"
    text = models.CharField(max_length=200)              # "Mathématiques Fondamentales"

    formation = models.ForeignKey(Formation, on_delete=models.PROTECT, related_name='course_units')

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('formation','code')
        ordering = ['semester__order', 'code']

    def get_total_credits(self):
        """Somme des crédits de tous les modules actifs de cette UE."""
        return self.modules.filter(is_active=True).aggregate(
            total=models.Sum('credits')
        )['total'] or 0

class CourseModule(models.Model):
    """
    Élément Constitutif (EC) d'une UE.
    Représente une matière/module : Maths, Algo, POO...
    Appartient toujours à une seule UE.
    """
    code = models.CharField(max_length=20)   # "EC-ALGO"
    text = models.CharField(max_length=200)  # "Algorithmique"
    credits = models.PositiveIntegerField(default=1)
    
    min_val_score = models.IntegerField(default=1,validators=[
        MinValueValidator(1),MaxValueValidator(20)
    ])

    course_unit = models.ForeignKey(
        CourseUnit,
        on_delete=models.CASCADE,
        related_name='course_modules'
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name='course_modules'
    )

    # enseignant responsable (optionnel à la création)
    teacher = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='course_modules'
    )

    volume_hours = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('course_unit', 'code')
        ordering = ['semester__order', 'code']