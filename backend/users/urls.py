# urls.py
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenSerializer
from django.urls import path
from .views import StudentListCreateView,TeacherListCreateView

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = [
    path('login/', CustomTokenView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path('teachers/', TeacherListCreateView.as_view()),
    path('students/', StudentListCreateView.as_view()),
]