from .models import (
    Level,Formation,Semester,CourseUnit,CourseModule,SchoolYear,StudentSchoolYear,Enrollment,CourseModule,CourseUnit
)
from users.models import (
    StudentUser,TeacherUser
)

def get_student_school_year_queryset(student):
    return SchoolYear.objects.filter(student_school_years__student=student)
def get_student_formation_queryset(student):
    return Formation.objects.filter(student_school_years__student=student)
def get_student_level_queryset(student):
    return Level.objects.filter(student_school_years__student=student)
def get_student_semester_queryset(student):
    return Semester.objects.filter(enrollments__student_school_year__student=student)
def get_student_student_school_year_queryset(student):
    return StudentSchoolYear.objects.filter(student=student)
def get_student_enrollment_queryset(student):
    return Enrollment.objects.filter(student_school_year__student=student)
def get_student_course_unit_queryset(student):
    return CourseUnit.objects.filter(semester__enrollments__student_school_year__student=student)
def get_student_course_module_queryset(student):
    return CourseModule.objects.filter(course_unit__semester__enrollments__student_school_year__student=student)
def get_student_teacher_queryset(student):
    return TeacherUser.objects.filter(course_modules__course_unit__semester__enrollments__student_school_year__student=student)
def get_student_student_queryset(student):
    school_year = get_student_school_year_queryset(student)
    return StudentUser.objects.filter(student_school_years__school_year=school_year)


def get_teacher_formation_queryset(teacher):
    return Formation.objects.filter(student_school_years__enrollments__semester__course_unit__course_modules__teacher=teacher)
def get_teacher_level_queryset(teacher):
    return Level.objects.filter(student_school_years__enrollments__semester__course_unit__course_modules__teacher=teacher)
def get_teacher_semester_queryset(teacher):
    return Semester.objects.filter(course_unit__course_modules__teacher=teacher)
def get_teacher_student_school_year(teacher):
    return StudentSchoolYear.objects.filter(enrollments__semester__course_unit__course_modules__teacher=teacher)
def get_teacher_enrollment_queryset(teacher):
    return Enrollment.objects.filter(semester__course_unit__course_modules__teacher=teacher)
def get_teacher_school_year_queryset(teacher):
    return SchoolYear.objects.filter(student_school_years__enrollments__semester__course_unit__course_modules__teacher=teacher)
def get_teacher_student_queryset(teacher):
    return StudentUser.objects.filter(school_years__enrollments__semester__course_unit__course_modules__teacher=teacher)
def get_teacher_teacher_queryset(teacher):
    return TeacherUser.objects.all()
def get_teacher_course_unit_queryset(teacher):
    return CourseUnit.objects.filter(course_modules__teacher=teacher)
def get_teacher_course_module_queryset(teacher):
    return CourseModule.objects.filter(teacher=teacher)