from .models import (
    Level, Formation, Semester, TeachingUnit, CourseComponent, Enrollement
)
from rest_framework.serializers import ModelSerializer,IntegerField


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
    class Meta:
        model = CourseComponent
        fields = ["id", "name", "teaching_unit", "course_credits", "teacher"]
        read_only_fields = ["id"]


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
        fields = ["id", "student", "semester", "date_registered"]
        read_only_fields = ["date_registered","id","date_registered"]