from .models import (
    Formation,Semester,CourseUnit,CourseModule,SchoolYear,Enrollment,CourseModule,CourseUnit,
    User,Mention,Role
)

MANAGEMENT = [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]

def get_mention_queryset(user : User):
    if user.role == Role.SYSTEM_ADMIN:
        return Mention.objects.all()
    return Mention.objects.none()

def get_formation_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Formation.objects.filter(mention=mention)
    elif user.role == Role.TEACHER:
        return Formation.objects.filter(mention=mention, course_unit__course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Formation.objects.filter(mention=mention, enrollments__student=user).distinct()
    return Formation.objects.none()

def get_semester_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Semester.objects.filter(mention=mention)
    elif user.role == Role.TEACHER:
        return Semester.objects.filter(mention=mention, course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Semester.objects.filter(mention=mention, enrollments__student=user).distinct()
    return Semester.objects.none()

def get_school_year_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return SchoolYear.objects.filter(mention=mention)
    elif user.role == Role.TEACHER:
        return SchoolYear.objects.filter(mention=mention, enrollments__formation__course_units__course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return SchoolYear.objects.filter(mention=mention, enrollments__student=user).distinct()
    return SchoolYear.objects.none()

def get_course_unit_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return CourseUnit.objects.filter(formation__mention=mention)
    elif user.role == Role.TEACHER:
        return CourseUnit.objects.filter(formation__mention=mention, course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return CourseUnit.objects.filter(formation__mention=mention, course_modules__semester__enrollments__student=user).distinct()
    return CourseUnit.objects.none()

def get_course_module_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return CourseModule.objects.filter(semester__mention=mention)
    elif user.role == Role.TEACHER:
        return CourseModule.objects.filter(semester__mention=mention, teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return CourseModule.objects.filter(semester__mention=mention, semester__enrollments__student=user).distinct()
    return CourseModule.objects.none()

def get_enrollment_queryset(user : User):
    mention = user.mention
    if user.role in MANAGEMENT:
        return Enrollment.objects.filter(formation_mention=mention)
    elif user.role == Role.TEACHER:
        return Enrollment.objects.filter(formation__mention=mention, semester__course_modules__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Enrollment.objects.filter(formation__mention=mention, student=user).distinct()
    return Enrollment.objects.none()