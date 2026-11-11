from django.db import models
from patients.models import Patient


class Medicine(models.Model):

    CATEGORY_CHOICES = (
        ('Tablet', 'Tablet'),
        ('Syrup', 'Syrup'),
        ('Injection', 'Injection'),
        ('Capsule', 'Capsule'),
    )

    name = models.CharField(
        max_length=100
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    manufacturer = models.CharField(
        max_length=100
    )

    quantity = models.IntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    expiry_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class Prescription(models.Model):

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )

    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE
    )

    dosage = models.CharField(
        max_length=100
    )

    frequency = models.CharField(
        max_length=100
    )

    duration = models.CharField(
        max_length=100
    )

    instructions = models.TextField(
        blank=True
    )

    prescribed_date = models.DateField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.patient.first_name} - {self.medicine.name}"