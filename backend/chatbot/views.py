
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from admissions.models import Admission

from .symptom_mapping import SYMPTOM_SPECIALIZATION_MAP


@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot(request):


    message = request.data.get("message", "").strip().lower()

    if not message:
        return Response({
            "reply": "Please enter a message."
        })

    # --------------------------------------------------
    # PATIENTS
    # --------------------------------------------------

    if "patient" in message:

        count = Patient.objects.count()

        return Response({
            "reply": f"There are {count} patients in the hospital system."
        })

    # --------------------------------------------------
    # DOCTORS
    # --------------------------------------------------

    if "doctor" in message or "cardiologist" in message:

        # Search specifically for Cardiologist
        if "cardiologist" in message:

            doctors = Doctor.objects.filter(
                specialization="Cardiologist"
            )

            if doctors.exists():

                doctor_details = []

                for doctor in doctors:

                    doctor_name = (
                        f"Dr. {doctor.first_name} {doctor.last_name}"
                    )

                    room = doctor.room_number or "Room not assigned"

                    doctor_details.append(
                        f"{doctor_name} - "
                        f"Cardiologist - "
                        f"Room {room}"
                    )

                return Response({
                    "reply": (
                        "Yes, we have the following "
                        "Cardiologist(s):\n\n"
                        + "\n".join(doctor_details)
                    )
                })

            return Response({
                "reply": "No Cardiologist is currently available."
            })

        # General doctor count
        count = Doctor.objects.count()

        return Response({
            "reply": (
                f"There are {count} doctors "
                f"in the hospital system."
            )
        })

    # --------------------------------------------------
    # APPOINTMENTS
    # --------------------------------------------------

    if "appointment" in message:

        count = Appointment.objects.count()

        return Response({
            "reply": (
                f"There are {count} appointments "
                f"in the hospital system."
            )
        })

    # --------------------------------------------------
    # ADMISSIONS
    # --------------------------------------------------

    if "admission" in message:

        count = Admission.objects.count()

        return Response({
            "reply": (
                f"There are {count} admissions "
                f"in the hospital system."
            )
        })

    # --------------------------------------------------
    # SYMPTOM DETECTION + DOCTOR SEARCH
    # --------------------------------------------------

    for symptom, specialization in SYMPTOM_SPECIALIZATION_MAP.items():

        if symptom in message:

            # Search doctors from actual database
            doctors = Doctor.objects.filter(
                specialization=specialization
            )

            # If doctors are available
            if doctors.exists():

                doctor_details = []

                for doctor in doctors:

                    doctor_name = (
                        f"Dr. {doctor.first_name} "
                        f"{doctor.last_name}"
                    )

                    room = (
                        doctor.room_number
                        if doctor.room_number
                        else "Room not assigned"
                    )

                    doctor_details.append(
                        f"Doctor: {doctor_name}\n"
                        f"Specialization: {specialization}\n"
                        f"Room: {room}"
                    )

                return Response({
                    "reply": (
                        f"For your symptom '{symptom}', "
                        f"you can consult a "
                        f"{specialization}.\n\n"
                        + "\n\n".join(doctor_details)
                    )
                })

            # If no doctor is available
            return Response({
                "reply": (
                    f"For your symptom '{symptom}', "
                    f"a {specialization} may be appropriate, "
                    f"but no {specialization} is currently "
                    f"available in the hospital system."
                )
            })

    # --------------------------------------------------
    # DEFAULT RESPONSE
    # --------------------------------------------------

    return Response({
        "reply": (
            "I can help you with patients, doctors, "
            "appointments, admissions, and common symptoms."
        )
    })

