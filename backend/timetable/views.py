# timetable/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsTeacher, IsStudent, IsStaffOrSuperUser
from .permissions import IsOwnerTeacher
from .models import TeacherAvailability, TimeSlot
from .serializers import (
    TeacherAvailabilitySerializer,
    TimeSlotSerializer,
    TimeSlotWriteSerializer,
)
from structures.models import Enrollement


# ─────────────────────────────────────────────
# DISPONIBILITÉS ENSEIGNANT
# ─────────────────────────────────────────────
class TeacherAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class   = TeacherAvailabilitySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Admin voit toutes les dispos, enseignant voit les siennes
            return [IsAuthenticated()]
        if self.action in ['create']:
            return [IsTeacher()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsTeacher(), IsOwnerTeacher()]
        return [IsStaffOrSuperUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            # Admin : toutes les dispos, filtrables par semester
            qs = TeacherAvailability.objects.select_related('teacher', 'semester')
            semester_id = self.request.query_params.get('semester')
            if semester_id:
                qs = qs.filter(semester_id=semester_id)
            return qs
        if user.is_teacher:
            # Enseignant : seulement ses propres dispos
            return TeacherAvailability.objects.filter(teacher=user)
        return TeacherAvailability.objects.none()

    def perform_create(self, serializer):
        # Le teacher est toujours l'utilisateur connecté
        serializer.save(teacher=self.request.user)


# ─────────────────────────────────────────────
# EMPLOI DU TEMPS (TimeSlot)
# ─────────────────────────────────────────────
class TimeSlotViewSet(viewsets.ModelViewSet):

    def get_serializer_class(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return TimeSlotWriteSerializer
        return TimeSlotSerializer  # lecture seule pour étudiant / enseignant

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Seul l'admin crée, modifie, supprime, publie
        return [IsStaffOrSuperUser()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            # Admin : tout, filtrables par semester
            qs = TimeSlot.objects.select_related(
                'course_component', 'teacher', 'semester'
            )
            semester_id = self.request.query_params.get('semester')
            if semester_id:
                qs = qs.filter(semester_id=semester_id)
            return qs

        if user.is_student:
            # Étudiant : seulement les créneaux publiés de SA classe (son semestre actif)
            enrollment = Enrollement.objects.filter(
                student=user,
                Semester__is_active=True
            ).first()
            if not enrollment:
                return TimeSlot.objects.none()
            return TimeSlot.objects.filter(
                semester=enrollment.Semester,
                is_published=True
            ).select_related('course_component', 'teacher')

        if user.is_teacher:
            # Enseignant : créneaux publiés des semestres où il enseigne
            return TimeSlot.objects.filter(
                teacher=user,
                is_published=True
            ).select_related('course_component', 'semester')

        return TimeSlot.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrSuperUser])
    def publish(self, request, pk=None):
        """POST /timetable/timeslots/{id}/publish/ — publier un créneau."""
        slot = self.get_object()
        slot.is_published = True
        slot.save()
        return Response({'status': 'publié'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsStaffOrSuperUser])
    def publish_all(self, request):
        """POST /timetable/timeslots/publish_all/?semester=X — tout publier d'un semestre."""
        semester_id = request.query_params.get('semester')
        if not semester_id:
            return Response(
                {'error': 'Paramètre semester requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        updated = TimeSlot.objects.filter(
            semester_id=semester_id, is_published=False
        ).update(is_published=True)
        return Response({'publié': updated}, status=status.HTTP_200_OK)