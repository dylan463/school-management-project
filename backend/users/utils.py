# utils.py
from .models import MatriculeCounter,CustomUser
from django.db import transaction
import secrets
import string
from django.core.mail import send_mail

def generate_matricule(role):
    prefix = 'STU' if role == CustomUser.Role.STUDENT else 'TEA'

    with transaction.atomic():
        counter, created = MatriculeCounter.objects.select_for_update().get_or_create(role=role)

        counter.last_number += 1
        counter.save()

        return f"{prefix}-{counter.last_number}"

def generate_password(length=10):
    """Génère un mot de passe aléatoire sécurisé"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def send_email(username,password,email):
    send_mail(
            subject="Votre compte TELECOM a été créé",
            message=f"""
Bonjour {username},

Votre compte a été créé.

Identifiant : {username}
Mot de passe : {password}

Veuillez vous connecter et changer votre mot de passe.
""",
            from_email="no-reply@school.com",
            recipient_list=[email],
            fail_silently=False
        )


def is_user_student(user):
    return user.role == CustomUser.Role.STUDENT

def is_user_teacher(user):
    return user.role == CustomUser.Role.TEACHER

def is_user_superuser(user):
    return user.role == CustomUser.Role.SUPERUSER
