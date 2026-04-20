# timetable/urls.py
from rest_framework.routers import DefaultRouter
from .views import TeacherAvailabilityViewSet, TimeSlotViewSet

router = DefaultRouter()
router.register(r'availabilities', TeacherAvailabilityViewSet, basename='availability')
router.register(r'timeslots',      TimeSlotViewSet,             basename='timeslot')

urlpatterns = router.urls