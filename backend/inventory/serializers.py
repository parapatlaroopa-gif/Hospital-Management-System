from rest_framework import serializers
from .models import InventoryItem


class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = InventoryItem
        fields = '__all__'