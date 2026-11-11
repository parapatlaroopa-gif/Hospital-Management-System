from rest_framework import serializers
from .models import Admission


class AdmissionSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Admission
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'room_number',
            'admission_date',
            'discharge_date',
            'status',
            'created_at',
        ]

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return ""

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}"
        return ""