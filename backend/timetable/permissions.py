# timetable/permissions.py
from rest_framework.permissions import BasePermission

class IsOwnerTeacher(BasePermission):
    """Un enseignant ne peut modifier que ses propres disponibilités."""
    def has_object_permission(self, request, view, obj):
        return obj.teacher == request.user