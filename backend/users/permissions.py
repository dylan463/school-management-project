# permissions.py
from rest_framework.permissions import BasePermission

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_teacher

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student

class IsSuperUser(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_superuser and request.user.is_authenticated

class IsStaff(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_staff and request.user.is_authenticated

class IsStaffOrSuperUser(BasePermission):
    def has_permission(self,request,view):
        return (request.user.is_staff or request.user.is_superuser) and request.user.is_anthenticated


