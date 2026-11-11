from django.contrib import admin
from .models import Bill


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'bill_number',
        'patient',
        'total_amount',
        'payment_status'
    )