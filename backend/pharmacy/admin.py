from django.contrib import admin
from .models import Medicine


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'category',
        'quantity',
        'price',
        'expiry_date'
    )