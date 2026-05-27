from structures.models import (
    CourseUnit,User,Role
)
from .models import (
    Assessment,Grade,EnrollmentResult,Enrollment
)
from django.db.models import Q

MANAGEMENT = [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]


def get_student_assessment_queryset(student):
    return Assessment.objects.filter(Q(course_module__course_unit__semester__enrollments__student_school_year__student=student) | Q(course_module__debts__enrollment__student_school_year__student=student)).distinct()

def get_student_grade_queryset(student):
    return Grade.objects.filter(enrollment__student_school_year__student=student)

def get_student_result_queryset(student):
    return EnrollmentResult.objects.filter(enrollment__student_school_year__student=student)

def get_teacher_assessment_queryset(teacher):
    return Assessment.objects.filter(course_modul__teacher=teacher)

def get_teacher_grade_queryset(teacher):
    return Grade.objects.filter(assessment__course_modul__teacher=teacher)

def get_teacher_result_queryset(teacher):
    return EnrollmentResult.objects.filter(course_modul__teacher=teacher)

def get_enrollment_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Enrollment.objects.filter(formation_mention=mention)
    elif user.role == Role.TEACHER:
        return Enrollment.objects.filter(formation__mention=mention, semester__course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Enrollment.objects.filter(formation__mention=mention, student=user).distinct()
    return Enrollment.objects.none()