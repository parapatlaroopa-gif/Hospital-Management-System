from django.db import models


class Patient(models.Model):

    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )


    first_name = models.CharField(max_length=100)

    last_name = models.CharField(max_length=100)

    age = models.IntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    phone = models.CharField(max_length=15)

    address = models.TextField()


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.first_name + " " + self.last_name


class PatientVitals(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='vitals'
    )
    blood_pressure = models.CharField(max_length=20, default="120/80")
    heart_rate = models.IntegerField(default=75)
    temperature = models.DecimalField(max_digits=5, decimal_places=1, default=98.6)
    spo2 = models.IntegerField(default=98)
    blood_sugar = models.IntegerField(default=100)
    respiratory_rate = models.IntegerField(default=16)
    recorded_by = models.CharField(max_length=100, blank=True, default="Nurse")
    notes = models.TextField(blank=True, default="")
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Vitals for {self.patient.first_name} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"
