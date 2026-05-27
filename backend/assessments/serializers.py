from rest_framework import serializers

from .models import Assessment, Grade, EnrollmentResult,Debt
from structures.models import CourseModule,SchoolYear,Formation
from rest_framework.exceptions import ValidationError
from .models import Enrollment
from collections import defaultdict


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

class ChangeEnrolStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    def validate_status(self,value):
        if not value in Enrollment.Status.values:
            raise serializers.ValidationError("ce status est invalide")
        return value

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["student", "school_year", "formation", "semester"]



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
    debt = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ["id", "student", "grade", "debt"]

    def get_grade(self, enrollment):
        grades = getattr(enrollment, "assessment_grades", [])
        return grades[0].score if grades else None

    def get_debt(self, enrollment):
        result = enrollment.enrollment_results.all().first()
        if not result:
            return None
        debts = getattr(result, "module_debts", [])
        if not debts:
            return None
        school_year = debts[0].result.enrollment.school_year
        return {"text":school_year.text}


class BulletinSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    bulletin = serializers.SerializerMethodField()
    formation = serializers.CharField(source="formation.code")
    school_year = serializers.CharField(source="school_year.label")
    semester = serializers.CharField(source="semester.code")

    class Meta:
        model = Enrollment
        fields = ["id", "student", "formation", "school_year", "semester", "bulletin"]
        read_only_fields = fields

    def get_student(self, obj):
        student = obj.student
        return {
            "id": student.id,
            "username": student.username,
            "full_name": student.get_full_name(),  # utilise la méthode Django
        }

    def get_bulletin(self, obj):
        # Utilise le prefetch fait en amont — aucune query supplémentaire
        results = obj.enrollment_results.all()
        bulletin = defaultdict(dict)
        for result in results:
            unit = result.course_module.course_unit.text
            module = result.course_module.text
            bulletin[unit][module] = {
                "score": result.final_score,
                "credit": result.course_module.credits,
                "status": result.status,
            }
        return bulletin
    
class GradeGridSerializer(serializers.Serializer):
    formation = serializers.IntegerField(write_only=True)
    semester = serializers.IntegerField(write_only=True)
    school_year = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        # Confirm the formation/semester/school_year combo actually exists
        if not Formation.objects.filter(pk=attrs["formation"]).exists():
            raise serializers.ValidationError({"formation": "Formation not found."})
        return attrs

    def get_results(self):
        """
        Call after .is_valid() so validated_data is guaranteed to be populated.
        """
        data = self.validated_data  # safe — already validated

        enrollment_results = (
            EnrollmentResult.objects.filter(
                enrollment__formation=data["formation"],
                enrollment__semester=data["semester"],
                enrollment__school_year=data["school_year"],
            )
            .select_related(
                "enrollment",
                "enrollment__student",
                "course_module",
                "course_module__course_unit",
            )
            .order_by(
                "enrollment__student__last_name",
                "course_module__course_unit__text",
            )
        )

        return [
            {
                "student_full_name": result.enrollment.student.get_full_name(),
                "course_unit": result.course_module.course_unit.text,
                "course_module": result.course_module.text,
                "score": result.final_score,
                "credit": result.course_module.credits,
                "status": result.status,
            }
            for result in enrollment_results
        ]
class EnrollmentResultSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    course_credit = serializers.CharField(source="course_module.credits")
    semester = serializers.CharField(source='course_module.course_unit.semester.code')
    formation = serializers.CharField(source='course_module.course_unit.formation.code')
    
    class Meta:
        model=EnrollmentResult
        fields = ['full_name','final_score','status','course_credit','semester','formation']
    def get_full_name(self,obj):
        student = obj.enrollment.student_school_year.student
        return f'{student.first_name} {student.last_name}'