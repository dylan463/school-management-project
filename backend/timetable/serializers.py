# timetable/serializers.py
from rest_framework import serializers
from .models import TeacherAvailability, TimeSlot

class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source='teacher.get_full_name', read_only=True
    )

    class Meta:
        model  = TeacherAvailability
        fields = [
            'id', 'teacher', 'teacher_name', 'semester',
            'day', 'start_time', 'end_time'
        ]
        read_only_fields = ['id', 'teacher']  # teacher injecté depuis la vue

    def validate(self, data):
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError(
                "L'heure de fin doit être après l'heure de début."
            )
        return data


class TimeSlotSerializer(serializers.ModelSerializer):
    """Lecture seule enrichie — pour étudiant et enseignant."""
    course_name  = serializers.CharField(
        source='course_component.name', read_only=True
    )
    teacher_name = serializers.CharField(
        source='teacher.get_full_name', read_only=True
    )

    class Meta:
        model  = TimeSlot
        fields = [
            'id', 'semester', 'course_component', 'course_name',
            'teacher', 'teacher_name', 'day',
            'start_time', 'end_time', 'room', 'is_published'
        ]
        read_only_fields = ['id']


class TimeSlotWriteSerializer(serializers.ModelSerializer):
    """Écriture — pour admin uniquement."""
    class Meta:
        model  = TimeSlot
        fields = [
            'id', 'semester', 'course_component', 'teacher',
            'day', 'start_time', 'end_time', 'room', 'is_published'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError(
                "L'heure de fin doit être après l'heure de début."
            )
        # Vérifier cohérence enseignant ↔ EC
        if data['course_component'].teacher_id != data['teacher'].pk:
            raise serializers.ValidationError(
                "Ce professeur n'est pas affecté à cet EC."
            )
        return data