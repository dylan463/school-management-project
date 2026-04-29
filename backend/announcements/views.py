from rest_framework import viewsets
from users.permissions import (
    IsStudent,
    IsSuperUser,
    IsTeacher,
    IsSuperUserOrTeacher
)
from users.models import CustomUser
from rest_framework.permissions import (
    IsAuthenticated,
)
from .models import Announcement,Audience,Read
from structures.models import StudentSchoolYear,SchoolYear
from django.db.models import Q
from .serializers import (
    AnnouncementCreateSerializer,
    AnnouncementListSerializer,
    AudienceListSerializer,
    AnnoncementRetrieveSerializer
)
from rest_framework.response import Response
from rest_framework import status
from .services import (
    create_announcement_with_audiences,
    update_annoncements_and_its_audiences,
    read_unread_annoncement,
    get_unread_annoncement
)
from rest_framework.decorators import action

class AnnouncementViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user: CustomUser = self.request.user

        base_queryset = (
            Announcement.objects
            .select_related("author")
            .prefetch_related("audiences")
        )

        if user.role == CustomUser.Role.STUDENT:
            ssys = StudentSchoolYear.objects.filter(
                student=user
            ).select_related(
                "level",
                "formation",
                "school_year"
            )

            query = Q()

            for ssy in ssys:
                query |= Q(
                    audiences__formation=ssy.formation,
                    audiences__level=ssy.level,
                    audiences__school_year=ssy.school_year
                )

            return base_queryset.filter(query).distinct()

        elif user.role == CustomUser.Role.TEACHER:
            return base_queryset.filter(author=user)

        return base_queryset.all()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy","retieve"]:
            permissions = [IsSuperUserOrTeacher]
        elif self.action == "unreadcount":
            permissions = [IsStudent]
        else:
            permissions = [IsAuthenticated]

        return [permission() for permission in permissions]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return AnnouncementCreateSerializer
        return AnnouncementListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data.copy()

        announcement = create_announcement_with_audiences(
            data=data,
            author=request.user
        )

        return Response(
            AnnouncementListSerializer(announcement).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        announcement = self.get_object()

        serializer = self.get_serializer(
            announcement,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data.copy()

        announcement = update_annoncements_and_its_audiences(
            announcement,
            request.user,
            data
        )

        return Response(
            AnnouncementListSerializer(announcement).data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        announcement = self.get_object()

        if (
            request.user.role == CustomUser.Role.TEACHER
            and announcement.author_id != request.user.id
        ):
            return Response(
                {"detail": "forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        announcement.delete()

        return Response(
            {"detail": "deleted"},
            status=status.HTTP_200_OK
        )
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if user.role == CustomUser.Role.STUDENT:
            user = request.user
            read_unread_annoncement(queryset,user)

        serializer = AnnouncementListSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        ) 

    def retrieve(self,request,*args,**kwargs):
        annoncement = self.get_object()

        serializer = AnnoncementRetrieveSerializer(annoncement)

        return Response(
            AnnoncementRetrieveSerializer.data,
            status=status.HTTP_200_OK
        )

    @action(methods=["get"],detail=False)
    def unreadcount(self,request):
        all_announcement = self.get_queryset()
        user = request.user
        count = get_unread_annoncement(all_announcement,user).count()
        return Response({"count":count},status=status.HTTP_200_OK)
        
        




