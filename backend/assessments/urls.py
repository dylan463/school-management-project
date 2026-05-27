from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    EnrollmentViewSet,
    AssessmentViewSet,
    GradeViewSet,
    ResultViewSet,
    BulletinView,
    GradeGridView
    )

router = DefaultRouter()
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
router.register(r"assessments", AssessmentViewSet, basename="assessments")
router.register(r"grades", GradeViewSet, basename="grades")
router.register(r"results", ResultViewSet, basename="results")

urlpatterns = router.urls + [
    path("enrollments/<int:pk>/bulletin/", BulletinView.as_view()),
    path("grade-grid/",GradeGridView.as_view())
]