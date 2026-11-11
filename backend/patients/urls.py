
from django.urls import path

from .views import (
    PatientListCreateView,
    PatientDetailView,
    PatientVitalsListCreateView,
    PatientVitalsDetailView,
)


urlpatterns = [
    # Get all patients / Add new patient
    path(
        "",
        PatientListCreateView.as_view(),
        name="patient-list",
    ),

    # Patient Vitals endpoints
    path(
        "vitals/",
        PatientVitalsListCreateView.as_view(),
        name="patient-vitals-list",
    ),
    path(
        "vitals/<int:pk>/",
        PatientVitalsDetailView.as_view(),
        name="patient-vitals-detail",
    ),

    # Get one patient / Edit / Delete
    path(
        "<int:pk>/",
        PatientDetailView.as_view(),
        name="patient-detail",
    ),
]


