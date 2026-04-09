# utils.py
from .models import CustomUser
import secrets
import string

def generate_matricule(role):
    """Génère un matricule incrémental selon le rôle"""
    prefix = 'STU' if role == CustomUser.Role.STUDENT else 'TEA'
    
    # Compter les utilisateurs existants avec ce rôle
    count = CustomUser.objects.filter(role=role).count() + 1
    
    return f"{prefix}-{count}"


def generate_password(length=10):
    """Génère un mot de passe aléatoire sécurisé"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))