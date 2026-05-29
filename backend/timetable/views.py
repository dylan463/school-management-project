from rest_framework.viewsets import ModelViewSet,GenericViewSet,mixins
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status

from .serializers import ScheduleSerializer, ScheduleEntrySerializer

from structures.permissions import (
    IsInMention,
    IsDepartmentStaff,
    IsAcademicStaff,IsTeacher
)
from .services import create_schedule_entry,create_teacher_availability
from .queryset import get_schedule_queryset, get_schedule_entry_queryset, get_teacher_availability_queryset
from .serializers import (
    ScheduleEntrySerializer,
    ScheduleEntryCreateSerializer,
    ScheduleCreateSerializer,
    ScheduleSerializer,
    TeacherAvailabilityCreateSerializer,
    TeacherAvailabilitySerializer
)

class ScheduleViewSet(ModelViewSet):
    serializer_class = ScheduleSerializer
    filters_backend = [DjangoFilterBackend]
    filterset_fields = ['formation','semester']

    def get_queryset(self):
        user = self.request.user
        return get_schedule_queryset(user)
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsInMention]
        else:
            permission_classes = [IsDepartmentStaff]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == "create":
            return ScheduleCreateSerializer
        return ScheduleSerializer
    

class ScheduleEntryViewSet(GenericViewSet,mixins.CreateModelMixin,mixins.DestroyModelMixin,mixins.ListModelMixin):
    serializer_class = ScheduleEntrySerializer
    filters_backend = [DjangoFilterBackend]
    filterset_fields = ['schedule']

    def get_queryset(self):
        user = self.request.user
        return get_schedule_entry_queryset(user)
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsInMention]
        else:
            permission_classes = [IsDepartmentStaff]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "create":
            return ScheduleEntryCreateSerializer
        return ScheduleEntrySerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schedule_entry = create_schedule_entry(serializer.validated_data)
        output_serializer = ScheduleEntrySerializer(schedule_entry)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

class TeacherAvailabilityViewSet(GenericViewSet,mixins.CreateModelMixin,mixins.DestroyModelMixin,mixins.ListModelMixin):
    serializer_class = TeacherAvailabilitySerializer
    filters_backend = [DjangoFilterBackend]
    filterset_fields = ['teacher']

    def get_queryset(self):
        user = self.request.user
        return get_teacher_availability_queryset(user)
    
    def get_permissions(self):
        if self.action in ["list","destroy"]:
            permission_classes = [IsAcademicStaff]
        else:
            permission_classes = [IsTeacher]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "create":
            return TeacherAvailabilityCreateSerializer
        return TeacherAvailabilitySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schedule_entry = create_teacher_availability(serializer.validated_data)
        output_serializer = TeacherAvailabilitySerializer(schedule_entry)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
