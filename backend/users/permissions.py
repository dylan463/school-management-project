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
        return request.user.is_superuser and request.user.is_authenticated

class IsStaff(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_staff and request.user.is_authenticated

class IsStaffOrSuperUser(BasePermission):
    def has_permission(self,request,view):
        return (request.user.is_staff or request.user.is_superuser) and request.user.is_authenticated


