from django.db.models import Q
from .models import Enrollment
from structures.models import CourseModule, SchoolYear

# enrollments
def promoted_people(course_module : CourseModule, school_year : SchoolYear):
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
        enrollment_results__debts__cleared=False
    )

def has_no_grade_in_assessment(assessment):
    return ~Q(grades__assessment=assessment)

def not_validated():
    return ~Q(enrollment_results__status="VALIDATED")

def attend_to_assessment(assessment):
    base_query = promoted_people(assessment.course_module, assessment.school_year) | people_with_course_debt(assessment.course_module)
    if assessment.session == "NORMAL":
        return base_query
    return base_query & not_validated()



