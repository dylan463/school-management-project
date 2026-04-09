from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Étudiant'
        TEACHER = 'TEACHER', 'Professeur'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    def save(self, *args, **kwargs):
        # # Un étudiant ne peut JAMAIS être admin ou staff
        if self.role == self.Role.STUDENT:
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT
    

class StudentManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role=CustomUser.Role.STUDENT)

class TeacherManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(role=CustomUser.Role.TEACHER)

class StudentUser(CustomUser):
    objects = StudentManager()
    class Meta:
        proxy = True

class TeacherUser(CustomUser):
    objects = TeacherManager()
    class Meta:
        proxy = True