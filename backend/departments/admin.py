from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'head_doctor',
        'phone',
        'location',
    )