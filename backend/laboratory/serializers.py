from rest_framework import serializers
from .models import LabTest
from patients.models import Patient


class PatientField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if data is None or data == 0 or data == '0' or data == '':
            return None
        return super().to_internal_value(data)


class LabTestSerializer(serializers.ModelSerializer):
    patient = PatientField(
        queryset=Patient.objects.all(),
        required=False,
        allow_null=True
    )
    patient_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LabTest
        fields = '__all__'

    def get_patient_name(self, obj):
        if obj.patient:
            name = f"{obj.patient.first_name} {obj.patient.last_name}".strip()
            return name if name else f"Patient #{obj.patient.id}"
        return "Unknown Patient"

    def validate(self, attrs):
        if not attrs.get('patient'):
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                profile = getattr(request.user, 'profile', None)
                if profile and profile.patient:
                    attrs['patient'] = profile.patient
            if not attrs.get('patient'):
                first_patient = Patient.objects.first()
                if first_patient:
                    attrs['patient'] = first_patient
                else:
                    raise serializers.ValidationError({"patient": "A valid patient is required. No patient records exist in the database."})
        return attrs