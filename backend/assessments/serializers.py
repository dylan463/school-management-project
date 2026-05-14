from rest_framework import serializers

from .models import Assessment, Grade, EnrollmentResult,Debt
from structures.models import CourseModule,SchoolYear
from rest_framework.exceptions import ValidationError
from structures.models import Enrollment

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
            "is_published"
        ]
        read_only_fields = ["id","is_published"]


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["id","assessment","enrollment","score"]
        read_only_fields = ["id"]

class AttendantGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["id","assessment","score"]
        read_only_fields = ["id"]

class AttendantSerializer(serializers.ModelSerializer):
    grade = serializers.SerializerMethodField()
    debt_year = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ["id", "full_name","username", "grade", "debt_year"]

    def get_grade(self, obj):
        grades_map = self.context.get("grades_map", {})
        grade = grades_map.get(obj.id)
        if grade:
            return AttendantGradeSerializer(grade).data
        return None

    def get_debt_year(self, obj):
        debts_map = self.context.get("debts_map", {})
        debt = debts_map.get(obj.id)
        if debt:
            return obj.student_school_year.school_year.label
        return None
    
    def get_full_name(self,obj):
        student = obj.student_school_year.student
        return f"{student.first_name} {student.last_name}"

    def get_username(self,obj): 
        student = obj.student_school_year.student
        return f"{student.username}"