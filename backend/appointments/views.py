from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from accounts.permissions import IsAdmin, IsClinicalStaff, IsPatient, IsHospitalUser
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        return [IsHospitalUser()]

    def get_queryset(self):
        qs = Appointment.objects.select_related("patient", "doctor").order_by("appointment_date", "appointment_time")
        profile = getattr(self.request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        if role == "PATIENT":
            patient_id = getattr(profile, "patient_id", None)
            if not patient_id and self.request.user and self.request.user.is_authenticated:
                from accounts.views import ensure_user_profile_linkage
                patient = ensure_user_profile_linkage(self.request.user)
                patient_id = patient.id if patient else None
            return qs.filter(patient_id=patient_id) if patient_id else qs.none()
        if role == "DOCTOR" and getattr(profile, "doctor_id", None):
            return qs.filter(doctor_id=profile.doctor_id)
        if role == "NURSE" and getattr(profile, "staff_id", None):
            from accounts.models import PatientAssignment
            patient_ids = PatientAssignment.objects.filter(
                nurse_id=profile.staff_id
            ).values_list("patient_id", flat=True)
            return qs.filter(patient_id__in=patient_ids)
        return qs

    def perform_create(self, serializer):
        profile = getattr(self.request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        # serializer.validated_data already has the patient model instance cleanly set
        status_val = "Pending" if role == "PATIENT" else serializer.validated_data.get("status", "Pending")
        serializer.save(status=status_val)

    def update(self, request, *args, **kwargs):
        profile = getattr(request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        instance = self.get_object()
        if role == "PATIENT":
            if not profile or instance.patient_id != profile.patient_id:
                raise PermissionDenied()
            if request.data.get("status") != "Cancelled":
                raise PermissionDenied("Patients can only cancel their appointments.")
            instance.status = "Cancelled"
            instance.save(update_fields=["status"])
            return Response(self.get_serializer(instance).data)
        if role in ("DOCTOR", "NURSE"):
            next_status = request.data.get("status")
            if next_status not in {"Pending", "Confirmed", "Completed", "Cancelled"}:
                raise PermissionDenied("Clinical staff can only update appointment status.")
            instance.status = next_status
            instance.save(update_fields=["status"])
            return Response(self.get_serializer(instance).data)
        return super().update(request, *args, **kwargs)

