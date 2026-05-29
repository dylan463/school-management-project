from .views import HeadsViewSet,SecretaryViewSet,TeacherViewSet,StudentViewSet,OfficerViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('heads',HeadsViewSet,basename='heads')
router.register('secretaries',SecretaryViewSet,basename='secretary')
router.register('officers',OfficerViewSet,basename='officer')
router.register('teachers',TeacherViewSet,basename='teacher')
router.register('students',StudentViewSet,basename='student')


urlpatterns = router.urls