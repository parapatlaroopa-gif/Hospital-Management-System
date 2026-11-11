import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import authService from "../services/auth";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

function PatientProfile() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("patients/");
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.results || (data?.id ? [data] : []);
      setPatients(list);
      setError("");
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Unable to load patient information from the hospital database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-layout">
      <PatientSidebar />

      <main className="patient-main">
        {/* Header Banner */}
        <header className="patient-header">
          <div>
            <span className="patient-page-label">PATIENT HEALTH PORTAL</span>
            <h1>My Patient Profile 👤</h1>
            <p>View your official hospital registration, digital health credentials, and clinical profile.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              to="/patient/appointments"
              className="patient-welcome-btn"
              style={{ padding: "10px 20px", fontSize: "13.5px" }}
            >
              <span>📅 Book Appointment</span>
              <span>→</span>
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="patient-message">
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
                display: "inline-block",
                animation: "pulse 1.5s infinite ease-in-out",
              }}
            >
              🩺
            </div>
            <h3>Accessing Hospital Records...</h3>
            <p>Please wait while we retrieve your verified health credentials.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="patient-message error-message">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
            <h3>Unable to Retrieve Records</h3>
            <p>{error}</p>
            <button onClick={fetchPatients}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* No patients found */}
        {!loading && !error && patients.length === 0 && (
          <div className="patient-message">
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
            <h3>No Patient Profile Found</h3>
            <p>Your account is active, but no clinical profile is associated yet.</p>
            <button
              onClick={fetchPatients}
              style={{
                marginTop: "14px",
                padding: "10px 20px",
                background: "#0284c7",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Refresh Profile
            </button>
          </div>
        )}

        {/* Patient Profile Content */}
        {!loading && !error && patients.length > 0 && (
          <>
            {/* Overview Summary Banner */}
            <div className="profile-summary">
              <div className="summary-icon">🏥</div>
              <div style={{ flex: 1 }}>
                <h2>Official Hospital Health Passport</h2>
                <p>
                  Verified Patient ID: <strong>#{patients[0]?.id}</strong> · Status:{" "}
                  <strong>Active Hospital Member</strong>
                </p>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid #bae6fd",
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#0369a1",
                }}
              >
                🔒 SECURE RECORD
              </div>
            </div>

            {/* Profile Grid / Cards */}
            <section className="patients-profile-grid">
              {patients.map((patient) => {
                const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase() || "P";

                return (
                  <div className="patient-profile-card" key={patient.id}>
                    {/* Card Header */}
                    <div className="profile-card-header">
                      <div className="large-patient-avatar">
                        {initials}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span className="patient-id">
                            Patient ID: #{patient.id}
                          </span>
                          <span className="patient-active">
                            ● Registered
                          </span>
                        </div>

                        <h2>
                          {patient.first_name} {patient.last_name}
                        </h2>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                          CarePulse AI Smart Hospital Network
                        </span>
                      </div>
                    </div>

                    {/* Patient Information Grid */}
                    <div className="profile-details">
                      <div className="profile-detail">
                        <span className="detail-icon">🎂</span>
                        <div>
                          <small>Age</small>
                          <strong>{patient.age ? `${patient.age} Years` : "Not Specified"}</strong>
                        </div>
                      </div>

                      <div className="profile-detail">
                        <span className="detail-icon">⚧</span>
                        <div>
                          <small>Gender</small>
                          <strong>{patient.gender || "Other"}</strong>
                        </div>
                      </div>

                      <div className="profile-detail">
                        <span className="detail-icon">📱</span>
                        <div>
                          <small>Phone Contact</small>
                          <strong>{patient.phone || "Not Provided"}</strong>
                        </div>
                      </div>

                      <div className="profile-detail">
                        <span className="detail-icon">✉️</span>
                        <div>
                          <small>Account Email</small>
                          <strong>{currentUser?.email || "patient@hospital.com"}</strong>
                        </div>
                      </div>

                      <div className="profile-detail address-detail">
                        <span className="detail-icon">📍</span>
                        <div>
                          <small>Residential Address</small>
                          <strong>{patient.address || "CarePulse Registered Patient"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="profile-card-footer">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>🏥</span>
                        <span>AI Smart Hospital Medical Registry</span>
                      </span>

                      <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>
                        ID: {patient.id.toString().padStart(6, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default PatientProfile;
