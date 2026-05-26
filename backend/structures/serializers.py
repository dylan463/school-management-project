from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import (
    Formation, Semester,
    SchoolYear, Enrollment,
    CourseUnit, CourseModule
)


class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = ["id","code",'text',"description"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "label": {"required": True},
            "code": {"required": True},
            "description": {"required": False},
        }

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "code", "order"]
        read_only_fields = ["id"]

    def validate_order(self, value):
        request = self.context.get("request")
        user = request.user
        mention = user.mention

        last_semester = Semester.objects.filter(
            mention=mention
        ).order_by("order").last()

        if last_semester and value <= last_semester.order:
            raise serializers.ValidationError(
                f"L'ordre doit être supérieur à {last_semester.order}"
            )

        return value
        


class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = [
            "id", "text", "status", "start_date", 
            "end_date", "is_locked"
        ]
        read_only_fields = ["id","status",'is_locked']
        extra_kwargs = {
            "text": {"required": True},
            "start_date": {"required": False},
            "end_date": {"required": False},
        }

class ChangeSYStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    def validate_status(self,value):
        if not value in SchoolYear.Status.values:
            raise serializers.ValidationError("ce status est invalide")
        return value

class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source='student.get_full_name', read_only=True)
    school_year = serializers.CharField(source='school_year.text', read_only=True)
    formation = serializers.CharField(source='formation.text', read_only=True)
    semester = serializers.CharField(source='semester.code', read_only=True)
    class Meta:
        model = Enrollment
        fields = [
            "id","student", "school_year", "formation",
            "semester", "status", "opened_at"
        ]
        read_only_fields = ["id", "opened_at","status"]

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["student", "school_year", "formation", "semester"]
        extra_kwargs = {
            "student": {"required": True},
            "school_year": {"required": True},
            "formation": {"required": True},
            "semester": {"required": True},
        }


class CourseModuleSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source='teacher.get_full_name', read_only=True)
    course_unit = serializers.CharField(source='course_unit.code', read_only=True)
    semester = serializers.CharField(source='semester.code', read_only=True)
    class Meta:
        model = CourseModule
        fields = ["id","code","text",'semester',"teacher","credits","min_val_score","course_unit","volume_hours","is_active"]
        read_only_fields = ["id"]


class CourseModuleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = ["code","text","credits",'semester',"teacher","min_val_score","course_unit","volume_hours","teacher"]
        extra_kwargs = {
            "volume_hours": {"required": False},
            "teacher":{"required":False},
        }

    
class CourseUnitSerializer(serializers.ModelSerializer):
    formation = FormationSerializer(read_only=True)
    total_credits = serializers.SerializerMethodField()
    class Meta:
        model = CourseUnit
        fields = ["id","code","text","formation","is_active","total_credits"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "is_active":{"required":False}
        }
    def get_total_credits(self,obj):
        return sum([ credit for credit in obj.modules.filter(is_active=True).values_list('credits', flat=True)])

class CourseUnitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseUnit
        fields = ["code","text","formation"]         
