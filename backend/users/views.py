# Django REST Framework
from rest_framework.viewsets import ModelViewSet,GenericViewSet,mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework import status
from rest_framework.exceptions import ValidationError
# Local apps
from .models import User,Role,Mention
from .serializers import (
    UserSerializer,
    ProfileUpdateSerializer,
    SysAdminUserCreate,
    MentionSerailizer,
)
from .permissions import IsSystemAdmin
from .services import create_user
# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

class MentionViewSet(ModelViewSet):
    serializer_class = MentionSerailizer
    queryset = Mention.objects.all().order_by('-id')
    permission_classes = [IsSystemAdmin]
    filter_backends = [SearchFilter]
    search_fields = ["text","code"]
 


