import django_filters
from structures.models import (
    Level,Semester,SchoolYear,Enrollment,CourseModule,CourseUnit,StudentSchoolYear
)
from django.db.models import Q

class LevelFilter(django_filters.FilterSet):
    formation = django_filters.NumberFilter(
        field_name="formation_levels__formation__id"
    )
    class Meta:
        model = Level
        fields = []

class EnrollmentFilter(django_filters.FilterSet):
    level = "semester__level__id"
    formation = "student_school_year__formation__id"
    school_year = "student_school_year__school_year__id"
    class Meta:
        model = Enrollment
        fields = ["semester"]

class CourseModuleFilter(django_filters.FilterSet):
    formation = django_filters.NumberFilter(field_name="course_unit__formation__id")
    semester = django_filters.NumberFilter(field_name="course_unit__semester__id")

    class Meta:
        model = CourseModule
        fields = ["is_active","course_unit","formation","semester"]

class SchoolYearFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    limit = django_filters.NumberFilter(method="filter_limit")
    class Meta:
        model = SchoolYear
        fields = ["is_locked"]
    def filter_status(self, queryset, name, value):
        if value == "active":
            return queryset.filter(status=SchoolYear.Status.ACTIVE)
        elif value == "closed":
            return queryset.filter(status=SchoolYear.Status.CLOSED)
        elif value == "upcoming":
            return queryset.filter(status=SchoolYear.Status.UPCOMING)
        elif value == "open":
            return queryset.filter(status__in=[SchoolYear.Status.ACTIVE,SchoolYear.Status.UPCOMING])
        return queryset
    def filter_limit(self,queryset,name,value):
        return queryset[:value]
    
class SemesterFilter(django_filters.FilterSet):
    formation = django_filters.NumberFilter(
        field_name="level__formation_levels__formation__id"
    )
    limit = django_filters.NumberFilter(method="filter_limit")
    class Meta:
        model = Semester
        fields = ["level"]
    def filter_limit(self,queryset,name,value):
        return queryset[:value]

class SSYFilter(django_filters.FilterSet):
    completed = django_filters.BooleanFilter(method="filter_completed")
    class Meta:
        model = StudentSchoolYear
        fields = ["formation","level","school_year","completed"]
    def filter_completed(self,queryset,name,value):
        query = Q(status__in=["ACTIVE"])
        return queryset.filter(query) if (not value) else queryset.filter(~query)
