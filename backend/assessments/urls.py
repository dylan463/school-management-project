from rest_framework.routers import DefaultRouter

from .views import AssessmentViewSet, GradeViewSet

router = DefaultRouter()
router.register(r"", AssessmentViewSet, basename="assessments")
router.register(r"grades", GradeViewSet, basename="grades")

urlpatterns = router.urls