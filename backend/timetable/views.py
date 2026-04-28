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

    # 🔸 Ajouter une ligne
    @action(detail=True, methods=["post"])
    def add_entry(self, request, pk=None):

        schedule = self.get_object()

        # 🔒 BLOQUER si publié
        if schedule.is_published:
            raise ValidationError(
                "Impossible de modifier un emploi du temps publié"
            )

        data = request.data.copy()
        data["schedule"] = schedule.id

        serializer = ScheduleEntrySerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    # 🔸 Modifier une ligne
    @action(detail=True, methods=["patch"], url_path="update_entry/(?P<entry_id>[^/.]+)")
    def update_entry(self, request, pk=None, entry_id=None):

        schedule = self.get_object()

        if schedule.is_published:
            raise ValidationError("Modification interdite après publication")

        entry = get_object_or_404(
            ScheduleEntry, id=entry_id, schedule=schedule
        )

        serializer = ScheduleEntrySerializer(
            entry,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # 🔸 Supprimer une ligne
    @action(detail=True, methods=["delete"], url_path="delete_entry/(?P<entry_id>[^/.]+)")
    def delete_entry(self, request, pk=None, entry_id=None):

        schedule = self.get_object()

        if schedule.is_published:
            raise ValidationError("Suppression interdite après publication")

        entry = get_object_or_404(
            ScheduleEntry, id=entry_id, schedule=schedule
        )

        entry.delete()
        return Response({"status": "deleted"}, status=204)

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
            is_active=True
        ).distinct()

        schedules = Schedule.objects.filter(
            semester__in=semesters,
            is_published=True
        )

        return Response(ScheduleSerializer(schedules, many=True).data)
