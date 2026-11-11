import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import "./Unauthorized.css";

export default function Unauthorized() {
  const navigate = useNavigate();
  const role = authService.getRole();
  const dashboardPath = authService.getDashboardPath();
  const [switching, setSwitching] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleLoginAsAdmin = () => {
    authService.logout();
    navigate("/login?preset=ADMIN");
  };

  const handleQuickSwitch = async (email, password, redirectPath) => {
    setSwitching(true);
    try {
      await authService.login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Quick switch error:", err);
      navigate("/login");
    } finally {
      setSwitching(false);
    }
  };

  const formattedRole = role ? role.toUpperCase() : "GUEST";
  const isAdmin = formattedRole === "ADMIN";
  const roleLabel =
    role === "NURSE"
      ? "Nurse Station"
      : role === "DOCTOR"
      ? "Doctor Station"
      : role === "PATIENT"
      ? "Patient"
      : role === "ADMIN"
      ? "Administrator"
      : "User";

  return (
    <div className="unauth-container">
      <div className="unauth-ambient-orb"></div>

      <div className="unauth-card">
        {/* SHIELD SECURITY BADGE */}
        <div className="unauth-badge-icon-wrapper">
          <div className="unauth-badge-icon-pulse"></div>
          <div className="unauth-badge-icon">🛡️</div>
        </div>

        {/* SECURITY COMPLIANCE TAG */}
        <div className="unauth-eyebrow">
          <span>🔒</span>
          <span>Hospital Administration Only</span>
        </div>

        <h1 className="unauth-title">Access Notice: Role Restricted</h1>

        <p className="unauth-description">
          You are currently signed in as{" "}
          <span className="unauth-role-pill">{formattedRole}</span>.
          This section is strictly reserved for <strong>Hospital Administration</strong>.
        </p>

        {/* DIRECT ACTION: PROCEED DIRECTLY TO MY ACCOUNT TO PERFORM ACTIONS */}
        <button
          onClick={() => navigate(dashboardPath)}
          disabled={switching}
          className="unauth-primary-btn"
        >
          <span>🏥</span>
          <span>Proceed to My {roleLabel} Account & Perform Actions</span>
        </button>

        {/* 1-CLICK ROLE SWITCHER: DISPLAY ONLY FOR ADMINISTRATOR */}
        {isAdmin && (
          <div className="unauth-switcher-box">
            <div className="unauth-switcher-header">
              <div className="unauth-switcher-title">
                <span>⚡</span>
                <span>Administrator Role Switcher (Testing & Review)</span>
              </div>
              <span className="unauth-switcher-note">
                {switching ? "Switching..." : "Admin Mode"}
              </span>
            </div>

            <div className="unauth-switcher-grid">
              <button
                onClick={() => handleQuickSwitch("nithinkumarreddy1538@gmail.com", "Nithin@1538", "/admin/dashboard")}
                disabled={switching}
                className={`unauth-role-btn ${role === "ADMIN" ? "active" : ""}`}
              >
                <div className="unauth-role-btn-left">
                  <span className="unauth-role-icon">🛡️</span>
                  <span>Administrator</span>
                </div>
                {role === "ADMIN" && <div className="unauth-active-dot"></div>}
              </button>

              <button
                onClick={() => handleQuickSwitch("dr.smith@hospital.com", "doctor123", "/staff/dashboard?role=DOCTOR")}
                disabled={switching}
                className={`unauth-role-btn ${role === "DOCTOR" ? "active" : ""}`}
              >
                <div className="unauth-role-btn-left">
                  <span className="unauth-role-icon">🩺</span>
                  <span>Doctor</span>
                </div>
                {role === "DOCTOR" && <div className="unauth-active-dot"></div>}
              </button>

              <button
                onClick={() => handleQuickSwitch("nurse.sarah@hospital.com", "nurse123", "/staff/dashboard?role=NURSE")}
                disabled={switching}
                className={`unauth-role-btn ${role === "NURSE" ? "active" : ""}`}
              >
                <div className="unauth-role-btn-left">
                  <span className="unauth-role-icon">👩‍⚕️</span>
                  <span>Nurse</span>
                </div>
                {role === "NURSE" && <div className="unauth-active-dot"></div>}
              </button>

              <button
                onClick={() => handleQuickSwitch("patient.john@hospital.com", "patient123", "/patient/dashboard")}
                disabled={switching}
                className={`unauth-role-btn ${role === "PATIENT" ? "active" : ""}`}
              >
                <div className="unauth-role-btn-left">
                  <span className="unauth-role-icon">👤</span>
                  <span>Patient</span>
                </div>
                {role === "PATIENT" && <div className="unauth-active-dot"></div>}
              </button>
            </div>
          </div>
        )}

        {/* NON-ADMIN ACTION HELPER */}
        {!isAdmin && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={handleLoginAsAdmin}
              style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "#f8fafc",
                color: "#0369a1",
                border: "1.5px dashed #bae6fd",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "10px",
                transition: "all 0.2s ease",
              }}
            >
              🔐 Sign In with Administrator Credentials
            </button>
          </div>
        )}

        {/* SIGN OUT / UNIVERSAL LOGIN BUTTON */}
        <button onClick={handleLogout} className="unauth-signout-btn">
          <span>🚪</span>
          <span>Sign Out to Universal Login</span>
        </button>
      </div>
    </div>
  );
}
