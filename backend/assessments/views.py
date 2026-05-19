from rest_framework import viewsets

from .models import Assessment, Grade
from .serializers import AssessmentSerializer, GradeSerializer,BulletinSerializer,GradeGridSerializer,EnrollmentResultSerializer
from .filter import AssessmentFilter,EnrollmentResultFilter,GradeFilter,BulletinFilter

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
from structures.models import CourseModule,SchoolYear,Enrollment
from .queryset import *
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .services import publish_assessment_result,unpublish_assessment_result,create_assessment,get_attendant_data
from .services import update_results as update_all_result

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from structures.queryset import get_teacher_enrollment_queryset,get_student_enrollment_queryset
from .query import attend_to_assessment,people_with_course_debt

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
    
    def create(self, request, *args, **kwargs):
        serializer = AssessmentSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data.copy()
            response_serializer = AssessmentSerializer(create_assessment(data))
            return Response(response_serializer.data,status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

    
    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        assessment = self.get_object()
        try:
            publish_assessment_result(assessment)
            return Response({"detail": "Assessment published successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True,methods=["post"])
    def unpublish(self,request,pk=None):
        assessment = self.get_object()
        try:
            unpublish_assessment_result(assessment)
            return Response({"detail": "Assessment unpublished successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True,methods=["get"])
    def attendant_student(self,request,pk):
        assessment :Assessment = self.get_object()
        has_grade = request.query_params.get("has_grade")
        has_debt = request.query_params.get("has_debt")
        search = request.query_params.get("search")

        user = request.user
        if user.role == "TEACHER":
            queryset = get_teacher_enrollment_queryset(user)
        else:
            queryset = Enrollment.objects.all()

        attendant = queryset.filter(attend_to_assessment(assessment))

        if search:
            attendant = attendant.filter(
                Q(student_school_year__student__last_name=search)|
                Q(student_school_year__student__first_name=search)
            )

        if not has_grade is None:
            query = Q(grades__assessment=assessment)
            query = query if has_grade == 'true' else ~query
            attendant = attendant.filter(query)
        
        if not has_debt is None:
            query = people_with_course_debt(assessment.course_module)
            query = query if has_debt  == 'true' else ~query
            attendant = attendant.filter(query)

        data = get_attendant_data(attendant,assessment)
        return Response(data)
        
        
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
            return Grade.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]


class ResultViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin):
    queryset = EnrollmentResult.objects.all()
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = EnrollmentResultFilter
    serializer_class = EnrollmentResultSerializer
    search_fields = ["enrollment__student_school_year__student__first_name","enrollment__student_school_year__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_result_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_result_queryset(user)
        else:
            return EnrollmentResult.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]

    @action(methods=["post"],detail=False)
    def publish(self,request):
        try:
            course_module = CourseModule.objects.get(id=request.data.get("course_module"))
            update_all_result(course_module)
            return Response({"detail":"result updated"},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

class BulletinViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin):
    queryset = Enrollment.objects.all()
    serializer_class = BulletinSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BulletinFilter

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_enrollment_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_enrollment_queryset(user)
        else:
            return Enrollment.objects.all()
    
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        else:
            return [IsSuperUserOrTeacher()]