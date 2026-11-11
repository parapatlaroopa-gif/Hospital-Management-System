from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet

router = DefaultRouter()

router.register(
    '',
    BillViewSet,
    basename='billing'
)

urlpatterns = [
    path('', include(router.urls)),
]