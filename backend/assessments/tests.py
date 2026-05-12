from django.test import TestCase
from django.contrib.auth import get_user_model
from assessments.models import Assessment, Grade, EnrollmentResult,Debt
from assessments.query import (
    promoted_people, 
    people_with_course_debt, 
    has_no_grade_in_assessment, 
    attend_to_assessment,
    not_validated
)
from structures.models import CourseModule, SchoolYear,Level, Semester, CourseUnit, Enrollment,Formation,FormationLevel,StudentSchoolYear
from users.models import CustomUser


class QueryTests(TestCase):
    def setUp(self):
        # Créer des données de test
        self.student = CustomUser.objects.create_user(username='student',email='student@gmail.com',password='student123',role = CustomUser.Role.STUDENT)

        self.school_year = SchoolYear.objects.create(
            label='2023-2024',
        )

        self.formation = Formation.objects.create(
            code='acad',
            label='Académique',
        )

        self.level = Level.objects.create(
            code='L1',
            order=1
        )
        self.level.save()

        self.student_school_year = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level
        )
        self.student_school_year.save()

        self.formation_level = FormationLevel.objects.create(
            formation=self.formation,
            level=self.level
        )

        self.semester = Semester.objects.create(
            code='S1',
            order=1,
            level=self.level
        )
        self.semester.save()

        self.enrollment = Enrollment.objects.create(
            student_school_year=self.student_school_year,
            semester=self.semester
        )
        self.enrollment.save()

        self.course_unit = CourseUnit.objects.create(
            code='UE-MATH-L1S1',
            label='Mathématiques Fondamentales',
            formation=self.formation,
            semester=self.semester
        )
        self.course_unit.save()

        self.course_module = CourseModule.objects.create(
            code='MATH101',
            label='Mathématiques Fondamentales',
            credits=3,
            course_unit=self.course_unit
        )
        self.course_module.save()

        self.assessment = Assessment.objects.create(
            name='Examen - Mathématique',
            type='Examen',
            session='NORMAL',
            location='Salle A',
            course_module=self.course_module,
            school_year=self.school_year
        )
        self.assessment.save()

    def test_promoted_people(self):
        promoted = Enrollment.objects.filter(promoted_people(self.course_module, self.school_year))

        repeat_student = CustomUser.objects.create_user(username='repeat_student', email='repeat_student@gmail.com', password='repeat_student123', role=CustomUser.Role.STUDENT)
        repeat_student_school_year = StudentSchoolYear.objects.create(
            student=repeat_student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level
        )
        repeat_enrollment = Enrollment.objects.create(
            student_school_year=repeat_student_school_year,
            semester=self.semester
        )
        repeate_result = EnrollmentResult.objects.create(
            enrollment=repeat_enrollment,
            course_module=self.course_module,
            is_repeated=True,
            final_score=12,
            status="validated"
        )

        debt_student = CustomUser.objects.create_user(username='debt_student', email='debt_student@gmail.com', password='debt_student123', role=CustomUser.Role.STUDENT)
        last_year = SchoolYear.objects.create(
            label='2022-2023',
            status=SchoolYear.Status.CLOSED
        )
        last_year.save()
        last_debt_student_school_year = StudentSchoolYear.objects.create(
            student=debt_student,
            school_year=last_year,
            formation=self.formation,
            level=self.level
        )
        last_debt_student_school_year.save()
        debt_enrollment = Enrollment.objects.create(
            student_school_year=last_debt_student_school_year,
            semester=self.semester
        )
        debt_enrollment.save()

        up_level = Level.objects.create(
            code='L2',
            order=2
        )
        up_level.save()
        up_debt_student_school_year = StudentSchoolYear.objects.create(
            student=debt_student,
            school_year=self.school_year,
            formation=self.formation,
            level=up_level
        )
        up_semester = Semester.objects.create(
            code='S3',
            order=3,
            level=up_level
        )
        up_semester.save()
        up_debt_enrollment = Enrollment.objects.create(
            student_school_year=up_debt_student_school_year,
            semester=up_semester
        )
        up_debt_enrollment.save()

        debt = Debt.objects.create(
            enrollment=debt_enrollment,
            course_module=self.course_module,
            cleared=False
        )
        grade = Grade.objects.create(
            enrollment=debt_enrollment,
            assessment=self.assessment,
            score=8
        )
        grade1 = Grade.objects.create(
            enrollment=self.enrollment,
            assessment=self.assessment,
            score=16
        )
        result1 = EnrollmentResult.objects.create(
            enrollment=self.enrollment,
            course_module=self.course_module,
            is_repeated=False,
            final_score=16,
            status="VALIDATED"
        )
        result2 = EnrollmentResult.objects.create(
            enrollment=debt_enrollment,
            course_module=self.course_module,
            is_repeated=False,
            final_score=8,
            status="NOT_VALIDATED"
        )


        self.assessment.session = "RATTRAPAGE"
        self.assessment.save()
        has_no_grade = Enrollment.objects.filter(attend_to_assessment(self.assessment))
        for enrollment in has_no_grade:
            print("student with no grade in assessment : ", enrollment.student_school_year.student.username)