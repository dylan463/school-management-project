from .models import MatriculeCounter,User,Role
from django.db import transaction
import secrets
import string


def generate_matricule(role,mention):
    def getPrefix(role):
        if role == Role.TEACHER:
            return 'TEACHER'
        elif role == Role.DEPARTMENT_HEAD:
            return 'HEAD'
        elif role == Role.DEPARTMENT_SECRETARY:
            return 'SECRETARY'
        elif role == Role.REGISTRAR_OFFICER:
            return 'REGISTAR'
        else:
            return 'STUDENT'
    
    prefix = f'{getPrefix(role)}-{mention.code}'

    with transaction.atomic():
        counter, created = MatriculeCounter.objects.select_for_update().get_or_create(role=role,mention=mention)
        counter.last_number += 1
        counter.save()

        return f"{prefix}-{counter.last_number}"

def generate_password(length=10):
    """Génère un mot de passe aléatoire sécurisé"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

