# utils.py
from .models import MatriculeCounter,CustomUser
from django.db import transaction
import secrets
import string


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