# Django REST Framework
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import (
    FormationSerializer, 
    SemesterSerializer,
    CourseUnitSerializer, 
    CourseModuleSerializer, 
    SchoolYearSerializer,
    ChangeSYStatusSerializer,
    EnrollmentSerializer,
    CourseUnitCreateSerializer,
    CourseModuleCreateSerializer,
    ChangeEnrolStatusSerializer
)
from .services import (
    create_enrollment,
    create_formation,
    create_school_year,
    create_semester,
    change_enrollment_status,
    change_school_year_status,
    toggle_school_year_lock,
    toggle_course_module_activation,
    toggle_course_unit_activation,
    toggle_formation_activation,
    toggle_semester_activation,
    delete_formation,
    delete_school_year,
    delete_semester,
    delete_enrollment,
    delete_course_unit
)

from .permissions import (
    IsDepartmentStaff,
    IsInMention,
)

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .filter import (
    EnrollmentFilter,
    CourseModuleFilter,
    SchoolYearFilter,
    SemesterFilter,
    FormationFilter,
    CourseUnitFilter
)

from .queryset import (
    get_course_module_queryset,
    get_course_unit_queryset,
    get_enrollment_queryset,
    get_formation_queryset,
    get_school_year_queryset,
    get_semester_queryset,
    get_mention_queryset
)

from .serializers import (
    MentionSerailizer,
)
from .permissions import IsSystemAdmin
from .user_services import delete_mention


class MentionViewSet(ModelViewSet):
    serializer_class = MentionSerailizer
    permission_classes = [IsSystemAdmin]
    filter_backends = [SearchFilter]
    search_fields = ["text","code"]

    def get_queryset(self):
        user = self.request.user
        return get_mention_queryset(user).order_by('id')

    def destroy(self, request, *args, **kwargs):
        mention = self.get_object()
        delete_mention(mention)
        return Response(status=status.HTTP_204_NO_CONTENT)
 

class FormationViewSet(ModelViewSet):
    serializer_class = FormationSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["text", "code"]
    filterset_class = FormationFilter

    def get_queryset(self):
        user = self.request.user
        return get_formation_queryset(user).order_by('text')
    
    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = FormationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        formation = create_formation(user,data)
        response_serializer = FormationSerializer(formation)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        formation = self.get_object()
        delete_formation(formation)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(methods=['post'],detail=True)
    def toggle_activation(self,request,pk=None):
        instance = self.get_object()
        formation = toggle_formation_activation(instance)
        serializer = self.get_serializer(formation)
        return Response(serializer.data)
        
        

class SemesterViewSet(ModelViewSet):
    serializer_class = SemesterSerializer
    filter_backends = [SearchFilter,DjangoFilterBackend]
    search_fields = ["code","order"]
    filterset_class = SemesterFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]

    def get_queryset(self):
        user = self.request.user
        return get_semester_queryset(user).order_by('order')

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = SemesterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        semester = create_semester(user,data)
        response_serializer = SemesterSerializer(semester)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        semester = self.get_object()
        delete_semester(semester)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['post'],detail=True)
    def toggle_activation(self,request,pk=None):
        instance = self.get_object()
        semester = toggle_semester_activation(instance)
        serializer = self.get_serializer(semester)
        return Response(serializer.data)

class SchoolYearViewSet(ModelViewSet):
    serializer_class = SchoolYearSerializer
    filter_backends = [SearchFilter,DjangoFilterBackend]
    search_fields = ["text"]
    filterset_class = SchoolYearFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]

    def get_queryset(self):
        user = self.request.user
        return get_school_year_queryset(user)

    @action(detail=True, methods=['POST'])
    def change_status(self, request, pk=None):
        """Changer le status d'une année scolaire"""
        user = request.user
        serializer = ChangeSYStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status = serializer.validated_data.get("status")

        school_year = self.get_object()
        changed_sy = change_school_year_status(user,school_year,status)
        response_serializer = SchoolYearSerializer(changed_sy)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['POST'])
    def toggle_lock(self, request, pk=None):
        """Bascule le verrouillage d'une année scolaire"""
        school_year = self.get_object()
        toggled_year = toggle_school_year_lock(school_year)
        serializer = self.get_serializer(toggled_year)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = SchoolYearSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        school_year = create_school_year(user,data)
        response_serializer = SchoolYearSerializer(school_year)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        school_year = self.get_object()
        delete_school_year(school_year)
        return Response(status=status.HTTP_204_NO_CONTENT)

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
        user = request.user
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


class CourseUnitViewSet(ModelViewSet):
    serializer_class = CourseUnitSerializer
    permission_classes = [IsDepartmentStaff]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","text"]
    filterset_class = CourseUnitFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]
    
    def get_serializer_class(self):
        if self.action == "list":
            return CourseUnitSerializer
        else:
            return CourseUnitCreateSerializer
        
    def get_queryset(self):
        user = self.request.user
        return get_course_unit_queryset(user).select_related('formation').prefetch_related('course_modules')

    @action(methods=['post'],detail=True)
    def toggle_activation(self,request,pk=None):
        instance = self.get_object()
        course_unit = toggle_course_unit_activation(instance)
        serializer = self.get_serializer(course_unit)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        course_unit = self.get_object()
        delete_course_unit(course_unit)
        return Response(status=status.HTTP_204_NO_CONTENT)



class CourseModuleViewSet(ModelViewSet):
    serializer_class = CourseModuleSerializer
    permission_classes = [IsDepartmentStaff]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","label","teacher__first_name","teacher__last_name","teacher__username"]
    filterset_class = CourseModuleFilter

    def get_serializer_class(self):
        if self.action == "list":
            return CourseModuleSerializer
        else:
            return CourseModuleCreateSerializer

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        return get_course_module_queryset(user).select_related('teacher','course_unit','semester')

    @action(methods=['post'],detail=True)
    def toggle_activation(self,request,pk=None):
        instance = self.get_object()
        course_module = toggle_course_module_activation(instance)
        serializer = self.get_serializer(course_module)
        return Response(serializer.data)
