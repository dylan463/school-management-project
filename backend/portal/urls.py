from .views import HeadsViewSet,SecretaryViewSet,TeacherViewSet,StudentViewSet,OfficerViewSet,EnrollmentUploadViewSet,ImportJobViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path


router = DefaultRouter()
router.register('heads',HeadsViewSet,basename='heads')
router.register('secretaries',SecretaryViewSet,basename='secretary')
router.register('officers',OfficerViewSet,basename='officer')
router.register('teachers',TeacherViewSet,basename='teacher')
router.register('students',StudentViewSet,basename='student')
router.register('tasks',ImportJobViewSet,basename='task')
router.register("enrollments",EnrollmentUploadViewSet,basename='enrollment-upload')

urlpatterns = router.urls