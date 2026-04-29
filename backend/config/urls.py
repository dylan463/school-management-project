from django.contrib import admin
from django.urls import path,include


urlpatterns = [
    path('api/auth/', include('users.urls')),
    path('api/structures/',include('structures.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/announcements/',include('announcements.urls'))
]
