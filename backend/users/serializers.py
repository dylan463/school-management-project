from rest_framework import serializers
from .models import User,Role,Mention

#  serializer pour afficher les infos d'un utilisateur
class UserSerializer(serializers.ModelSerializer):
    """Pour afficher les infos d'un utilisateur"""
    full_name = serializers.CharField(source ="get_full_name",read_only=True)
    class Meta:
        model = User
        fields = ['id',
                  'username',
                  'email',
                  "is_active",
                  'first_name', 
                  'last_name',
                  'full_name'
                  'role',
                  'mention']
        read_only_fields = ['id','role','mention','is_active']


class MentionSerailizer(serializers.ModelSerializer):
    class Meta:
        model = Mention
        fields = ["id","text","code"]
        

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
        creator : User = self.context.get("user")
        if value == Role.SYSTEM_ADMIN:
            raise serializers.ValidationError("veillez utiliser le terminal du serveur pour cree un administrateur du système")
        if creator.role == Role.SYSTEM_ADMIN:
            if not value == Role.DEPARTMENT_HEAD:
                raise serializers.ValidationError("vous ne pouver que créer des chefs de départements")
        elif creator.role == Role.DEPARTMENT_HEAD:
            if value in [Role.SYSTEM_ADMIN,Role.DEPARTMENT_HEAD]:
                raise serializers.ValidationError("vous n'avez pas la permission nécessaire")
        return value

    def validate_mention(self,value):
        creator : User = self.context.get('user')
        if not creator.role == Role.SYSTEM_ADMIN and not creator.mention.id == value.id:
            raise serializers.ValidationError("vous ne pouver pas cree un utilisateur avec une mention différente de la votre")
