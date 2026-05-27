from rest_framework.viewsets import GenericViewSet
from rest_framework.viewsets import mixins
from .models import Notification
from .serializers import NotificationSerializer
from .permissions import IsOwnerNotification
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class NotificationView(GenericViewSet,mixins.ListModelMixin,mixins.DestroyModelMixin):
    serializer_class=NotificationSerializer
    permission_classes= [IsAuthenticated,IsOwnerNotification]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self,request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"count": count}, status=status.HTTP_200_OK)

