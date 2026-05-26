# permissions.py
from rest_framework.permissions import BasePermission
from .models import Role


class IsAuthenticatedAndRole(BasePermission):
    """
    Permission de base pour vérifier auth + rôle.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in self.allowed_roles
        )


# --------- Rôles simples ---------

class IsTeacher(IsAuthenticatedAndRole):
    allowed_roles = [Role.TEACHER]


class IsStudent(IsAuthenticatedAndRole):
    allowed_roles = [Role.STUDENT]


class IsSystemAdmin(IsAuthenticatedAndRole):
    allowed_roles = [Role.SYSTEM_ADMIN]


# --------- Rôles administratifs ---------

class IsDepartmentHead(IsAuthenticatedAndRole):
    allowed_roles = [Role.DEPARTMENT_HEAD]


class IsDepartmentSecretary(IsAuthenticatedAndRole):
    allowed_roles = [Role.DEPARTMENT_SECRETARY]


class IsRegistrarOfficer(IsAuthenticatedAndRole):
    allowed_roles = [Role.REGISTRAR_OFFICER]


# --------- Groupes métier (très utile pour les vues) ---------

class IsDepartmentStaff(IsAuthenticatedAndRole):
    """
    Personnel du département
    """
    allowed_roles = [
        Role.DEPARTMENT_HEAD,
        Role.DEPARTMENT_SECRETARY
    ]


class IsAcademicStaff(IsAuthenticatedAndRole):
    """
    Tout le staff académique
    """
    allowed_roles = [
        Role.TEACHER,
        Role.DEPARTMENT_HEAD,
        Role.DEPARTMENT_SECRETARY
    ]


class IsInMention(IsAuthenticatedAndRole):
    """
    Gestion de la mention (administration académique élargie)
    """
    allowed_roles = [
        Role.DEPARTMENT_HEAD,
        Role.DEPARTMENT_SECRETARY,
        Role.REGISTRAR_OFFICER,
        Role.TEACHER,
        Role.STUDENT
    ]