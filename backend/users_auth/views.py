from .serializers import (
    ChangePasswordSerializer,
    ChangeForgetSerializer,
)
from rest_framework.response import Response
from rest_framework import status

from rest_framework.permissions import AllowAny
from django.core.mail import EmailMultiAlternatives

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework.permissions import IsAuthenticated
from .token import token_generator
from rest_framework import status
from rest_framework.views import APIView
from users.models import User

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user  : User = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            # Vérifier ancien mot de passe
            if not user.check_password(old_password):
                return Response(
                    {"detail": "Mot de passe incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validation sécurité Django
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()

            # Garder session active
            update_session_auth_hash(request, user)
            return Response({"status": "password updated"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")

        user : User = User.objects.filter(email=email).first()

        if not user:
            return Response({"detail":"aucun compte n'est liée a cette email"},status=400)

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

        return Response({"message": "email envoyé"})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")

        password_data = {
            "new_password1": request.data.get("new_password1"),
            "new_password2": request.data.get("new_password2")
        }

        # Utiliser le serializer pour valider les mots de passe
        serializer = ChangeForgetSerializer(data=password_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (ValueError, User.DoesNotExist):
            return Response({"detail": "lien invalide"}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"detail": "token invalide ou éxpiré"}, status=status.HTTP_400_BAD_REQUEST)

        # Changer le mot de passe
        user.set_password(serializer.validated_data["new_password1"])
        user.save()

        return Response({"message": "le mot de passe est réinitialisé avec succes"})