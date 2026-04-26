from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.utils import timezone

from .models import (
    Level, Formation, Semester,
    SchoolYear, StudentSchoolYear, Enrollment,
    CourseUnit, CourseModule
)
from users.serializers import UserSerializer


# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "code", "order"]
        read_only_fields = ["id","order"]


class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = ["id", "label", "code", "description"]
        read_only_fields = ["id"]


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "code", "order"]
        read_only_fields = ["id","order"]




# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = [
            "id", "label", "status", "start_date", 
            "end_date", "is_locked"
        ]
        read_only_fields = ["id"]

class SchoolYearCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = ["label"]


class StudentSchoolYearSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    school_year = SchoolYearSerializer(read_only=True)
    formation = FormationSerializer(read_only=True)
    level = LevelSerializer(read_only=True)
    
    student_id = serializers.IntegerField(write_only=True)
    school_year_id = serializers.IntegerField(write_only=True)
    formation_id = serializers.IntegerField(write_only=True)
    level_id = serializers.IntegerField(write_only=True)
    
    enrollments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentSchoolYear
        fields = [
            "id", "student", "school_year", "formation", "level",
            "status", "created_at", "enrollments_count",
            "student_id", "school_year_id", "formation_id", "level_id"
        ]
        read_only_fields = ["id", "created_at", "enrollments_count"]
    
    def get_enrollments_count(self, obj):
        return getattr(obj, 'enrollments_count', obj.enrollments.count())

class StudentlatestSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(write_only = True)

    def validate_student_id(self, value):
        from users.models import StudentUser
        if not StudentUser.objects.filter(id=value).exists():
            raise ValidationError("L'étudiant spécifié n'existe pas")
        return value
        
# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    student_school_year = StudentSchoolYearSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
        
    class Meta:
        model = Enrollment
        fields = [
            "id", "student_school_year", "semester", 
            "decision", "is_current", "opened_at"
        ]
        read_only_fields = ["id", "opened_at"]


# ─────────────────────────────────────────
# UNITÉS D'ENSEIGNEMENT
# ─────────────────────────────────────────

class CourseModuleSerializer(serializers.ModelSerializer):
    course_unit = serializers.StringRelatedField(read_only=True)
    teacher = UserSerializer(read_only=True)
    
    course_unit_id = serializers.IntegerField(write_only=True)
    teacher_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = CourseModule
        fields = [
            "id", "code", "label", "credits", "course_unit",
            "teacher", "volume_hours", "is_active",
            "course_unit_id", "teacher_id"
        ]
        read_only_fields = ["id"]


class CourseUnitSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    modules_count = serializers.SerializerMethodField()
    formation = FormationSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    
    formation_id = serializers.IntegerField(write_only=True)
    semester_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CourseUnit
        fields = [
            "id", "code", "label", "coefficient", "is_active",
            "modules", "modules_count", "formation", "level", "semester",
            "formation_id", "semester_id"
        ]
        read_only_fields = ["id", "modules", "modules_count"]
    
    def get_modules_count(self, obj):
        return getattr(obj, 'modules_count', obj.modules.filter(is_active=True).count())


class CourseUnitDetailSerializer(CourseUnitSerializer):
    """Serializer détaillé avec tous les modules"""
    total_credits = serializers.SerializerMethodField()
    
    class Meta(CourseUnitSerializer.Meta):
        fields = CourseUnitSerializer.Meta.fields + ["total_credits"]
    
    def get_total_credits(self, obj):
        return obj.get_total_credits()


# ─────────────────────────────────────────
# SERIALIZERS SPÉCIFIQUES POUR LES ACTIONS
# ─────────────────────────────────────────

class CreateStudentSchoolYearSerializer(serializers.Serializer):
    """Serializer pour la création d'inscription annuelle"""
    student_id = serializers.IntegerField()
    school_year_id = serializers.IntegerField()
    formation_id = serializers.IntegerField()
    level_id = serializers.IntegerField()
    
    def validate_student_id(self, value):
        from users.models import StudentUser
        if not StudentUser.objects.filter(id=value).exists():
            raise ValidationError("L'étudiant spécifié n'existe pas")
        return value
    
    def validate_school_year_id(self, value):
        if not SchoolYear.objects.filter(id=value).exists():
            raise ValidationError("L'année scolaire spécifiée n'existe pas")
        return value
    
    def validate_formation_id(self, value):
        if not Formation.objects.filter(id=value).exists():
            raise ValidationError("La formation spécifiée n'existe pas")
        return value
    
    def validate_level_id(self, value):
        if not Level.objects.filter(id=value).exists():
            raise ValidationError("Le niveau spécifié n'existe pas")
        return value


class PromoteRepeatSerializer(serializers.Serializer):
    """Serializer pour la réinscription automatique"""
    student_id = serializers.IntegerField()
    new_school_year_id = serializers.IntegerField()
    
    def validate_student_id(self, value):
        from users.models import StudentUser
        if not StudentUser.objects.filter(id=value).exists():
            raise ValidationError("L'étudiant spécifié n'existe pas")
        return value
    
    def validate_new_school_year_id(self, value):
        if not SchoolYear.objects.filter(id=value).exists():
            raise ValidationError("L'année scolaire spécifiée n'existe pas")
        return value


class ChangeEnrollmentDecisionSerializer(serializers.Serializer):
    """Serializer pour changer la décision d'un enrollment"""
    decision = serializers.ChoiceField(choices=Enrollment.Decision.choices)


class ActivateNextSemesterSerializer(serializers.Serializer):
    """Serializer pour activer le semestre suivant"""
    decision = serializers.ChoiceField(
        choices=Enrollment.Decision.choices,
        default=Enrollment.Decision.PASSED
    )
