from .models import (
    Announcement,Audience
)
from structures.models import (
    SchoolYear
)
from django.db import transaction
from users.models import CustomUser
from rest_framework.exceptions import ValidationError

def create_audinces_from_audiences_info(audince_infos,announcement):
    Audience.objects.bulk_create([
        Audience(
            announcement=announcement,
            school_year=school_year,
            **audience
        )
        for audience in audiences_infos
    ])

@transaction.atomic
def create_announcement_with_audiences(data,author):
    # data should be  {"title" : str,"content": str , "audiences" : [{"level": int,"formation":int},...]}
    school_year = SchoolYear.objects.filter(
        status=SchoolYear.Status.ACTIVE
    ).first()

    if school_year is None:
        raise ValidationError(
            "Veuillez attendre une année scolaire active avant de faire une annonce."
        )

    audiences_infos = data.pop("audiences")

    announcement = Announcement.objects.create(
        author=author,
        **data
    )

    create_audinces_from_audiences_info(audiences_infos,announcement)

    return announcement

@transaction.atomic
def update_annoncements_and_its_audiences(announcement : Announcement,user : CustomUser,data):
    # data should be  {"title" : str,"content": str , "audiences" : [{"level": int,"formation":int},...]}
    if user.role == CustomUser.Role.TEACHER:
        if not announcement.author.id == user.id:
            raise ValidationError("Vous n'avez pas la permission nécéssaire pour éffectuer cette action")
    
    audiences = Audience.objects.filter(announcement=announcement)
    audiences.delete()

    announcement.title = data["title"]
    announcement.content = data["content"]

    announcement.save()

    create_audinces_from_audiences_info(audince_infos=data["audiences"],announcement=announcement)

    return announcement

def get_unread_annoncement(all_annoncement,user):
    reads = Read.objects.filter(
        announcement__in=all_annoncement,
        user=user
    ).values_list("announcement_id", flat=True)

    unread_queryset = all_annoncement.exclude(id__in=reads)
    return unread_queryset

def read_unread_annoncement(all_annoncement,user):
    unread_queryset = get_unread_annoncement(all_annoncement,user)

    Read.objects.bulk_create([
        Read(announcement=announcement, user=user)
        for announcement in unread_queryset
    ])

