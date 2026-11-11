import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import StaffLayout from "./pages/staff/StaffLayout";

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/auth/Login";
import PatientRegister from "./pages/auth/PatientRegister";
import Unauthorized from "./pages/auth/Unauthorized";
import AdminLogin from "./pages/admin/AdminLogin";
import StaffLogin from "./pages/staff/StaffLogin";
import PatientLogin from "./patient/PatientLogin";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminPatients from "./pages/admin/Patients";
import AdminDoctors from "./pages/admin/Doctors";
import AdminStaff from "./pages/admin/staff";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminAppointments from "./pages/admin/Appointments";
import AdminDepartments from "./pages/admin/Departments";
import AdminAdmissions from "./pages/admin/Admissions";
import AdminBilling from "./pages/admin/Billing";
import AdminLaboratory from "./pages/admin/Laboratory";
import AdminPharmacy from "./pages/admin/Pharmacy";
import AdminInventory from "./pages/admin/Inventory";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffPatients from "./pages/staff/Patients";
import StaffAppointments from "./pages/staff/Appointments";
import StaffProfile from "./pages/staff/Profile";

import PatientDashboard from "./patient/PatientDashboard";
import PatientProfile from "./patient/PatientProfile";
import PatientAppointments from "./patient/PatientAppointments";
import PatientPrescriptions from "./patient/PatientPrescriptions";

function App() {
  const admin = (page) => <ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout>{page}</AdminLayout></ProtectedRoute>;
  const staff = (page) => <ProtectedRoute allowedRoles={["DOCTOR", "NURSE"]}><StaffLayout>{page}</StaffLayout></ProtectedRoute>;
  const patient = (page) => <ProtectedRoute allowedRoles={["PATIENT"]}>{page}</ProtectedRoute>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PatientRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={admin(<AdminDashboard />)} />
        <Route path="/admin/patients" element={admin(<AdminPatients />)} />
        <Route path="/admin/doctors" element={admin(<AdminDoctors />)} />
        <Route path="/admin/staff" element={admin(<AdminStaff />)} />
        <Route path="/admin/users" element={admin(<AdminUserManagement />)} />
        <Route path="/admin/appointments" element={admin(<AdminAppointments />)} />
        <Route path="/admin/departments" element={admin(<AdminDepartments />)} />
        <Route path="/admin/admissions" element={admin(<AdminAdmissions />)} />
        <Route path="/admin/billing" element={admin(<AdminBilling />)} />
        <Route path="/admin/laboratory" element={admin(<AdminLaboratory />)} />
        <Route path="/admin/pharmacy" element={admin(<AdminPharmacy />)} />
        <Route path="/admin/inventory" element={admin(<AdminInventory />)} />
        <Route path="/admin/reports" element={admin(<AdminReports />)} />
        <Route path="/admin/settings" element={admin(<AdminSettings />)} />

        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={staff(<StaffDashboard />)} />
        <Route path="/staff/patients" element={staff(<StaffPatients />)} />
        <Route path="/staff/appointments" element={staff(<StaffAppointments />)} />
        <Route path="/staff/profile" element={staff(<StaffProfile />)} />

        <Route path="/doctor/dashboard" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/doctor-dashboard" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/nurse/dashboard" element={<Navigate to="/staff/dashboard" replace />} />

        <Route path="/patient" element={patient(<PatientDashboard />)} />
        <Route path="/patient/dashboard" element={patient(<PatientDashboard />)} />
        <Route path="/patient/appointments" element={patient(<PatientAppointments />)} />
        <Route path="/patient/prescriptions" element={patient(<PatientPrescriptions />)} />
        <Route path="/patient/profile" element={patient(<PatientProfile />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
