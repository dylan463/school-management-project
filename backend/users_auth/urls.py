from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.urls import path
from .views import ChangePasswordView,PasswordResetConfirmView,PasswordResetRequestView,MeViewsSet

me = MeViewsSet.as_view({
    'get': 'list',
    'patch': 'partial_update',
    'put': 'partial_update'
})

urlpatterns =[
    path('me/',me),
    path('login/', TokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),
]