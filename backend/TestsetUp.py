import os
import django
import pandas as pd
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from structures.user_services import create_user
from assessments.services import create_enrollment
from structures.models import User, Role, Formation, Semester, SchoolYear, Mention,CourseModule,CourseUnit

class SystemAdmin:
    email = "sysadmin@gmail.com"
    username = "sysadmin"
    password = "dldldldl"


class TCOHead:
    email = "tco_head@gmail.com"
    username = "tcohead"
    password = "dldldldl"

def create_system_admin():
    try:
        sys_admin = User.objects.get(role=Role.SYSTEM_ADMIN,email=SystemAdmin.email)
        print("SystemAdmin existe déjà")
    except User.DoesNotExist:
        sys_admin = User.objects.create_user(
            email=SystemAdmin.email,
            username=SystemAdmin.username,
            role=Role.SYSTEM_ADMIN,
            mention=None,
            is_staff=True,
            is_superuser=True,
        )
        sys_admin.set_password(SystemAdmin.password)
        sys_admin.save()
        print("SystemAdmin créé avec succès")


def create_tco_head():
    try:
        mention = Mention.objects.get(text="Informatique")
    except Mention.DoesNotExist:
        mention,_ = Mention.objects.get_or_create(
            text="Télécommunication",
            code="TCO"
            )
    try:
        tco_head = User.objects.get(role=Role.DEPARTMENT_HEAD,email=TCOHead.email)
        print("TCO Head existe déjà")
    except User.DoesNotExist:
        tco_head = User.objects.create_user(
            email=TCOHead.email,
            username=TCOHead.username,
            password=TCOHead.password,
            role=Role.DEPARTMENT_HEAD,
            mention=mention,
            is_staff=True,
            is_superuser=True,
        )
        tco_head.set_password(TCOHead.password)
        tco_head.save()
        print("TCO Head créé avec succès")


def setup_database_structure():
    """Setup database structure for testing"""
    mention,_ = Mention.objects.get_or_create(
        text="Télécommunication",
        code="TCO"
        )
    school_year,_ = SchoolYear.objects.get_or_create(
        text="2026-2027",
        mention=mention
    )


def enterStudents():
    """setup users"""
    file_name = "listeTCO.csv"
    df = pd.read_csv(file_name)
    total = len(df)
    current = 0
    mention,_ = Mention.objects.get_or_create(
        text="Télécommunication",
        code="TCO"
        )
    school_year,_ = SchoolYear.objects.get_or_create(
        text="2026-2027",
        mention=mention
    )
    role = Role.STUDENT 
    for i, row in df.iterrows():
        try:
            cycle = 0 if row["Niveau"][0] == "L" else 3
            order = (int(re.search(r"\d+", row["Niveau"]).group()) + cycle) * 2 - 1
            code = f"S{order}"

            semester, _ = Semester.objects.get_or_create(
                code=code,
                order=order,
                mention=mention
            )
            code = row["Formation"]
            formation , _ = Formation.objects.get_or_create(
                code=code,
                text=code,
                mention=mention
            )

            first_name = row["Prenom"]
            last_name = row["Nom"]
            email = row["email"]
            student = create_user(first_name,last_name,email,role,mention,no_email=False)
            create_enrollment(student,school_year,semester,formation,no_notification=False)
        except Exception as e:
            pass
        finally:
            current += 1
            if i%10 == 0:
                print(f"progression de creation d'utilisateur: {current}/{total}")


def enterEC():
    mention,_ = Mention.objects.get_or_create(
        text="Télécommunication",
        code="TCO"
        )

    formation , _= Formation.objects.get_or_create(code="ACAD",text="ACAD",mention=mention)
    file_name = "matieres_db.csv"
    df = pd.read_csv(file_name)
    total= len(df)
    current = 0
    for i,row in df.iterrows():
        try:
            code= row["Semestre"]
            order = int(re.search(r"\d+",code).group())
            semester,_ = Semester.objects.get_or_create(code=code,order=order,mention=mention)

            code = row["UE"]

            couse_unit , _ = CourseUnit.objects.get_or_create(
                code=code,
                text=code,
                formation=formation
            )

            text = row['Nom_matiere']

            CourseModule.objects.create(
                text=text,
                code=text,
                course_unit= couse_unit,
                semester=semester
            )
        except :
            pass
        finally:
            current+=1
            if i%10 == 0:
                print(f"progression de creation de matière : {current}/{total}")


def enterTeachers():
    """setup users"""
    file_name = "professeurs.csv"
    df = pd.read_csv(file_name)
    total = len(df)
    current = 0
    mention,_ = Mention.objects.get_or_create(
        text="Télécommunication",
        code="TCO"
        )
    role = Role.TEACHER
    for i, row in df.iterrows():
        try:
            first_name = row["Prenoms"]
            last_name = row["Nom"]
            email = row["email"]
            teacher = create_user(first_name,last_name,email,role,mention,no_email=False)
        except Exception as e:
            pass
        finally:
            current += 1
            print(f"progression de creation d'utilisateur: {current}/{total}")    


if __name__ == "__main__":
    create_system_admin()
    create_tco_head()
    setup_database_structure()
    enterStudents()
    enterEC()
    enterTeachers()