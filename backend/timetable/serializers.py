from rest_framework import serializers
from .models import Schedule, ScheduleEntry, TeacherAvalability
from collections import defaultdict
from structures.serializers import CourseModuleSerializer
from structures.models import CourseModule

# 🔹 Serializer pour les lignes d'emploi du temps
class ScheduleEntrySerializer(serializers.ModelSerializer):
    course_module = serializers.CharField(source="course_module.text", read_only=True)
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
    semester = serializers.CharField(source="semester.name", read_only=True)
    formation = serializers.CharField(source="formation.text", read_only=True)
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
        model = TeacherAvalability
        fields = ["teacher", "day", "start_time", "end_time"]

class TeacherAvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAvalability
        fields = ["teacher", "day", "start_time", "end_time"]