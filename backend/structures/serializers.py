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


class FormationCreateSerializer(serializers.ModelSerializer):
    from_level = serializers.IntegerField()
    to_level = serializers.IntegerField()

    class Meta:
        model = Formation
        fields = ["label", "code", "description", "from_level", "to_level"]


    def validate(self, attrs):
        from_level = attrs.get("from_level")
        to_level = attrs.get("to_level")

        # On ne valide que si les deux sont fournis
        if from_level is None or to_level is None:
            return attrs

        # Validation logique
        if from_level <= 0 or to_level <= 0:
            raise serializers.ValidationError(
                "Les niveaux doivent être strictement positifs."
            )

        if from_level > to_level:
            raise serializers.ValidationError(
                "from_level ne peut pas être supérieur à to_level."
            )

        # Validation existence de from_level et to_level uniquement
        if not Level.objects.filter(order=from_level).exists():
            raise serializers.ValidationError(
                {"from_level": "Ce niveau n'existe pas."}
            )

        if not Level.objects.filter(order=to_level).exists():
            raise serializers.ValidationError(
                {"to_level": "Ce niveau n'existe pas."}
            )

        return attrs



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
    class Meta:
        model = CourseModule
        fields = ["code","label","credits","min_val_score","course_unit","teacher","volume_hours","is_active","created_at"]
        read_only_fields = ["id","created_at"]

class CourseModuleForListUnitSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    class Meta:
        model = CourseModule
        fields = ["code","label","credits","teacher_name"]
    def get_teacher_name(self,obj):
        return obj.teacher.get_full_name()

class CourseUnitListSerializer(serializers.ModelSerializer):
    modules = CourseModuleForListUnitSerializer(read_only=True,many=True)
    class Meta:
        model = CourseUnit
        fields = ["id","code","label","formation","semester","is_active","created_at","modules"]
        read_only_fields = ["id","code","label","formation","semester","is_active","created_at","modules"]
    
class CourseUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseUnit
        fields = ["id","code","label","formation","semester","is_active","created_at"]
        read_only_fields = ["id","created_at"]


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
