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


class BulletinSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    formation = serializers.CharField(source="student_school_year.formation.code")
    level = serializers.CharField(source="student_school_year.level.code")
    school_year = serializers.CharField(source="student_school_year.school_year.label")
    semester = serializers.CharField(source="semester.code")

    class Meta :
        model = Enrollment
        fields = ["id","student","formation","level","school_year","results","semester"]
        read_only_fields = ["id","student","formation","level","school_year","results","semester"]

    def get_student(self, obj):
        student = obj.student_school_year.student
        return {"id": student.id,"username": student.username,"full_name": f"{student.first_name} {student.last_name}"}
    
    def get_results(self, obj):
        results = obj.enrollment_results.all()
        response_result = []
        for result in results:
            response_result.append({
                "course_unit": result.course_module.course_unit.label,
                "course_module": result.course_module.label,
                "score": result.final_score,
                "credit": result.course_module.credit,
                "status": result.status
            })
        return response_result
    

class GradeGridSerializer(serializers.Serializer):
    level = serializers.IntegerField(write_only=True)
    formation = serializers.IntegerField(write_only=True)
    semester = serializers.IntegerField(write_only=True)
    school_year = serializers.IntegerField(write_only=True)
    
    def get_results(self,obj):

        enrollment_results = EnrollmentResult.objects.filter(
            enrollment__student_school_year__level=self.initial_data["level"],
            enrollment__student_school_year__formation=self.initial_data["formation"],
            enrollment__semester=self.initial_data["semester"],
            enrollment__student_school_year__school_year=self.initial_data["school_year"]
        ).select_related(
            "enrollment",
            "enrollment__student_school_year",
            "enrollment__student_school_year__student",
            "course_module",
            "course_module__course_unit"
            )
        response_result = []
        for result in enrollment_results:
            student_full_name = result.enrollment.student_school_year.student.get_full_name()
            course_unit = result.course_module.course_unit.label
            course_module = result.course_module.label
            score = result.final_score
            credit = result.course_module.credit
            status = result.status
            response_result.append({
                "student_full_name": student_full_name,
                "course_unit": course_unit,
                "course_module": course_module,
                "score": score,
                "credit": credit,
                "status": status
            })
        return response_result


    
    