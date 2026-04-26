import django_filters
from users.models import StudentUser,TeacherUser

class StudentFilter(django_filters.FilterSet):
    in_level_id = django_filters.NumberFilter(field_name="school_years__level__id")
    in_formation_id = django_filters.NumberFilter(field_name="school_years__formation__id")
    in_schoolyear_id = django_filters.NumberFilter(field_name="school_years__school_year__id")

    class Meta:
        model = StudentUser
        fields = []


class TeacherFilter(django_filters.FilterSet):
    in_semester_id = django_filters.NumberFilter(field_name="course_modules__course_unit__semester__id")
    in_formation_id = django_filters.NumberFilter(field_name="course_modules__course_unit__formation__id")
    in_level_id = django_filters.NumberFilter(field_name="course_modules__course_unit__semester__level__id")

    class Meta:
        model = TeacherUser
        fields = []