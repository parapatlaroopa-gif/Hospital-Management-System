from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('NURSE', 'Nurse'),
        ('PATIENT', 'Patient'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PATIENT'
    )
    phone = models.CharField(max_length=20, blank=True, default='')

    # Optional relationships to hospital entities
    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_accounts'
    )
    staff = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_accounts'
    )
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_accounts'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class PatientAssignment(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Discharged', 'Discharged'),
        ('Completed', 'Completed'),
    )

    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='doctor_assignments'
    )
    nurse = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nurse_assignments'
    )
    assigned_date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active'
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        nurse_name = f", Nurse: {self.nurse.first_name}" if self.nurse else ""
        return f"Patient: {self.patient.first_name} -> Dr. {self.doctor.first_name}{nurse_name}"


# Auto-create UserProfile for new users if not present
@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'ADMIN' if instance.is_superuser else 'PATIENT'
        UserProfile.objects.get_or_create(user=instance, defaults={'role': role})
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()