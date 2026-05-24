from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LevelViewSet,FormationViewSet,SemesterViewSet,SchoolYearViewSet,StudentSchoolYearViewSet,EnrollmentViewSet,
    CourseModuleViewSet,CourseUnitViewSet,TeacherPortalViewSet,StudentPortalViewSet
    )

router = DefaultRouter()
router.register(r"levels", LevelViewSet)
router.register(r"formations", FormationViewSet)
router.register(r"semesters", SemesterViewSet)
router.register(r"school_years", SchoolYearViewSet)
router.register(r"student_school_years", StudentSchoolYearViewSet,basename="ssy")
router.register(r"enrollments", EnrollmentViewSet)
router.register(r"course_units", CourseUnitViewSet,basename="courseunit")
router.register(r"course_modules", CourseModuleViewSet,basename="coursemodule")
router.register(r"teachers", TeacherPortalViewSet, basename="teacherportal")
router.register(r"students", StudentPortalViewSet, basename="studentportal")


urlpatterns = router.urls