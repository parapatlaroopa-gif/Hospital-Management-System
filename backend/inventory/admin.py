from django.contrib import admin
from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'item_name',
        'category',
        'quantity',
        'supplier',
        'availability'
    )