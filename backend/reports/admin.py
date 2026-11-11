from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'patient_name',
        'doctor_name',
        'report_type',
        'report_date',
    )