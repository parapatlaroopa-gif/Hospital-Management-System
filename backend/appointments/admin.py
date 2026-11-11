from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient',
        'doctor',
        'appointment_date',
        'appointment_time',
        'status'
    )