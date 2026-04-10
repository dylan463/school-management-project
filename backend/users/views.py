# views.py
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser,TeacherUser,StudentUser
from .serializers import UserSerializer,StudentCreateSerializer,TeacherCreateSerializer,ChangePasswordSerializer
from .permissions import IsTeacher,IsStudent,IsSuperUser,IsStaff,IsStaffOrSuperUser
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail

class StudentViewSet(ModelViewSet):
    permission_classes = [IsStaffOrSuperUser]
    queryset = StudentUser.objects.all()
    def get_serializer_class(self):
        if self.action == "create":
            return StudentCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        # ✅ création de l'étudiant
        student = serializer.save()

        # récupérer mot de passe généré depuis le serializer
        password = getattr(student, "_plain_password", "non disponible")

        # ✅ envoi email
        send_mail(
            subject="Votre compte étudiant",
            message=f"""
Bonjour {student.username},

Votre compte a été créé.

Identifiant : {student.username}
Mot de passe : {password}

Veuillez vous connecter et changer votre mot de passe.
""",
            from_email="no-reply@school.com",
            recipient_list=[student.email],
            fail_silently=False
        )

class TeacherViewSet(ModelViewSet):
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
        teacher.is_staff = False
        teacher.save()
        return Response({"status":"demoted"})
        
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