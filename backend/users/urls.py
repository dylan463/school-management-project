from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MentionViewSet

router = DefaultRouter()
router.register(r'mentions',MentionViewSet,basename='mentions')


urlpatterns = router.urls