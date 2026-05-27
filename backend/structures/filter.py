import django_filters
from structures.models import (
    Semester,SchoolYear,CourseModule,CourseUnit,Formation
)

class FormationFilter(django_filters.FilterSet):
    class Meta:
        model = Formation
        fields = ["is_active"]

class SemesterFilter(django_filters.FilterSet):
    class Meta:
        model = Semester
        fields = ["is_active"]

class SchoolYearFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    class Meta:
        model = SchoolYear
        fields = ["is_locked","status"]
    def filter_status(self, queryset, name, value):
        if value in SchoolYear.Status.values:
            return queryset.filter(status=value)
        elif value == "OPEN":
            return queryset.filter(status__in=[SchoolYear.Status.ACTIVE,SchoolYear.Status.UPCOMING])
        return queryset

class CourseUnitFilter(django_filters.FilterSet):
    class Meta:
        model = CourseUnit
        fields = ["formation",'is_active']


class CourseModuleFilter(django_filters.FilterSet):
    class Meta:
        model = CourseModule
        fields = ["is_active","course_unit","semester"]


    
