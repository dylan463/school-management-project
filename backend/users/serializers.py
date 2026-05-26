from rest_framework import serializers
from .models import User,Role,Mention

class MentionSerailizer(serializers.ModelSerializer):
    class Meta:
        model = Mention
        fields = ["id","text","code"]


#  serializer pour afficher les infos d'un utilisateur
class UserSerializer(serializers.ModelSerializer):
    """Pour afficher les infos d'un utilisateur"""
    full_name = serializers.CharField(source ="get_full_name",read_only=True)
    mention = MentionSerailizer()
    class Meta:
        model = User
        fields = ['id',
                  'username',
                  'email',
                  "is_active",
                  'first_name', 
                  'last_name',
                  'full_name',
                  'role',
                  'mention']
        read_only_fields = ['id','role','mention','is_active']




class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['last_name','first_name','email','role','mention']
        extra_kwargs = {
            "first_name":{"required":False},
            "last_name":{"required":False},
        }
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("cet email est déjà utilisé")
        return value
    
    def validate_role(self, value):
        if value not in Role.values:
            raise serializers.ValidationError("role invalide")
        return value
    
    def validate_mention(self, value):
        if not Mention.objects.filter(id=value).exists():
            raise serializers.ValidationError("mention invalide")
        return value
    




class ProfileUpdateSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ['first_name','last_name','email']
     
    