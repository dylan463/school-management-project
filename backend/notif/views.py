from rest_framework.viewsets import GenericViewSet
from rest_framework.viewsets import mixins
from .models import Notification
from .serializers import NotificationSerializer
from .permissions import IsOwnerNotification
from rest_framework.permissions import IsAuthenticated



class NotificationView(GenericViewSet,mixins.ListModelMixin,mixins.DestroyModelMixin):
    serializer_class=NotificationSerializer
    permission_classes= [IsAuthenticated,IsOwnerNotification]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

