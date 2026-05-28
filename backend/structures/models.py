from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator,MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.db import models


class Mention(models.Model):
    text = models.CharField(max_length=40)
    code = models.CharField(max_length=20)

class Role(models.TextChoices):
    SYSTEM_ADMIN        = 'system_admin',       'System Admin'
    DEPARTMENT_HEAD     = 'department_head',    'Department Head'
    DEPARTMENT_SECRETARY = 'department_secretary', 'Department Secretary'
    REGISTRAR_OFFICER   = 'registrar_officer',  'Registrar Officer'
    TEACHER             = 'teacher',            'Teacher'
    STUDENT             = 'student',            'Student'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    mention = models.ForeignKey(Mention,on_delete=models.PROTECT,blank=True,null=True)
    def save(self, *args, **kwargs):
        if not (self.role == Role.SYSTEM_ADMIN):
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["id"]


class MatriculeCounter(models.Model):
    role = models.CharField(max_length=20)
    mention = models.ForeignKey(Mention,on_delete=models.CASCADE)
    last_number = models.IntegerField(default=0)

    class Meta:
        unique_together = ('role','mention')


class Formation(models.Model):
    """Filière / programme : Académique, Luban, etc."""
    mention = models.ForeignKey(Mention,on_delete=models.PROTECT)
    text = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['text']

class Semester(models.Model):
    """Semestre : S1, S2, S3..."""
    mention = models.ForeignKey(Mention,on_delete=models.PROTECT)
    code = models.CharField(max_length=50)           # "S1"
    order = models.PositiveIntegerField(unique=True)  # pour savoir lequel suit lequel
    is_active = models.BooleanField(default=True)

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

    mention = models.ForeignKey(Mention,on_delete=models.PROTECT)
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
        ordering = ['text']

class CourseUnit(models.Model):
    """
    Unité d'Enseignement (UE) liée une formation précis.
    Ex : "Mathématiques" 
    """
    code = models.CharField(max_length=20, unique=True)  # "UE1"
    text = models.CharField(max_length=200)              # "Mathématiques"

    formation = models.ForeignKey(Formation, on_delete=models.PROTECT, related_name='course_units')

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('formation','code')
        ordering = ['formation__text', 'code']

    def get_total_credits(self):
        """Somme des crédits de tous les modules actifs de cette UE."""
        return self.modules.filter(is_active=True).aggregate(
            total=models.Sum('credits')
        )['total'] or 0

class CourseModule(models.Model):
    """
    Élément Constitutif (EC) d'une UE.
    Représente une matière/module : math appliqué, math théorique...
    Appartient toujours à une seule UE et un semestre.
    """
    code = models.CharField(max_length=20)   # "EC-ALGO"
    text = models.CharField(max_length=200)  # "Algorithmique"
    credits = models.PositiveIntegerField(default=1)
    
    min_val_score = models.IntegerField(default=1,validators=[
        MinValueValidator(1),MaxValueValidator(20)
    ])

    course_unit = models.ForeignKey(
        CourseUnit,
        on_delete=models.PROTECT,
        related_name='course_modules'
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.PROTECT,
        related_name='course_modules'
    )

    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='course_modules'
    )

    volume_hours = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('course_unit', 'code')
        ordering = ['semester__order', 'code']