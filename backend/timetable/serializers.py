from rest_framework import serializers
from .models import Schedule, ScheduleEntry
from collections import defaultdict


# 🔹 Serializer pour les lignes d'emploi du temps
class ScheduleEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = ScheduleEntry
        fields = "__all__"

    def validate(self, data):
        """
        🔥 Fonction principale de validation :
        - cohérence horaire
        - conflits prof
        - conflits salle
        - blocage si publié
        """

        # 🔁 récupération instance si update
        schedule = data.get("schedule") or self.instance.schedule
        start = data.get("start_time") or self.instance.start_time
        end = data.get("end_time") or self.instance.end_time
        teacher = data.get("teacher") or self.instance.teacher
        classroom = data.get("classroom") or self.instance.classroom
        day = data.get("day") or self.instance.day

        # 🔒 BLOQUER si publié
        if schedule.is_published:
            raise serializers.ValidationError(
                "Impossible de modifier un emploi du temps publié"
            )

        # 🔴 1. Vérifier cohérence horaire
        if start >= end:
            raise serializers.ValidationError(
                "start_time doit être inférieur à end_time"
            )

        # 🔴 2. Conflit PROF
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

        # 🔴 3. Conflit SALLE
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

        return data


# 🔹 Serializer global (emploi du temps)
class ScheduleSerializer(serializers.ModelSerializer):

    # 🔥 champ personnalisé pour regroupement
    grouped_entries = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ["id", "semester", "is_published", "grouped_entries"]

    def get_grouped_entries(self, obj):
        """
        🔥 Regroupe les cours par jour
        """
        grouped = defaultdict(list)

        entries = obj.entries.all().order_by("day", "start_time")

        for entry in entries:
            grouped[entry.day].append({
                "id": entry.id,
                "course": entry.course.name,
                "teacher": entry.teacher.username if entry.teacher else None,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "classroom": entry.classroom,
            })

        return grouped