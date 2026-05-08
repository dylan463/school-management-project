from users.models import CustomUser
from .models import SchoolYear,Level,Formation
from .services import create_student_school_year
from users.utils import generate_matricule,generate_password
from django.db import transaction
from .serializers import StudentSchoolYearSerializer
from users.serializers import UserSerializer
from django.core.mail import send_mail

def send_account_creation_email(username,password,email,role):
    role = "étudiant" if role == "STUDENT" else "enseignant"
    send_mail(
            subject=f"Votre compte {role} a été créé",
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
    

def create_user(data):
    role = data.pop("role")
    matricule = generate_matricule(role)
    password = generate_password()
    user = CustomUser.objects.create_user(
        username=matricule,
        password=password,
        role=role,
        **data
    )
    send_account_creation_email(matricule,password,data["email"],role)
    return user

@transaction.atomic
def create_student(data):
    school_year = SchoolYear.objects.get(pk=data.pop("school_year"))
    level = Level.objects.get(pk = data.pop("level"))
    formation = Formation.objects.get(pk = data.pop("formation"))
    student = create_user(data)
    create_student_school_year(
        student= student,
        level= level,
        school_year=school_year,
        formation=formation
    )
    return student
