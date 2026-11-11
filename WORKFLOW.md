# Hospital Management System — Role-Based Workflow

## Updated workflow

The project now uses a strict role-based workflow:

### 1. Admin
Admin accounts can:
- Sign in only to the Admin Portal.
- Add doctors **with a doctor login email and password**.
- Add nursing/clinical staff **with a staff login email and password**.
- Enable/disable user accounts.
- Manage patients and doctor appointments.
- Manage the hospital operational modules already present in the project.

### 2. Doctor
A doctor account can see only doctor-required pages:
- Dashboard
- My Appointments
- My Patients
- My Profile

Doctor data is filtered by the logged-in doctor's linked account. A doctor cannot open the admin portal or another doctor's workspace.

Doctor workflow:
1. Patient books an appointment.
2. The appointment appears in that doctor's queue.
3. Doctor confirms the appointment.
4. Doctor completes the consultation.
5. Appointment status is stored as Completed.

### 3. Staff / Nurse
A nursing staff account can see only:
- Dashboard
- Assigned Patients
- Appointments
- My Profile

Nursing data is filtered by the nurse's patient assignments. Nurses can record patient vitals from the dashboard.

### 4. Patient
Patients can:
- Register a new account.
- Log in with their own credentials.
- See only their own dashboard/profile.
- View their own doctor appointments.
- Book an appointment by selecting a doctor, date, time and reason.
- Cancel their own appointment.

The patient API automatically associates a booking with the authenticated patient account; the browser cannot choose another patient's ID.

## Security/workflow changes

- Replaced the fake `token-<id>-<username>` login value with Django REST Framework token authentication.
- Added backend role permissions; frontend route protection is no longer the only security layer.
- Removed the old frontend behavior where an Admin could enter Doctor/Nurse/Patient portals.
- Added server-side filtering for patients, appointments, vitals, assignments and doctor access.
- Doctor appointment slots are unique per doctor/date/time.
- Past appointment dates are rejected.
- Patients can only cancel their own appointments.
- Doctors/nurses can only change appointment status.
- Admin-only management endpoints are protected on the backend.
- Removed unnecessary staff/patient navigation pages from the active workflow.

## Run

Backend:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python seed_demo_data.py
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://127.0.0.1:8000/api/`.

## Demo accounts from seed_demo_data.py

- Admin: `admin@gmail.com` / `admin123`
- Doctor: `dr.smith@hospital.com` / `doctor123`
- Nurse: `nurse.sarah@hospital.com` / `nurse123`
- Patient: `patient.john@hospital.com` / `patient123`

Run the seed script after migrations if the database does not already contain these demo records.
