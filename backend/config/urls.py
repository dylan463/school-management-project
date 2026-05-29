from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/structures/',include('structures.urls')),
    path('api/auth/', include('authentification.urls')),
    path('api/portal/',include('portal.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/notifications/', include('notifications.urls')),
    path("api/assessments/",include("assessments.urls"))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)