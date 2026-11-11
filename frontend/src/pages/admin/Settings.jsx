import React, { useState, useEffect } from "react";
import authService from "../../services/auth";
import "./AdminPages.css";

function Settings() {
  const currentUser = authService.getCurrentUser();

  const [settings, setSettings] = useState({
    hospitalName: "CarePulse AI Smart Hospital",
    contactEmail: "admin@gmail.com",
    contactPhone: "+91 (0) 98765 43210",
    emergencyAlerts: true,
    emailNotifications: true,
    autoBackup: true,
    sessionTimeout: "30",
    timezone: "UTC+5:30 (India/IST)",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("hospital_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("hospital_settings", JSON.stringify(settings));
    setMessage("Hospital system settings successfully updated and applied!");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>⚙️ Hospital System Settings</h1>
          <p>Configure institutional parameters, automated clinical alerts, and security preferences</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
            }}
          >
            {currentUser?.first_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
              {currentUser?.first_name || "Admin"} {currentUser?.last_name || ""}
            </strong>
            <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>CHIEF ADMINISTRATOR</span>
          </div>
        </div>
      </header>

      {/* ALERT MESSAGE */}
      {message && (
        <div className="admin-alert admin-alert-success">
          <span style={{ fontSize: "18px" }}>✅</span>
          <span>{message}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSave}>
        {/* SECTION 1: GENERAL INSTITUTION CONFIG */}
        <div className="admin-form-card">
          <h2>🏥 Institutional Information</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Hospital Facility Name</label>
              <input
                type="text"
                name="hospitalName"
                value={settings.hospitalName}
                onChange={handleChange}
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Official Administration Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Emergency Trauma Hotline</label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>System Operating Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="admin-select"
              >
                <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                <option value="UTC-6 (Central Time)">UTC-6 (Central Time)</option>
                <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                <option value="UTC+0 (GMT/London)">UTC+0 (GMT/London)</option>
                <option value="UTC+5:30 (India/IST)">UTC+5:30 (India/IST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: CLINICAL AUTOMATIONS & ALERTS */}
        <div className="admin-form-card">
          <h2>🔔 Telemetry, Emergency & Alert Preferences</h2>
          <div className="admin-form-grid">
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>
                  🚨 Emergency Trauma Alerts
                </strong>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Notify all on-duty physicians for critical patient vitals
                </span>
              </div>
              <input
                type="checkbox"
                name="emergencyAlerts"
                checked={settings.emergencyAlerts}
                onChange={handleChange}
                style={{ width: "20px", height: "20px", accentColor: "#0284c7" }}
              />
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>
                  ✉️ Email Appointment Reminders
                </strong>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Send automated SMS and email reminders to patients
                </span>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                style={{ width: "20px", height: "20px", accentColor: "#0284c7" }}
              />
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>
                  💾 Automated Database Backups
                </strong>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Perform encrypted daily clinical database snapshots
                </span>
              </div>
              <input
                type="checkbox"
                name="autoBackup"
                checked={settings.autoBackup}
                onChange={handleChange}
                style={{ width: "20px", height: "20px", accentColor: "#0284c7" }}
              />
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>
                  ⏱️ Idle Session Timeout
                </strong>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Auto-lock screen after period of inactivity
                </span>
              </div>
              <select
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                className="admin-select"
                style={{ width: "auto", padding: "6px 12px" }}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div>
          <button type="submit" className="admin-btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>
            <span>💾 Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;