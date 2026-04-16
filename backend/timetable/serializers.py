from rest_framework import serializers
from .models import Schedule, ScheduleEntry
from structures.models import CourseComponent


# 🔹 Serializer pour les lignes d'emploi du temps
class ScheduleEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = ScheduleEntry
        fields = "__all__"

    def validate(self, data):
        start = data.get("start_time")
        end = data.get("end_time")
        teacher = data.get("teacher")
        classroom = data.get("classroom")
        day = data.get("day")
        schedule = data.get("schedule")

        # 🔴 1. Vérifier cohérence horaire
        if start >= end:
            raise serializers.ValidationError("start_time doit être inférieur à end_time")

        # 🔴 2. Vérifier conflit PROF
        if teacher:
            conflict_teacher = ScheduleEntry.objects.filter(
                teacher=teacher,
                day=day,
                start_time__lt=end,
                end_time__gt=start,
            )

            if self.instance:
                conflict_teacher = conflict_teacher.exclude(id=self.instance.id)

            if conflict_teacher.exists():
                raise serializers.ValidationError(
                    "Ce professeur a déjà un cours à cet horaire"
                )

        # 🔴 3. Vérifier conflit SALLE
        conflict_room = ScheduleEntry.objects.filter(
            classroom=classroom,
            day=day,
            start_time__lt=end,
            end_time__gt=start,
        )

        if self.instance:
            conflict_room = conflict_room.exclude(id=self.instance.id)

        if conflict_room.exists():
            raise serializers.ValidationError(
                "Cette salle est déjà occupée à cet horaire"
            )

        # 🔴 4. Vérifier même schedule (optionnel mais propre)
        if schedule:
            conflict_schedule = ScheduleEntry.objects.filter(
                schedule=schedule,
                day=day,
                start_time__lt=end,
                end_time__gt=start,
            )

            if self.instance:
                conflict_schedule = conflict_schedule.exclude(id=self.instance.id)

            if conflict_schedule.exists():
                raise serializers.ValidationError(
                    "Conflit dans cet emploi du temps (chevauchement)"
                )

        return data


# 🔹 Serializer global (emploi du temps)
class ScheduleSerializer(serializers.ModelSerializer):

    entries = ScheduleEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Schedule
        fields = ["id", "semester", "is_published", "entries"]