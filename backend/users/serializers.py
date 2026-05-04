# serializers.py
from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import generate_matricule,generate_password

#  serializer pour afficher les infos d'un utilisateur
class UserSerializer(serializers.ModelSerializer):
    """Pour afficher les infos d'un utilisateur"""
    matricule = serializers.CharField(source='username', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'matricule', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser',
            'phone', 'grade', 'subjects', 'date_of_birth', 'place_of_birth', 'cin', 'current_semester', 'status'
        ]
        read_only_fields = ['id', 'role', 'is_staff', 'is_superuser', 'username', 'matricule']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if not request:
            data.pop("is_superuser", None)
            data.pop("is_staff", None)
            return data

        user = request.user
        # seulement staff ou superuser peuvent voir
        if not (user.is_staff or user.is_superuser):
            print("not staff or superuser")
            data.pop("is_superuser", None)
            data.pop("is_staff", None)

        return data

# serializer pour créer un étudiant
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

        user._plain_password = password

        return user

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value

# serializer pour créer un enseignant
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

        user._plain_password = password

        return user

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value

# serializer pour le JWT
class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        token["is_superuser"] =  user.is_superuser
        return token

# serializer pour changer le mot de passe
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    # avant de sauvegarder, vérifier que les deux nouveaux mots de passe sont identiques
    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas"
            })
        return attrs