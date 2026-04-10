# urls.py
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenSerializer
from django.urls import path
from .views import StudentViewSet,TeacherViewSet,ChangePasswordView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"students",StudentViewSet)
router.register(r"teachers",TeacherViewSet)

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = router.urls + [
    path('login/', CustomTokenView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]