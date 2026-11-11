from django.db import models


class InventoryItem(models.Model):

    CATEGORY_CHOICES = (
        ('Equipment', 'Equipment'),
        ('Surgical', 'Surgical'),
        ('Medical Supply', 'Medical Supply'),
        ('Other', 'Other'),
    )


    item_name = models.CharField(
        max_length=100
    )


    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )


    supplier = models.CharField(
        max_length=100
    )


    quantity = models.IntegerField()


    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    availability = models.BooleanField(
        default=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.item_name