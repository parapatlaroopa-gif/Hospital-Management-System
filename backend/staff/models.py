from django.db import models


class Staff(models.Model):

    ROLE_CHOICES = (
        ('Doctor', 'Doctor'),
        ('Nurse', 'Nurse'),
        ('Receptionist', 'Receptionist'),
        ('Lab Technician', 'Lab Technician'),
        ('Other', 'Other'),
    )


    first_name = models.CharField(
        max_length=50
    )


    last_name = models.CharField(
        max_length=50
    )


    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES
    )


    phone = models.CharField(
        max_length=15
    )


    email = models.EmailField(
        unique=True
    )


    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    joining_date = models.DateField()


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.first_name + " " + self.last_name