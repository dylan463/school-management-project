from structures.models import (
    User,Role
)
from .models import (
    Assessment,Grade,EnrollmentResult,Enrollment,Debt
)

MANAGEMENT = [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]


def get_assessment_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Assessment.objects.filter(course_module__semester__mention=mention)
    if user.role == Role.TEACHER:
        return Assessment.objects.filter(
            course_module__semester__mention=mention,
            course_module__teacher=user
        )
    if user.role == Role.STUDENT:
        return Assessment.objects.filter(
            course_module__semester__mention=mention,
            course_module__semester__enrollments__student=user
        )
    return Assessment.objects.none()

def get_grade_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Grade.objects.filter(assessment__course_module__semester__mention=mention)
    if user.role == Role.TEACHER:
        return Grade.objects.filter(
            assessment__course_module__semester__mention=mention,
            assessment__course_module__teacher=user
        )
    if user.role == Role.STUDENT:
        return Grade.objects.filter(
            assessment__course_module__semester__mention=mention,
            enrollment__student=user
        )
    return Grade.objects.none()

def get_result_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return EnrollmentResult.objects.filter(course_module__semester__mention=mention)
    if user.role == Role.TEACHER:
        return EnrollmentResult.objects.filter(
            course_module__semester__mention=mention,
            course_module__teacher=user
        )
    if user.role == Role.STUDENT:
        return EnrollmentResult.objects.filter(
            course_module__semester__mention=mention,
            enrollment__student=user
        )
    return EnrollmentResult.objects.none()

def get_debt_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Debt.objects.filter(result__course_module__semester__mention=mention)
    if user.role == Role.TEACHER:
        return Debt.objects.filter(
            result__course_module__semester__mention=mention,
            result__course_module__teacher=user
        )
    if user.role == Role.STUDENT:
        return Debt.objects.filter(
            result__course_module__semester__mention=mention,
            result__enrollment__student=user
        )
    return Debt.objects.none()

def get_enrollment_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Enrollment.objects.filter(formation_mention=mention)
    elif user.role == Role.TEACHER:
        return Enrollment.objects.filter(formation__mention=mention, semester__course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Enrollment.objects.filter(formation__mention=mention, student=user).distinct()
    return Enrollment.objects.none()