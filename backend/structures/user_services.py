from .models import MatriculeCounter,User,Role,Mention
from django.db import transaction
import secrets
import string
from rest_framework.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.apps import apps
GROUP1 = [Role.STUDENT,Role.TEACHER,Role.REGISTRAR_OFFICER]

def registration_email_template(matricule, password, mention: str):
    text_content = f"""
    Bienvenue dans la mention {mention}.
    Nous vous avons créé un compte afin de vous connecter au site web de l'établissement.
    Voici votre identifiant (matricule) et votre mot de passe. Remplacez votre mot de
    passe dès votre première connexion afin de ne pas le perdre.

    Matricule : {matricule}
    Mot de passe : {password}
    """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
            .body {{ padding: 20px 0; color: #333; line-height: 1.6; }}
            .credentials {{ background-color: #f0f4f8; border-left: 4px solid #2c3e50; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }}
            .credentials p {{ margin: 8px 0; font-size: 16px; }}
            .credentials span {{ font-weight: bold; color: #2c3e50; }}
            .warning {{ color: #e74c3c; font-size: 13px; margin-top: 20px; }}
            .footer {{ text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Bienvenue dans la mention {mention}</h2>
            </div>
            <div class="body">
                <p>Nous vous avons créé un compte afin de vous connecter au site web de l'établissement.</p>
                <p>Voici vos identifiants de connexion :</p>
                <div class="credentials">
                    <p>Matricule : <span>{matricule}</span></p>
                    <p>Mot de passe : <span>{password}</span></p>
                </div>
                <p class="warning">⚠️ Remplacez votre mot de passe dès votre première connexion afin de ne pas le perdre.</p>
            </div>
            <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return text_content, html_content

def reset_password_email_template(reset_link: str, mention: str):
    text_content = f"""
    Réinitialisation de votre mot de passe - Mention {mention}

    Vous avez demandé la réinitialisation de votre mot de passe.
    Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe.

    Lien de réinitialisation : {reset_link}

    Ce lien est valable 24 heures.

    Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    Votre mot de passe restera inchangé.
    """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
            .body {{ padding: 20px 0; color: #333; line-height: 1.6; }}
            .btn {{ display: inline-block; padding: 12px 30px; background-color: #2c3e50; color: white !important; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px 0; }}
            .btn:hover {{ background-color: #1a252f; }}
            .expiry {{ background-color: #f0f4f8; border-left: 4px solid #f39c12; padding: 12px 20px; border-radius: 4px; margin: 20px 0; color: #856404; }}
            .warning {{ color: #e74c3c; font-size: 13px; margin-top: 20px; }}
            .footer {{ text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Réinitialisation de mot de passe</h2>
                <p style="margin:0; font-size:14px;">Mention {mention}</p>
            </div>
            <div class="body">
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                <div style="text-align: center;">
                    <a href="{reset_link}" class="btn">Réinitialiser mon mot de passe</a>
                </div>
                <div class="expiry">
                    ⏳ Ce lien est valable <strong>24 heures</strong>.
                </div>
                <p class="warning">⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre mot de passe restera inchangé.</p>
            </div>
            <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return text_content, html_content

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
def create_user(first_name,last_name,email,role,mention,no_email=False,return_password=False):
    if User.objects.filter(email=email).exists():
        raise ValidationError({"email":"cet email est déjà utilisé"})
    
    username = generate_matricule(role, mention)
    password = generate_password(8)

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        mention=mention
    )
    user.set_password(password)
    user.save()
    if not no_email:
        text_content,html_content = registration_email_template(username,password,mention.text)
        send_email('Creation de votre compte.',text_content,[user.email],html_content)

    if return_password:
        return user,password
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
        