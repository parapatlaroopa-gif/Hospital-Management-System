from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, PatientAssignment
from patients.models import Patient
from doctors.models import Doctor
from staff.models import Staff
from datetime import date


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    phone = serializers.CharField(source='profile.phone', read_only=True)
    patient_id = serializers.IntegerField(source='profile.patient.id', read_only=True)
    doctor_id = serializers.IntegerField(source='profile.doctor.id', read_only=True)
    staff_id = serializers.IntegerField(source='profile.staff.id', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'patient_id', 'doctor_id', 'staff_id',
            'is_active', 'date_joined'
        ]


class PatientRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(max_length=20)
    age = serializers.IntegerField(min_value=0, max_value=150)
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'])
    address = serializers.CharField(allow_blank=True, required=False)

    def validate_email(self, value):
        if User.objects.filter(username__iexact=value).exists() or User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        patient = Patient.objects.create(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            age=validated_data['age'],
            gender=validated_data['gender'],
            phone=validated_data['phone'],
            address=validated_data.get('address', '')
        )

        # Profile is auto-created by signal, update it:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'PATIENT'
        profile.phone = validated_data['phone']
        profile.patient = patient
        profile.save()

        return user


class RecruitStaffSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['DOCTOR', 'NURSE', 'PATIENT', 'ADMIN'])
    phone = serializers.CharField(max_length=20)
    # Doctor specific fields
    specialization = serializers.CharField(required=False, allow_blank=True, default="General Physician")
    experience = serializers.IntegerField(required=False, default=1, allow_null=True)
    room_number = serializers.CharField(required=False, allow_blank=True, default="")
    # Staff / Nurse specific fields
    salary = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=35000.00, allow_null=True)
    joining_date = serializers.DateField(required=False, default=date.today, allow_null=True)
    # Patient specific fields
    age = serializers.IntegerField(required=False, default=30, allow_null=True)
    gender = serializers.CharField(required=False, default="Other")
    address = serializers.CharField(required=False, allow_blank=True, default="Hospital Registered Patient")

    def validate_email(self, value):
        if User.objects.filter(username__iexact=value).exists() or User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        role = validated_data['role']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.phone = validated_data['phone']

        if role == 'DOCTOR':
            doctor = Doctor.objects.filter(email__iexact=email).first()
            if not doctor:
                doctor = Doctor.objects.create(
                    first_name=validated_data['first_name'],
                    last_name=validated_data['last_name'],
                    specialization=validated_data.get('specialization', 'General Physician') or 'General Physician',
                    phone=str(validated_data['phone'])[:15],
                    email=email,
                    experience=int(validated_data.get('experience') or 1),
                    room_number=str(validated_data.get('room_number', ''))[:20] if validated_data.get('room_number') else ''
                )
            else:
                doctor.first_name = validated_data['first_name']
                doctor.last_name = validated_data['last_name']
                doctor.specialization = validated_data.get('specialization', doctor.specialization) or doctor.specialization
                doctor.phone = str(validated_data['phone'])[:15]
                doctor.experience = int(validated_data.get('experience') or doctor.experience or 1)
                doctor.room_number = str(validated_data.get('room_number', doctor.room_number or ''))[:20]
                doctor.save()
            profile.doctor = doctor
        elif role == 'NURSE':
            nurse = Staff.objects.filter(email__iexact=email).first()
            if not nurse:
                nurse = Staff.objects.create(
                    first_name=validated_data['first_name'],
                    last_name=validated_data['last_name'],
                    role='Nurse',
                    phone=str(validated_data['phone'])[:15],
                    email=email,
                    salary=float(validated_data.get('salary') or 35000.00),
                    joining_date=validated_data.get('joining_date') or date.today()
                )
            else:
                nurse.first_name = validated_data['first_name']
                nurse.last_name = validated_data['last_name']
                nurse.phone = str(validated_data['phone'])[:15]
                nurse.salary = float(validated_data.get('salary') or nurse.salary or 35000.00)
                nurse.save()
            profile.staff = nurse
        elif role == 'PATIENT':
            patient = Patient.objects.create(
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                age=int(validated_data.get('age') or 30),
                gender=validated_data.get('gender', 'Other'),
                phone=str(validated_data['phone'])[:15],
                address=validated_data.get('address', 'Hospital Registered Patient')
            )
            profile.patient = patient
        elif role == 'ADMIN':
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=['is_staff', 'is_superuser'])

        profile.save()
        user.profile = profile
        return user


class PatientAssignmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    nurse_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientAssignment
        fields = [
            'id', 'patient', 'doctor', 'nurse',
            'patient_name', 'doctor_name', 'nurse_name',
            'assigned_date', 'status', 'notes', 'created_at'
        ]
        extra_kwargs = {
            'doctor': {'required': False},
            'nurse': {'required': False},
            'status': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        profile = getattr(user, 'profile', None)

        if not attrs.get('doctor'):
            if profile and profile.role == 'DOCTOR' and profile.doctor:
                attrs['doctor'] = profile.doctor
            elif profile and profile.doctor:
                attrs['doctor'] = profile.doctor
            else:
                from doctors.models import Doctor
                doc = Doctor.objects.first()
                if doc:
                    attrs['doctor'] = doc

        if not attrs.get('doctor'):
            raise serializers.ValidationError({'doctor': 'A doctor must be assigned to this clinical duty.'})

        return attrs

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return ""

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"
        return "Unassigned"

    def get_nurse_name(self, obj):
        if obj.nurse:
            return f"{obj.nurse.first_name} {obj.nurse.last_name}"
        return "Unassigned Staff"