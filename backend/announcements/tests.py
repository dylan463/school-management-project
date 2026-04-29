from django.test import TestCase
from rest_framework.test import APITestCase
from users.models import CustomUser
from structures.models import (
    Level,
    Formation,
    SchoolYear,
    StudentSchoolYear
)

class AnnouncementTestCase(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')
        self.student = CustomUser.objects.create_user(username='student',email='student@gmail.com',password='student123',role = CustomUser.Role.STUDENT)
        self.teacher = CustomUser.objects.create_user(username='teacher',email='teacher@gmail.com',password='teacher123',role = CustomUser.Role.TEACHER)

        L1 = Level.objects.create("L1",1)
        L2 = Level.objects.create("L2",2)

        acad = Formation.objects.create("acad","acad","acad")
        pro = Formation.objects.create("pro","pro","pro")

        

    def test_list_student(self):
        pass
