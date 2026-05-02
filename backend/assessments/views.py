from rest_framework import viewsets

from .models import Assessment, Grade
from .serializers import AssessmentSerializer, GradeSerializer

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
from .services import create_assessment,publish_result_course_module

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

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
    
    def create(self, request, *args, **kwargs):
        serializer = AssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        assessment = create_assessment(data)
        response_serializer= AssessmentSerializer(assessment)
        return Response(response_serializer.data)
        

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

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

