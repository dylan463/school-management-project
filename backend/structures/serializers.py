from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import (
    Level, Formation, Semester,
    SchoolYear, StudentSchoolYear, Enrollment,
    CourseUnit, CourseModule
)
from users.serializers import UserSerializer,UserCreateSerializer
from users.models import CustomUser, TeacherUser

# ─────────────────────────────────────────
# STRUCTURE ACADEMIQUE
# ─────────────────────────────────────────

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "code", "order"]
        read_only_fields = ["id","order"]


class FormationSerializer(serializers.ModelSerializer):
    first_level = serializers.SerializerMethodField()
    last_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Formation
        fields = ["id", "label", "code", "description", "first_level", "last_level"]
        read_only_fields = ["id"]
    
    def get_first_level(self, obj):
        """Retourne le niveau le plus bas de la formation"""
        first_level = obj.formation_levels.select_related('level').order_by('level__order').first()
        if first_level:
            return {
                'id': first_level.level.id,
                'code': first_level.level.code,
                'order': first_level.level.order
            }
        return None
    
    def get_last_level(self, obj):
        """Retourne le niveau le plus élevé de la formation"""
        last_level = obj.formation_levels.select_related('level').order_by('level__order').last()
        if last_level:
            return {
                'id': last_level.level.id,
                'code': last_level.level.code,
                'order': last_level.level.order
            }
        return None


class FormationCreateSerializer(serializers.ModelSerializer):
    from_level = serializers.IntegerField()
    to_level = serializers.IntegerField()

    class Meta:
        model = Formation
        fields = ["label", "code", "description", "from_level", "to_level"]
        extra_kwargs = {
            "label": {"required": True},
            "code": {"required": True},
            "description": {"required": False},
        }


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
    level = LevelSerializer()
    class Meta:
        model = Semester
        fields = ["id", "code", "order","level"]
        read_only_fields = ["id","order","level"]




# ─────────────────────────────────────────
# ANNÉE SCOLAIRE
# ─────────────────────────────────────────

class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = [
            "id", "label", "status", "start_date", 
            "end_date", "is_locked","period"
        ]
        read_only_fields = ["id", "status", "start_date", "end_date", "is_locked","period"]

class SchoolYearCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = ["label"]
    def validate(self,attrs):
        if SchoolYear.objects.filter(status="UPCOMING").exists():
            raise serializers.ValidationError(
                "Il ne peut y avoir qu'une seule année scolaire à venir.")
        return attrs


class SSYListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    formation = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    school_year = serializers.SerializerMethodField()

    class Meta:
        model = StudentSchoolYear
        fields = ['id','full_name','status','username','formation','level','school_year']
    
    def get_full_name(self,obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_username(self,obj):
        return obj.student.username

    def get_formation(self,obj):
        return obj.formation.code
    
    def get_level(self,obj):
        return obj.level.code
    
    def get_school_year(self,obj):
        return obj.school_year.label
        
# ─────────────────────────────────────────
# INSCRIPTION PAR SEMESTRE
# ─────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
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
    teacher = UserSerializer(read_only=True)
    class Meta:
        model = CourseModule
        fields = ["id","code","label","teacher","credits","min_val_score","volume_hours","is_active","created_at"]
        read_only_fields = ["id","created_at"]
        
class CourseModuleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = ["code","label","credits","min_val_score","course_unit","volume_hours","is_active","teacher"]
        read_only_fields = ["created_at"]
        extra_kwargs = {
            "code": {"required": True},
            "label": {"required": True},
            "credits": {"required": True},
            "min_val_score": {"required": True},
            "course_unit": {"required": True},
            "volume_hours": {"required": False},
            "is_active": {"required": False},
            "teacher":{"required":False}
        }
    

    
class CourseUnitSerializer(serializers.ModelSerializer):
    formation = FormationSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    total_credits = serializers.SerializerMethodField()
    class Meta:
        model = CourseUnit
        fields = ["id","code","label","formation","semester","is_active","created_at","total_credits"]
        read_only_fields = ["id","created_at"]
    def get_total_credits(self,obj):
        return sum([ credit for credit in obj.modules.filter(is_active=True).values_list('credits', flat=True)])

class CourseUnitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseUnit
        fields = ["code","label","formation","semester","is_active"]  
        extra_kwargs = {
            "formation": {"required": True},
            "semester": {"required": True},
            "label": {"required": True},
            "code": {"required": True},
            "is_active": {"required": False},
        }           


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


class StudentCreateSerializer(UserCreateSerializer):
    school_year = serializers.IntegerField()
    level = serializers.IntegerField()
    formation = serializers.IntegerField()

    class Meta:
        model = CustomUser
        fields = ["first_name","last_name","email","role","school_year","level","formation"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_school_year(self,value):
        if not SchoolYear.objects.filter(id=value).exists():
            raise ValidationError("L'année scolaire spécifiée n'existe pas")
        return value

    def validate_level(self,value):
        if not Level.objects.filter(id=value).exists():
            raise ValidationError("Le niveau spécifié n'existe pas")
        return value
    
    def validate_formation(self,value):
        if not Formation.objects.filter(id=value).exists():
            raise ValidationError("La formation spécifiée n'existe pas")
        return value

class StudentSearchSerializer(serializers.ModelSerializer):
    active_ssy = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ["id","last_name","first_name","email","username","active_ssy"]
    def get_active_ssy(self,obj):
        if obj.prefeched_active_ssy:
            return obj.prefeched_active_ssy[0]
        return None