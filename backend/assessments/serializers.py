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
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "student_name", "grade", "debt"]

    def get_grade(self, enrollment):
        grades = getattr(enrollment, "assessment_grades", [])
        if grades:
            return {"id": grades[0].id, "score": grades[0].score}
        return None

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
    full_name = serializers.CharField(source="enrollment.student.get_full_name")
    course_credit = serializers.CharField(source="course_module.credits")
    semester = serializers.CharField(source='course_module.course_unit.semester.code')
    formation = serializers.CharField(source='course_module.course_unit.formation.code')
    school_year = serializers.CharField(source='enrollment.school_year.text')
    course_module = serializers.CharField(source="course_module.text")
    course_unit = serializers.CharField(source="course_module.course_unit.text")
    
    class Meta:
        model=EnrollmentResult
        fields = ['full_name',"course_unit",'final_score','course_module','status','course_credit','semester','formation']

class DebtSerializer(serializers.ModelSerializer):
    semester = serializers.CharField(source='result.course_module.course_unit.semester.code')
    formation = serializers.CharField(source='result.course_module.course_unit.formation.code')
    course_module = serializers.CharField(source="result.course_module.text")
    class Meta:
        model = Debt
        fields = ["id","cleared","semester","course_module","formation"]