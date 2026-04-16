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

class EnrollementViewSet(viewsets.ModelViewSet):
    queryset = Enrollement.objects.all()
    serializer_class = EnrollementSerializer
    permission_classes = [IsStaffOrSuperUser]


# ici on définit une endpoint des etudiants et professeurs avec les intercations avec les modeles de l'application structure

#  endpoint pour les étudiants pour voir leur semestre actif, les unités d'enseignement associées et les autres étudiants inscrits dans le même semestre
class StudentPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStudent]

    @action(detail=False, methods=["get"])
    def my_semester(self, request):
        student = request.user

        enrollement = Enrollement.objects.filter(
            student=student,
            semester__is_active=True
        ).select_related("semester", "semester__level", "semester__formation").first()

        if not enrollement:
            return Response({"detail": "No active semester"}, status=404)

        semester = enrollement.semester

        return Response({
            "name": semester.name,
            "level": semester.level.code,
            "formation": semester.formation.name
        })

    @action(detail=False, methods=["get"])
    def my_teaching_units(self, request):
        student = request.user

        semester = Enrollement.objects.get(
            student=student,
            semester__is_active=True
        ).semester

        units = semester.teachingunits.all()

        return Response(TeachingUnitSerializer(units, many=True).data)

    @action(detail=False, methods=["get"])
    def classmates(self, request):
        student = request.user

        semester = Enrollement.objects.get(
            student=student,
            semester__is_active=True
        ).semester

        classmates = StudentUser.objects.filter(
            enrollements__semester=semester
        ).exclude(id=student.id).distinct()

        return Response(UserSerializer(classmates, many=True).data)


# endpoint pour les professeurs pour voir les cours qu'ils enseignent, les étudiants inscrits dans leurs cours et les semestres associés à leurs cours
class TeacherPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsTeacher]

    @action(detail=False, methods=["get"])
    def my_courses(self, request):
        teacher = request.user

        courses = CourseComponent.objects.filter(
            teacher=teacher
        ).select_related("teaching_unit", "teaching_unit__semester")

        return Response(CourseComponentSerializer(courses, many=True).data)

    @action(detail=False, methods=["get"])
    def my_students(self, request):
        teacher = request.user

        students = StudentUser.objects.filter(
            enrollements__semester__teachingunits__courses__teacher=teacher
        ).distinct()

        return Response(UserSerializer(students, many=True).data)

    @action(detail=False, methods=["get"])
    def my_semesters(self, request):
        teacher = request.user

        semesters = Semester.objects.filter(
            teachingunits__courses__teacher=teacher
        ).distinct()

        return Response(SemesterSerializer(semesters, many=True).data)