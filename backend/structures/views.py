# Django
from django.core.exceptions import ValidationError
from django.db.models import Count, Prefetch

# Django REST Framework
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Level, Formation, Semester, CourseUnit, CourseModule,
    SchoolYear, StudentSchoolYear, Enrollment, FormationLevel
)
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,
    CourseUnitSerializer, CourseModuleSerializer, SchoolYearSerializer,
    StudentSchoolYearSerializer, EnrollmentSerializer,
    CreateStudentSchoolYearSerializer, PromoteRepeatSerializer,
    ChangeEnrollmentDecisionSerializer, ActivateNextSemesterSerializer,
    StudentlatestSerializer, SchoolYearCreateSerializer, FormationCreateSerializer,CourseUnitListSerializer
)
from .services import (
    get_current_enrollment,
    change_enrollement_decision,
    create_formation_and_its_levels,
    create_level,
    update_formation_and_its_level,
    activate_school_year,
    end_school_year,
    toggle_school_year_lock,
    promote_or_repeat_for_new_school_years,
    force_create_student_school_year_for_new_year,
    get_last_student_school_year,
    go_to_first_periode,
    go_to_second_periode,
    get_open_school_year
)

from users.permissions import IsSuperUser, IsStudent, IsTeacher, IsSuperUserOrTeacher
from rest_framework.permissions import IsAuthenticated
from users.models import StudentUser, TeacherUser,CustomUser
from users.serializers import UserSerializer, UserCreateSerializer
from .queryset import *

from users.utils import (
    is_user_student,
    is_user_superuser,
    is_user_teacher
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

from .filter import (
    LevelFilter,EnrollmentFilter,CourseModuleFilter
)

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_field = ["label", "code"]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_formation_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_formation_queryset(user)
        else:
            return Formation.objects.all()
    
    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]

    def create(self, request, *args, **kwargs):
        serializer = FormationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        formation = create_formation_and_its_levels(
            serializer.validated_data.copy()
        )

        response_serializer = FormationSerializer(formation)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = FormationCreateSerializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        formation = update_formation_and_its_level(
            instance,
            serializer.validated_data.copy()
        )

        response_serializer = FormationSerializer(formation)
        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )

    @action(methods=["post"],detail=True,url_path="remove-levels")
    def removelevels(self,request,pk=None):
        formation = self.get_object()
        FormationLevel.objects.filter(formation=formation).delete()
        return Response({"formation levels":"deleted"},status=status.HTTP_200_OK)



class LevelViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin,viewsets.mixins.CreateModelMixin,viewsets.mixins.UpdateModelMixin,viewsets.mixins.RetrieveModelMixin):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","order"]
    filterset_class = LevelFilter

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission for permission in permissions]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_level_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_level_queryset(user)
        else:
            return Level.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_level = Level.objects.order_by("order").last()
        last_order = last_level.order if last_level else 0

        level = create_level(
            code=serializer.validated_data["code"],
            order=last_order + 1
        )

        return Response(
            self.get_serializer(level).data,
            status=201
        )

    @action(methods=["delete"],detail=False)
    def pop(self,request):
        level = Level.objects.order_by("order").last()
        if not level:
            return Response(...)
        level.delete()
        return Response({"detail":"poped"},status.HTTP_200_OK)

class SemesterViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin,viewsets.mixins.UpdateModelMixin):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","order"]
    filterset_fields = ["level"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_semester_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_semester_queryset(user)
        else:
            return Semester.objects.all()


# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

class SchoolYearViewSet(viewsets.ModelViewSet):
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["label"]
    filterset_fields = ["status","is_locked"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]

    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_school_year_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_school_year_queryset(user)
        else:
            return SchoolYear.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return SchoolYearCreateSerializer
        return SchoolYearSerializer

    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        """Active une année scolaire"""
        school_year = self.get_object()
        try:
            activated_year = activate_school_year(school_year)
            serializer = self.get_serializer(activated_year)
            return Response(serializer.data)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    def end(self, request, pk=None):
        """Clôture une année scolaire"""
        school_year = self.get_object()
        try:
            ended_year = end_school_year(school_year)
            serializer = self.get_serializer(ended_year)
            return Response(serializer.data)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    def toggle_lock(self, request, pk=None):
        """Bascule le verrouillage d'une année scolaire"""
        school_year = self.get_object()
        try:
            toggled_year = toggle_school_year_lock(school_year)
            serializer = self.get_serializer(toggled_year)
            return Response(serializer.data)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'],url_path="go-first")
    def go_to_first_periode(self, request, pk=None):
        """Bascule le verrouillage d'une année scolaire"""
        school_year = self.get_object()
        try:
            go_to_first_periode(school_year=school_year)
            return Response({"status":"first periode activated"})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['POST'],url_path="go-seconde")
    def go_to_second_periode(self, request, pk=None):
        """Bascule le verrouillage d'une année scolaire"""
        school_year = self.get_object()
        try:
            go_to_second_periode(school_year=school_year)
            return Response({"status":"seconde periode activated"})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False,methods=["get"])
    def opened(self,request):
        school_years = get_open_school_year()
        serializer = SchoolYearSerializer(school_years,many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────
# INSCRIPTION ANNUELLE
# ─────────────────────────────────────────

class StudentSchoolYearViewSet( viewsets.GenericViewSet,
                                viewsets.mixins.ListModelMixin,
                                viewsets.mixins.RetrieveModelMixin,
                                viewsets.mixins.DestroyModelMixin 
                            ):
    queryset = (
        StudentSchoolYear.objects
        .select_related('student', 'school_year', 'formation', 'level')
        .annotate(enrollments_count=Count('enrollments'))
    )
    serializer_class = StudentSchoolYearSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student","school_year","formation","level","status"]
    search_fields = ["student__firs_name","student__last_name","student__email","student__username"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_student_school_year_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_student_school_year_queryset(user)
        else:
            return StudentSchoolYear.objects.all()

    @action(detail=False, methods=['POST'])
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
            response_serializer = StudentSchoolYearSerializer(student_school_year)
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

            student_school_year = force_create_student_school_year_for_new_year(
                student=student,
                level=level,
                formation=formation,
                new_school_year=school_year
            )
            response_serializer = StudentSchoolYearSerializer(student_school_year)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    filterset_fields = ["semester","formation"]

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
    def get_queryset(self):
        user = self.request.user
        if is_user_student(user):
            return get_student_course_unit_queryset(user)
        elif is_user_teacher(user):
            return get_teacher_course_unit_queryset(user)
        else:
            return CourseUnit.objects.all()

class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ["code","label","teacher__first_name","teacher__last_name","teacher__username"]
    filterset_class = CourseModuleFilter


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

    @action(detail=True, methods=['POST'])
    def assign_teacher(self, request, pk=None):
        """Assigne un enseignant à un module"""
        course_module = self.get_object()
        teacher_id = request.data.get('teacher')

        if not teacher_id:
            return Response({
                'error': 'teacher id est requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = TeacherUser.objects.get(pk=teacher_id)
            course_module.teacher = teacher
            course_module.save()
            serializer = self.get_serializer(course_module)
            return Response({
                'status': 'teacher assigned',
                'course_module': serializer.data
            })
        except TeacherUser.DoesNotExist:
            return Response({
                'error': 'Teacher not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(methods=["delete"],detail=True)
    def remove_techer(self,request,pk):
        """supprimer un teacher d'un module"""
        course_module = self.get_object()
        course_module.teacher = None
        course_module.save()
        serializer = self.get_serializer(course_module)
        return Response({
            'status': 'teacher removed',
            'course_module': serializer.data
        })
    
# ─────────────────────────────────────────
# PORTAIL ÉTUDIANT
# ─────────────────────────────────────────

class StudentPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStudent]
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        if self.action in ["current_year","current_semester","current_course_units"]:
            premissions = [IsStudent]
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
            serializer = StudentSchoolYearSerializer(current_school_year)
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
            current_school_year = StudentSchoolYear.objects.select_related(
                'formation', 'level', 'school_year'
            ).get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            current_enrollment = get_current_enrollment(current_school_year)
            
            if not current_enrollment:
                return Response({
                    'error': 'Aucun semestre actif trouvé'
                }, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'semester': {
                    'id': current_enrollment.semester.id,
                    'code': current_enrollment.semester.code,
                    'decision': current_enrollment.decision,
                    'opened_at': current_enrollment.opened_at
                },
                'formation': {
                    'id': current_school_year.formation.id,
                    'code': current_school_year.formation.code,
                    'label': current_school_year.formation.label
                },
                'level': {
                    'id': current_school_year.level.id,
                    'code': current_school_year.level.code,
                    'order': current_school_year.level.order
                }
            })
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

        response_serializer = CourseUnitListSerializer(course_units,many=True)
        return Response(response_serializer.data)


# ─────────────────────────────────────────
# PORTAIL ENSEIGNANT
# ─────────────────────────────────────────

class TeacherPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsTeacher]
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'list':
            permissions = [IsAuthenticated]
        elif self.action in ["current_modules","current_semesters","current_units"]:
            permissions = [IsTeacher]
        else:
            permissions = [IsSuperUser]
        return [permission() for permission in permissions]
        
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

        serializer = CourseUnitListSerializer(course_unit, many=True)
        return Response(serializer.data)

