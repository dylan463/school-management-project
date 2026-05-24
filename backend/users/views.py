# Django REST Framework
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response


# Local apps
from .models import User,Role,Mention
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    MentionSerailizer,
)
from .permissions import IsSystemAdmin
# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

class MentionViewSet(ModelViewSet):
    serializer_class = MentionSerailizer
    queryset = Mention.objects.all()
    permission_classes = IsSystemAdmin


class UserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        else:
            return [IsSystemAdmin()]

    def get_queryset(self):
        return User.objects.filter(role=Role.DEPARTMENT_HEAD)
    

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        user : User  = request.user

        if request.method == "GET":
            serializer = UserSerializer(user)
            return Response(serializer.data)

        serializer =  UserCreateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
