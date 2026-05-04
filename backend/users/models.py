from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("Le username est requis")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", CustomUser.Role.TEACHER)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser doit avoir is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser doit avoir is_superuser=True")

        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Étudiant'
        TEACHER = 'TEACHER', 'Professeur'

    class Status(models.TextChoices):
        PASSANT = 'PASSANT', 'Passant'
        REDOUBLANT = 'REDOUBLANT', 'Redoublant'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    
    # Informations personnelles
    phone = models.CharField(max_length=20, blank=True, null=True)
    grade = models.CharField(max_length=100, blank=True, null=True)
    subjects = models.TextField(blank=True, null=True, verbose_name="Matières enseignées")
    date_of_birth = models.DateField(blank=True, null=True)
    place_of_birth = models.CharField(max_length=200, blank=True, null=True)
    cin = models.CharField(max_length=50, blank=True, null=True, verbose_name="Numéro d'identité")
    current_semester = models.PositiveIntegerField(blank=True, null=True, verbose_name="Semestre actuel")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        blank=True,
        null=True,
        verbose_name="Statut académique"
    )
    
    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        # # Un étudiant ne peut JAMAIS être admin ou staff
        if self.role == self.Role.STUDENT:
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)

    

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

class MatriculeCounter(models.Model):
    role = models.CharField(max_length=20, unique=True)
    last_number = models.IntegerField(default=0)