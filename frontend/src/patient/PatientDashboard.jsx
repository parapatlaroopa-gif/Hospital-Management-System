import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import authService from "../services/auth";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientDashboard() {
  const user = authService.getCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("appointments/"),
      api.get("doctors/"),
      api.get("pharmacy/prescriptions/"),
    ])
      .then(([a, d, rx]) => {
        setAppointments(Array.isArray(a.data) ? a.data : a.data.results || []);
        setDoctors(Array.isArray(d.data) ? d.data : d.data.results || []);
        setPrescriptions(Array.isArray(rx.data) ? rx.data : rx.data.results || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingVisits = appointments.filter((a) => a.status === "Pending").length;
  const confirmedVisits = appointments.filter((a) => a.status === "Confirmed").length;

  return (
    <div className="patient-layout">
      <PatientSidebar />
      <main className="patient-main">
        {/* WELCOME HERO BANNER */}
        <div className="patient-welcome-card">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#0369a1",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "inline-block",
              marginBottom: "6px",
            }}
          >
            PATIENT CARE CONCIERGE
          </span>
          <h1>Welcome, {user?.first_name || "Patient"}</h1>
          <p>
            Track your doctor appointments, view pharmacy prescriptions, and access clinical services from your personal portal.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            <Link to="/patient/appointments" className="patient-welcome-btn">
              <span>📅 Book Consultation</span>
              <span>→</span>
            </Link>
            <Link
              to="/patient/prescriptions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.9)",
                color: "#0369a1",
                border: "1.5px solid #bae6fd",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.1)",
              }}
            >
              <span>💊 My Prescriptions ({prescriptions.length})</span>
            </Link>
          </div>
        </div>

        {/* STATS METRIC CARDS */}
        <div className="patient-stats-grid">
          <div className="patient-stat-card">
            <div className="patient-stat-icon">📅</div>
            <div>
              <span className="patient-stat-label">My Appointments</span>
              <div className="patient-stat-val">{appointments.length}</div>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="patient-stat-icon">💊</div>
            <div>
              <span className="patient-stat-label">Prescribed Medicines</span>
              <div className="patient-stat-val">{prescriptions.length}</div>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="patient-stat-icon">⏳</div>
            <div>
              <span className="patient-stat-label">Pending Visits</span>
              <div className="patient-stat-val">{pendingVisits}</div>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="patient-stat-icon">✅</div>
            <div>
              <span className="patient-stat-label">Confirmed Visits</span>
              <div className="patient-stat-val">{confirmedVisits}</div>
            </div>
          </div>
        </div>

        {/* PRESCRIBED MEDICINES FROM HOSPITAL PHARMACY */}
        <div className="patient-panel" style={{ marginBottom: "24px" }}>
          <div className="patient-panel-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>💊</span>
                <h3 style={{ margin: 0 }}>Doctor Prescribed Medications (Hospital Pharmacy)</h3>
              </div>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Medications prescribed by your doctors and dispensed from the pharmacy
              </span>
            </div>
            <Link to="/patient/prescriptions" style={{ fontSize: "13px", fontWeight: 700, color: "#0284c7", textDecoration: "none" }}>
              View all prescriptions ({prescriptions.length}) →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
              Loading prescribed medications...
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748b" }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>💊</span>
              <strong style={{ color: "#0f172a" }}>No Active Prescriptions</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                When your doctor prescribes medications during your consultation, they will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "16px 20px" }}>
              {prescriptions.slice(0, 3).map((rx) => (
                <div
                  key={rx.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1.5px solid #e0f2fe",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                        {rx.medicine_name}
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#e0f2fe",
                          color: "#0369a1",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {rx.medicine_category || "Medicine"}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", color: "#334155", marginBottom: "4px" }}>
                      <strong>Dosage: </strong>{rx.dosage}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#0369a1", marginBottom: "6px" }}>
                      <strong>Regimen: </strong>{rx.frequency}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      <strong>Duration: </strong>{rx.duration}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "12px", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#64748b" }}>
                    <span>👨‍⚕️ {rx.doctor_name || "Physician"}</span>
                    <span style={{ color: "#059669", fontWeight: 700 }}>● Active Rx</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING APPOINTMENTS PANEL */}
        <div className="patient-panel">
          <div className="patient-panel-header">
            <div>
              <h3>Upcoming Doctor Consultations</h3>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Review schedule, consulting doctor, and confirmation status
              </span>
            </div>
            <Link to="/patient/appointments" style={{ fontSize: "13px", fontWeight: 700, color: "#0284c7", textDecoration: "none" }}>
              Manage appointments →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
              Loading consultations...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>📅</span>
              <strong style={{ color: "#0f172a" }}>No Scheduled Appointments</strong>
              <p style={{ margin: "4px 0 16px", fontSize: "13px" }}>You do not have any upcoming visits booked.</p>
              <Link to="/patient/appointments" className="patient-welcome-btn">
                <span>Book Your First Visit</span>
              </Link>
            </div>
          ) : (
            <div style={{ padding: "10px 20px" }}>
              {appointments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#e0f2fe",
                        color: "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🩺
                    </div>
                    <div>
                      <strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>
                        {a.doctor_name || `Doctor #${a.doctor}`}
                      </strong>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        🗓️ {a.appointment_date} at ⏰ {a.appointment_time} · {a.reason || "General Visit"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor:
                          a.status === "Confirmed"
                            ? "#dcfce7"
                            : a.status === "Pending"
                            ? "#fef3c7"
                            : a.status === "Completed"
                            ? "#e0f2fe"
                            : "#fee2e2",
                        color:
                          a.status === "Confirmed"
                            ? "#15803d"
                            : a.status === "Pending"
                            ? "#b45309"
                            : a.status === "Completed"
                            ? "#0369a1"
                            : "#b91c1c",
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
