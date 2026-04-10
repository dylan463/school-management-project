# serializers.py
from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import generate_matricule,generate_password


class UserSerializer(serializers.ModelSerializer):
    """Pour afficher les infos d'un utilisateur"""
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
        read_only_fields = ['id', 'role']

class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email']

    def create(self, validated_data):
        matricule = generate_matricule(CustomUser.Role.STUDENT)
        password = generate_password()

        user = CustomUser.objects.create_user(
            username=matricule,  # STU-1, STU-2...
            password=password,
            role=CustomUser.Role.STUDENT,
            **validated_data
        )

        # 🔥 IMPORTANT : pour le signal email
        user._plain_password = password

        return user

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value

        
class TeacherCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email']

    def create(self, validated_data):
        matricule = generate_matricule(CustomUser.Role.TEACHER)
        password = generate_password()

        user = CustomUser.objects.create_user(
            username=matricule,
            password=password,
            role=CustomUser.Role.TEACHER,
            **validated_data
        )

        # 🔥 standardisé pour le signal
        user._plain_password = password

        return user

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role      # inclus dans le JWT
        token['is_staff'] = user.is_staff
        token["is_superuser"] =  user.is_superuser
        return token

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas"
            })
        return attrs