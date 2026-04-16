from django.db import models
from users.models import TeacherUser,StudentUser

# le niveau d'étude (L1, L2, L3, M1, M2)
class Level(models.Model):
    code = models.CharField(max_length=100)
    number = models.PositiveIntegerField(unique=True, null=True, blank=True)

# la formation (ex: academique, luban...)
class Formation(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

# le semestre (ex: S1, S2, S3...) qui appartient à un niveau et une formation
class Semester(models.Model):
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)


# unité d'enseignement (ex: Mathématiques, Physique...) qui appartient à un semestre
class TeachingUnit(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE,related_name="teachingunits")
    description = models.TextField(blank=True)

    @property
    def total_credits(self):
        return self.components.aggregate(
            Sum("credits")
        )["credits__sum"] or 0

# composante d'une unité d'enseignement (ex: Algèbre, Analyse...) qui appartient à une unité d'enseignement et est enseignée par un enseignant
class CourseComponent(models.Model):
    name = models.CharField(max_length=100)
    teaching_unit = models.ForeignKey(TeachingUnit, on_delete=models.CASCADE,related_name="courses")
    course_credits = models.PositiveIntegerField()
    teacher = models.ForeignKey(TeacherUser,on_delete=models.SET_NULL,null=True,blank=True)

# l'inscription d'un étudiant à un semestre, avec une règle d'un seul semestre actif par étudiant
class Enrollement(models.Model):
    student = models.ForeignKey(
        StudentUser,
        on_delete=models.CASCADE,
        related_name="enrollements"
    )
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="enrollements"
    )
    date_registered = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "semester"],
                name="unique_enrollment"
            )
        ]

    def clean(self):
        # règle métier : semestre doit être actif
        if not self.semester.is_active:
            raise ValidationError("Le semestre n'est pas actif")