from rest_framework import generics
from accounts.permissions import IsAdmin, IsClinicalStaff, IsPatient, IsHospitalUser
from .models import Patient, PatientVitals
from .serializers import PatientSerializer, PatientVitalsSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsHospitalUser()]

    def get_queryset(self):
        qs = Patient.objects.all().order_by("-id")
        profile = getattr(self.request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        if role == "PATIENT":
            patient_id = getattr(profile, "patient_id", None)
            return qs.filter(id=patient_id) if patient_id else qs.none()
        if role == "DOCTOR" and getattr(profile, "doctor_id", None):
            from appointments.models import Appointment
            ids = Appointment.objects.filter(doctor_id=profile.doctor_id).values_list("patient_id", flat=True)
            return qs.filter(id__in=ids).distinct()
        if role == "NURSE" and getattr(profile, "staff_id", None):
            from accounts.models import PatientAssignment
            ids = PatientAssignment.objects.filter(nurse_id=profile.staff_id).values_list("patient_id", flat=True)
            return qs.filter(id__in=ids).distinct()
        search = self.request.query_params.get("search")
        gender = self.request.query_params.get("gender")
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(phone__icontains=search))
        if gender and gender.lower() != "all":
            qs = qs.filter(gender__iexact=gender)
        return qs


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAdmin()]
        return [IsHospitalUser()]

    def get_queryset(self):
        profile = getattr(self.request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        if role == "PATIENT":
            patient_id = getattr(profile, "patient_id", None)
            return Patient.objects.filter(id=patient_id) if patient_id else Patient.objects.none()
        return Patient.objects.all()


class PatientVitalsListCreateView(generics.ListCreateAPIView):
    serializer_class = PatientVitalsSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsClinicalStaff()]
        return [IsHospitalUser()]

    def get_queryset(self):
        qs = PatientVitals.objects.all()
        profile = getattr(self.request.user, "profile", None)
        role = getattr(profile, "role", None) if profile else None
        if role == "PATIENT":
            patient_id = getattr(profile, "patient_id", None)
            qs = qs.filter(patient_id=patient_id) if patient_id else qs.none()
        elif role == "DOCTOR" and getattr(profile, "doctor_id", None):
            from appointments.models import Appointment
            ids = Appointment.objects.filter(doctor_id=profile.doctor_id).values_list("patient_id", flat=True)
            qs = qs.filter(patient_id__in=ids)
        elif role == "NURSE" and getattr(profile, "staff_id", None):
            from accounts.models import PatientAssignment
            ids = PatientAssignment.objects.filter(nurse_id=profile.staff_id).values_list("patient_id", flat=True)
            qs = qs.filter(patient_id__in=ids)
        patient_id = self.request.query_params.get("patient") or self.request.query_params.get("patient_id")
        if patient_id and role in ("ADMIN", "DOCTOR", "NURSE"):
            qs = qs.filter(patient_id=patient_id)
        return qs


class PatientVitalsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientVitalsSerializer
    queryset = PatientVitals.objects.all()
    permission_classes = [IsAdmin | IsClinicalStaff]

