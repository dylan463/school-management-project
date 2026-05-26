from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from users.models import User
from users.serializers import UserSerializer,UserCreateSerializer,MentionSerailizer
from structures.models import (
    Formation, Semester,
    SchoolYear,
)

class StudentCreateSerializer(UserCreateSerializer):
    school_year = serializers.IntegerField()
    semester = serializers.IntegerField()
    formation = serializers.IntegerField()

    class Meta:
        model = User
        fields = ["first_name","last_name","email","school_year","semester","formation"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_school_year(self,value):
        if not SchoolYear.objects.filter(id=value).exists():
            raise ValidationError("L'année scolaire spécifiée n'existe pas")
        return value

    def validate_semester(self,value):
        if not Semester.objects.filter(id=value).exists():
            raise ValidationError("Le semestre spécifié n'existe pas")
        return value
    
    def validate_formation(self,value):
        if not Formation.objects.filter(id=value).exists():
            raise ValidationError("La formation spécifiée n'existe pas")
        return value