from django.contrib import admin
from .models import LabTest


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient',
        'test_name',
        'test_date',
        'status'
    )