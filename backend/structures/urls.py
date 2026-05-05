from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
<<<<<<< HEAD
router.register(r"levels", LevelViewSet)
router.register(r"formations", FormationViewSet)
router.register(r"semesters", SemesterViewSet)
router.register(r"school_years", SchoolYearViewSet)
router.register(r"student_school_years", StudentSchoolYearViewSet)
router.register(r"enrollments", EnrollmentViewSet)
router.register(r"course_units", CourseUnitViewSet,basename="courseunit")
router.register(r"course_modules", CourseModuleViewSet,basename="coursemodule")
=======
router.register(r"levels",LevelViewSet)
router.register(r"formations",FormationViewSet)
router.register(r"semesters",SemesterViewSet)
router.register(r"teaching_units",TeachingUnitViewSet,basename="teachingunits")
router.register(r"cours_components",CourseComponentViewSet)
router.register(r"enrollements",EnrollementViewSet)
router.register(r"resources", ResourceViewSet)
>>>>>>> frontend
router.register(r"teacher", TeacherPortalViewSet, basename="teacherportal")
router.register(r"student", StudentPortalViewSet, basename="studentportal")


urlpatterns = router.urls