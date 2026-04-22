# urls.py
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenSerializer
from django.urls import path
from .views import ChangePasswordView,UserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet,basename='users')

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = router.urls + [
    path('login/', CustomTokenView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]