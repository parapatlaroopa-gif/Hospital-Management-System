from rest_framework import serializers
from .models import Medicine, Prescription
from doctors.models import Doctor


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = "__all__"


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    medicine_name = serializers.SerializerMethodField()
    medicine_category = serializers.SerializerMethodField()
    medicine_price = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "medicine",
            "medicine_name",
            "medicine_category",
            "medicine_price",
            "dosage",
            "frequency",
            "duration",
            "instructions",
            "prescribed_date",
        ]

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}".strip()
        return "Unknown Patient"

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}".strip()
        return "Attending Physician"

    def get_medicine_name(self, obj):
        return obj.medicine.name if obj.medicine else "Unknown Medicine"

    def get_medicine_category(self, obj):
        return obj.medicine.category if obj.medicine else "General"

    def get_medicine_price(self, obj):
        return float(obj.medicine.price) if obj.medicine and obj.medicine.price else 0.0