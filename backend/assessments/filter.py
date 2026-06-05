import django_filters
from .models import Assessment,EnrollmentResult,Grade,Enrollment,Debt
from .models import Enrollment
from django.db.models import Q
from structures.models import SchoolYear

class EnrollmentFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    exclude_year = django_filters.NumberFilter(method="filter_exclude_year")
    class Meta:
        model = Enrollment
        fields = ["semester","formation","school_year","student","status"]
    
    def filter_status(self, queryset, name, value):
        if value in Enrollment.Status.values:
            return queryset.filter(status=value)
        elif value == "DELIBERATED":
            active_sy = SchoolYear.objects.filter(status = "ACTIVE").first()
            if not active_sy:
                return queryset.none()
            debts = Debt.objects.filter(last_deliberation=active_sy)
            query = Q(enrollment_results__debts__in=debts) | Q(school_year=active_sy,status__in = ["VALIDATED","NOT_VALIDATED"])
            return queryset.filter(query)
        elif value == "NOT_DELIBERATED":
            active_sy = SchoolYear.objects.filter(status = "ACTIVE").first()
            if not active_sy:
                return queryset.none()
            return queryset.filter(status ="ACTIVE")
        return queryset

    def filter_exclude_year(self,queryset,name,value):
        if value:
            return queryset.exclude(student__enrollments__school_year__id=value)
        return queryset

class AssessmentFilter(django_filters.FilterSet):
    class Meta:
        model = Assessment
        fields = ["school_year","course_module"]

class EnrollmentResultFilter(django_filters.FilterSet):
    school_year = django_filters.NumberFilter(field_name="enrollment__school_year__id")
    formation = django_filters.NumberFilter(field_name="enrollment__formation__id")
    semester = django_filters.NumberFilter(field_name="enrollment__semester__id")
    class Meta:
        model = EnrollmentResult
        fields = ["school_year","course_module","formation","semester","status","enrollment"]

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
    

    
