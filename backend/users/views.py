# 🔹 Django
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password

# 🔹 Django REST Framework
from rest_framework import status, mixins
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

# 🔹 Local apps
from .models import CustomUser, TeacherUser, StudentUser
from .serializers import (
    UserSerializer,
    StudentCreateSerializer,
    TeacherCreateSerializer,
    ChangePasswordSerializer,
)
from .permissions import (
    IsTeacher,
    IsStudent,
    IsSuperUser,
    IsStaff,
    IsStaffOrSuperUser,
)
from .utils import send_email


#  ceci est utiliser juste pour creer un etudiants et faire la liste des etudiants
class StudentViewSet(GenericViewSet,mixins.CreateModelMixin,mixins.ListModelMixin):
    permission_classes = [IsStaffOrSuperUser]
    queryset = StudentUser.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return StudentCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        student = serializer.save()
        password = getattr(student, "_plain_password", "non disponible")
        send_email(student.username,password,student.email)
        
#  ceci est utiliser juste pour creer un enseignant et faire la liste des enseignants, et aussi promouvoir ou rétrograder un enseignant en staff ou non staff
class TeacherViewSet(GenericViewSet,mixins.CreateModelMixin,mixins.ListModelMixin):
    permission_classes = [IsStaffOrSuperUser]
    queryset = TeacherUser.objects.all()

    def get_permissions(self):
        if self.action in ["promote", "demote"]:
            permission_classes = [IsSuperUser]  # superuser only
        else:
            permission_classes = [IsStaffOrSuperUser]
        return [permission() for permission in permission_classes]


    def get_serializer_class(self):
        if self.action in ["create"]:
            return TeacherCreateSerializer
        return UserSerializer
    

    @action(detail=True,methods=["post"])
    def promote(self,request,pk=None):
        teacher : TeacherUser = self.get_object()
        if teacher.is_superuser or teacher.is_staff:
            raise PermissionDenied("You cannot promote this user.")
        if teacher == request.user:
            raise PermissionDenied("You cannot promote yourself.")
        teacher.is_staff = True
        teacher.save()
        return Response({"status":"promoted"})
    
    @action(detail=True,methods=["post"])
    def demote(self,request,pk=None):
        teacher : TeacherUser = self.get_object()
        if teacher.is_superuser or (not teacher.is_staff):
            raise PermissionDenied("You cannot demote this user.")
        if teacher == request.user:
            raise PermissionDenied("You cannot demote yourself.")
        teacher.is_staff = False
        teacher.save()
        return Response({"status":"demoted"})

    def perform_create(self, serializer):
        teacher = serializer.save()
        password = getattr(teacher, "_plain_password", "non disponible")
        send_email(teacher.username,password,teacher.email)

#  ceci est utiliser pour faire les opérations de base sur les utilisateurs (récupérer, mettre à jour, supprimer) et aussi pour récupérer ou mettre à jour son propre profil
class UserViewSet(GenericViewSet,mixins.RetrieveModelMixin,mixins.UpdateModelMixin,mixins.DestroyModelMixin):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()

    def get_permissions(self):
        if self.action in ["retrieve","me"]:
            permission_classes = [IsAuthenticated]
        elif self.action in ["update","partial_update"]:
            permission_classes = [IsStaffOrSuperUser]
        elif self.action == "destroy":
            permission_classes = [IsSuperUser]
        return [permission() for permission in permission_classes]
    

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# endpoint pour changer son mot de passe 
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]
            # vérifier ancien mot de passe
            if not user.check_password(old_password):
                return Response(
                    {"old_password": "Mot de passe incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # validation sécurité Django
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            # garder session active
            update_session_auth_hash(request, user)
            return Response({"status": "password updated"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

