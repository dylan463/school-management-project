from rest_framework.viewsets import ModelViewSet,generics,views,mixins,GenericViewSet
from structures.permissions import (
    IsInMention,
    IsDepartmentStaff,
    IsAcademicStaff
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
    EnrollmentCreateSerializer,
    ChangeEnrolStatusSerializer,
    GradeSerializer,
    BulletinSerializer,
    GradeGridSerializer,
    EnrollmentResultSerializer,
    AssessmentSerializer,
    DebtSerializer
)
from .filter import AssessmentFilter,EnrollmentResultFilter,GradeFilter,BulletinFilter

from .services import (
    create_enrollment,
    change_enrollment_status,
    delete_enrollment,
    create_assessment,
    delete_assessment,
    toggle_assessment_publication,
    bulk_deliberate
)

from .queryset import (
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
    search_fields = ["student__first_name","student__last_name","student__email","student__username"]
    filterset_class = EnrollmentFilter

    def get_permissions(self):
        if self.action in ['list',"retrieve"]:
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
        serializer = EnrollmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        student = data["student"]
        formation = data["formation"]
        semester = data["semester"]
        school_year = data["school_year"]
        enrollment = create_enrollment(student,school_year,semester,formation,no_notification=False)
        response_serializer = EnrollmentSerializer(enrollment)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        enrollment = self.get_object()
        delete_enrollment(enrollment)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(methods=["post"],detail=True)
    def bulletin(self,request,pk=None):
        instance = self.get_object()
        enrollment = Enrollment.objects.filter(id=instance.id).select_related(
                "student", "formation", "school_year", "semester"
            ).prefetch_related(
                Prefetch(
                    "enrollment_results",
                    queryset=EnrollmentResult.objects.select_related(
                        "course_module",
                        "course_module__course_unit",
                    ),
                )
            ).first()
        serializer = BulletinSerializer(enrollment)
        return Response(serializer.data)

    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)

    @action(methods=["post"],detail=False)
    def deliberate(self,request):
        formation_id = request.query_params.get("formation_id")
        semester_id = request.query_params.get("semester_id")
        bulk_deliberate(formation_id,semester_id)
        return Response({"detail":"déliberation terminée"})

class AssessmentViewSet(ModelViewSet):
    serializer_class = AssessmentSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = AssessmentFilter
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        return get_assessment_queryset(user).order_by("date")
    
    def get_permissions(self):
        if self.action in ['list',"retrieve"]:
            return [IsInMention()]
        elif self.action in ["create","toggle_publication","destroy","partial_update","update"]:
            return [IsAcademicStaff()]
        else:
            return [IsDepartmentStaff()]

    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)

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
        
        
class GradeViewSet(ModelViewSet):
    serializer_class = GradeSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_class = GradeFilter
    search_fields = ["enrollment__student__first_name","enrollment__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        return get_grade_queryset(user).select_related("enrollment","assessment","enrollment__student","enrollment__school_year")

    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)

    def get_permissions(self):
        if self.action in ['list',"retrieve"]:
            return [IsInMention()]
        elif self.action in ["create","destroy","partial_update","update"]:
            return [IsAcademicStaff()]
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
        return get_result_queryset(user).select_related(
            "course_module",
            "course_module__course_unit",
            "enrollment__student",
            "enrollment__school_year"
            )

    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)

    def get_permissions(self):
        if self.action in ['list',"retrieve"]:
            return [IsInMention()]
        
        else:
            return [IsDepartmentStaff()]
        
class DebtViewSet(GenericViewSet,mixins.ListModelMixin):
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ["cleared"]
    serializer_class = DebtSerializer
    search_fields = ["result__enrollment__student__first_name","result__enrollment__student__last_name"]

    def get_queryset(self):
        user = self.request.user
        return get_debt_queryset(user).select_related(
            "result__course_module",
            "result__course_module__course_unit",
            "result__enrollment__student",
            "result__enrollment__school_year"
            )

    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)
    
    def get_permissions(self):
        if self.action in ['list',"retrieve"]:
            return [IsInMention()]
        else:
            return [IsDepartmentStaff()]

class GradeGridView(generics.GenericAPIView):
    def get(self, request):
        serializer = GradeGridSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.get_results())