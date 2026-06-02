from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import (
    Formation, Semester,
    SchoolYear,
    CourseUnit, CourseModule,User,Role,Mention
)

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
        fields = ['last_name','first_name','email','mention']
        extra_kwargs = {
            "last_name":{"required":True},
            "first_name":{"required":True},
            "email":{"required":True}
        }

    def validate_email(self, value):
        queryset = User.objects.filter(email=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("cet email est déjà utilisé")

        return value

class ProfileUpdateSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ['first_name','last_name','email']
     

class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = ["id","code",'text',"description","is_active"]
        read_only_fields = ["id","is_active"]
        extra_kwargs = {

            "code": {"required": True},
            "description": {"required": False},
        }

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "code", "order","is_active"]
        read_only_fields = ["id","is_active"]

    def validate_order(self, value):
        request = self.context.get("request")
        user = request.user
        mention = user.mention

        last_semester = Semester.objects.filter(
            mention=mention
        ).order_by("order").last()

        if last_semester and value <= last_semester.order:
            raise serializers.ValidationError(
                f"L'ordre doit être supérieur à {last_semester.order}"
            )

        return value
        


class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = [
            "id", "text", "status", "start_date", 
            "end_date", "is_locked"
        ]
        read_only_fields = ["id","status",'is_locked']
        extra_kwargs = {
            "text": {"required": True},
            "start_date": {"required": False},
            "end_date": {"required": False},
        }

class ChangeSYStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    def validate_status(self,value):
        if not value in SchoolYear.Status.values:
            raise serializers.ValidationError("ce status est invalide")
        return value


class CourseModuleSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source='teacher.get_full_name', read_only=True)
    course_unit = serializers.CharField(source='course_unit.code', read_only=True)
    semester = serializers.CharField(source='semester.code', read_only=True)
    class Meta:
        model = CourseModule
        fields = ["id","code","text",'semester',"teacher","credits","min_val_score","course_unit","volume_hours","is_active"]
        read_only_fields = ["id"]


class CourseModuleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = ["code","text","credits",'semester',"teacher","min_val_score","course_unit","volume_hours"]
        extra_kwargs = {
            "volume_hours": {"required": False},
            "teacher":{"required":False},
        }
    
    def validate_min_val_score(self,value):
        if not (value > 0 and value < 20):
            raise serializers.ValidationError("la note minimale de validation doit être compris entre [1,19]")
        return value

    
class CourseUnitSerializer(serializers.ModelSerializer):
    formation = FormationSerializer(read_only=True)
    total_credits = serializers.SerializerMethodField()
    class Meta:
        model = CourseUnit
        fields = ["id","code","text","formation","is_active","total_credits"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "is_active":{"required":False}
        }
    def get_total_credits(self,obj):
        return sum([ credit for credit in obj.modules.filter(is_active=True).values_list('credits', flat=True)])

class CourseUnitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseUnit
        fields = ["code","text","formation"]        
