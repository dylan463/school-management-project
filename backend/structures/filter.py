import django_filters
from users.models import StudentUser,TeacherUser
from structures.models import (
    Level,Formation,FormationLevel,SchoolYear,StudentSchoolYear,Enrollment,CourseModule,CourseUnit
)

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
    formation = "course_unit__formation__id"
    semester = "course_unit__semester__id"

    class Meta:
        model = CourseModule
        fields = ["is_active","course_unit","teacher"]