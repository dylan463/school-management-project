from rest_framework import serializers

from .models import Assessment, Grade, EnrollmentResult,Debt
from structures.models import CourseModule,SchoolYear,Formation
from structures.serializers import UserSerializer,SchoolYearSerializer,FormationSerializer,SemesterSerializer
from rest_framework.exceptions import ValidationError
from .models import Enrollment
from collections import defaultdict


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    school_year = SchoolYearSerializer(read_only=True)
    formation = FormationSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
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
        validators = []

    def validate(self,attrs):
        if Enrollment.objects.filter(
            student=attrs["student"],
            school_year=attrs["school_year"],
            semester=attrs["semester"]
        ).exists():
            raise serializers.ValidationError("L'étudiant est déjà inscrit dans ce semestre de cette année scolaire")
        
        return attrs


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
        read_only_fields = ["id","is_published","school_year"]


class GradeSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source="enrollment.student.get_full_name", read_only=True)
    school_year = serializers.CharField(source="enrollment.school_year.text", read_only=True)
    class Meta:
        model = Grade
        fields = ["id","assessment","student","school_year","score"]
        read_only_fields = ["id"]

class BulletinSerializer(serializers.ModelSerializer):
    matrix = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ["matrix"]
        read_only_fields = fields

    def get_matrix(self, obj):
        enrollmentresults = obj.enrollment_results.all()

        cours_units = []
        matrix = {}

        total_score = 0
        total_credit = 0

        for er in enrollmentresults:
            course_unit = er.course_module.course_unit.text
            course_module = er.course_module.text
            score = er.final_score
            credit = er.course_module.credits
            status = er.status

            if course_unit not in matrix:
                matrix[course_unit] = {}

            matrix[course_unit][course_module] = {
                "score": score,
                "credit": credit,
                "status": status,
            }

            unit = next(
                (u for u in cours_units if u["label"] == course_unit),
                None
            )

            if unit is None:
                unit = {
                    "label": course_unit,
                    "modules": [],
                    "total_score": 0,
                    "total_credit": 0,
                    "validated": True,
                }
                cours_units.append(unit)

            total_score += score * credit
            total_credit += credit

            unit["total_score"] += score * credit
            unit["total_credit"] += credit

            if status == "NOT_VALIDATED":
                unit["validated"] = False

            unit["modules"].append(course_module)

        return {
            "coursUnits": cours_units,
            "map": matrix,
            "totalScore": total_score,
            "totalCredit": total_credit,
            "average": (
                total_score / total_credit
                if total_credit > 0
                else 0
            ),
        }
    
class GradeGridSerializer(serializers.Serializer):
    formation = serializers.IntegerField(write_only=True)
    semester = serializers.IntegerField(write_only=True)
    school_year = serializers.IntegerField(write_only=True)
    results = serializers.SerializerMethodField()

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
                "score": result.final_score * result.course_module.credits
            }
            for result in enrollment_results
        ]
    
class EnrollmentResultSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="enrollment.student.get_full_name")
    course_credit = serializers.CharField(source="course_module.credits")
    semester = serializers.CharField(source='course_module.semester.code')
    formation = serializers.CharField(source='course_module.course_unit.formation.code')
    school_year = serializers.CharField(source='enrollment.school_year.text')
    course_module = serializers.CharField(source="course_module.text")
    course_unit = serializers.CharField(source="course_module.course_unit.text")
    
    class Meta:
        model=EnrollmentResult
        fields = ['full_name',"course_unit",'final_score',"school_year",'course_module','status','course_credit','semester','formation']

class DebtSerializer(serializers.ModelSerializer):
    semester = serializers.CharField(source='result.course_module.semester.code')
    formation = serializers.CharField(source='result.course_module.course_unit.formation.code')
    course_module = serializers.CharField(source="result.course_module.text")
    school_year = serializers.CharField(source='result.enrollment.school_year.text')
    class Meta:
        model = Debt
        fields = ["id","cleared","semester","school_year","course_module","formation"]