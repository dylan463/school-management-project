# permissions.py
from rest_framework.permissions import BasePermission
from .models import CustomUser

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == CustomUser.Role.TEACHER

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == CustomUser.Role.STUDENT

class IsSuperUser(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.role == CustomUser.Role.SUPERUSER

class NoSuperUserAccess(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
    def has_object_permission(self, request, view, obj):
        if obj.role == CustomUser.Role.SUPERUSER:
            return False
        return True

class CannotDeleteAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if view.action == "destroy" and obj.role == CustomUser.Role.SUPERUSER:
            return False
        return True