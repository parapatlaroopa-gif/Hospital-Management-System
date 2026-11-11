from django.db import models


class Report(models.Model):
    patient_name = models.CharField(max_length=100)
    doctor_name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=100)
    description = models.TextField()
    report_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} - {self.report_type}"