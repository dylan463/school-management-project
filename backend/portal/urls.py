from .views import HeadsViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('heads',HeadsViewSet,basename='heads')

urlpatterns = router.urls