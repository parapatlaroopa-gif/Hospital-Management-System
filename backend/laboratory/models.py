from django.db import models
from patients.models import Patient


class LabTest(models.Model):

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    )


    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )


    test_name = models.CharField(
        max_length=100
    )


    test_result = models.TextField(
        blank=True
    )


    test_date = models.DateField()


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.test_name
