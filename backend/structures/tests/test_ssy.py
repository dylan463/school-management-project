from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

class ServiceTestCase(TestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(username='admin',password='admin123456',email='admin@gmail.com')