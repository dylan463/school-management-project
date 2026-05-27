from rest_framework.routers import DefaultRouter
from .views import (
    FormationViewSet,SemesterViewSet,SchoolYearViewSet,EnrollmentViewSet,
    CourseModuleViewSet,CourseUnitViewSet,MentionViewSet
    )

router = DefaultRouter()
router.register(r"formations", FormationViewSet,basename='formations')
router.register(r"semesters", SemesterViewSet,basename='semesters')
router.register(r"school_years", SchoolYearViewSet,basename='school_years')
router.register(r"enrollments", EnrollmentViewSet,basename='enrollments')
router.register(r"course_units", CourseUnitViewSet,basename="courseunit")
router.register(r"course_modules", CourseModuleViewSet,basename="coursemodule")
router.register(r'mentions',MentionViewSet,basename='mentions')

urlpatterns = router.urls