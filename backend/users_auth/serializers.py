from rest_framework import serializers


# serializer pour changer le mot de passe
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password1 = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    # avant de sauvegarder, vérifier que les deux nouveaux mots de passe sont identiques
    def validate(self, attrs):
        if attrs["new_password1"] != attrs["new_password2"]:
            raise serializers.ValidationError("les mots de passe ne corresspond pas")
        return attrs

class ChangeForgetSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    # avant de sauvegarder, vérifier que les deux nouveaux mots de passe sont identiques
    def validate(self, attrs):
        if attrs["new_password1"] != attrs["new_password2"]:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas"
            })
        return attrs