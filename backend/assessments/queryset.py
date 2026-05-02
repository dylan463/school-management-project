from structures.models import (
    Enrollment,CourseUnit
)
from .models import (
    Assessment,Grade,EnrollmentResult
)

def get_student_assessment_queryset(student):
    return Assessment.objects.filter(course_module__course_unit__semester__enrollments__student_school_year__student=student).distinct()

def get_student_grade_queryset(student):
    return Grade.objects.filter(assessment__course_module__course_unit__semester__enrollments__student_school_year__student=student)

def get_student_result_queryset(student):
    return EnrollmentResult.objects.filter(enrollment__student_school_year__student=student)

def get_teacher_assessment_queryset(teacher):
    return Assessment.objects.filter(course_modul__teacher=teacher)

def get_teacher_grade_queryset(teacher):
    return Grade.objects.filter(assessment__course_modul__teacher=teacher)

def get_teacher_result_queryset(teacher):
    return EnrollmentResult.objects.filter(course_modul__teacher=teacher)
