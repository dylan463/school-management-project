from .views import HeadsViewSet,SecretaryViewSet,TeacherViewSet,StudentViewSet,OfficerViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('heads',HeadsViewSet,basename='heads')
router.register('secretary',SecretaryViewSet,basename='secretary')
router.register('officer',OfficerViewSet,basename='officer')
router.register('teacher',TeacherViewSet,basename='teacher')
router.register('student',StudentViewSet,basename='student')


urlpatterns = router.urls