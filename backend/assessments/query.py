from django.db.models import Q
from .models import EnrollmentResult
from structures.models import CourseModule, SchoolYear

def promoted_people(course_module, school_year):
    return Q(
        semester=course_module.semester,
        formation=course_module.course_unit.formation,
        school_year=school_year,
    ) & ~Q(
        enrollment_results__course_module=course_module,
        enrollment_results__is_repeated=True,
    )

def people_with_course_debt(course_module):
    return Q(
        enrollment_results__course_module=course_module,
        enrollment_results__debts__cleared=False,
    )

def not_validated(course_module):
    return Q(enrollment_results__course_module=course_module,
             enrollment_results__status=EnrollmentResult.Status.NOT_VALIDATED) | Q(enrollment_results__isnull=False)

def attend_to_assessment(assessment):
    base_query = promoted_people(assessment.course_module, assessment.school_year) | people_with_course_debt(assessment.course_module)
    return base_query if assessment.session == "NORMAL" else base_query & not_validated(assessment.course_module)


