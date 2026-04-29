from rest_framework import serializers
from .models import (
    Announcement,
    Audience,
    Read
)


class AnnouncementListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )

    class Meta:
        model = Announcement
        fields = ["id", "title", "content", "author_name"]
        read_only_fields = ["id"]


class AudienceCreatedWithAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = ["id", "level", "formation"]
        read_only_fields = ["id"]


class AudienceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = ["id", "level", "formation", "school_year"]


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    audiences = AudienceCreatedWithAnnouncementSerializer(many=True)

    class Meta:
        model = Announcement
        fields = ["title", "content", "audiences"]


class AnnoncementRetrieveSerializer(AnnouncementListSerializer):
    audiences = AudienceListSerializer(many = True)
    class Meta:
        model = Announcement
        fields = AnnouncementListSerializer.Meta.fields + ["audiences"]