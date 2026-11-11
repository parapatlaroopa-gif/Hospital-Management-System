from rest_framework import serializers
from .models import Patient, PatientVitals


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class PatientVitalsSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PatientVitals
        fields = [
            'id', 'patient', 'patient_name',
            'blood_pressure', 'heart_rate', 'temperature',
            'spo2', 'blood_sugar', 'respiratory_rate',
            'recorded_by', 'notes', 'recorded_at'
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
