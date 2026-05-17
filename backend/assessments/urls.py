from rest_framework.routers import DefaultRouter

from .views import AssessmentViewSet, GradeViewSet,BulletinViewSet

router = DefaultRouter()
router.register(r"assessments", AssessmentViewSet, basename="assessments")
router.register(r"grades", GradeViewSet, basename="grades")
router.register(r"bulletins", BulletinViewSet, basename="bulletins")

urlpatterns = router.urls