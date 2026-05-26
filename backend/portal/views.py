from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework import status
from rest_framework.exceptions import ValidationError
# Local apps
from users.models import User,Role,Mention
from users.serializers import (
    UserSerializer,
    UserCreateSerializer
)
from users.permissions import IsSystemAdmin
from users.services import create_user

class HeadsViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(role=Role.DEPARTMENT_HEAD).order_by('id')
    filter_backends = [SearchFilter]
    search_fields = ["last_name","first_name",'email','username']
    permission_classes = [IsSystemAdmin]
    
    def get_serializer_class(self):
        if self.action in ['list','retrieve']:
            return UserSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(
            data={**request.data}
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.data.copy()
        data.pop('role')
        mentionId = data.pop('mention')
        role = Role.DEPARTMENT_HEAD
        mention = Mention.objects.get(pk=mentionId)

        try:
            user = create_user(data, role, mention)
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            msg = e.detail[0]
            return Response({"error":msg},status=status.HTTP_400_BAD_REQUEST)
    
    def perform_update(self, serializer):
        if 'role' in serializer.validated_data:
            raise ValidationError('vous ne pouvez pas changer le role de cet utilisateur')
        return super().perform_update(serializer)