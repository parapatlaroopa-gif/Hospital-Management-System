from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabTestViewSet


router = DefaultRouter()


router.register(
    'tests',
    LabTestViewSet
)


urlpatterns = [
    path('', include(router.urls)),
]