from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminScheduleViewSet,
    AdminScheduleEntryViewSet,
    StudentScheduleViewSet,
    TeacherScheduleViewSet,
)

router = DefaultRouter()
router.register(r"schedules", AdminScheduleViewSet, basename="admin-schedules")
router.register(r"schedule-entries", AdminScheduleEntryViewSet, basename="admin-schedule-entries")
router.register(r"student", StudentScheduleViewSet, basename="student-schedules")
router.register(r"teacher", TeacherScheduleViewSet, basename="teacher-schedules")

urlpatterns = router.urls