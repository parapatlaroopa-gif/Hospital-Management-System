from rest_framework import serializers
from django.utils import timezone
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment

        fields = [
            "id",
            "appointment_date",
            "appointment_time",
            "reason",
            "status",
            "created_at",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
        ]
        extra_kwargs = {
            "patient": {"required": False},
        }

    def validate(self, attrs):
        appointment_date = attrs.get("appointment_date", getattr(self.instance, "appointment_date", None))
        appointment_time = attrs.get("appointment_time", getattr(self.instance, "appointment_time", None))
        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        role = getattr(getattr(user, "profile", None), "role", None)
        is_staff_or_admin = bool(user and (user.is_superuser or role in ("ADMIN", "DOCTOR", "NURSE")))

        # 1. Resolve patient object cleanly
        patient_obj = attrs.get("patient")
        if not patient_obj and self.instance:
            patient_obj = getattr(self.instance, "patient", None)

        if not patient_obj:
            # Check user profile
            profile = getattr(user, "profile", None)
            if profile and getattr(profile, "patient", None):
                patient_obj = profile.patient
            elif user and user.is_authenticated:
                from accounts.views import ensure_user_profile_linkage
                patient_obj = ensure_user_profile_linkage(user)

            # If still not found and user is staff or admin, get or create a default patient
            if not patient_obj and is_staff_or_admin:
                from patients.models import Patient
                patient_obj = Patient.objects.first()
                if not patient_obj and user:
                    patient_obj = Patient.objects.create(
                        first_name=user.first_name or "Hospital",
                        last_name=user.last_name or "Patient",
                        age=30,
                        gender="Other",
                        phone="9999999999",
                        address="CarePulse Medical Center"
                    )

        if not patient_obj:
            raise serializers.ValidationError({"patient": "A valid patient record is required to book an appointment."})

        attrs["patient"] = patient_obj

        # 2. Check doctor schedule availability
        if appointment_date and appointment_time and doctor:
            if not is_staff_or_admin and appointment_date < timezone.localdate():
                raise serializers.ValidationError({"appointment_date": "Appointment date cannot be in the past."})
            qs = Appointment.objects.filter(doctor=doctor, appointment_date=appointment_date, appointment_time=appointment_time)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"appointment_time": "That doctor already has an appointment at this time."})
        return attrs

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return ""

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}"
        return ""