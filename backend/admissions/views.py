from rest_framework import viewsets
from .models import Admission
from .serializers import AdmissionSerializer


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer