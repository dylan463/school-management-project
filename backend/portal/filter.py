import django_filters
from .models import ImportJob

class ImportJobFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    class Meta:
        model = ImportJob
        fields = ["import_type","status"]
    def filter_status(self, queryset, name, value):
        if value in ImportJob.Status.values:
            return queryset.filter(status=value)
        elif value == "LOADING":
            return queryset.filter(status__in=[ImportJob.Status.PENDING, ImportJob.Status.PROGRESS])
        return queryset
