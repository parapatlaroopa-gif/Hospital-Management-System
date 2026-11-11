import os
import django
from datetime import date, time, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile, PatientAssignment
from patients.models import Patient, PatientVitals
from doctors.models import Doctor
from staff.models import Staff
from departments.models import Department
from appointments.models import Appointment
from admissions.models import Admission
from pharmacy.models import Medicine, Prescription
from laboratory.models import LabTest
from billing.models import Bill

def seed():
    print("[+] Seeding Comprehensive Hospital Management System Data...")

    # 1. DEPARTMENTS
    dept_names = [
        ("Cardiology", "Specializing in heart, cardiovascular health, and cardiology care."),
        ("Pediatrics", "Comprehensive child, infant, and adolescent medical care."),
        ("Neurology", "Advanced neurological diagnosis, brain, and nervous system care."),
        ("Orthopedics", "Bone, joint, spine, and musculoskeletal surgery & rehabilitation."),
        ("Emergency Medicine", "24/7 critical trauma, acute resuscitation, and emergency care."),
        ("Internal Medicine", "Diagnosis and treatment of adult acute and chronic diseases."),
    ]
    depts = {}
    for name, desc in dept_names:
        dept, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
        depts[name] = dept
    print(f"[OK] {len(depts)} Departments seeded.")


    # 2. MEDICINES
    meds_data = [
        ("Amoxicillin 500mg", "Capsule", "Pfizer Labs", 150, 45.00, date(2027, 12, 31)),
        ("Paracetamol 650mg", "Tablet", "GSK Pharma", 500, 15.00, date(2028, 5, 20)),
        ("Atorvastatin 20mg", "Tablet", "Sun Pharma", 200, 85.50, date(2027, 8, 15)),
        ("Metformin 500mg", "Tablet", "Cipla", 300, 30.00, date(2027, 10, 10)),
        ("Azithromycin 500mg", "Tablet", "Abbott", 120, 110.00, date(2026, 11, 28)),
        ("Cough Syrup DX", "Syrup", "Dabur Health", 80, 75.00, date(2027, 3, 14)),
        ("Insulin Glargine", "Injection", "Sanofi", 45, 450.00, date(2026, 12, 1)),
    ]
    medicines = {}
    for name, cat, mfg, qty, price, exp in meds_data:
        med, _ = Medicine.objects.get_or_create(
            name=name,
            defaults={
                'category': cat,
                'manufacturer': mfg,
                'quantity': qty,
                'price': price,
                'expiry_date': exp
            }
        )
        medicines[name] = med
    print(f"[OK] {len(medicines)} Medicines seeded.")


    # 3. DOCTORS (Entity + User Account)
    dr1_obj, _ = Doctor.objects.get_or_create(
        email="dr.smith@hospital.com",
        defaults={
            'first_name': "John",
            'last_name': "Smith",
            'specialization': "Cardiology",
            'phone': "+1 555-0102",
            'experience': 12,
            'room_number': "Cabin 302"
        }
    )

    dr2_obj, _ = Doctor.objects.get_or_create(
        email="dr.emily@hospital.com",
        defaults={
            'first_name': "Emily",
            'last_name': "Davis",
            'specialization': "Pediatrics",
            'phone': "+1 555-0105",
            'experience': 8,
            'room_number': "Cabin 204"
        }
    )

    # 4. NURSES / STAFF (Entity + User Account)
    nurse1_obj, _ = Staff.objects.get_or_create(
        email="nurse.sarah@hospital.com",
        defaults={
            'first_name': "Sarah",
            'last_name': "Jenkins",
            'role': "Nurse",
            'phone': "+1 555-0144",
            'salary': 42000.00,
            'joining_date': date(2024, 1, 15)
        }
    )

    nurse2_obj, _ = Staff.objects.get_or_create(
        email="nurse.michael@hospital.com",
        defaults={
            'first_name': "Michael",
            'last_name': "Chang",
            'role': "Nurse",
            'phone': "+1 555-0148",
            'salary': 40000.00,
            'joining_date': date(2024, 3, 10)
        }
    )

    # 5. PATIENTS (Entity + User Account)
    pat1_obj, _ = Patient.objects.get_or_create(
        phone="+1 555-0199",
        defaults={
            'first_name': "John",
            'last_name': "Doe",
            'age': 34,
            'gender': "Male",
            'address': "742 Evergreen Terrace, Springfield"
        }
    )

    pat2_obj, _ = Patient.objects.get_or_create(
        phone="+1 555-0188",
        defaults={
            'first_name': "Alice",
            'last_name': "Walker",
            'age': 28,
            'gender': "Female",
            'address': "124 Conch Street, Riverdale"
        }
    )

    # 6. USER ACCOUNTS WITH UNIFIED CREDENTIALS
    users_to_create = [
        # (username, email, password, first_name, last_name, role, is_superuser, doctor, staff, patient)
        ("admin@gmail.com", "admin@gmail.com", "admin123", "Hospital", "Administrator", "ADMIN", True, None, None, None),
        ("dr_smith", "dr.smith@hospital.com", "doctor123", "John", "Smith", "DOCTOR", False, dr1_obj, None, None),
        ("dr_emily", "dr.emily@hospital.com", "doctor123", "Emily", "Davis", "DOCTOR", False, dr2_obj, None, None),
        ("nurse_sarah", "nurse.sarah@hospital.com", "nurse123", "Sarah", "Jenkins", "NURSE", False, None, nurse1_obj, None),
        ("nurse_michael", "nurse.michael@hospital.com", "nurse123", "Michael", "Chang", "NURSE", False, None, nurse2_obj, None),
        ("patient_john", "patient.john@hospital.com", "patient123", "John", "Doe", "PATIENT", False, None, None, pat1_obj),
        ("patient_alice", "patient.alice@hospital.com", "patient123", "Alice", "Walker", "PATIENT", False, None, None, pat2_obj),
    ]

    for uname, email, pwd, fname, lname, role, is_super, doc, stf, pat in users_to_create:
        user = User.objects.filter(email__iexact=email).first() or User.objects.filter(username=uname).first()
        if not user:
            user = User.objects.create_user(
                username=uname,
                email=email,
                password=pwd,
                first_name=fname,
                last_name=lname,
                is_superuser=is_super,
                is_staff=is_super
            )
        else:
            user.set_password(pwd)
            user.first_name = fname
            user.last_name = lname
            user.is_superuser = is_super
            user.is_staff = is_super
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        if doc:
            profile.doctor = doc
        if stf:
            profile.staff = stf
        if pat:
            profile.patient = pat
        profile.save()
        print(f"[USER] User Account Ready: {email} / {pwd} [{role}]")


    # 7. APPOINTMENTS
    today = date.today()
    apt1, _ = Appointment.objects.get_or_create(
        patient=pat1_obj,
        doctor=dr1_obj,
        appointment_date=today,
        appointment_time=time(10, 30),
        defaults={
            'reason': "Follow-up ECG check and routine cardiac consultation.",
            'status': "Confirmed"
        }
    )

    apt2, _ = Appointment.objects.get_or_create(
        patient=pat2_obj,
        doctor=dr2_obj,
        appointment_date=today,
        appointment_time=time(11, 45),
        defaults={
            'reason': "Seasonal allergic rhinitis and routine wellness checkup.",
            'status': "Pending"
        }
    )

    apt3, _ = Appointment.objects.get_or_create(
        patient=pat1_obj,
        doctor=dr1_obj,
        appointment_date=today - timedelta(days=7),
        appointment_time=time(14, 0),
        defaults={
            'reason': "Initial consultation for chest discomfort after exertion.",
            'status': "Completed"
        }
    )
    print("[OK] Appointments ready.")

    # 8. ADMISSION
    adm1, _ = Admission.objects.get_or_create(
        patient=pat1_obj,
        room_number="ICU-Bed 04",
        defaults={
            'doctor': dr1_obj,
            'admission_date': today - timedelta(days=2),
            'status': "Admitted"
        }
    )
    print("[OK] Inpatient Admission ready.")

    # 9. PATIENT ASSIGNMENT
    ass1, _ = PatientAssignment.objects.get_or_create(
        patient=pat1_obj,
        doctor=dr1_obj,
        defaults={
            'nurse': nurse1_obj,
            'status': "Active",
            'notes': "Monitor continuous telemetry, vitals q4h, low sodium cardiac diet."
        }
    )
    print("[OK] Doctor-Nurse Patient Assignment ready.")

    # 10. PATIENT VITALS (Recorded by Nurse)
    vitals_records = [
        (pat1_obj, "122/80", 74, 98.4, 99, 104, 16, "Nurse Sarah Jenkins", "Patient resting comfortably, pulse regular."),
        (pat1_obj, "128/84", 80, 98.6, 98, 112, 18, "Nurse Sarah Jenkins", "Post-prandial vitals, no acute distress."),
        (pat2_obj, "118/76", 72, 98.2, 100, 95, 14, "Nurse Michael Chang", "Baseline vitals recorded prior to pediatric consult.")
    ]
    for p, bp, hr, tmp, sp, bs, rr, rec_by, nts in vitals_records:
        PatientVitals.objects.get_or_create(
            patient=p,
            blood_pressure=bp,
            heart_rate=hr,
            temperature=tmp,
            defaults={
                'spo2': sp,
                'blood_sugar': bs,
                'respiratory_rate': rr,
                'recorded_by': rec_by,
                'notes': nts
            }
        )
    print("[OK] Patient Vitals recorded.")

    # 11. PRESCRIPTIONS
    prescriptions_data = [
        (pat1_obj, medicines["Atorvastatin 20mg"], "20mg", "Once daily at bedtime", "30 days", "Take after dinner with water."),
        (pat1_obj, medicines["Paracetamol 650mg"], "650mg", "As needed (SOS)", "5 days", "Take if body temperature > 100°F or headache."),
        (pat2_obj, medicines["Amoxicillin 500mg"], "500mg", "Twice daily (1-0-1)", "7 days", "Complete the full antibiotic course."),
    ]
    for p, m, dos, freq, dur, inst in prescriptions_data:
        Prescription.objects.get_or_create(
            patient=p,
            medicine=m,
            dosage=dos,
            defaults={
                'frequency': freq,
                'duration': dur,
                'instructions': inst
            }
        )
    print("[OK] Prescriptions ready.")

    # 12. LABORATORY TESTS
    lab_data = [
        (pat1_obj, "Comprehensive Cardiac Panel", "Troponin negative, CK-MB within normal limits.", today - timedelta(days=1), "Completed"),
        (pat1_obj, "Lipid Profile", "Serum cholesterol: 185 mg/dL, HDL: 48, LDL: 110.", today - timedelta(days=2), "Completed"),
        (pat2_obj, "Complete Blood Count (CBC)", "Awaiting lab processing.", today, "Pending"),
    ]
    for p, tname, tres, tdate, stat in lab_data:
        LabTest.objects.get_or_create(
            patient=p,
            test_name=tname,
            defaults={
                'test_result': tres,
                'test_date': tdate,
                'status': stat
            }
        )
    print("[OK] Laboratory tests ready.")

    # 13. BILLING
    bills_data = [
        (pat1_obj, "INV-2026-001", 1500.00, 850.00, 1200.00, 3550.00, "Pending"),
        (pat2_obj, "INV-2026-002", 800.00, 350.00, 0.00, 1150.00, "Paid"),
    ]
    for p, bnum, cfee, mfee, lfee, tot, pstat in bills_data:
        Bill.objects.get_or_create(
            bill_number=bnum,
            defaults={
                'patient': p,
                'consultation_fee': cfee,
                'medicine_fee': mfee,
                'lab_fee': lfee,
                'total_amount': tot,
                'payment_status': pstat
            }
        )
    print("[OK] Billing invoices ready.")

    print("\nHMS Demo Database Seeding Successfully Completed!")
    print("-------------------------------------------------------")
    print("Standard Demo Logins:")
    print("  Admin:   admin@gmail.com      / admin123")
    print("  Doctor:  dr.smith@hospital.com / doctor123")
    print("  Nurse:   nurse.sarah@hospital.com / nurse123")
    print("  Patient: patient.john@hospital.com / patient123")
    print("-------------------------------------------------------")


if __name__ == '__main__':
    seed()
