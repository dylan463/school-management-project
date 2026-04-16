from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/auth/', include('users.urls')),
    path('api/structures/',include('structures.urls')),
    path('api/timetable/', include('timetable.urls')),
]
