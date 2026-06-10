from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    EnrollmentViewSet,
    AssessmentViewSet,
    GradeViewSet,
    ResultViewSet,
    GradeGridView,
    DebtViewSet
    )

router = DefaultRouter()
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
router.register(r"assessments", AssessmentViewSet, basename="assessments")
router.register(r"grades", GradeViewSet, basename="grades")
router.register(r"results", ResultViewSet, basename="results")
router.register(r"debts", DebtViewSet, basename="debts")

urlpatterns = router.urls + [
    path("grade-grid/",GradeGridView.as_view())
]