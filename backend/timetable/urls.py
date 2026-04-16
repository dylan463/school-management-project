from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (AdminScheduleViewSet,StudentScheduleViewSet,TeacherScheduleViewSet
)

router = DefaultRouter()
router.register(r"admin/schedules", AdminScheduleViewSet, basename="admin-schedules")
router.register(r"student/schedules", StudentScheduleViewSet, basename="student-schedules")
router.register(r"teacher/schedules", TeacherScheduleViewSet, basename="teacher-schedules")

urlpatterns = router.urls