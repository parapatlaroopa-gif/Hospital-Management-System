from rest_framework import viewsets
from accounts.permissions import IsAdmin, IsHospitalUser
from .models import Doctor
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("first_name", "last_name")
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsHospitalUser()]
        return [IsAdmin()]

