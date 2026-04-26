# timetable/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import *
from .permissions import IsOwnerTeacher
from .models import TeacherAvailability, TimeSlot
from .serializers import (
    TeacherAvailabilitySerializer,
    TimeSlotSerializer,
    TimeSlotWriteSerializer,
)
from .services import (
    create_teacher_availability,
    get_teacher_availabilities,
    get_availabilities_for_semester,
    create_timeslot,
    publish_timeslot,
    publish_all_timeslots_for_semester,
    get_timeslots_for_semester,
    get_student_timeslots,
    get_teacher_timeslots,
)


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
        return [IsSuperUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            # Admin : toutes les dispos, filtrables par semester
            semester_id = self.request.query_params.get('semester')
            return get_availabilities_for_semester(semester_id) if semester_id else TeacherAvailability.objects.select_related('teacher', 'semester')
        if user.role == 'TEACHER':
            # Enseignant : seulement ses propres dispos
            semester_id = self.request.query_params.get('semester')
            return get_teacher_availabilities(user, semester_id)
        return TeacherAvailability.objects.none()

    def perform_create(self, serializer):
        # Utiliser le service pour créer la disponibilité
        data = serializer.validated_data
        create_teacher_availability(
            teacher=self.request.user,
            semester=data['semester'],
            day=data['day'],
            start_time=data['start_time'],
            end_time=data['end_time']
        )


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
        return [IsSuperUser()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            # Admin : tout, filtrables par semester
            semester_id = self.request.query_params.get('semester')
            return get_timeslots_for_semester(semester_id) if semester_id else TimeSlot.objects.select_related('course_component', 'teacher', 'semester')

        if user.role == 'STUDENT':
            # Étudiant : seulement les créneaux publiés de SA classe (son semestre actif)
            from structures.models import Enrollment
            enrollment = Enrollment.objects.filter(
                student_school_year__student=user,
                is_current=True,
            ).first()
            if not enrollment:
                return TimeSlot.objects.none()
            return get_student_timeslots(user, enrollment.semester)

        if user.role == 'TEACHER':
            # Enseignant : créneaux publiés des semestres où il enseigne
            return get_teacher_timeslots(user)

        return TimeSlot.objects.none()

    def perform_create(self, serializer):
        # Utiliser le service pour créer le créneau
        data = serializer.validated_data
        create_timeslot(
            semester=data['semester'],
            course_component=data['course_component'],
            teacher=data['teacher'],
            day=data['day'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            room=data.get('room', '')
        )

    @action(detail=True, methods=['post'], permission_classes=[IsSuperUser])
    def publish(self, request, pk=None):
        """POST /timetable/timeslots/{id}/publish/ — publier un créneau."""
        slot = self.get_object()
        publish_timeslot(slot)
        return Response({'status': 'publié'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsSuperUser])
    def publish_all(self, request):
        """POST /timetable/timeslots/publish_all/?semester=X — tout publier d'un semestre."""
        semester_id = request.query_params.get('semester')
        if not semester_id:
            return Response(
                {'error': 'Paramètre semester requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        from structures.models import Semester
        try:
            semester = Semester.objects.get(id=semester_id)
        except Semester.DoesNotExist:
            return Response(
                {'error': 'Semestre non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        updated = publish_all_timeslots_for_semester(semester)
        return Response({'publié': updated}, status=status.HTTP_200_OK)