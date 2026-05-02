from rest_framework import serializers

from .models import Assessment, Grade, EnrollmentResult
from structures.models import CourseModule,SchoolYear
from rest_framework.exceptions import ValidationError

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = [
            "id",
            "name",
            "type",
            "session",
            "location",
            "grade_weight",
            "date",
            "course_module",
            "school_year",
        ]
        read_only_fields = ["id"]


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["id", "enrollment", "assessment", "score"]
        read_only_fields = ["id"]
