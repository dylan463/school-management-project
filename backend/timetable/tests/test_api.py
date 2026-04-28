from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from structures.models import Semester,Level
from ..models import Schedule
from users.models import CustomUser


class AdminScheduleViewSetTestCase(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')
        self.student = CustomUser.objects.create_user(username='student',email='student@gmail.com',password='student123',role = CustomUser.Role.STUDENT)
        self.teacher = CustomUser.objects.create_user(username='teacher',email='teacher@gmail.com',password='teacher123',role = CustomUser.Role.TEACHER)
        
        self.level = Level(code="L1",order=1)
        self.level.save()
        self.semester = Semester(code="S1",order=1,level=self.level)
        self.semester.save()

        self.sdl = Schedule.objects.create(semester=self.semester)
        self.sdl.save()


    
    def test_get_all_schudle(self):
        self.client.force_authenticate(user=self.superuser)

        response = self.client.get("/api/timetable/admin/schedules/")
        self.assertEqual(response.data[0]["semester"],self.semester.id)


