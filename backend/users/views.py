# Django
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .token import token_generator

# Django REST Framework
from rest_framework import status, mixins
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

# Local apps
from .models import CustomUser, TeacherUser, StudentUser
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
    ChangeForgetSerializer,
)
from .permissions import (
    IsTeacher,
    IsStudent,
    IsSuperUser,
    CannotDeleteAdmin
)
from .utils import send_email
from .token import token_generator
from notif.utils import create_notification

# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

class UserViewSet(GenericViewSet):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─────────────────────────────────────────
# PASSWORD MANAGEMENT
# ─────────────────────────────────────────

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            # Vérifier ancien mot de passe
            if not user.check_password(old_password):
                return Response(
                    {"old_password": "Mot de passe incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validation sécurité Django
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()

            # Garder session active
            update_session_auth_hash(request, user)
            create_notification(request.user, "Changement de Mot de passe", "Votre mot de passe a été modifié avec succès.")
            return Response({"status": "password updated"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.permissions import AllowAny
from django.core.mail import EmailMultiAlternatives


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")

        user = CustomUser.objects.filter(email=email).first()

        if not user:
            return Response({"message": "If email exists, link sent"})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        subject = "Reset Password"

        text_content = f"Reset your password:\n{reset_link}"

        html_content = f"""
        <h2>Reset Password</h2>

        <p>Click below:</p>

        <a href="{reset_link}"
        style="
        background:#2563eb;
        color:white;
        padding:10px 16px;
        text-decoration:none;
        border-radius:6px;">
        Reset Password
        </a>
        """

        msg = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )

        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return Response({"message": "Email sent"})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")

        # Extraire les données de mot de passe pour le serializer
        password_data = {
            "new_password": request.data.get("new_password"),
            "new_password2": request.data.get("new_password2")
        }

        # Utiliser le serializer pour valider les mots de passe
        serializer = ChangeForgetSerializer(data=password_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (ValueError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        # Changer le mot de passe
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"message": "Password updated successfully"})