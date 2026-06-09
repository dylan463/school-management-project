from rest_framework import serializers
from .models import Schedule, ScheduleEntry, TeacherAvailability
from collections import defaultdict
from structures.serializers import CourseModuleSerializer, SemesterSerializer, FormationSerializer
from structures.models import CourseModule

# 🔹 Serializer pour les lignes d'emploi du temps
class ScheduleEntrySerializer(serializers.ModelSerializer):
    course_module = CourseModuleSerializer(read_only=True)
    class Meta:
        model = ScheduleEntry
        fields = ["id", "schedule", "course_module", "day", "start_time", "end_time", "classroom"]

class ScheduleEntryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleEntry
        fields = ["schedule", "course_module", "day", "start_time", "end_time", "classroom"]
        extra_kwargs = {
            'classroom': {'required': False},
        }

# 🔹 Serializer global (emploi du temps)
class ScheduleSerializer(serializers.ModelSerializer):
    semester = SemesterSerializer(read_only=True)
    formation = FormationSerializer(read_only=True)
    class Meta:
        model = Schedule
        fields = ["id", "semester","formation","created_at"]
        read_only_fields = ["id"]


class ScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ["semester","formation"]

class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source="teacher.get_full_name", read_only=True)
    class Meta:
        model = TeacherAvailability
        fields = ["id", "teacher", "day", "start_time", "end_time"]

class TeacherAvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAvailability
        fields = ["teacher", "day", "start_time", "end_time"]

    def validate(self,attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if not start_time < end_time:
            raise serializers.ValidationError({
                "detail":"Le début doit être avant la fin."
            })

        return attrs