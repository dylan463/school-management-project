from rest_framework.routers import DefaultRouter
from .views import (
    FormationViewSet,SemesterViewSet,SchoolYearViewSet,
    CourseModuleViewSet,CourseUnitViewSet,MentionViewSet,CourseModuleChoice
    )

router = DefaultRouter()
router.register(r"formations", FormationViewSet,basename='formations')
router.register(r"semesters", SemesterViewSet,basename='semesters')
router.register(r"schoolyears", SchoolYearViewSet,basename='schoolyears')
router.register(r"courseunits", CourseUnitViewSet,basename="courseunit")
router.register(r"coursemodules", CourseModuleViewSet,basename="coursemodule")
router.register(r"coursemodulechoice", CourseModuleChoice,basename="coursemodulechoice")
router.register(r'mentions',MentionViewSet,basename='mentions')

urlpatterns = router.urls