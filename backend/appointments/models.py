from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class Appointment(models.Model):

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )


    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )


    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE
    )


    appointment_date = models.DateField()


    appointment_time = models.TimeField()


    reason = models.TextField()


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return (
            self.patient.first_name
            + " - "
            + self.doctor.first_name
        )