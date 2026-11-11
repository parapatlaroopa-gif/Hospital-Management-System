from django.db import models


class Doctor(models.Model):

    first_name = models.CharField(max_length=100)

    last_name = models.CharField(max_length=100)

    specialization = models.CharField(max_length=100)

    phone = models.CharField(max_length=15)

    email = models.EmailField()

    experience = models.IntegerField()

    room_number = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.first_name + " " + self.last_name