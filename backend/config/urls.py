from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/departments/', include('departments.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/laboratory/', include('laboratory.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/admissions/', include('admissions.urls')),
    path('api/staff/', include('staff.urls')),
    path('api/reports/', include('reports.urls')),

    # Chatbot
    path('api/chatbot/', include('chatbot.urls')),
]