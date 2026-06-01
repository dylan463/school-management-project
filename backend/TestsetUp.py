import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from structures.models import User, Role, Formation, Semester, SchoolYear, Mention

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
        mention = Mention.objects.create(
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
    try:
        mention = Mention.objects.get(code="TCO")
    except Mention.DoesNotExist:
        mention = Mention.objects.create(
            text="Télécommunication",
            code="TCO"
            )

    formation = Formation.objects.create(
        text="RS",
        code="rs",
        mention=mention
    )
    semester = Semester.objects.create(
        code="S1",
        order=1,
        mention=mention
    )
    school_year = SchoolYear.objects.create(
        text="2026-2027",
        mention=mention
    )


if __name__ == "__main__":
    create_system_admin()
    create_tco_head()
    setup_database_structure()