from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import StudentUser, TeacherUser, CustomUser
from structures.models import (SchoolYear, Semester, Level, Formation, StudentSchoolYear, CourseModule, CourseUnit)

class StudentFiltertestcase(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')

        self.student0 = CustomUser.objects.create_user(username='student0',email='student0@gmail.com',password='student0123',role = CustomUser.Role.STUDENT)
        self.student1 = CustomUser.objects.create_user(username='student1',email='student1@gmail.com',password='student1123',role = CustomUser.Role.STUDENT)
        self.student2 = CustomUser.objects.create_user(username='student2',email='student2@gmail.com',password='student2123',role = CustomUser.Role.STUDENT)
        self.student3 = CustomUser.objects.create_user(username='student3',email='student3@gmail.com',password='student3123',role = CustomUser.Role.STUDENT)
        self.student4 = CustomUser.objects.create_user(username='student4',email='student4@gmail.com',password='student4123',role = CustomUser.Role.STUDENT)
        


        self.level1 = Level.objects.create(code="L1",order=1)
        self.level2 = Level.objects.create(code="L2",order=2)

        self.formation1 = Formation.objects.create(label="acad",code="AC",description="academique")
        self.formation2 = Formation.objects.create(label="pro",code="PR",description="proffesionnel")

        self.sy1 = SchoolYear.objects.create(label="2020-2021",status=SchoolYear.Status.CLOSED)
        self.sy2 = SchoolYear.objects.create(label="2021-2022",status=SchoolYear.Status.ACTIVE)

        StudentSchoolYear.objects.create(
            formation=self.formation1,level=self.level1,status=StudentSchoolYear.Status.PROMOTED,school_year=self.sy1,student=self.student0
        )
        StudentSchoolYear.objects.create(
            formation=self.formation2,level=self.level1,status=StudentSchoolYear.Status.PROMOTED,school_year=self.sy1,student=self.student1
        )
        StudentSchoolYear.objects.create(
            formation=self.formation1,level=self.level2,status=StudentSchoolYear.Status.PROMOTED,school_year=self.sy1,student=self.student2
        )
        StudentSchoolYear.objects.create(
            formation=self.formation1,level=self.level1,status=StudentSchoolYear.Status.ACTIVE,school_year=self.sy2,student=self.student3
        )
        StudentSchoolYear.objects.create(
            formation=self.formation1,level=self.level2,status=StudentSchoolYear.Status.ACTIVE,school_year=self.sy2,student=self.student4
        )

    def test_get_students(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/students/")
        self.assertEqual(len(response.data),5)

    def test_filter_student_by_year(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/students/?in_schoolyear_id={self.sy1.id}")
        self.assertEqual(len(response.data),3)
        response = self.client.get(f"/api/structures/admin/students/?in_schoolyear_id={self.sy2.id}")
        self.assertEqual(len(response.data),2)
    
    def test_filter_student_by_level(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/students/?in_level_id={self.level1.id}")
        self.assertEqual(len(response.data),3)

        response = self.client.get(f"/api/structures/admin/students/?in_level_id={self.level2.id}")
        self.assertEqual(len(response.data),2)
    
    def test_filter_student_by_formation(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/students/?in_formation_id={self.formation1.id}")
        self.assertEqual(len(response.data),4)

        response = self.client.get(f"/api/structures/admin/students/?in_formation_id={self.formation2.id}")
        self.assertEqual(len(response.data),1)

    def test_filter_by_many_fields(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/students/?in_formation_id={self.formation1.id}&in_level_id={self.level1.id}&in_schoolyear_id={self.sy1.id}")
        self.assertEqual(len(response.data),1)

        response = self.client.get(f"/api/structures/admin/students/?in_formation_id={self.formation1.id}&in_level_id={self.level1.id}")
        self.assertEqual(len(response.data),2)
        self.assertIn("student0",[student["username"] for student in response.data])
        self.assertIn("student3",[student["username"] for student in response.data])


class TeacherFiltertestcase(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')

        self.teacher0 = CustomUser.objects.create_user(username='teacher0',email='teacher0@gmail.com',password='teacher0123',role = CustomUser.Role.TEACHER)
        self.teacher1 = CustomUser.objects.create_user(username='teacher1',email='teacher1@gmail.com',password='teacher1123',role = CustomUser.Role.TEACHER)
        self.teacher2 = CustomUser.objects.create_user(username='teacher2',email='teacher2@gmail.com',password='teacher2123',role = CustomUser.Role.TEACHER)
        self.teacher3 = CustomUser.objects.create_user(username='teacher3',email='teacher3@gmail.com',password='teacher3123',role = CustomUser.Role.TEACHER)
        self.teacher4 = CustomUser.objects.create_user(username='teacher4',email='teacher4@gmail.com',password='teacher4123',role = CustomUser.Role.TEACHER)
        self.teacher5 = CustomUser.objects.create_user(username='teacher5',email='teacher5@gmail.com',password='teacher5123',role = CustomUser.Role.TEACHER)


        self.level1 = Level.objects.create(code="L1",order=1)
        self.level2 = Level.objects.create(code="L2",order=2)

        self.formation1 = Formation.objects.create(label="acad",code="AC",description="academique")
        self.formation2 = Formation.objects.create(label="pro",code="PR",description="proffesionnel")

        self.semester1 = Semester.objects.create(code="S1", order=1, level=self.level1)
        self.semester2 = Semester.objects.create(code="S4", order=4, level=self.level2)

        ue = CourseUnit.objects.create(label="programation", code="dfsdf", formation=self.formation1, semester=self.semester1)
        self.cour1 = CourseModule.objects.create(label='python',code="py",teacher=self.teacher0,course_unit=ue)
        self.cour2 = CourseModule.objects.create(label='java',code="jv",teacher=self.teacher1,course_unit=ue)


        ue2 = CourseUnit.objects.create(label="fefef", code="fe", formation=self.formation1, semester=self.semester1)
        self.cour3 = CourseModule.objects.create(label='economie',code="jv",teacher=self.teacher2,course_unit=ue2)


        ue3 = CourseUnit.objects.create(label="finance", code="fin", formation=self.formation1, semester=self.semester2)
        self.cour4 = CourseModule.objects.create(label='trading',code="jv",teacher=self.teacher3,course_unit=ue3)

    def test_get_teachers(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/")
        self.assertEqual(len(response.data),6)

    def test_nomoduleteacher(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/nomodules/")
        self.assertEqual(len(response.data),2)

    
    def test_filter_teacher_by_level(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/?in_level_id={self.level1.id}")
        self.assertEqual(len(response.data),3)

        response = self.client.get(f"/api/structures/admin/teachers/?in_level_id={self.level2.id}")
        self.assertEqual(len(response.data),1)
    
    def test_filter_student_by_formation(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/?in_formation_id={self.formation1.id}")
        self.assertEqual(len(response.data),4)

        response = self.client.get(f"/api/structures/admin/teachers/?in_formation_id={self.formation2.id}")
        self.assertEqual(len(response.data),0)

    def test_filter_student_by_semester(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/?in_semester_id={self.semester1.id}")
        self.assertEqual(len(response.data),3)

        response = self.client.get(f"/api/structures/admin/teachers/?in_semester_id={self.semester2.id}")
        self.assertEqual(len(response.data),1)

    def test_filter_by_many_fields(self):
        self.client.force_authenticate(user = self.superuser)

        response = self.client.get(f"/api/structures/admin/teachers/?in_formation_id={self.formation1.id}&in_level_id={self.level1.id}")
        self.assertEqual(len(response.data),3)

        response = self.client.get(f"/api/structures/admin/teachers/?in_semester_id={self.semester1.id}&in_level_id={self.level1.id}")
        self.assertEqual(len(response.data),3)
        self.assertIn("teacher1",[teacher["username"] for teacher in response.data])
        self.assertIn("teacher2",[teacher["username"] for teacher in response.data])
        
        