from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScheduleViewSet,
    ScheduleEntryViewSet,
    TeacherAvailabilityViewSet,
)

router = DefaultRouter()
router.register(r"schedules", ScheduleViewSet, basename="schedules")
router.register(r"schedule-entries", ScheduleEntryViewSet, basename="schedule-entries")
router.register(r"teacher-availabilities", TeacherAvailabilityViewSet, basename="teacher-availabilities")

urlpatterns = router.urls