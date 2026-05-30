from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import ValidationError
# Local apps
from structures.models import User,Role,Mention
from structures.serializers import (
    UserSerializer,
    UserCreateSerializer
)
from structures.permissions import IsSystemAdmin,IsInMention,IsDepartmentStaff,IsDepartmentHead
from structures.user_services import create_user

class HeadsViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(role=Role.DEPARTMENT_HEAD).order_by('id')
    filter_backends = [SearchFilter,DjangoFilterBackend]
    filterset_fields = ['mention']
    search_fields = ["last_name","first_name",'email','username']
    permission_classes = [IsSystemAdmin]
    
    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        if data.get('role'):
            data.pop('role')
        role = Role.DEPARTMENT_HEAD
        mention = data.pop('mention')
        user = create_user(data,role,mention)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer le role de cet utilisateur'
                })
        return super().perform_update(serializer)
    

class SecretaryViewSet(ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = [SearchFilter]
    permission_classes = [IsDepartmentHead]
    search_fields = ["last_name","first_name",'email','username']

    def get_queryset(self):
        user = self.request.user
        mention = user.mention
        if user.role ==  Role.DEPARTMENT_HEAD:
            return User.objects.filter(role=Role.DEPARTMENT_SECRETARY,mention=mention)
        return User.objects.none()

    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        data.pop('role')
        role = Role.DEPARTMENT_SECRETARY
        mention = request.user.mention
        user = create_user(data,role,mention)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer le role de cet utilisateur'
                })
        if 'mention' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer la mention de cet utilisateur.'
            })
        return super().perform_update(serializer)
    
class OfficerViewSet(ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = [SearchFilter]
    permission_classes = [IsDepartmentHead]
    search_fields = ["last_name","first_name",'email','username']

    def get_queryset(self):
        user = self.request.user
        mention = user.mention
        if user.role ==  Role.DEPARTMENT_HEAD:
            return User.objects.filter(role=Role.REGISTRAR_OFFICER,mention=mention)
        return User.objects.none()

    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        data.pop('role')
        role = Role.REGISTRAR_OFFICER
        mention = request.user.mention
        user = create_user(data,role,mention)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer le role de cet utilisateur'
                })
        if 'mention' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer la mention de cet utilisateur.'
            })
        return super().perform_update(serializer)
    

class TeacherViewSet(ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = [SearchFilter]
    search_fields = ["last_name","first_name",'email','username']

    def get_queryset(self):
        user = self.request.user
        mention = user.mention
        if user.role ==  [Role.DEPARTMENT_HEAD,Role.DEPARTMENT_SECRETARY,Role.REGISTRAR_OFFICER,Role.TEACHER]:
            return User.objects.filter(role=Role.TEACHER,mention=mention)
        elif user.role == Role.STUDENT:
            return User.objects.filter(role=Role.TEACHER,mention=mention,course_modules__semester__enrollments__student=user)
        return User.objects.none()
    
    def get_permissions(self):
        if self.action == "list":
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]

    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        data.pop('role')
        role = Role.TEACHER
        mention = request.user.mention
        user = create_user(data,role,mention)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer le role de cet utilisateur'
                })
        if 'mention' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer la mention de cet utilisateur.'
            })
        return super().perform_update(serializer)

class StudentViewSet(ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = [SearchFilter]
    search_fields = ["last_name","first_name",'email','username']

    def get_queryset(self):
        user = self.request.user
        mention = user.mention
        if user.role ==  [Role.DEPARTMENT_HEAD,Role.DEPARTMENT_SECRETARY,Role.REGISTRAR_OFFICER,Role.TEACHER]:
            return User.objects.filter(role=Role.STUDENT,mention=mention)
        elif user.role == Role.STUDENT:
            return User.objects.filter(role=Role.STUDENT,menton=mention)
        return User.objects.none()
    
    def get_permissions(self):
        if self.action == "list":
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]

    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        data.pop('role')
        role = Role.STUDENT
        mention = request.user.mention
        user = create_user(data,role,mention)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer le role de cet utilisateur'
                })
        if 'mention' in serializer.validated_data:
            raise ValidationError({
                'detail':'vous ne pouvez pas changer la mention de cet utilisateur.'
            })
        return super().perform_update(serializer)