import django_filters
from .models import Assessment,EnrollmentResult,Grade
from .models import Enrollment


class EnrollmentFilter(django_filters.FilterSet):
    class Meta:
        model = Enrollment
        fields = ["semester","formation","school_year","student","status"]


class AssessmentFilter(django_filters.FilterSet):
    class Meta:
        model = Assessment
        fields = ["school_year","course_module"]

class EnrollmentResultFilter(django_filters.FilterSet):
    school_year = django_filters.NumberFilter(field_name="enrollment__student_school_year__school_year__id")
    course_module = django_filters.NumberFilter(field_name="course_module__id")
    class Meta:
        model = EnrollmentResult
        fields = ["school_year","course_module"]

class GradeFilter(django_filters.FilterSet):
    assessment = django_filters.NumberFilter(field_name="assessment__id")
    class Meta:
        model = Grade
        fields = ["assessment"]

class BulletinFilter(django_filters.FilterSet):
    student_school_year = django_filters.NumberFilter(field_name="student_school_year__id")
    class Meta:
        model = Enrollment
        fields = ["student_school_year"]
    

    
