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


<<<<<<< HEAD
# 🔹 Serializer global (emploi du temps)
class ScheduleSerializer(serializers.ModelSerializer):

    # 🔥 champ personnalisé pour regroupement
    grouped_entries = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ["id", "semester", "is_published", "grouped_entries"]
=======
class TimeSlotSerializer(serializers.ModelSerializer):
    """Lecture seule enrichie — pour étudiant et enseignant."""
    course_name        = serializers.CharField(
        source='course_component.name', read_only=True
    )
    course_credits     = serializers.IntegerField(
        source='course_component.course_credits', read_only=True
    )
    teaching_unit_name = serializers.CharField(
        source='course_component.teaching_unit.name', read_only=True
    )
    semester_name      = serializers.CharField(
        source='semester.name', read_only=True
    )
    teacher_name       = serializers.CharField(
        source='teacher.get_full_name', read_only=True
    )

    class Meta:
        model  = TimeSlot
        fields = [
            'id', 'semester', 'semester_name', 'course_component',
            'course_name', 'course_credits', 'teaching_unit_name',
            'teacher', 'teacher_name', 'day',
            'start_time', 'end_time', 'room', 'is_published'
        ]
        read_only_fields = ['id']
>>>>>>> frontend

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
