# Django
from django.core.exceptions import ValidationError
from django.db.models import Prefetch, Q
from django.db.models.deletion import ProtectedError

# Django REST Framework
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from assessments.models import Assessment

from .models import (
    Formation, Semester, CourseUnit, CourseModule,
    SchoolYear, Enrollment
)
from .serializers import (
    FormationSerializer, 
    SemesterSerializer,
    CourseUnitSerializer, 
    CourseModuleSerializer, 
    SchoolYearSerializer,
    ChangeSYStatusSerializer,
    EnrollmentSerializer,
    CourseUnitCreateSerializer,
    CourseModuleCreateSerializer
)
from .services import (
    create_enrollment,
    create_formation,
    create_school_year,
    create_semester,
    change_enrollment_decision,
    change_school_year_status,
    toggle_school_year_lock,
    toggle_course_module_activation,
    toggle_course_unit_activation
)

from users.permissions import (
    IsDepartmentHead,
    IsDepartmentStaff,
    IsInMention,
)
from users.models import User, Mention
from users.serializers import UserSerializer, UserCreateSerializer
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

from .filter import (
    LevelFilter,EnrollmentFilter,CourseModuleFilter,SchoolYearFilter,SemesterFilter,SSYFilter
)

from .queryset import (
    get_course_module_queryset,
    get_course_unit_queryset,
    get_enrollment_queryset,
    get_formation_queryset,
    get_school_year_queryset,
    get_semester_queryset
)

class FormationViewSet(ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["text", "code"]

    def get_queryset(self):
        user = self.request.user
        return get_formation_queryset(user).order_by('text')
    
    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsInMention]
        else:
            permissions = [IsDepartmentStaff]
        return [permission() for permission in permissions]


class SemesterViewSet(ModelViewSet):
    queryset = Semester.objects.all()
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

class SchoolYearViewSet(ModelViewSet):
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    filter_backends = [SearchFilter,DjangoFilterBackend]
    search_fields = ["label"]
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


# ─────────────────────────────────────────
# INSCRIPTION ANNUELLE
# ─────────────────────────────────────────

class StudentSchoolYearViewSet( viewsets.GenericViewSet,
                                viewsets.mixins.ListModelMixin,
                                viewsets.mixins.RetrieveModelMixin,
                                viewsets.mixins.DestroyModelMixin 
                            ):
    serializer_class = SSYListSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [SearchFilter,DjangoFilterBackend]
    filterset_class = SSYFilter
    search_fields = ["student__first_name","student__last_name","student__email","student__username"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            queryset = get_student_student_school_year_queryset(user)
        elif is_user_teacher(user):
            queryset = get_teacher_student_school_year_queryset(user)
        else:
            queryset =  StudentSchoolYear.objects.all()
        return queryset.select_related('student', 'school_year', 'formation', 'level')

    @action(detail=False, methods=['post'])
    def promote_repeat(self, request):
        """Réinscription automatique (promotion/redoublement)"""
        serializer = PromoteRepeatSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = StudentUser.objects.get(pk=serializer.validated_data['student_id'])
            new_school_year = SchoolYear.objects.get(pk=serializer.validated_data['new_school_year_id'])

            student_school_year = promote_or_repeat_for_new_school_years(
                student=student,
                new_school_year=new_school_year
            )
            response_serializer = SSYListSerializer(student_school_year)
            return Response(response_serializer.data)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def force_create(self, request):
        """Inscription forcée par un admin"""
        serializer = CreateStudentSchoolYearSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = StudentUser.objects.get(pk=serializer.validated_data['student_id'])
            school_year = SchoolYear.objects.get(pk=serializer.validated_data['school_year_id'])
            formation = Formation.objects.get(pk=serializer.validated_data['formation_id'])
            level = Level.objects.get(pk=serializer.validated_data['level_id'])

            student_school_year = create_student_school_year(
                student=student,
                level=level,
                formation=formation,
                school_year=school_year
            )
            response_serializer = SSYListSerializer(student_school_year)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=["post"],detail=True)
    def change_decision(self,request,pk=True):
        try:
            ssy = self.get_object()
            decision = request.data.get("decision")
            ssy.status = decision
            ssy.save()
            return Response(SSYListSerializer(ssy).data)
        except Exception as e:
            return Response({"error":"provide correct decision"},status=status.HTTP_400_BAD_REQUEST)



# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

class EnrollmentViewSet(viewsets.GenericViewSet,
                        viewsets.mixins.ListModelMixin,
                        viewsets.mixins.RetrieveModelMixin,
                        ):
    queryset = (
        Enrollment.objects
        .select_related(
            'student_school_year__student',
            'student_school_year__school_year',
            'student_school_year__formation',
            'student_school_year__level',
            'semester'
        )
    )
    serializer_class = EnrollmentSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["student_school_year__student__firs_name","student_school_year__student__last_name","student_school_year__student__email","student_school_year__student__username"]
    filterset_class = EnrollmentFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_enrollment_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_enrollment_queryset(user)
        else:
            return Enrollment.objects.all()

    @action(detail=True, methods=['POST'])
    def change_decision(self, request, pk=None):
        """Modifie la décision d'un enrollment"""
        enrollment = self.get_object()
        
        serializer = ChangeEnrollmentDecisionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            decision = serializer.validated_data['decision']
            change_enrollement_decision(enrollment, decision)
            response_serializer = self.get_serializer(enrollment)
            return Response(response_serializer.data)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
# UNITÉS D'ENSEIGNEMENT
# ─────────────────────────────────────────

class CourseUnitViewSet(viewsets.ModelViewSet):
    serializer_class = CourseUnitSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","label"]
    filterset_fields = ["semester","formation","is_active"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
    
    def get_serializer_class(self):
        if self.action == "list":
            return CourseUnitSerializer
        else:
            return CourseUnitCreateSerializer
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            queryset =  get_student_course_unit_queryset(user)
        elif is_user_teacher(user):
            queryset = get_teacher_course_unit_queryset(user)
        else:
            queryset = CourseUnit.objects.all()
        return queryset.select_related("semester","formation").prefetch_related("modules")
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError as e:
            return Response(
                {
                    "error": "il y a encore des examen dans cette unité d'enseignement",
                },
                status=status.HTTP_409_CONFLICT
            )

    @action(methods=["post"],detail=True)
    def toggle_active(self, request, pk=None):
        """Bascule l'activation d'une unité d'enseignement"""
        course_unit = self.get_object()
        new_status = not course_unit.is_active
        course_unit.is_active = new_status
        course_unit.save()
        
        modules = course_unit.modules
        updated_count = modules.update(is_active=new_status)
        
        serializer = self.get_serializer(course_unit)
        return Response({
            "data": serializer.data,
            "message": f"Unité d'enseignement {'activée' if new_status else 'désactivée'} avec succès. {updated_count} modules mis à jour."
        })



class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
    permission_classes = [IsSuperUser]
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
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_course_module_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_course_module_queryset(user)
        else:
            return CourseModule.objects.all()
    def create(self, request, *args, **kwargs):
        print(request.data)
        return super().create(request, *args, **kwargs)

    @action(methods=["post"],detail=True)
    def toggle_active(self, request, pk=None):
        """Bascule l'activation d'une unité d'enseignement"""
        course_module = self.get_object()
        new_status = not course_module.is_active
        course_module.is_active = new_status
        course_module.save()
        serializer = self.get_serializer(course_module)
        return Response(serializer.data)
    
    def destroy(self,request,*args,**kwargs):
        try:
            return super().destroy(request,*args,**kwargs)
        except ProtectedError as e:
            return Response(
                {
                    "error": "Il y a encore des examen dans ce cours",
                },
                status=status.HTTP_409_CONFLICT
            )
        
    def update(self, request, *args, **kwargs):
        print(request.data)
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

# ─────────────────────────────────────────
# PORTAIL ÉTUDIANT
# ─────────────────────────────────────────

from .utils import create_student,create_user
from .serializers import StudentSearchSerializer
class StudentPortalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStudent]
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["username","first_name","last_name","email"]
    filterset_fields = ["is_active"]

    def get_serializer_class(self):
        if self.action == "create":
            return StudentCreateSerializer
        if self.action == "retrieve":
            return StudentSearchSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        raw_data = request.data.copy()
        raw_data['role'] = 'STUDENT'
        serializer = StudentCreateSerializer(data=raw_data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        student = create_student(data)
        response_serializer = UserSerializer(student)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        if self.action in ["current_year","current_semester","current_course_units"]:
            permissions = [IsStudent]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_student_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_student_queryset(user)
        else:
            return StudentUser.objects.all()
    
    @action(detail=False, methods=['GET'])
    def current_year(self, request):
        """Informations sur l'année scolaire actuelle de l'étudiant"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.select_related(
                'formation', 'level', 'school_year'
            ).get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            serializer = SSYListSerializer(current_school_year)
            return Response(serializer.data)
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'Aucune inscription active trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def current_semester(self, request):
        """Informations sur le semestre actuel de l'étudiant"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            current_enrollment = Enrollment.objects.filter(
                student_school_year=current_school_year,
                is_current=True 
            ).first()
            
            if not current_enrollment:
                return Response({
                    'error': 'Aucun semestre actif trouvé'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = EnrollmentSerializer(current_enrollment)
            return Response(serializer.data)
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'Aucune inscription active trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def current_course_units(self, request):
        """Unités d'enseignement du semestre actuel"""
        student = request.user
        
        course_units = get_student_course_unit_queryset(student).filter(
            semester__enrollments__student_school_year__school_year__status=SchoolYear.Status.ACTIVE,
            semester__enrollments__is_current=True
        ).distinct().prefetch_related(
            Prefetch(
                "modules",
                queryset=CourseModule.objects.select_related("teacher")
            )
        )

        response_serializer = CourseUnitSerializer(course_units,many=True)
        return Response(response_serializer.data)

    @action(detail=False,methods=['get'])
    def search_student(self,request):
        """
        pour faire le recherche des étudiant pour les inscriptions
        """
        search = request.query_params.get("search")
        limit = request.query_params.get("limit")
        if search:
            queryset = StudentUser.objects.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search),
                is_active=True
            ).prefetch_related(
                Prefetch(
                    "school_years",
                    queryset=StudentSchoolYear.objects.filter(status="ACTIVE"),
                    to_attr="prefeched_active_ssy"
                )
            )[:int(limit)]
            serializer = StudentSearchSerializer(queryset,many=True)
            return Response(serializer.data)
        return Response([])
    def retrieve(self,request,*args,**kwargs):
        student = CustomUser.objects.prefetch_related(
                Prefetch(
                    "school_years",
                    queryset=StudentSchoolYear.objects.filter(status="ACTIVE"),
                    to_attr="prefeched_active_ssy"
                )
            ).get(pk=self.kwargs.get("pk"))
        return Response(StudentSearchSerializer(student).data)



# ─────────────────────────────────────────
# PORTAIL ENSEIGNANT
# ─────────────────────────────────────────

class TeacherPortalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["username","first_name","last_name","email"]
    filterset_fields = ["is_active"]

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = create_user(serializer.validated_data.copy())
        response_serializer = UserSerializer(teacher)
        return Response(response_serializer.data,status=status.HTTP_201_CREATED)
    

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        elif self.action in ["current_modules","current_semesters","current_units"]:
            permissions = [IsTeacher]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]

    @action(methods=["get"], detail=False)
    def search_teacher(self, request):
        search = request.query_params.get("search")
        limit = request.query_params.get("limit")

        if search:
            teachers = TeacherUser.objects.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search),
                is_active=True
            )[:int(limit)]

            serializer = UserSerializer(teachers, many=True)
            return Response(serializer.data)

        return Response([])
        
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_teacher_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_teacher_queryset(user)
        else:
            return TeacherUser.objects.all()

    @action(detail=False, methods=['GET'])
    def current_modules(self, request):
        """Modules enseignés par l'enseignant"""
        teacher = request.user
        semester = request.query_params.get("semester")

        modules = CourseModule.objects.filter(
            teacher=teacher,
            is_active=True,
            course_unit__semester__enrollments__is_current=True,
            course_unit__semester__enrollments__student_school_year__school_year__status="ACTIVE"
        ).select_related("teacher")
        
        if semester:
            modules.filter(course_unit__semester__id=semester)
        serializer = CourseModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def current_semesters(self, request):
        """Semestres des cours de l'enseignant"""
        teacher = request.user
        
        semesters = Semester.objects.filter(
            course_units__modules__teacher=teacher
        ).distinct()
        
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def current_units(self, request):
        """Unités d'enseignement de l'enseignant"""
        teacher = request.user
        semester = request.query_params.get("semester")
        
        course_unit = CourseUnit.objects.filter(
            modules__teacher=teacher,
            semester__enrollments__is_current=True,
            semester__enrollments__student_school_year__school_year__status="ACTIVE"
        ).prefetch_related(
            Prefetch(
                "modules",
                queryset=CourseModule.objects.select_related("teacher")
            )
        )

        if semester:
            course_unit.filter(semester__id=semester)

        serializer = CourseUnitSerializer(course_unit, many=True)
        return Response(serializer.data)

