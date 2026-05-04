from rest_framework import viewsets
from .models import Level, Formation, Semester, TeachingUnit, CourseComponent, Enrollement, Resource
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,
    TeachingUnitSerializer, CourseComponentSerializer, EnrollementSerializer, ResourceSerializer
)
from rest_framework.exceptions import ValidationError
from users.permissions import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from users.models import StudentUser, TeacherUser
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

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Resource.objects.select_related('teaching_unit', 'teacher')
        if user.is_staff or user.is_superuser:
            return qs
        if user.is_teacher:
            return qs.filter(teacher=user)

        # student access
        level_id = self.request.query_params.get('level_id')
        semester_id = self.request.query_params.get('semester_id')
        if level_id:
            return qs.filter(teaching_unit__semester__level_id=level_id)
        if semester_id:
            return qs.filter(teaching_unit__semester_id=semester_id)

        try:
            enrollement = Enrollement.objects.get(
                student=user,
                semester__is_active=True
            )
            semester = enrollement.semester
        except Enrollement.DoesNotExist:
            return Resource.objects.none()

        return qs.filter(teaching_unit__semester=semester)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def get_queryset(self):
        return TeachingUnit.objects.prefetch_related('courses').annotate(
            courses_count=Count('courses')
        )

class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer
    permission_classes = [IsStaffOrSuperUser]

    @action(detail=True, methods=["post"])    
    def assign_teacher(self, request, pk=None):    
        course = self.get_object()    

        teacher_id = request.data.get("teacher")    
        if not teacher_id:    
            raise ValidationError({"teacher": "This field is required"})    

        try:    
            teacher = TeacherUser.objects.get(pk=teacher_id)    
        except TeacherUser.DoesNotExist:    
            raise ValidationError({"teacher": "Teacher not found"})    

        course.teacher = teacher    
        course.save()    

        return Response({    
            "status": "teacher assigned",    
            "course_id": course.id,    
            "teacher_id": teacher.id    
        })

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
    
    @action(detail=False, methods=["post"])
    def enrolle(self, request):
        student = request.user
        semester_id = request.data.get("semester")

        if not semester_id:
            raise ValidationError({"semester": "This field is required"})
        try:
            semester = Semester.objects.get(pk=semester_id)
        except Semester.DoesNotExist:
            raise ValidationError({"semester": "Semester not found"})
        
        if Enrollement.objects.filter(student=student, semester=semester).exists():
            raise ValidationError("L'étudiant est déjà inscrit dans ce semestre")
        
        if not semester.is_active:
            raise ValidationError("Le semestre n'est pas actif")
        
        enrollement = Enrollement.objects.create(student=student, semester=semester)
        return Response({
            "status": "enrolled",
            "enrollement_id": enrollement.id
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

    @action(detail=False, methods=["get"])
    def my_resources(self, request):
        student = request.user

        try:
            enrollement = Enrollement.objects.get(
                student=student,
                semester__is_active=True
            )
            semester = enrollement.semester
        except Enrollement.DoesNotExist:
            return Response([], status=200)

        # Obtenir les ressources des unités d'enseignement du semestre
        resources = Resource.objects.filter(
            teaching_unit__semester=semester
        ).select_related('teaching_unit', 'teacher').order_by('-created_at')[:10]

        return Response(ResourceSerializer(resources, many=True).data)


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

    @action(detail=False, methods=["get"])
    def my_students_by_level(self, request):
        teacher = request.user

        # Semesters where the teacher actually teaches
        semester_ids = CourseComponent.objects.filter(
            teacher=teacher
        ).values_list('teaching_unit__semester_id', flat=True).distinct()

        levels = Level.objects.filter(
            semesters__id__in=semester_ids
        ).distinct()

        result = []
        for level in levels:
            students = StudentUser.objects.filter(
                enrollements__semester__id__in=semester_ids,
                enrollements__semester__level=level
            ).distinct()
            result.append({
                "level": LevelSerializer(level).data,
                "students": UserSerializer(students, many=True).data
            })

        return Response(result)
    


