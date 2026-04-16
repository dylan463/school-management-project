from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Schedule, ScheduleEntry
from .serializers import ScheduleSerializer, ScheduleEntrySerializer

from users.permissions import IsStudent, IsTeacher, IsStaffOrSuperUser
from structures.models import Enrollement, Semester, CourseComponent


# 🔹 ADMIN VIEWSET
class AdminScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsStaffOrSuperUser]

    def get_serializer_class(self):
        if self.action in ["add_entry"]:
            return ScheduleEntrySerializer

        return ScheduleSerializer



    # 🔸 ajouter une ligne d'emploi du temps
    @action(detail=True, methods=["post"])
    def add_entry(self, request, pk=None):
        schedule = self.get_object()

        data = request.data.copy()
        data["schedule"] = schedule.id

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    # 🔸 publier emploi du temps
    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_published = True
        schedule.save()
        return Response({"status": "published"})


# 🔹 ETUDIANT
class StudentScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsStudent]

    @action(detail=False, methods=["get"])
    def my_schedule(self, request):

        student = request.user

        enrollement = Enrollement.objects.filter(
            student=student,
            semester__is_active=True
        ).select_related("semester").first()

        if not enrollement:
            return Response({"detail": "No active semester"}, status=404)

        semester = enrollement.semester

        try:
            schedule = Schedule.objects.get(
                semester=semester,
                is_published=True
            )
        except Schedule.DoesNotExist:
            return Response({"detail": "Schedule not available"}, status=404)

        return Response(ScheduleSerializer(schedule).data)


# 🔹 PROFESSEUR
class TeacherScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsTeacher]

    @action(detail=False, methods=["get"])
    def my_schedules(self, request):

        teacher = request.user

        # récupérer les semestres actifs où il enseigne
        semesters = Semester.objects.filter(
            teachingunits__courses__teacher=teacher,
            is_active=True
        ).distinct()

        schedules = Schedule.objects.filter(
            semester__in=semesters,
            is_published=True
        )

        return Response(ScheduleSerializer(schedules, many=True).data)