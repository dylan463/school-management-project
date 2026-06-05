from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import mixins
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .task import create_users_from_dataset,create_enrollment_from_dataset
from assessments.services import create_enrollment
# Local apps
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from celery.result import AsyncResult
from structures.models import User,Role,Mention
from structures.serializers import (
    UserSerializer,
    UserCreateSerializer
)
from .serializers import StudentCreateSerializer,StudentUploadValidationSerializer, ImportJobSerializer
from .models import ImportJob
from structures.permissions import IsSystemAdmin,IsInMention,IsDepartmentStaff,IsDepartmentHead
from structures.user_services import create_user
from pathlib import Path
import pandas as pd
import uuid
from django.core.files.storage import default_storage
from .filter import ImportJobFilter
from structures.models import Formation,Semester,SchoolYear


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
        role = Role.DEPARTMENT_HEAD
        mention = data.pop('mention')
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        user = create_user(first_name,last_name,email,role,mention)
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
        role = Role.DEPARTMENT_SECRETARY
        mention = request.user.mention
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        user = create_user(first_name,last_name,email,role,mention)
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
        role = Role.REGISTRAR_OFFICER
        mention = request.user.mention
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        user = create_user(first_name,last_name,email,role,mention)
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
        if user.role in  [Role.DEPARTMENT_HEAD,Role.DEPARTMENT_SECRETARY,Role.REGISTRAR_OFFICER,Role.TEACHER]:
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
        role = Role.TEACHER
        mention = request.user.mention
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        user = create_user(first_name,last_name,email,role,mention)
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
        if user.role in [Role.DEPARTMENT_HEAD,Role.DEPARTMENT_SECRETARY,Role.REGISTRAR_OFFICER,Role.TEACHER]:
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
            return StudentCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = StudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        role = Role.STUDENT
        mention = request.user.mention
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        user = create_user(first_name,last_name,email,role,mention)
        formation = data["formation"]
        semester = data["semester"]
        school_year = data["school_year"]
        create_enrollment(user,school_year,semester,formation,no_notification=False)
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
    
    @action(detail=False, methods=["post"])
    def upload(self, request):
        if ImportJob.objects.filter(status__in=["PENDING","PROGRESS"],import_type="STUDENT_CREATION").exists():
            raise ValidationError({
                'detail':'un import de fichier est en cours'
            })
        serializer = StudentUploadValidationSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        formation   = serializer.validated_data["formation"]    # instance Formation
        semester    = serializer.validated_data["semester"]     # instance Semester
        school_year = serializer.validated_data["school_year"]  # instance SchoolYear
        file        = serializer.validated_data["file"]


        import_job = ImportJob.objects.create(
            import_type="STUDENT_CREATION",
            status="PENDING",
            input_file=file
        )

        with import_job.input_file.open("rb") as f:
            df = pd.read_csv(f)

        REQUIRED_COLS = {"email", "nom", "prenoms"}
        missing_cols = REQUIRED_COLS - set(df.columns)

        if missing_cols:
            import_job.delete()
            return Response(
                {"detail": f"colonnes manquantes : {list(missing_cols)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            task = create_users_from_dataset.delay(
                df.to_dict(orient="records"),
                formation.pk,
                semester.pk,
                school_year.pk,
            )
            import_job.task_id = task.id
            import_job.save()
        except:
            import_job.delete()
            raise ValidationError({
                "detail": "Le service de traitement est indisponible."
            })
            

        return Response({"task_id": task.id, "job_id": import_job.id})

class ImportJobViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ImportJobSerializer
    queryset = ImportJob.objects.all().order_by('-id')
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ImportJobFilter
    
class EnrollmentUploadViewSet(GenericViewSet):
    permission_classes = [IsDepartmentStaff]

    @action(detail=False, methods=["post"])
    def upload(self, request):
        if ImportJob.objects.filter(status="PENDING",import_type="ENROLLMENT").exists():
            raise ValidationError({
                'detail':'un import de fichier est en cours'
            })
        serializer = StudentUploadValidationSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        formation   = serializer.validated_data["formation"]    # instance Formation
        semester    = serializer.validated_data["semester"]     # instance Semester
        school_year = serializer.validated_data["school_year"]  # instance SchoolYear
        file        = serializer.validated_data["file"]


        import_job = ImportJob.objects.create(
            import_type="ENROLLMENT",
            status="PENDING",
            input_file=file
        )

        with import_job.input_file.open("rb") as f:
            df = pd.read_csv(f)

        REQUIRED_COLS = {"email","matricule"}
        missing_cols = REQUIRED_COLS - set(df.columns)

        if missing_cols:
            import_job.delete()
            return Response(
                {"detail": f"colonnes manquantes : {list(missing_cols)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = create_enrollment_from_dataset.delay(
            df.to_dict(orient="records"),
            formation.pk,
            semester.pk,
            school_year.pk,
        )
        import_job.task_id = task.id
        import_job.save()

        return Response({"task_id": task.id, "job_id": import_job.id})