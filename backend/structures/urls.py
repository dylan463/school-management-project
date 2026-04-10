from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r"levels",LevelViewSet)
router.register(r"formations",FormationViewSet)
router.register(r"semesters",SemesterViewSet)
router.register(r"teaching_units",TeachingUnitViewSet)
router.register(r"cours_components",CourseComponentViewSet)
router.register(r"enrollements",EnrollementViewSet)

urlpatterns = router.urls