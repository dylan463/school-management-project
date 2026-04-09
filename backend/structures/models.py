from django.db import models
from users.models import TeacherUser,StudentUser

# Create your models here.
class Level(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)

class Formation(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

class Semester(models.Model):
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

class TeachingUnit(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE,related_name="teachingunit")
    description = models.TextField(blank=True)

    @property
    def total_credits(self):
        return self.components.aggregate(
            Sum("credits")
        )["credits__sum"] or 0

class CourseComponent(models.Model):
    name = models.CharField(max_length=100)
    teaching_unit = models.ForeignKey(TeachingUnit, on_delete=models.CASCADE,related_name="components")
    course_credits = models.PositiveIntegerField()
    teacher = models.ForeignKey(TeacherUser)

class Enrollement(models.Model):
    student = models.ForeignKey(StudentUser,on_delete=models.CASCADE, related_name="enrollements")
    Semester = models.ForeignKey(Semester,on_delete=models.CASCADE,related_name="enrollements")
    date_registered = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.semester.is_active:
            enrollment = Enrollment.objects.filter(
                student=self.student,
                semester__is_active=True
            ).exclude(pk=self.pk)

            if enrollment.exists():
                raise ValidationError(
                    "Cet étudiant est déjà inscrit dans un semestre actif."
                )

    def save(self, *args, **kwargs):
        self.clean()  # on vérifie la règle
        super().save(*args, **kwargs)  # on sauvegarde