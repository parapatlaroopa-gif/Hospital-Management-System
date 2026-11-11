from rest_framework import viewsets
from accounts.permissions import IsAdmin, IsHospitalUser
from .models import Staff
from .serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by("first_name", "last_name")
    serializer_class = StaffSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsHospitalUser()]
        return [IsAdmin()]
