from rest_framework import viewsets, permissions
from .models import Level, Formation, Semester, TeachingUnit, CourseComponent, Enrollement
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,
    TeachingUnitSerializer, CourseComponentSerializer, EnrollementSerializer
)
from rest_framework.exceptions import ValidationError


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAdminUser]  # Seul l'admin peut modifier

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [permissions.IsAdminUser]

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [permissions.IsAdminUser]

class TeachingUnitViewSet(viewsets.ModelViewSet):
    queryset = TeachingUnit.objects.all()
    serializer_class = TeachingUnitSerializer
    permission_classes = [permissions.IsAdminUser]

class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer
    permission_classes = [permissions.IsAdminUser]

class EnrollementViewSet(viewsets.ModelViewSet):
    queryset = Enrollement.objects.all()
    serializer_class = EnrollementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Enrollement.objects.all()
        return Enrollement.objects.filter(student=user)

    def perform_create(self, serializer):
        student = self.request.user
        semester = serializer.validated_data['semester']

        # Vérifier qu'il n'a pas déjà un enrollement actif
        if semester.is_active and Enrollement.objects.filter(student=student, semester__is_active=True).exists():
            raise ValidationError("Vous êtes déjà inscrit dans un semestre actif.")

        serializer.save(student=student)



