from .models import (
    Level, Formation, Semester, TeachingUnit, CourseComponent, Enrollement, Resource
)
from rest_framework.serializers import ModelSerializer, IntegerField, CharField
from rest_framework.exceptions import ValidationError


class LevelSerializer(ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "code", "number"]
        read_only_fields = ["id"]


class FormationSerializer(ModelSerializer):
    class Meta:
        model = Formation
        fields = ["id", "name", "code", "description"]
        read_only_fields = ["id"]


class SemesterSerializer(ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "name", "level", "formation", "number", "is_active"]
        read_only_fields = ["id"]


class CourseComponentSerializer(ModelSerializer):
    teaching_unit_name = CharField(source='teaching_unit.name', read_only=True)
    semester_name = CharField(source='teaching_unit.semester.name', read_only=True)
    level_code = CharField(source='teaching_unit.semester.level.code', read_only=True)

    class Meta:
        model = CourseComponent
        fields = ["id", "name", "teaching_unit", "teaching_unit_name", "course_credits", "teacher", "semester_name", "level_code"]
        read_only_fields = ["id","teacher"]


class TeachingUnitSerializer(ModelSerializer):
    courses = CourseComponentSerializer(many=True, read_only=True)
    courses_count = IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = TeachingUnit
        fields = ["id", "name", "code", "semester", "description", "courses", "courses_count"]
        read_only_fields = ["id","courses","courses_count"]


class EnrollementSerializer(ModelSerializer):
    class Meta:
        model = Enrollement
        fields = ["id", "student", "semester", "enrollement_date"]
        read_only_fields = ["id", "enrollement_date"]

    def validate(self, attrs):
        student = attrs["student"]
        semester = attrs["semester"]

        if Enrollement.objects.filter(student=student, semester=semester).exists():
            raise ValidationError("L'étudiant est déjà inscrit dans ce semestre")

        if not semester.is_active:
            raise ValidationError("Le semestre n'est pas actif")

        return attrs


class ResourceSerializer(ModelSerializer):
    teaching_unit_name = CharField(source='teaching_unit.name', read_only=True)
    teacher_name = CharField(source='teacher.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Resource
        fields = ["id", "name", "description", "teaching_unit", "teaching_unit_name", "teacher", "teacher_name", "file_url", "file_type", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]