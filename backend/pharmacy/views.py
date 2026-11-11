from rest_framework import viewsets, permissions
from .models import Medicine, Prescription
from .serializers import MedicineSerializer, PrescriptionSerializer
from doctors.models import Doctor


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all().order_by("-id")
    serializer_class = MedicineSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by("-id")
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        qs = Prescription.objects.all().select_related("patient", "doctor", "medicine").order_by("-id")
        user = self.request.user
        
        # Filter by patient query param
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        elif hasattr(user, "profile") and user.profile.role == "PATIENT" and user.profile.patient_id:
            qs = qs.filter(patient_id=user.profile.patient_id)

        # Filter by doctor query param
        doctor_id = self.request.query_params.get("doctor")
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        elif hasattr(user, "profile") and user.profile.role == "DOCTOR" and user.profile.doctor_id:
            # If explicit doctor request without patient filter, filter to doctor's prescriptions
            if not self.request.query_params.get("all"):
                qs = qs.filter(doctor_id=user.profile.doctor_id)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        doctor = serializer.validated_data.get("doctor")

        if not doctor and hasattr(user, "profile") and user.profile.doctor:
            doctor = user.profile.doctor

        if not doctor:
            doctor = Doctor.objects.first()

        prescription = serializer.save(doctor=doctor)

        # Deduct prescribed quantity from pharmacy inventory stock if available
        med = prescription.medicine
        if med and med.quantity > 0:
            med.quantity = max(0, med.quantity - 1)
            med.save(update_fields=["quantity"])

    def perform_destroy(self, instance):
        # Restore 1 unit to stock on cancellation/deletion if medicine still exists
        med = instance.medicine
        if med:
            med.quantity = med.quantity + 1
            med.save(update_fields=["quantity"])
        instance.delete()