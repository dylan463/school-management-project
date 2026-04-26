from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db.models import Count, Prefetch


from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .filter import StudentFilter,TeacherFilter


from .models import (
    Level, Formation, Semester, CourseUnit, CourseModule, 
    SchoolYear, StudentSchoolYear, Enrollment,FormationLevel
)
from .serializers import (
    LevelSerializer, FormationSerializer, SemesterSerializer,
    CourseUnitSerializer, CourseModuleSerializer, SchoolYearSerializer,
    StudentSchoolYearSerializer, EnrollmentSerializer,
    CreateStudentSchoolYearSerializer, PromoteRepeatSerializer,
    ChangeEnrollmentDecisionSerializer, ActivateNextSemesterSerializer,
    StudentlatestSerializer, SchoolYearCreateSerializer
)
from .services import (
    get_current_enrollment,
    get_student_enrollment_summary,
    change_enrollement_decision,
    regenerate_levels_for_formation,
    create_level,
    activate_school_year,
    end_school_year,
    toggle_school_year_lock,
    promote_or_repeat_for_new_school_years,
    force_create_student_school_year_for_new_year,
    get_last_student_school_year,go_to_first_periode,go_to_second_periode,get_open_school_year
)

from users.permissions import IsSuperUser, IsStudent, IsTeacher
from users.models import StudentUser, TeacherUser
from users.serializers import UserSerializer,UserCreateSerializer


# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

class LevelViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin,viewsets.mixins.CreateModelMixin,viewsets.mixins.UpdateModelMixin,viewsets.mixins.RetrieveModelMixin):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsSuperUser]

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

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsSuperUser]

    @action(methods=["get"],detail=True)
    def levels(self,request,pk=None):
        formation = self.get_object()
        levels = Level.objects.filter(formation_levels__formation=formation).distinct()
        serializer = LevelSerializer(levels,many = True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    @action(methods=["post"],detail=True,url_path="assign-levels")
    def assign_levels(self,request,pk=None):
        formation = self.get_object()

        try:
            from_level = int(request.data["from"])
            to_level = int(request.data["to"])

            regenerate_levels_for_formation(from_level_order=from_level,to_level_order=to_level,formation=formation)
            return Response({"detail": "levels assigned"})
        except KeyError as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({"error": "from et to devrait etre des entier"},status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(methods=["post"],detail=True,url_path="remove-levels")
    def removelevels(self,request,pk=None):
        formation = self.get_object()
        FormationLevel.objects.filter(formation=formation).delete()
        return Response({"formation levels":"deleter"},status=status.HTTP_200_OK)

class SemesterViewSet(viewsets.GenericViewSet,viewsets.mixins.ListModelMixin,viewsets.mixins.UpdateModelMixin):
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


# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

class SchoolYearViewSet(viewsets.ModelViewSet):
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [IsSuperUser]

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
    
    @action(methods=["post"],detail=False,url_path="student-latest")
    def student_latest(self,request):
        serializer = StudentlatestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = StudentUser.objects.get(pk=serializer.validated_data["student_id"])
            last_ssy = get_last_student_school_year(student)
            response_serializer = StudentSchoolYearSerializer(last_ssy)
            return Response(response_serializer.data,status=status.HTTP_200_OK)
        except Exception as e:
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

    def get_queryset(self):
        return (
            CourseUnit.objects
            .select_related('formation', 'semester', 'semester__level')
            .prefetch_related(
                Prefetch(
                    'modules',
                    queryset=CourseModule.objects.select_related('teacher')
                )
            )
            .annotate(modules_count=Count('modules'))
        )

class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.select_related(
        'course_unit', 'course_unit__semester', 'teacher'
    )
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

            course_units = (
                CourseUnit.objects
                .filter(
                    formation=current_school_year.formation,
                    semester=current_enrollment.semester
                )
                .select_related('formation', 'semester', 'semester__level')
                .prefetch_related(
                    Prefetch(
                        'modules',
                        queryset=CourseModule.objects.select_related('teacher')
                    )
                )
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
            current_school_year = StudentSchoolYear.objects.select_related(
                'formation', 'level', 'school_year'
            ).get(
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
        ).select_related('course_unit', 'course_unit__semester')
        
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
        
        course_units = (
            CourseUnit.objects
            .filter(modules__teacher=teacher)
            .select_related('formation', 'semester', 'semester__level')
            .prefetch_related(
                Prefetch(
                    'modules',
                    queryset=CourseModule.objects.select_related('teacher')
                )
            )
            .distinct()
        )
        
        serializer = CourseUnitSerializer(course_units, many=True)
        return Response(serializer.data)


class AdminStudentViewset(viewsets.ModelViewSet):
    permission_classes = [IsSuperUser]
    queryset = StudentUser.objects.all()
    serializer_class = UserSerializer
    filter_backends =  [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = StudentFilter

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class AdminTeacherViewset(viewsets.ModelViewSet):
    permission_classes = [IsSuperUser]
    queryset = TeacherUser.objects.all()
    serializer_class = UserSerializer
    filter_backends =  [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TeacherFilter

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False,methods=["get"])
    def nomodules(self,request):
        teachers = TeacherUser.objects.filter(
            course_modules__isnull = True
        ).distinct()

        serializer = self.get_serializer(teachers,many = True)

        return Response(serializer.data)

