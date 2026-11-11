from django.db import models
from patients.models import Patient


class Bill(models.Model):

    PAYMENT_STATUS = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
    )


    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )


    bill_number = models.CharField(
        max_length=50,
        unique=True
    )


    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    medicine_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )


    lab_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )


    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='Pending'
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.bill_number