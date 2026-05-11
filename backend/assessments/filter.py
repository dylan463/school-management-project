import django_filters
from structures.models import SchoolYear

class AssessmentFilter(django_filters.FilterSet):
    school_year = django_filters.NumberFilter(field_name="school_year__id")
    
    class Meta:
        model = SchoolYear
        fields = ["school_year"]
