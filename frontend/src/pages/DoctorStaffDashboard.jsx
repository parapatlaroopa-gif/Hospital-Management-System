import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import "./DoctorStaffDashboard.css";

function DoctorStaffDashboard() {
  const location = useLocation();

  // Decide dashboard based on URL
  const isDoctor = location.pathname === "/doctor-dashboard";
  const isStaff = location.pathname === "/staff-dashboard";

  // -----------------------------
  // State
  // -----------------------------
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [laboratory, setLaboratory] = useState([]);

  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Load data from Django
  // -----------------------------
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          api.get("patients/"),
          api.get("doctors/"),
          api.get("staff/"),
          api.get("appointments/"),
          api.get("admissions/"),
          api.get("laboratory/tests/"),
        ]);

        // Patients
        if (results[0].status === "fulfilled") {
          setPatients(getResults(results[0].value));
        }

        // Doctors
        if (results[1].status === "fulfilled") {
          setDoctors(getResults(results[1].value));
        }

        // Staff
        if (results[2].status === "fulfilled") {
          setStaff(getResults(results[2].value));
        }

        // Appointments
        if (results[3].status === "fulfilled") {
          setAppointments(getResults(results[3].value));
        }

        // Admissions
        if (results[4].status === "fulfilled") {
          setAdmissions(getResults(results[4].value));
        }

        // Laboratory
        if (results[5].status === "fulfilled") {
          setLaboratory(getResults(results[5].value));
        }
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // -----------------------------
  // Helper
  // -----------------------------
  const getResults = (response) => {
    if (!response || !response.data) {
      return [];
    }

    // Django REST Framework pagination
    if (Array.isArray(response.data.results)) {
      return response.data.results;
    }

    // Normal array response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  };

  // -----------------------------
  // Appointment helpers
  // -----------------------------
  const getAppointmentPatient = (appointment) => {
    if (!appointment) return "Patient";

    if (
      typeof appointment.patient === "object" &&
      appointment.patient !== null
    ) {
      return (
        appointment.patient.name ||
        `${appointment.patient.first_name || ""} ${
          appointment.patient.last_name || ""
        }`.trim() ||
        "Patient"
      );
    }

    return (
      appointment.patient_name ||
      appointment.patientName ||
      appointment.patient ||
      "Patient"
    );
  };

  const getAppointmentDoctor = (appointment) => {
    if (!appointment) return "Doctor";

    if (
      typeof appointment.doctor === "object" &&
      appointment.doctor !== null
    ) {
      return (
        appointment.doctor.name ||
        `${appointment.doctor.first_name || ""} ${
          appointment.doctor.last_name || ""
        }`.trim() ||
        "Doctor"
      );
    }

    return (
      appointment.doctor_name ||
      appointment.doctorName ||
      appointment.doctor ||
      "Doctor"
    );
  };

  const getAppointmentTime = (appointment) => {
    return (
      appointment.time ||
      appointment.appointment_time ||
      appointment.start_time ||
      "--:--"
    );
  };

  const getAppointmentDate = (appointment) => {
    return (
      appointment.date ||
      appointment.appointment_date ||
      appointment.scheduled_date ||
      ""
    );
  };

  // -----------------------------
  // Status helpers
  // -----------------------------
  const getStatus = (item) => {
    return (
      item?.status ||
      item?.appointment_status ||
      item?.state ||
      "Pending"
    );
  };

  const normalizeStatus = (status) => {
    return String(status || "").toLowerCase();
  };

  // -----------------------------
  // Doctor statistics
  // -----------------------------
  const doctorAppointments = appointments.filter((appointment) => {
    // Currently showing all appointments.
    // Later this can be filtered by logged-in doctor ID.
    return true;
  });

  const doctorPending = doctorAppointments.filter((appointment) => {
    const status = normalizeStatus(getStatus(appointment));

    return (
      status === "pending" ||
      status === "scheduled" ||
      status === "confirmed"
    );
  }).length;

  const doctorCompleted = doctorAppointments.filter((appointment) => {
    const status = normalizeStatus(getStatus(appointment));

    return (
      status === "completed" ||
      status === "complete" ||
      status === "done"
    );
  }).length;

  // -----------------------------
  // Staff statistics
  // -----------------------------
  const nurses = staff.filter((member) => {
    const role = String(member.role || "").toLowerCase();
    return role.includes("nurse");
  }).length;

  const receptionists = staff.filter((member) => {
    const role = String(member.role || "").toLowerCase();

    return (
      role.includes("reception") ||
      role.includes("front desk")
    );
  }).length;

  const labTechnicians = staff.filter((member) => {
    const role = String(member.role || "").toLowerCase();

    return (
      role.includes("lab") ||
      role.includes("technician")
    );
  }).length;

  // -----------------------------
  // Dashboard title
  // -----------------------------
  const dashboardTitle = isDoctor
    ? "Doctor Dashboard"
    : "Staff Dashboard";

  const dashboardSubtitle = isDoctor
    ? "Manage your appointments, patients and medical activities."
    : "Manage hospital activities, patients and daily tasks.";

  // -----------------------------
  // Loading screen
  // -----------------------------
  if (loading) {
    return (
      <div className="ds-dashboard">
        <div className="ds-loading">
          <div className="ds-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DOCTOR DASHBOARD
  // ==========================================================
  if (isDoctor) {
    return (
      <div className="ds-dashboard">

        {/* Header */}
        <div className="ds-header">
          <div>
            <p className="ds-small-title">
              MEDICAL PORTAL
            </p>

            <h1>
              <span className="ds-icon">👨‍⚕️</span>
              {dashboardTitle}
            </h1>

            <p className="ds-subtitle">
              {dashboardSubtitle}
            </p>
          </div>

          <div className="ds-profile">
            <div className="ds-profile-icon">
              DR
            </div>

            <div>
              <strong>Doctor</strong>
              <span>Medical Staff</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="ds-stat-grid">

          <div className="ds-stat-card">
            <div className="ds-stat-icon blue">
              👥
            </div>

            <div>
              <p>Total Patients</p>
              <h2>{patients.length}</h2>
              <span>Registered patients</span>
            </div>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon purple">
              📅
            </div>

            <div>
              <p>Appointments</p>
              <h2>{doctorAppointments.length}</h2>
              <span>Scheduled appointments</span>
            </div>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon orange">
              ⏳
            </div>

            <div>
              <p>Pending</p>
              <h2>{doctorPending}</h2>
              <span>Need attention</span>
            </div>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon green">
              ✓
            </div>

            <div>
              <p>Completed</p>
              <h2>{doctorCompleted}</h2>
              <span>Completed consultations</span>
            </div>
          </div>

        </div>

        {/* Main content */}
        <div className="ds-main-grid">

          {/* Today's appointments */}
          <div className="ds-card ds-large-card">

            <div className="ds-card-header">

              <div>
                <h2>Today's Appointments</h2>
                <p>Your scheduled patient appointments</p>
              </div>

              {/* STAFF ROUTE */}
              <Link
                to="/staff/appointments"
                className="ds-view-link"
              >
                View All
              </Link>

            </div>

            {doctorAppointments.length === 0 ? (
              <div className="ds-empty">
                <div>📅</div>
                <p>No appointments available.</p>
              </div>
            ) : (
              <div className="ds-appointment-list">

                {doctorAppointments
                  .slice(0, 6)
                  .map((appointment, index) => {

                    const status = getStatus(appointment);

                    return (
                      <div
                        className="ds-appointment"
                        key={appointment.id || index}
                      >

                        <div className="ds-time">
                          <strong>
                            {getAppointmentTime(appointment)}
                          </strong>

                          <span>
                            {getAppointmentDate(appointment)}
                          </span>
                        </div>

                        <div className="ds-patient-avatar">
                          {getAppointmentPatient(appointment)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="ds-appointment-info">

                          <strong>
                            {getAppointmentPatient(appointment)}
                          </strong>

                          <span>
                            Doctor: {getAppointmentDoctor(appointment)}
                          </span>

                        </div>

                        <span
                          className={`ds-status ${normalizeStatus(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>
                    );
                  })}

              </div>
            )}

          </div>

          {/* Quick actions */}
          <div className="ds-card">

            <div className="ds-card-header">

              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used modules</p>
              </div>

            </div>

            <div className="ds-quick-grid">

              {/* STAFF PATIENTS */}
              <Link
                to="/staff/patients"
                className="ds-quick-action"
              >
                <span>👥</span>

                <div>
                  <strong>Patients</strong>
                  <small>
                    Manage patient information
                  </small>
                </div>
              </Link>

              {/* STAFF APPOINTMENTS */}
              <Link
                to="/staff/appointments"
                className="ds-quick-action"
              >
                <span>📅</span>

                <div>
                  <strong>Appointments</strong>
                  <small>
                    View appointments
                  </small>
                </div>
              </Link>

              {/* STAFF ADMISSIONS */}
              <Link
                to="/staff/admissions"
                className="ds-quick-action"
              >
                <span>🏥</span>

                <div>
                  <strong>Admissions</strong>
                  <small>
                    Manage admissions
                  </small>
                </div>
              </Link>

              {/* STAFF LABORATORY */}
              <Link
                to="/staff/laboratory"
                className="ds-quick-action"
              >
                <span>🧪</span>

                <div>
                  <strong>Laboratory</strong>
                  <small>
                    View laboratory tests
                  </small>
                </div>
              </Link>

            </div>

          </div>

        </div>

        {/* Recent appointments */}
        <div className="ds-card">

          <div className="ds-card-header">

            <div>
              <h2>Recent Appointments</h2>
              <p>Latest scheduled appointments</p>
            </div>

            {/* STAFF ROUTE */}
            <Link
              to="/staff/appointments"
              className="ds-view-link"
            >
              View All
            </Link>

          </div>

          {appointments.length === 0 ? (
            <div className="ds-empty">
              <div>📅</div>
              <p>No appointments available.</p>
            </div>
          ) : (
            <div className="ds-appointment-list">

              {appointments
                .slice(0, 5)
                .map((appointment, index) => {

                  const status = getStatus(appointment);

                  return (
                    <div
                      className="ds-appointment"
                      key={appointment.id || index}
                    >

                      <div className="ds-time">

                        <strong>
                          {getAppointmentTime(appointment)}
                        </strong>

                        <span>
                          {getAppointmentDate(appointment)}
                        </span>

                      </div>

                      <div className="ds-patient-avatar">
                        {getAppointmentPatient(appointment)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="ds-appointment-info">

                        <strong>
                          {getAppointmentPatient(appointment)}
                        </strong>

                        <span>
                          Doctor: {getAppointmentDoctor(appointment)}
                        </span>

                      </div>

                      <span
                        className={`ds-status ${normalizeStatus(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                    </div>
                  );
                })}

            </div>
          )}

        </div>

      </div>
    );
  }

  // ==========================================================
  // STAFF DASHBOARD
  // ==========================================================
  if (isStaff) {
    return (
      <div className="ds-dashboard">

        {/* Header */}
        <div className="ds-header">

          <div>
            <p className="ds-small-title">
              HOSPITAL STAFF PORTAL
            </p>

            <h1>
              <span className="ds-icon">👩‍⚕️</span>
              {dashboardTitle}
            </h1>

            <p className="ds-subtitle">
              {dashboardSubtitle}
            </p>
          </div>

          <div className="ds-profile">

            <div className="ds-profile-icon">
              ST
            </div>

            <div>
              <strong>Staff</strong>
              <span>Hospital Staff</span>
            </div>

          </div>

        </div>

        {/* Statistics */}
        <div className="ds-stat-grid">

          <div className="ds-stat-card">

            <div className="ds-stat-icon blue">
              👥
            </div>

            <div>
              <p>Total Staff</p>
              <h2>{staff.length}</h2>
              <span>Hospital employees</span>
            </div>

          </div>

          <div className="ds-stat-card">

            <div className="ds-stat-icon purple">
              👩‍⚕️
            </div>

            <div>
              <p>Nurses</p>
              <h2>{nurses}</h2>
              <span>Nursing staff</span>
            </div>

          </div>

          <div className="ds-stat-card">

            <div className="ds-stat-icon orange">
              🧑‍💼
            </div>

            <div>
              <p>Receptionists</p>
              <h2>{receptionists}</h2>
              <span>Front desk staff</span>
            </div>

          </div>

          <div className="ds-stat-card">

            <div className="ds-stat-icon green">
              🧪
            </div>

            <div>
              <p>Lab Technicians</p>
              <h2>{labTechnicians}</h2>
              <span>Laboratory staff</span>
            </div>

          </div>

        </div>

        {/* Activity + Overview */}
        <div className="ds-main-grid">

          {/* Hospital activity */}
          <div className="ds-card ds-large-card">

            <div className="ds-card-header">

              <div>
                <h2>Today's Hospital Activity</h2>
                <p>
                  Overview of today's hospital operations
                </p>
              </div>

            </div>

            <div className="ds-activity-list">

              <div className="ds-activity-row">

                <div className="ds-activity-icon blue">
                  👥
                </div>

                <div className="ds-activity-info">
                  <strong>Patients</strong>
                  <span>Registered patients</span>
                </div>

                <strong className="ds-activity-number">
                  {patients.length}
                </strong>

              </div>

              <div className="ds-activity-row">

                <div className="ds-activity-icon purple">
                  📅
                </div>

                <div className="ds-activity-info">
                  <strong>Appointments</strong>
                  <span>Scheduled appointments</span>
                </div>

                <strong className="ds-activity-number">
                  {appointments.length}
                </strong>

              </div>

              <div className="ds-activity-row">

                <div className="ds-activity-icon orange">
                  🏥
                </div>

                <div className="ds-activity-info">
                  <strong>Admissions</strong>
                  <span>Patient admissions</span>
                </div>

                <strong className="ds-activity-number">
                  {admissions.length}
                </strong>

              </div>

              <div className="ds-activity-row">

                <div className="ds-activity-icon green">
                  🧪
                </div>

                <div className="ds-activity-info">
                  <strong>Laboratory</strong>
                  <span>Laboratory tests</span>
                </div>

                <strong className="ds-activity-number">
                  {laboratory.length}
                </strong>

              </div>

            </div>

          </div>

          {/* Staff information */}
          <div className="ds-card">

            <div className="ds-card-header">

              <div>
                <h2>Staff Information</h2>
                <p>
                  Hospital workforce overview
                </p>
              </div>

            </div>

            <div className="ds-staff-summary">

              <div className="ds-summary-box">
                <span>Doctors</span>
                <strong>{doctors.length}</strong>
              </div>

              <div className="ds-summary-box">
                <span>Staff</span>
                <strong>{staff.length}</strong>
              </div>

              <div className="ds-summary-box">
                <span>Patients</span>
                <strong>{patients.length}</strong>
              </div>

              <div className="ds-summary-box">
                <span>Admissions</span>
                <strong>{admissions.length}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* Recent appointments */}
        <div className="ds-card">

          <div className="ds-card-header">

            <div>
              <h2>Recent Appointments</h2>
              <p>
                Latest scheduled appointments
              </p>
            </div>

            {/* STAFF ROUTE */}
            <Link
              to="/staff/appointments"
              className="ds-view-link"
            >
              View All
            </Link>

          </div>

          {appointments.length === 0 ? (
            <div className="ds-empty">
              <div>📅</div>
              <p>No appointments available.</p>
            </div>
          ) : (
            <div className="ds-appointment-list">

              {appointments
                .slice(0, 5)
                .map((appointment, index) => {

                  const status = getStatus(appointment);

                  return (
                    <div
                      className="ds-appointment"
                      key={appointment.id || index}
                    >

                      <div className="ds-time">

                        <strong>
                          {getAppointmentTime(appointment)}
                        </strong>

                        <span>
                          {getAppointmentDate(appointment)}
                        </span>

                      </div>

                      <div className="ds-patient-avatar">
                        {getAppointmentPatient(appointment)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="ds-appointment-info">

                        <strong>
                          {getAppointmentPatient(appointment)}
                        </strong>

                        <span>
                          Doctor: {getAppointmentDoctor(appointment)}
                        </span>

                      </div>

                      <span
                        className={`ds-status ${normalizeStatus(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                    </div>
                  );
                })}

            </div>
          )}

        </div>

        {/* Quick Actions */}
        <div className="ds-card ds-quick-card">

          <div className="ds-card-header">

            <div>
              <h2>Quick Actions</h2>
              <p>
                Access frequently used hospital modules
              </p>
            </div>

          </div>

          <div className="ds-quick-grid">

            {/* STAFF PATIENTS */}
            <Link
              to="/staff/patients"
              className="ds-quick-action"
            >
              <span>👥</span>

              <div>
                <strong>Patients</strong>
                <small>
                  Manage patient information
                </small>
              </div>
            </Link>

            {/* STAFF APPOINTMENTS */}
            <Link
              to="/staff/appointments"
              className="ds-quick-action"
            >
              <span>📅</span>

              <div>
                <strong>Appointments</strong>
                <small>
                  View appointments
                </small>
              </div>
            </Link>

            {/* STAFF ADMISSIONS */}
            <Link
              to="/staff/admissions"
              className="ds-quick-action"
            >
              <span>🏥</span>

              <div>
                <strong>Admissions</strong>
                <small>
                  Manage admissions
                </small>
              </div>
            </Link>

            {/* STAFF LABORATORY */}
            <Link
              to="/staff/laboratory"
              className="ds-quick-action"
            >
              <span>🧪</span>

              <div>
                <strong>Laboratory</strong>
                <small>
                  View laboratory tests
                </small>
              </div>
            </Link>

            {/* STAFF PHARMACY */}
            <Link
              to="/staff/pharmacy"
              className="ds-quick-action"
            >
              <span>💊</span>

              <div>
                <strong>Pharmacy</strong>
                <small>
                  Manage pharmacy
                </small>
              </div>
            </Link>

            {/* STAFF INVENTORY */}
            <Link
              to="/staff/inventory"
              className="ds-quick-action"
            >
              <span>📦</span>

              <div>
                <strong>Inventory</strong>
                <small>
                  Check hospital inventory
                </small>
              </div>
            </Link>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // IF URL IS WRONG
  // ==========================================================
  return (
    <div className="ds-dashboard">

      <div className="ds-empty-page">

        <h2>Dashboard not found</h2>

        <p>
          Please use Doctor or Staff dashboard.
        </p>

        <div className="ds-dashboard-buttons">

          <Link to="/doctor-dashboard">
            Doctor Dashboard
          </Link>

          <Link to="/staff-dashboard">
            Staff Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
}

export default DoctorStaffDashboard;