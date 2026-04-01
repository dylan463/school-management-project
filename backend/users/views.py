from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser,AllowAny
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]