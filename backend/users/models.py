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


class MatriculeCounter(models.Model):
    role = models.CharField(max_length=20, unique=True)
    mention = models.ForeignKey(Mention,on_delete=models.CASCADE)
    last_number = models.IntegerField(default=0)