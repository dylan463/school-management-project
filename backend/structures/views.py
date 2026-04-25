from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.db.models import Count, Q

from .models import (
    Level, Formation, Semester, CourseUnit, CourseModule, 
    SchoolYear, StudentSchoolYear, Enrollment, LevelSemester
)
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,LevelSemesterSerializer,
    CourseUnitSerializer, CourseModuleSerializer, SchoolYearSerializer,
    StudentSchoolYearSerializer, EnrollmentSerializer,
    CreateStudentSchoolYearSerializer, PromoteRepeatSerializer,
    ChangeEnrollmentDecisionSerializer, ActivateNextSemesterSerializer,
    EnrollmentDetailSerializer, CourseUnitDetailSerializer
)
from .services import (
    # School year services
    create_student_school_year,
    activate_school_year,
    end_school_year,
    toggle_school_year_lock,
    
    # Enrollment services
    get_semesters_for_level,
    get_current_enrollment,
    get_next_semester_for_level,
    create_year_enrollments,
    get_current_semester_for_level,
    activate_next_semester,
    change_enrollement_decision,
    get_student_enrollment_summary,
    
    # Student services
    get_last_closed_student_school_year,
    is_student_in_active_school_year,
    promote_or_repeat_for_new_school_years,
    force_create_student_school_year_for_new_year,
)

from users.permissions import IsSuperUser, IsStudent, IsTeacher
from users.models import StudentUser, TeacherUser
from users.serializers import UserSerializer


# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsSuperUser]

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsSuperUser]

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['GET'])
    def students(self, request, pk=None):
        """Récupère tous les étudiants inscrits à ce semestre"""
        semester = self.get_object()
        students = StudentUser.objects.filter(
            school_years__enrollments__semester=semester
        ).distinct()
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)


class LevelSemesterViewSet(viewsets.ModelViewSet):
    queryset = LevelSemester.objects.all()
    serializer_class = LevelSemesterSerializer
    permission_classes = [IsSuperUser]


# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

class SchoolYearViewSet(viewsets.ModelViewSet):
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [IsSuperUser]

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


# ─────────────────────────────────────────
# INSCRIPTION ANNUELLE
# ─────────────────────────────────────────

class StudentSchoolYearViewSet( viewsets.GenericViewSet,
                                viewsets.mixins.ListModelMixin,
                                viewsets.mixins.RetrieveModelMixin,
                                viewsets.mixins.DestroyModelMixin 
                            ):
    queryset = StudentSchoolYear.objects.all()
    serializer_class = StudentSchoolYearSerializer
    permission_classes = [IsSuperUser]

    @action(detail=False, methods=['POST'])
    def create_enrollment(self, request):
        """Crée une inscription annuelle pour un étudiant"""
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
                school_year=school_year,
                formation=formation,
                level=level
            )
            response_serializer = StudentSchoolYearSerializer(student_school_year)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['POST'])
    def activate_next(self, request, pk=None):
        """Active le semestre suivant"""
        enrollment = self.get_object()
        student_school_year = enrollment.student_school_year
        
        serializer = ActivateNextSemesterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decision = serializer.validated_data['decision']
            next_enrollment = activate_next_semester(
                student_school_year, 
                last_enrollment_decision=decision
            )
            if next_enrollment:
                response_serializer = EnrollmentSerializer(next_enrollment)
                return Response(response_serializer.data)
            else:
                return Response({
                    'message': 'Plus de semestres disponibles - fin d\'année'
                })
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['GET'])
    def summary(self, request):
        """Résumé des enrollments pour un étudiant"""
        student_school_year_id = request.query_params.get('student_school_year')
        
        if not student_school_year_id:
            return Response({
                'error': 'student_school_year est requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            student_school_year = StudentSchoolYear.objects.get(pk=student_school_year_id)
            summary = get_student_enrollment_summary(student_school_year)
            return Response(summary)
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'StudentSchoolYear non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# UNITÉS D'ENSEIGNEMENT
# ─────────────────────────────────────────

class CourseUnitViewSet(viewsets.ModelViewSet):
    serializer_class = CourseUnitSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        return CourseUnit.objects.prefetch_related('modules').annotate(
            modules_count=Count('modules')
        )

class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['POST'])
    def assign_teacher(self, request, pk=None):
        """Assigne un enseignant à un module"""
        course_module = self.get_object()
        teacher_id = request.data.get('teacher_id')

        if not teacher_id:
            return Response({
                'error': 'teacher_id est requis'
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


# ─────────────────────────────────────────
# PORTAIL ÉTUDIANT
# ─────────────────────────────────────────

class StudentPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStudent]

    @action(detail=False, methods=['GET'])
    def current_year(self, request):
        """Informations sur l'année scolaire actuelle de l'étudiant"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.get(
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
            current_school_year = StudentSchoolYear.objects.get(
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
    def my_course_units(self, request):
        """Unités d'enseignement du semestre actuel"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            current_enrollment = get_current_enrollment(current_school_year)
            
            if not current_enrollment:
                return Response({
                    'error': 'Aucun semestre actif trouvé'
                }, status=status.HTTP_404_NOT_FOUND)

            course_units = CourseUnit.objects.filter(
                formation=current_school_year.formation,
                level=current_school_year.level,
                semester=current_enrollment.semester
            )
            serializer = CourseUnitSerializer(course_units, many=True)
            return Response(serializer.data)
            
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'Aucune inscription active trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def classmates(self, request):
        """Camardes de classe du semestre actuel"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            current_enrollment = get_current_enrollment(current_school_year)
            
            if not current_enrollment:
                return Response({
                    'error': 'Aucun semestre actif trouvé'
                }, status=status.HTTP_404_NOT_FOUND)

            classmates = StudentUser.objects.filter(
                school_years__enrollments__semester=current_enrollment.semester,
                school_years__formation=current_school_year.formation,
                school_years__level=current_school_year.level
            ).exclude(id=student.id).distinct()
            
            serializer = UserSerializer(classmates, many=True)
            return Response(serializer.data)
            
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'Aucune inscription active trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def progress_summary(self, request):
        """Résumé de la progression de l'étudiant"""
        student = request.user
        
        try:
            current_school_year = StudentSchoolYear.objects.get(
                student=student,
                school_year__status=SchoolYear.Status.ACTIVE
            )
            summary = get_student_enrollment_summary(current_school_year)
            return Response(summary)
            
        except StudentSchoolYear.DoesNotExist:
            return Response({
                'error': 'Aucune inscription active trouvée'
            }, status=status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# PORTAIL ENSEIGNANT
# ─────────────────────────────────────────

class TeacherPortalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsTeacher]

    @action(detail=False, methods=['GET'])
    def my_modules(self, request):
        """Modules enseignés par l'enseignant"""
        teacher = request.user
        modules = CourseModule.objects.filter(
            teacher=teacher
        ).select_related('course_unit', 'course_unit__semester', 'course_unit__level')
        
        serializer = CourseModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_students(self, request):
        """Étudiants des cours de l'enseignant"""
        teacher = request.user
        
        students = StudentUser.objects.filter(
            school_years__enrollments__semester__course_units__modules__teacher=teacher
        ).distinct()
        
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_semesters(self, request):
        """Semestres des cours de l'enseignant"""
        teacher = request.user
        
        semesters = Semester.objects.filter(
            course_units__modules__teacher=teacher
        ).distinct()
        
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_course_units(self, request):
        """Unités d'enseignement de l'enseignant"""
        teacher = request.user
        
        course_units = CourseUnit.objects.filter(
            modules__teacher=teacher
        ).distinct()
        
        serializer = CourseUnitSerializer(course_units, many=True)
        return Response(serializer.data)


class AdminPortalViewset(viewsets.GenericViewSet):
    permission_classes = [IsSuperUser]

    @action(methods=["get"],detail=False)
    def students(self,request):
        queryset = StudentUser.objects.all()
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Filtrage par statut actif
        # is_active = request.query_params.get('is_active', None)
        # if is_active is not None:
        #     queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        serializer = UserSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(methods=["get"],detail=False)
    def teachers(self,request):
        queryset = TeacherUser.objects.all()
        
        # Recherche
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Filtrage par statut actif
        # is_active = request.query_params.get('is_active', None)
        # if is_active is not None:
        #     queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        serializer = UserSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
        

