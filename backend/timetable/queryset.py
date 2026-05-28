from structures.models import (
    User,Mention,Role,CourseModule,CourseUnit,Formation,Semester,SchoolYear
)
from assessments.models import Enrollment
from .models import Schedule, ScheduleEntry, TeacherAvailability
from django.db.models import Q

def get_schedule_queryset(user : User):
    mention = user.mention
    if user.role in [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]:
        return Schedule.objects.filter(formation__mention=mention)
    elif user.role == Role.TEACHER:
        return Schedule.objects.filter(formation__mention=mention, schedule_entries__course_module__teacher=user).distinct()
    elif user.role == Role.STUDENT:
        return Schedule.objects.filter(formation__mention=mention, schedule_entries__course_module__semester__enrollments__student=user).distinct()
    return Schedule.objects.none()

def get_schedule_entry_queryset(user : User):
    mention = user.mention
    if user.role in [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]:
        return ScheduleEntry.objects.filter(schedule__formation__mention=mention)
    elif user.role == Role.TEACHER:
        course_modules = CourseModule.objects.filter(teacher=user).select_related('semester','course_unit__formation')
        query = Q()
        for module in course_modules:
            query |= Q(course_module__semester=module.semester, course_module__course_unit__formation=module.course_unit.formation)
        return ScheduleEntry.objects.filter(schedule__formation__mention=mention).filter(query).distinct()
    elif user.role == Role.STUDENT:
        enrollments = Enrollment.objects.filter(student=user).select_related('semester','formation')
        query = Q()
        for enrollment in enrollments:
            query |= Q(course_module__semester=enrollment.semester, course_module__course_unit__formation=enrollment.formation)
        return ScheduleEntry.objects.filter(schedule__formation__mention=mention).filter(query).distinct()
    return ScheduleEntry.objects.none()

def get_teacher_availability_queryset(user : User):
    mention = user.mention
    if user.role in [Role.DEPARTMENT_HEAD, Role.DEPARTMENT_SECRETARY, Role.REGISTRAR_OFFICER]:
        return TeacherAvailability.objects.filter(teacher__mention=mention)
    if user.role == Role.TEACHER:
        return TeacherAvailability.objects.filter(teacher=user)
    return TeacherAvailability.objects.none()