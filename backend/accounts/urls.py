from django.urls import path
from .views import (
    LoginView,
    PatientRegisterView,
    RecruitStaffView,
    MeView,
    UserListView,
    UserToggleActiveView,
    UserDetailDestroyView,
    PatientAssignmentListCreateView,
    PatientAssignmentDetailView,
    AdminCredentialsView,
)

urlpatterns = [
    # Auth endpoints
    path('login/', LoginView.as_view(), name='account-login'),
    path('register/', PatientRegisterView.as_view(), name='account-register'),
    path('me/', MeView.as_view(), name='account-me'),

    # Admin staff recruitment & user management
    path('recruit-staff/', RecruitStaffView.as_view(), name='recruit-staff'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailDestroyView.as_view(), name='user-detail-destroy'),
    path('users/<int:pk>/toggle/', UserToggleActiveView.as_view(), name='user-toggle'),

    path(
    'admin/credentials/',
    AdminCredentialsView.as_view(),
    name='admin-credentials'
),

    # Doctor patient-nurse assignments
    path('assignments/', PatientAssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('assignments/<int:pk>/', PatientAssignmentDetailView.as_view(), name='assignment-detail'),
]