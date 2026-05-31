from structures.serializers import UserCreateSerializer
from rest_framework import serializers
from structures.models import User,Formation,Semester,SchoolYear


class StudentCreateSerializer(serializers.ModelSerializer):
    formation = serializers.PrimaryKeyRelatedField(
        queryset=Formation.objects.all()
    )
    semester = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all()
    )
    school_year = serializers.PrimaryKeyRelatedField(
        queryset=SchoolYear.objects.all()
    )
    class Meta:
        model = User
        fields = ["first_name",'last_name','email','formation','semester','school_year']
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value
    

class StudentUploadValidationSerializer(serializers.Serializer):
    formation = serializers.PrimaryKeyRelatedField(queryset=Formation.objects.none())
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.none())
    school_year = serializers.PrimaryKeyRelatedField(queryset=SchoolYear.objects.none())
    file = serializers.FileField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user:
            mention = request.user.mention
            self.fields["formation"].queryset = Formation.objects.filter(mention=mention)
            self.fields["semester"].queryset = Semester.objects.filter(mention=mention)
            self.fields["school_year"].queryset = SchoolYear.objects.filter(mention=mention)

    def validate_file(self, value):
        if not value.name.endswith(".csv"):
            raise serializers.ValidationError(
                "Format non supporté : utilisez un fichier CSV."
            )
        return value
    
from .models import ImportJob

class ImportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportJob
        fields = '__all__'