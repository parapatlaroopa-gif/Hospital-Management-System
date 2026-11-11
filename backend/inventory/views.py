from rest_framework import viewsets
from .models import InventoryItem
from .serializers import InventorySerializer


class InventoryViewSet(viewsets.ModelViewSet):

    queryset = InventoryItem.objects.all()

    serializer_class = InventorySerializer