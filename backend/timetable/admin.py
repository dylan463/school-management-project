# timetable/admin.py
from django.contrib import admin
from .models import Room, TimeSlot

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'capacity']
    search_fields = ['code', 'name']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display  = ['course_component', 'teacher', 'room',
                     'day', 'start_time', 'end_time', 'is_published']
    list_filter   = ['day', 'is_published', 'semester']
    search_fields = ['course_component__name', 'teacher__username']
    list_editable = ['is_published']