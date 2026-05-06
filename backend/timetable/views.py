from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from .models import Schedule, ScheduleEntry
from .serializers import ScheduleSerializer, ScheduleEntrySerializer

from users.permissions import IsStudent, IsTeacher, IsSuperUser
from structures.models import Enrollment, Semester,SchoolYear


# 🔹 ADMIN VIEWSET
class AdminScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsSuperUser]

    # 🔸 Publier
    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_published = True
        schedule.save()
        return Response({"status": "published"})

    # 🔸 Annuler la Publication
    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        schedule = self.get_object()
        schedule.is_published = False
        schedule.save()
        return Response({"status": "unpublished"})


# 🔹 ADMIN SCHEDULE ENTRY VIEWSET
class AdminScheduleEntryViewSet(viewsets.ModelViewSet):
    queryset = ScheduleEntry.objects.all()
    serializer_class = ScheduleEntrySerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        schedule_id = self.request.query_params.get("schedule")
        if schedule_id:
            queryset = queryset.filter(schedule_id=schedule_id)
        return queryset

    def perform_create(self, serializer):
        schedule = serializer.validated_data["schedule"]
        if schedule.is_published:
            raise ValidationError("Impossible de modifier un emploi du temps publié")
        serializer.save()

    def perform_update(self, serializer):
        schedule = serializer.validated_data.get("schedule") or serializer.instance.schedule
        if schedule.is_published:
            raise ValidationError("Impossible de modifier un emploi du temps publié")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.schedule.is_published:
            raise ValidationError("Suppression interdite après publication")
        instance.delete()


# 🔹 ETUDIANT
class StudentScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsStudent]

    @action(detail=False, methods=["get"])
    def my_schedule(self, request):

        enrollment = Enrollment.objects.filter(
            student=request.user,
            is_current=True,
            student_school_year__school_year__status = SchoolYear.Status.ACTIVE
        ).select_related("semester").first()

        if not enrollment:
            return Response({"detail": "No active semester"}, status=404)

        try:
            schedule = Schedule.objects.get(
                semester=enrollment.semester,
                is_published=True
            )
        except Schedule.DoesNotExist:
            return Response({"detail": "Schedule not available"}, status=404)

        return Response(ScheduleSerializer(schedule).data)


# 🔹 PROF
class TeacherScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsTeacher]

    @action(detail=False, methods=["get"])
    def my_schedules(self, request):

        semesters = Semester.objects.filter(
            course_units__modules__teacher=request.user,
        ).distinct()

        schedules = Schedule.objects.filter(
            semester__in=semesters,
            is_published=True
        )

        return Response(ScheduleSerializer(schedules, many=True).data)
