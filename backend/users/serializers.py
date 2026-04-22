# serializers.py
from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import generate_matricule,generate_password

#  serializer pour afficher les infos d'un utilisateur
class UserSerializer(serializers.ModelSerializer):
    """Pour afficher les infos d'un utilisateur"""
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name','role','is_superuser']
        read_only_fields = ['id','role', 'is_superuser']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if not request:
            data.pop("is_superuser", None)
            return data

        user = request.user
        # seulement superuser peuvent voir
        if not user.role == CustomUser.Role.SUPERUSER:
            data.pop("is_superuser", None)

        return data

class UserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=CustomUser.Role.choices) # on ne peut pas créer un superuser via cette endpoint, il faut le faire via la ligne de commande

    class Meta:
        model = CustomUser
        fields = ['email', 'role']

    def create(self, validated_data):
        role = validated_data.pop("role")

        matricule = generate_matricule(role)
        password = generate_password()

        user = CustomUser.objects.create_user(
            username=matricule,
            password=password,
            role=role,
            **validated_data
        )

        user._plain_password = password
        return user

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value
    
    def validate_role(self, value):
        if value == CustomUser.Role.SUPERUSER:
            raise serializers.ValidationError("veuillez utiliser la ligne de commande pour créer un superuser")
        return value
        
# serializer pour le JWT
class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
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