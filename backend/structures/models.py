from django.db import models
from django.utils import timezone
from users.models import TeacherUser, StudentUser
from django.db.models import Q


# ─────────────────────────────────────────
# STRUCTURE ACADÉMIQUE
# ─────────────────────────────────────────

class Formation(models.Model):
    """Filière / programme : Académique, Luban, etc."""
    label = models.CharField(max_length=100)             # "Académique"
    code = models.CharField(max_length=10, unique=True)  # "ACAD"
    description = models.TextField(blank=True)

    def __str__(self):
        return self.code


class Level(models.Model):
    """Niveau d'étude : L1, L2, L3, M1, M2"""
    code = models.CharField(max_length=100)          # "L1", "M2"
    order = models.PositiveIntegerField(unique=True)  # pour trier / déterminer la promotion

    def __str__(self):
        return self.code

    class Meta:
        ordering = ['order']


class FormationLevel(models.Model):
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name='formation_levels')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='formation_levels')

    class Meta:
        unique_together = ('formation', 'level')
     
    def __str__(self):
        return f"{self.formation} - {self.level}"


class Semester(models.Model):
    """Semestre : S1, S2, S3..."""
    code = models.CharField(max_length=50)           # "S1"
    order = models.PositiveIntegerField(unique=True)  # pour savoir lequel suit lequel
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='semesters')

    def __str__(self):
        return self.code

    class Meta:
        ordering = ['order']



# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────
class SchoolYear(models.Model):
    """Année scolaire : 2024-2025, 2025-2026..."""
    class Status(models.TextChoices):
        UPCOMING = "UPCOMING", "Upcoming"       # pas encore commencée
        ACTIVE = "ACTIVE", "Active"             # en cours
        CLOSED = "CLOSED", "Closed"             # terminée proprement

    label = models.CharField(max_length=20, unique=True)
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

    def __str__(self):
        return self.label

    
    def has_pending_student_school_years(self):
        return self.student_school_years.filter(status__in=["ACTIVE","DELIBERATING",]).exists()
    

# ─────────────────────────────────────────
# INSCRIPTION ANNUELLE
# ─────────────────────────────────────────

class StudentSchoolYear(models.Model):
    """
    Inscription d'un étudiant pour une année scolaire.
    Centralise : formation, niveau, et statut global de l'année.
    Point d'entrée pour la délibération future.
    """
    class Status(models.TextChoices):
        # état pendant l'année scolaire
        ACTIVE = 'ACTIVE', 'Active'
        DELIBERATING = 'DELIBERATING', 'En délibération'
        # basé sur le résultat de la délibération
        PROMOTED = 'PROMOTED', 'Promu'
        REPEAT = 'REPEAT', 'Redoublant'
        EXCLUDED = 'EXCLUDED', 'Exclu'

    student = models.ForeignKey(StudentUser, on_delete=models.CASCADE, related_name='school_years')
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT, related_name='student_school_years')
    formation = models.ForeignKey(Formation, on_delete=models.PROTECT, related_name='student_school_years')
    level = models.ForeignKey(Level, on_delete=models.PROTECT, related_name='student_school_years')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'school_year')
    def __str__(self):
        return f"{self.student} | {self.school_year} | {self.level.code}"

# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

class Enrollment(models.Model):
    """
    Inscription d'un étudiant à un semestre précis.
    Créée progressivement : on attend la validation du semestre précédent
    avant d'ouvrir le suivant.
    """
    class Decision(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS',  'En cours'
        PASSED  = 'PASSED',  'Validé'
        FAILED  = 'FAILED',  'Échoué'

    student_school_year = models.ForeignKey(
        StudentSchoolYear,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='enrollments')

    decision = models.CharField(max_length=20, choices=Decision.choices, default=Decision.IN_PROGRESS)
    is_current = models.BooleanField(default=False)
    opened_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student_school_year', 'semester')
        ordering = ['semester__order']
        constraints = [
            models.UniqueConstraint(
                fields=['student_school_year'],
                condition=Q(is_current=True),
                name='unique_current_enrollment'
            )
        ]
    def __str__(self):
        return f"{self.student_school_year} | {self.semester.code} | {self.decision}"

# ─────────────────────────────────────────────
# UNITÉ D'ENSEIGNEMENT (UE)
# ─────────────────────────────────────────────

class CourseUnit(models.Model):
    """
    Unité d'Enseignement (UE) liée à un semestre et une formation précis.
    Ex : "Mathématiques Fondamentales" en L1 / S1 / Académique
    """
    code = models.CharField(max_length=20, unique=True)  # "UE-MATH-L1S1"
    label = models.CharField(max_length=200)              # "Mathématiques Fondamentales"

    formation = models.ForeignKey(Formation, on_delete=models.PROTECT, related_name='course_units')
    semester = models.ForeignKey(Semester, on_delete=models.PROTECT, related_name='course_units')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('formation', 'semester', 'code')
        ordering = ['semester__order', 'code']

    @property
    def level(self):
        return self.semester.level

    def __str__(self):
        return f"[{self.code}] {self.label} — {self.level.code}/{self.semester.code}"

    def get_total_credits(self):
        """Somme des crédits de tous les modules actifs de cette UE."""
        return self.modules.filter(is_active=True).aggregate(
            total=models.Sum('credits')
        )['total'] or 0


# ─────────────────────────────────────────────
# ÉLÉMENT CONSTITUTIF (EC) — matière/module
# ─────────────────────────────────────────────
from django.core.validators import MinValueValidator,MaxValueValidator

class CourseModule(models.Model):
    """
    Élément Constitutif (EC) d'une UE.
    Représente une matière/module : Maths, Algo, POO...
    Appartient toujours à une seule UE.
    """
    code = models.CharField(max_length=20)   # "EC-ALGO"
    label = models.CharField(max_length=200)  # "Algorithmique"
    credits = models.DecimalField(max_digits=4, decimal_places=2, default=1)
    # note minimale pour validé le module, note avant la multiplication avec le credit , sur 20
    min_val_score = models.IntegerField(default=1,validators=[
        MinValueValidator(1),MaxValueValidator(20)
    ])

    course_unit = models.ForeignKey(
        CourseUnit,
        on_delete=models.CASCADE,
        related_name='modules'
    )

    # enseignant responsable (optionnel à la création)
    teacher = models.ForeignKey(
        TeacherUser,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='course_modules'
    )

    volume_hours = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course_unit', 'code')
        ordering = ['course_unit__semester__order', 'code']

    def __str__(self):
        return f"[{self.code}] {self.label} ({self.course_unit.code})"