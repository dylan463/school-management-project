from django.test import TestCase
from rest_framework.test import APITestCase
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
from structures.services import create_level,create_formation_and_its_levels,create_student_school_year
from assessments.services import update_results

# class QueryTests(TestCase):
#     def setUp(self):
#         # Créer des données de test
#         self.student = CustomUser.objects.create_user(username='student',email='student@gmail.com',password='student123',role = CustomUser.Role.STUDENT)

#         self.school_year = SchoolYear.objects.create(
#             label='2023-2024',
#         )

#         self.formation = Formation.objects.create(
#             code='acad',
#             label='Académique',
#         )

#         self.level = Level.objects.create(
#             code='L1',
#             order=1
#         )
#         self.level.save()

#         self.student_school_year = StudentSchoolYear.objects.create(
#             student=self.student,
#             school_year=self.school_year,
#             formation=self.formation,
#             level=self.level
#         )
#         self.student_school_year.save()

#         self.formation_level = FormationLevel.objects.create(
#             formation=self.formation,
#             level=self.level
#         )

#         self.semester = Semester.objects.create(
#             code='S1',
#             order=1,
#             level=self.level
#         )
#         self.semester.save()

#         self.enrollment = Enrollment.objects.create(
#             student_school_year=self.student_school_year,
#             semester=self.semester
#         )
#         self.enrollment.save()

#         self.course_unit = CourseUnit.objects.create(
#             code='UE-MATH-L1S1',
#             label='Mathématiques Fondamentales',
#             formation=self.formation,
#             semester=self.semester
#         )
#         self.course_unit.save()

#         self.course_module = CourseModule.objects.create(
#             code='MATH101',
#             label='Mathématiques Fondamentales',
#             credits=3,
#             course_unit=self.course_unit
#         )
#         self.course_module.save()

#         self.assessment = Assessment.objects.create(
#             name='Examen - Mathématique',
#             type='Examen',
#             session='NORMAL',
#             location='Salle A',
#             course_module=self.course_module,
#             school_year=self.school_year
#         )
#         self.assessment.save()

#     def test_promoted_people(self):
#         promoted = Enrollment.objects.filter(promoted_people(self.course_module, self.school_year))

#         repeat_student = CustomUser.objects.create_user(username='repeat_student', email='repeat_student@gmail.com', password='repeat_student123', role=CustomUser.Role.STUDENT)
#         repeat_student_school_year = StudentSchoolYear.objects.create(
#             student=repeat_student,
#             school_year=self.school_year,
#             formation=self.formation,
#             level=self.level
#         )
#         repeat_enrollment = Enrollment.objects.create(
#             student_school_year=repeat_student_school_year,
#             semester=self.semester
#         )
#         repeate_result = EnrollmentResult.objects.create(
#             enrollment=repeat_enrollment,
#             course_module=self.course_module,
#             is_repeated=True,
#             final_score=12,
#             status="validated"
#         )

#         debt_student = CustomUser.objects.create_user(username='debt_student', email='debt_student@gmail.com', password='debt_student123', role=CustomUser.Role.STUDENT)
#         last_year = SchoolYear.objects.create(
#             label='2022-2023',
#             status=SchoolYear.Status.CLOSED
#         )
#         last_year.save()
#         last_debt_student_school_year = StudentSchoolYear.objects.create(
#             student=debt_student,
#             school_year=last_year,
#             formation=self.formation,
#             level=self.level
#         )
#         last_debt_student_school_year.save()
#         debt_enrollment = Enrollment.objects.create(
#             student_school_year=last_debt_student_school_year,
#             semester=self.semester
#         )
#         debt_enrollment.save()

#         up_level = Level.objects.create(
#             code='L2',
#             order=2
#         )
#         up_level.save()
#         up_debt_student_school_year = StudentSchoolYear.objects.create(
#             student=debt_student,
#             school_year=self.school_year,
#             formation=self.formation,
#             level=up_level
#         )
#         up_semester = Semester.objects.create(
#             code='S3',
#             order=3,
#             level=up_level
#         )
#         up_semester.save()
#         up_debt_enrollment = Enrollment.objects.create(
#             student_school_year=up_debt_student_school_year,
#             semester=up_semester
#         )
#         up_debt_enrollment.save()

#         debt = Debt.objects.create(
#             enrollment=debt_enrollment,
#             course_module=self.course_module,
#             cleared=False
#         )
#         grade = Grade.objects.create(
#             enrollment=debt_enrollment,
#             assessment=self.assessment,
#             score=8
#         )
#         grade1 = Grade.objects.create(
#             enrollment=self.enrollment,
#             assessment=self.assessment,
#             score=16
#         )
#         result1 = EnrollmentResult.objects.create(
#             enrollment=self.enrollment,
#             course_module=self.course_module,
#             is_repeated=False,
#             final_score=16,
#             status="VALIDATED"
#         )
#         result2 = EnrollmentResult.objects.create(
#             enrollment=debt_enrollment,
#             course_module=self.course_module,
#             is_repeated=False,
#             final_score=8,
#             status="NOT_VALIDATED"
#         )


#         self.assessment.session = "RATTRAPAGE"
#         self.assessment.save()
#         has_no_grade = Enrollment.objects.filter(attend_to_assessment(self.assessment))
#         for enrollment in has_no_grade:
#             print("student with no grade in assessment : ", enrollment.student_school_year.student.username)

def create_course_unit(code,label,formation,semester):
    return CourseUnit.objects.create(code=code,label=label,formation=formation,semester=semester)

def create_course_module(code,label,unit,credits,min_val_score):
    return CourseModule.objects.create(code=code,label=label,course_unit=unit,credits=credits,min_val_score=min_val_score)

def create_assessment(name,type,course_module,school_year,session = "NORMAL",location ="en salle",grade_weight = 1):
    return Assessment.objects.create(name=name,type=type,course_module=course_module,school_year=school_year,session=session,location=location,grade_weight=grade_weight)

def create_grade(enrollment,assessment,score):
    return Grade.objects.create(enrollment=enrollment,assessment=assessment,score=score)



class BasicSetup(TestCase):
    def setUp(self):
        SchoolYear.objects.create(label = "2024-2025",status="CLOSED")
        self.sy_2025_2026 = SchoolYear.objects.create(label = "2025-2026",status="ACTIVE")
        SchoolYear.objects.create(label = "2026-2027",status="UPCOMING")
        self.l1 = create_level("L1",1)
        create_level("L2",2)
        create_level("L3",3)
        create_level("M1",4)
        create_level("M2",5)
        self.pro = create_formation_and_its_levels({"label":"PRO","code":"PRO","from_level":1,"to_level":5})
        self.acad = create_formation_and_its_levels({"label":"ACAD","code":"ACAD","from_level":1,"to_level":5})
        self.s1 = Semester.objects.get(order = 1)
        math = create_course_unit("Math","mathematique",self.acad,self.s1)
        phy = create_course_unit("Phy","physique",self.acad,self.s1)
        create_course_module('app',"appliqué",math,3,12)
        create_course_module('the',"theorique",math,3,12)
        create_course_module('cin',"cinematique",phy,3,12)
        create_course_module('nuc',"nucleaire",phy,3,12)
    



class GradeSystemTest(BasicSetup):
    def setUp(self):
        return super().setUp()
    
    def test_student_story(self):
        student1 = CustomUser.objects.create_user(username='student',email='student@gmail.com',password='student123',role = CustomUser.Role.STUDENT)
        student2 = CustomUser.objects.create_user(username='student2',email='student2@gmail.com',password='student123',role = CustomUser.Role.STUDENT)

        ss1 = create_student_school_year(student1,self.sy_2025_2026,self.acad,self.l1)

        app = CourseModule.objects.get(code="app")

        dsApp = create_assessment('ds math appliqué',"quiz",app,self.sy_2025_2026)
        tpApp = create_assessment('tp math appliqué',"quiz",app,self.sy_2025_2026)
        dsApp.is_published = True
        dsApp.save()

        enrollment1 = Enrollment.objects.filter(student_school_year = ss1,semester = self.s1).first()

        create_grade(enrollment1,dsApp,13)
        update_results(app)

        print("-"*25)
        results = list(EnrollmentResult.objects.filter(course_module = app).select_related("enrollment__student_school_year__student"))
        print(f'les resultat avant dépubliation de l\'examen: nombre ({len(results)})')
        print('-'*25)
        for res in results:
            student = res.enrollment.student_school_year.student
            print("student :" ,student.get_full_name())
            print('final_score :',res.final_score)
            print('status :',res.status)
            print('-'*25)

        dsApp.is_published = False
        dsApp.save()
        update_results(app)

        print("-"*25)
        results = list(EnrollmentResult.objects.filter(course_module = app).select_related("enrollment__student_school_year__student"))
        print(f'les resultat apres dépubliation de l\'examen: nombre ({len(results)})')
        print('-'*25)
        for res in results:
            student = res.enrollment.student_school_year.student
            print("student :" ,student.get_full_name())
            print('final_score :',res.final_score)
            print('status :',res.status)
            print('-'*25)
