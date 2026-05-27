from rest_framework.routers import DefaultRouter

from .views import (
    # AssessmentViewSet, GradeViewSet,BulletinViewSet,ResultViewSet
    EnrollmentViewSet
    )

router = DefaultRouter()
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
# router.register(r"assessments", AssessmentViewSet, basename="assessments")
# router.register(r"grades", GradeViewSet, basename="grades")
# router.register(r"bulletins", BulletinViewSet, basename="bulletins")
# router.register(r"results",ResultViewSet,basename="results")

urlpatterns = router.urls