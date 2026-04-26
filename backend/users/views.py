# 🔹 Django
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password

# 🔹 Django REST Framework
from rest_framework import status, mixins
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

# 🔹 Local apps
from .models import CustomUser, TeacherUser, StudentUser
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
)
from .permissions import (
    IsTeacher,
    IsStudent,
    IsSuperUser,
    CannotDeleteAdmin
)
from .utils import send_email

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

# endpoint pour changer son mot de passe 
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]
            # vérifier ancien mot de passe
            if not user.check_password(old_password):
                return Response(
                    {"old_password": "Mot de passe incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # validation sécurité Django
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            # garder session active
            update_session_auth_hash(request, user)
            return Response({"status": "password updated"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

