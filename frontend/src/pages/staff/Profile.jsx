import { useEffect, useState } from "react";
import authService from "../../services/auth";
import API from "../../services/api";
import "./StaffDashboard.css";

export default function Profile() {
  const currentUser = authService.getCurrentUser();
  const role = authService.getRole();
  const doctor = role === "DOCTOR";
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.doctor_id) {
      API.get(`doctors/${currentUser.doctor_id}/`)
        .then((res) => setProfileData(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (currentUser?.staff_id) {
      API.get(`staff/${currentUser.staff_id}/`)
        .then((res) => setProfileData(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const initials = `${currentUser?.first_name?.[0] || ""}${currentUser?.last_name?.[0] || ""}`.toUpperCase() || "S";

  return (
    <div className="ds-dashboard">
      {/* HEADER */}
      <header className="ds-header">
        <div>
          <div className="ds-small-title">
            <span>●</span>
            <span>CLINICIAN CREDENTIALS & HOSPITAL ID</span>
          </div>
          <h1>
            <span className="ds-icon">👤</span>
            <span>Medical Practitioner Profile</span>
          </h1>
          <p className="ds-subtitle">
            Official hospital accreditation, clinical license credentials, and station parameters.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #bae6fd",
            padding: "8px 18px",
            borderRadius: "20px",
            boxShadow: "0 4px 14px rgba(148, 163, 184, 0.1)",
            fontSize: "12px",
            fontWeight: "800",
            color: "#0369a1",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🛡️</span>
          <span>VERIFIED PRACTITIONER</span>
        </div>
      </header>

      {/* CREDENTIALS PASSPORT CARD */}
      <div
        style={{
          maxWidth: "800px",
          background: "#ffffff",
          border: "1.5px solid rgba(186, 230, 253, 0.95)",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 10px 30px rgba(148, 163, 184, 0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #38bdf8 0%, #0284c7 50%, #bae6fd 100%)",
          }}
        />

        {/* Clinician Card Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            paddingBottom: "24px",
            borderBottom: "1.5px solid #f1f5f9",
            marginBottom: "26px",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 60%, #38bdf8 100%)",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "800",
              boxShadow: "0 6px 20px rgba(56, 189, 248, 0.25)",
              border: "2px solid #ffffff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0284c7",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  border: "1px solid #bae6fd",
                }}
              >
                {doctor ? "ATTENDING PHYSICIAN" : "REGISTERED CLINICAL NURSE"}
              </span>

              <span
                style={{
                  background: "#ecfdf5",
                  color: "#059669",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "1px solid #a7f3d0",
                }}
              >
                ● Active On-Duty
              </span>
            </div>

            <h2 style={{ margin: "2px 0 0", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
              {doctor ? "Dr. " : ""}{currentUser?.first_name} {currentUser?.last_name || ""}
            </h2>
            <span style={{ fontSize: "13.5px", color: "#64748b", fontWeight: 600 }}>
              CarePulse AI Smart Hospital Network · Station #{doctor ? currentUser?.doctor_id || "101" : currentUser?.staff_id || "201"}
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "22px" }}>✉️</span>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email / Account
              </span>
              <strong style={{ fontSize: "14px", color: "#0f172a" }}>{currentUser?.email || currentUser?.username}</strong>
            </div>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "22px" }}>📱</span>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Contact Phone
              </span>
              <strong style={{ fontSize: "14px", color: "#0f172a" }}>{profileData?.phone || currentUser?.phone || "+1 (555) 019-2834"}</strong>
            </div>
          </div>

          {doctor && (
            <>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>🩺</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Clinical Specialization
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{profileData?.specialization || "General Medicine & Internal Care"}</strong>
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>🚪</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Consultation Room / Office
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{profileData?.room_number || "Room 204 - Clinical Wing"}</strong>
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>⏳</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Clinical Experience
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{profileData?.experience ? `${profileData.experience} Years Active Practice` : "5+ Years Senior Practice"}</strong>
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>🏥</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Hospital Department
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Outpatient & Consultation</strong>
                </div>
              </div>
            </>
          )}

          {!doctor && (
            <>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>👩‍⚕️</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Clinical Designation
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Registered Clinical Nurse</strong>
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px" }}>🏥</span>
                <div>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Assigned Clinical Ward
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Inpatient Care & Telemetry</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Stamp */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            borderTop: "1.5px solid #f1f5f9",
            fontSize: "13px",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🏥</span>
            <span>CarePulse AI Smart Hospital Staff Registry</span>
          </span>

          <span style={{ color: "#0284c7", fontWeight: 700 }}>
            Station ID: #{doctor ? currentUser?.doctor_id || "DOC-01" : currentUser?.staff_id || "STF-01"}
          </span>
        </div>
      </div>
    </div>
  );
}
