from .views import HeadsViewSet,SecretaryViewSet,TeacherViewSet,StudentViewSet,OfficerViewSet,TaskStatusView,EnrollmentUploadViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path


router = DefaultRouter()
router.register('heads',HeadsViewSet,basename='heads')
router.register('secretaries',SecretaryViewSet,basename='secretary')
router.register('officers',OfficerViewSet,basename='officer')
router.register('teachers',TeacherViewSet,basename='teacher')
router.register('students',StudentViewSet,basename='student')


urlpatterns = router.urls + [
    path("tasks/", TaskStatusView.as_view(), name="task-status"),
    path("enrollments/upload/", EnrollmentUploadViewSet.as_view(), name="enrollment-upload"),
]