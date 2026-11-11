from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class Admission(models.Model):

    STATUS_CHOICES = (
        ('Admitted', 'Admitted'),
        ('Discharged', 'Discharged'),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    room_number = models.CharField(
        max_length=20
    )

    admission_date = models.DateField()

    discharge_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Admitted'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.patient.first_name