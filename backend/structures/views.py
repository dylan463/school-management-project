from rest_framework import viewsets
from .models import Level, Formation, Semester, TeachingUnit, CourseComponent, Enrollement
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,
    TeachingUnitSerializer, CourseComponentSerializer, EnrollementSerializer
)
from rest_framework.exceptions import ValidationError
from users.permissions import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from users.models import StudentUser
from users.serializers import UserSerializer
from rest_framework.response import Response
from django.db.models import Count

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsStaffOrSuperUser]

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsStaffOrSuperUser]

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsStaffOrSuperUser]

    @action(detail=True,methods=["GET"])
    def students(self,request,pk = None):
        semester = self.get_object()
        students = StudentUser.objects.filter(enrollements__semester = semester)
        serializer = UserSerializer(students,many= True)
        return Response(serializer.data)

class TeachingUnitViewSet(viewsets.ModelViewSet):
    serializer_class = TeachingUnitSerializer
    permission_classes = [IsStaffOrSuperUser]

    def get_queryset(self):
        return TeachingUnit.objects.prefetch_related('courses').annotate(
            courses_count=Count('courses')
        )



class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer
    permission_classes = [IsStaffOrSuperUser]

    @action(detail=False,methods=["GET"],url_path="my-students")
    def my_students(self,request):
        courses = CourseComponent.objects.filter(teacher=request.user)
        students = StudentUser.objects.filter(enrollements__semester__teachingunits__courses__in=courses).distinct()
        serializer = UserSerializer(students,many = True)
        return Response(serializer.data)

class EnrollementViewSet(viewsets.ModelViewSet):
    queryset = Enrollement.objects.all()
    serializer_class = EnrollementSerializer
    permission_classes = [IsStaffOrSuperUser]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsStaffOrSuperUser()]
        
        elif self.action == 'create':
            return [IsStudent()]
        
        elif self.action in ['list', 'retrieve']:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return [IsStaffOrSuperUser()]
            return [IsStudent()]
        
        return super().get_permissions()

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



