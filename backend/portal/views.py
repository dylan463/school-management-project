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
from structures.models import Formation, Semester, SchoolYear, CourseModule
from assessments.models import Enrollment, Assessment, Grade
from timetable.models import ScheduleEntry
import datetime
from django.db.models import Count


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
        user ,password= create_user(first_name,last_name,email,role,mention,return_password=True)
        return Response({
            "user":UserSerializer(user).data,
            "password":password
            },
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
        user ,password= create_user(first_name,last_name,email,role,mention,return_password=True)
        return Response({
            "user":UserSerializer(user).data,
            "password":password
            },
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
        user ,password= create_user(first_name,last_name,email,role,mention,return_password=True)
        return Response({
            "user":UserSerializer(user).data,
            "password":password
            },
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
        user ,password= create_user(first_name,last_name,email,role,mention,return_password=True)
        return Response({
            "user":UserSerializer(user).data,
            "password":password
            },
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
        user ,password= create_user(first_name,last_name,email,role,mention,return_password=True)
        formation = data["formation"]
        semester = data["semester"]
        school_year = data["school_year"]
        create_enrollment(user,school_year,semester,formation,no_notification=False)
        return Response({
            "user":UserSerializer(user).data,
            "password":password
            },
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
    def paginate_queryset(self, queryset):
        if self.request.query_params.get("no_pagination") == "true":
            return None
        return super().paginate_queryset(queryset)

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

class TeacherDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role not in [Role.TEACHER, Role.DEPARTMENT_HEAD]:
            return Response({"detail": "Non autorisé."}, status=status.HTTP_403_FORBIDDEN)
        
        # 1. Cours Actifs
        active_courses = CourseModule.objects.filter(teacher=user, is_active=True)
        active_courses_count = active_courses.count()

        # 2. Total Étudiants
        # Students enrolled in the semesters of the teacher's active courses
        semesters = active_courses.values_list('semester', flat=True).distinct()
        formations = active_courses.values_list('course_unit__formation', flat=True).distinct()
        
        total_students = Enrollment.objects.filter(
            semester__in=semesters,
            formation__in=formations,
            status=Enrollment.Status.ACTIVE
        ).values('student').distinct().count()

        # 3. Classes
        classes_count = formations.count()

        # 4. Examens Prévus
        upcoming_exams = Assessment.objects.filter(
            course_module__teacher=user,
            date__gte=datetime.date.today()
        ).count()

        # 5. Emploi du temps hebdomadaire (Schedule)
        # Assuming we just fetch all for now, or we can filter by the current active school year/semester
        # We will fetch schedule entries for the teacher's modules
        schedule_entries = ScheduleEntry.objects.filter(
            course_module__teacher=user
        ).select_related('course_module', 'course_module__course_unit__formation', 'schedule__semester').order_by('day', 'start_time')

        # Format schedule entries
        weekly_schedule = []
        for entry in schedule_entries:
            weekly_schedule.append({
                "id": entry.id,
                "day": entry.get_day_display(),
                "start_time": entry.start_time.strftime("%H:%M"),
                "end_time": entry.end_time.strftime("%H:%M"),
                "classe": entry.course_module.course_unit.formation.code,
                "ec": entry.course_module.text,
                "room": entry.classroom
            })

        return Response({
            "active_courses_count": active_courses_count,
            "total_students": total_students,
            "classes_count": classes_count,
            "upcoming_exams": upcoming_exams,
            "weekly_schedule": weekly_schedule
        })

class ManagementDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role not in [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]:
            return Response({"detail": "Non autorisé."}, status=status.HTTP_403_FORBIDDEN)
        
        mention = user.mention

        # 1. Total Étudiants
        total_students = User.objects.filter(role=Role.STUDENT, mention=mention).count()

        # 2. Total Enseignants
        total_teachers = User.objects.filter(role=Role.TEACHER, mention=mention).count()

        # 3. Parcours Actifs
        active_formations = Formation.objects.filter(mention=mention, is_active=True).count()

        # 4. Importations en cours
        ongoing_imports = ImportJob.objects.filter(status__in=[ImportJob.Status.PENDING, ImportJob.Status.PROGRESS]).count()

        # Dernières tâches d'importation
        recent_imports_qs = ImportJob.objects.all().order_by('-created_at')[:5]
        recent_imports = []
        for job in recent_imports_qs:
            recent_imports.append({
                "id": job.id,
                "import_type": job.get_import_type_display(),
                "status": job.status,
                "created_at": job.created_at,
                "processed_rows": job.processed_rows,
                "total_rows": job.total_rows,
                "success_count": job.success_count,
                "error_count": job.error_count
            })

        return Response({
            "total_students": total_students,
            "total_teachers": total_teachers,
            "active_formations": active_formations,
            "ongoing_imports": ongoing_imports,
            "recent_imports": recent_imports
        })

from assessments.models import EnrollmentResult

class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != Role.STUDENT:
            return Response({"detail": "Non autorisé."}, status=status.HTTP_403_FORBIDDEN)
        
        # Inscriptions actives
        enrollments = Enrollment.objects.filter(student=user).select_related('semester', 'formation').order_by('opened_at')
        last_enrollment = enrollments.last()
        if not last_enrollment:
            return Response({"detail": "Aucune donnée."}, status=status.HTTP_200_OK)
        course_modules = CourseModule.objects.filter(semester=last_enrollment.semester,course_unit__formation=last_enrollment.formation)
        
        modules = {}

        modules["total"] = course_modules.count()
        modules["current"] = EnrollmentResult.objects.filter(enrollment=last_enrollment,course_module__in=course_modules,status__in=["VALIDATED","VALIDATED_AFTER_RETAKE"]).distinct().count()

        semesters = {}

        semesters["total"] = Semester.objects.all().count()
        semesters["current"] = Semester.objects.filter(enrollments__in=enrollments.filter(status="VALIDATED")).distinct().count()

        examens = Assessment.objects.filter(school_year=last_enrollment.school_year,course_module__in=course_modules) 

        examDate = [e.date for e in examens]

        return Response({
            "modules": modules,
            "semesters": semesters,
            "examDates": examDate
        })
