from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnnouncementViewset
)


router =  DefaultRouter()
router.register("",AnnouncementViewset,basename="annoncements")
urlpatterns  = []