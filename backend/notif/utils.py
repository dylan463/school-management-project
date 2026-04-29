from .models import Notification


def create_notification(user, title, content):
    Notification.objects.create(
        user=user,
        title=title,
        content=content
    )