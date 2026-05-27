from rest_framework.viewsets import ModelViewSet,generics,views,mixins,GenericViewSet
from structures.permissions import (
    IsInMention,
    IsDepartmentStaff
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filter import EnrollmentFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Prefetch

from .models import Assessment, Grade,Enrollment,EnrollmentResult,Debt
from .serializers import (
    EnrollmentSerializer,
    ChangeEnrolStatusSerializer,
    AttendantSerializer,
    Assessment,
    GradeSerializer,
    BulletinSerializer,
    GradeGridSerializer,
    EnrollmentResultSerializer,
    AssessmentSerializer
)
from .query import attend_to_assessment,people_with_course_debt

from .filter import AssessmentFilter,EnrollmentResultFilter,GradeFilter,BulletinFilter

from .services import (
    create_enrollment,
    change_enrollment_status,
    delete_enrollment,
    create_assessment,
    delete_assessment,
    toggle_assessment_publication,
)

from queryset import (
    get_assessment_queryset,
    get_grade_queryset,
    get_enrollment_queryset,
    get_debt_queryset,
    get_result_queryset
)

class EnrollmentViewSet(ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsDepartmentStaff]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["student__firs_name","student__last_name","student__email","student__username"]
    filterset_class = EnrollmentFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        return get_enrollment_queryset(user).select_related('student','school_year','formation','semester')

    @action(detail=True, methods=['POST'])
    def change_status(self, request, pk=None):
        """Modifie la status d'une inscription"""
        serializer = ChangeEnrolStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status = serializer.validated_data.get('status')
        enrollment = self.get_object()
        changed_enrollment = change_enrollment_status(enrollment,status)
        response_serializer = EnrollmentSerializer(changed_enrollment)
        return Response(response_serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = EnrollmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        enrollment = create_enrollment(data)
        response_serializer = EnrollmentSerializer(enrollment)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        enrollment = self.get_object()
        delete_enrollment(enrollment)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssessmentViewSet(ModelViewSet):
    serializer_class = AssessmentSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = AssessmentFilter
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        return get_assessment_queryset(user)
    
    def get_permissions(self):
        if self.action == "list":
            return [IsInMention()]
        else:
            return [IsDepartmentStaff()]
    
    def create(self, request, *args, **kwargs):
        serializer = AssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        assessment = create_assessment(data)
        response_serializer = AssessmentSerializer(assessment)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        assessment = self.get_object()
        delete_assessment(assessment)
        return Response(status=status.HTTP_204_NO_CONTENT)

    
    @action(detail=True, methods=["post"])
    def toggle_publication(self, request, pk=None):
        instance = self.get_object()
        assessment = toggle_assessment_publication(instance)
        response_serializer = AssessmentSerializer(assessment)
        return Response(response_serializer.data)

    @action(detail=True,methods=["get"])
    def attendant_student(self,request,pk):
        assessment :Assessment = self.get_object()
        has_grade = request.query_params.get("has_grade")
        has_debt = request.query_params.get("has_debt")
        search = request.query_params.get("search")

        query = Q()
        if search:
            search_query = (
                Q(student__last_name__icontains=search)|
                Q(student__first_name__icontains=search)|
                Q(student__usernname__icontains=search)|
                Q(student__email__icontains=search)
                )
            query = query & search_query

        if not has_grade is None:
            grade_query = Q(grades__assessment=assessment)
            query = query & grade_query if has_grade  == "true" else query & ~grade_query
        
        if not has_debt is None:
            debt_query = people_with_course_debt(assessment.course_module)
            query = query  & debt_query if has_debt  == 'true' else query & ~debt_query

        query = query & attend_to_assessment(assessment)

        attendants = Enrollment.objects.filter(query).prefetch_related(
            Prefetch(
                "grades",
                queryset=Grade.objects.filter(assessment=assessment),
                to_attr="assessment_grades"
                )
        ).prefetch_related(
            Prefetch(
                "enrollment_results__debts",
                queryset=Debt.objects.filter(course_module=assessment.course_module,cleared=False).select_related("result__enrollment__school_year"),
                to_attr="module_debts"
            )
        )

        serializer = AttendantSerializer(attendants,many=True)
        return Response(serializer.data)
        
        
class GradeViewSet(ModelViewSet):
    serializer_class = GradeSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = GradeFilter
    search_fields = ["enrollment__student__first_name","enrollment__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        return get_grade_queryset(user)
    
    def get_permissions(self):
        if self.action == "list":
            return [IsInMention()]
        else:
            return [IsDepartmentStaff()]


class ResultViewSet(GenericViewSet,mixins.ListModelMixin):
    queryset = EnrollmentResult.objects.all()
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = EnrollmentResultFilter
    serializer_class = EnrollmentResultSerializer
    search_fields = ["enrollment__student__first_name","enrollment__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        return get_result_queryset(user)
    
    def get_permissions(self):
        if self.action == "list":
            return [IsInMention()]
        else:
            return [IsDepartmentStaff()]


class BulletinView(generics.RetrieveAPIView):
    serializer_class = BulletinSerializer

    def get_queryset(self):
        return (
            Enrollment.objects.select_related(
                "student", "formation", "school_year", "semester"
            )
            .prefetch_related(
                Prefetch(
                    "enrollment_results",
                    queryset=EnrollmentResult.objects.select_related(
                        "course_module",
                        "course_module__course_unit",
                    ),
                )
            )
        )

class GradeGridView(generics.GenericAPIView):
    def get(self, request):
        serializer = GradeGridSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.get_results())