from .models import MatriculeCounter,User,Role,Mention
from django.db import transaction
import secrets
import string
from rest_framework.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.apps import apps
GROUP1 = [Role.STUDENT,Role.TEACHER,Role.REGISTRAR_OFFICER]

def send_email(
    subject: str,
    text_content: str,
    to: list[str],
    html_content: str | None = None,
):
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to,
    )

    if html_content:
        msg.attach_alternative(html_content, "text/html")

    msg.send()

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

    counter, created = MatriculeCounter.objects.select_for_update().get_or_create(role=role,mention=mention)
    counter.last_number += 1
    counter.save()

    return f"{prefix}-{counter.last_number}"

def generate_password(length=10):
    """Génère un mot de passe aléatoire sécurisé"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


@transaction.atomic
def create_user(data: dict,role,mention):
    
    username = generate_matricule(role, mention)
    password = generate_password(8)

    email = data.pop('email')
    data["username"] = username
    data["role"] = role
    data["mention"] = mention

    user = User.objects.create_user(email=email,password=password,**data)

    text_content = f"""
    Voici votre matricule et votre mot de passe.Veillez songer a changer votre mot de passe en arrivant sur la plateforme.

    matricule : {username}

    mot de pass : {password}

"""
    send_email('Creation de votre compte EDUCATIF',text_content,[user.email])


    return user

Formation = apps.get_model('structures','Formation')
Semeter = apps.get_model('structures','Semester')
SchoolYear = apps.get_model('structures','SchoolYear')

@transaction.atomic
def delete_mention(mention:Mention):
    if Formation.objects.filter(mention=mention).exists():
        raise ValidationError({"detail":'suppression imposible : des formation y sont référencées.'})
    if Semeter.objects.filter(mention=mention).exists():
        raise ValidationError({"detail":'suppression imposible : des semestre y sont référencés.'})
    if SchoolYear.objects.filter(mention=mention).exists():
        raise ValidationError({"detail":'suppression imposible : des années scolaire y sont référencées.'})
    mention.delete()
        