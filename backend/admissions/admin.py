from django.contrib import admin
from .models import Admission


@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient',
        'room_number',
        'admission_date',
        'status'
    )