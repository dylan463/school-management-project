# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer,StudentCreateSerializer,TeacherCreateSerializer
from .permissions import IsTeacher,IsStudent,IsSuperUser,IsStaff,IsStaffOrSuperUser


class StudentListCreateView(APIView):

    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        """Lister tous les étudiants"""
        students = CustomUser.objects.filter(role=CustomUser.Role.STUDENT)
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Créer un étudiant"""
        serializer = StudentCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherListCreateView(APIView):

    permission_classes = [IsStaffOrSuperUser]
    
    def get(self, request):
        """Lister tous les professeurs"""
        teachers = CustomUser.objects.filter(role=CustomUser.Role.TEACHER)
        serializer = UserSerializer(teachers, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Créer un professeur"""
        serializer = TeacherCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)