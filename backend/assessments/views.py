from rest_framework import viewsets

from .models import Assessment, Grade
from .serializers import AssessmentSerializer, GradeSerializer
from .filter import AssessmentFilter,EnrollmentResultFilter,GradeFilter

from users.permissions import (
    IsStudent,
    IsSuperUser,
    IsSuperUserOrTeacher,
    IsTeacher
)
from rest_framework.permissions import IsAuthenticated
from users.utils import (
    is_user_teacher,
    is_user_student,
    is_user_superuser
)
from .queryset import *
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .services import publish_assessment_result,delete_assessment,unpublish_assessment_result

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = AssessmentFilter
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_assessment_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_assessment_queryset(user)
        else:
            return Assessment.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]
    
    def destroy(self, request, *args, **kwargs):
        assessment = self.get_object()
        try:
            delete_assessment(assessment)
            return Response({"detail": "Assessment deleted successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        assessment = self.get_object()
        try:
            publish_assessment_result(assessment)
            return Response({"detail": "Assessment published successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True,methods=["post"])
    def unpublish(self,request):
        assessment = self.get_object()
        try:
            unpublish_assessment_result(assessment)
            return Response({"detail": "Assessment unpublished successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
        

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = GradeFilter
    search_fields = ["enrollment__student_school_year__student__first_name","enrollment__student_school_year__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_grade_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_grade_queryset(user)
        else:
            return Assessment.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]


class ResultViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin):
    queryset = EnrollmentResult.objects.all()
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = EnrollmentResultFilter
    search_fields = ["enrollment__student_school_year__student__first_name","enrollment__student_school_year__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_result_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_result_queryset(user)
        else:
            return Assessment.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]

    @action(methods=["post"],detail=False)
    def publish_results(self,request):
        try:
            course_module_id = request.data["course_module_id"]
            response = publish_result_course_module(course_module_id)
            return Response(response,status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

