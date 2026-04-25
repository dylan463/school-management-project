from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import *


class APIuserstestcase(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')
        self.student = CustomUser.objects.create(
            username="anthony",
            password="anthnoy2004",
            role=CustomUser.Role.STUDENT,
            email="anthony@gmail.com"

        )
        self.teacher = CustomUser.objects.create(
            username="teacher",
            password="teacher2004",
            role=CustomUser.Role.TEACHER,
            email="teacher@gmail.com"

        )
    
    def test_get_users(self):
        self.client.force_authenticate(user = self.student)
        response = self.client.get("/api/auth/users/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user = self.teacher)
        response = self.client.get("/api/auth/users/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user = self.superuser)
        response = self.client.get("/api/auth/users/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(len(response.data),3)

        response = self.client.get(f"/api/auth/users/?search={"anthony"}")

        self.assertEqual(response.data[0]["username"],self.student.username)

        response = self.client.get(f"/api/auth/users/?role={CustomUser.Role.TEACHER}")

        self.assertEqual(response.data[0]["role"],self.teacher.role)

        teacher2 = CustomUser.objects.create(
            username="teacher2",
            password="teacher22004",
            role=CustomUser.Role.TEACHER,
            email="teacher2@gmail.com"
        )

        response = self.client.get(f"/api/auth/users/?role={CustomUser.Role.TEACHER}")

        self.assertEqual(len(response.data),2)
        self.assertIn(teacher2.username,[teacher["username"] for teacher in response.data])
        self.assertNotIn(self.student,[user["username"] for user in response.data])








        