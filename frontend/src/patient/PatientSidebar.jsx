import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import authService from "../services/auth";
import "./patient.css";
import "../components/Sidebar.css";

export default function PatientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: "/patient/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/patient/appointments", label: "Doctor Appointments", icon: "📅" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
    : currentUser?.username || "Patient";

  return (
    <>
      {/* MOBILE TOPBAR - ONLY VISIBLE ON SCREENS <= 1024px */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <div className="mobile-topbar-brand">
            <span className="mobile-brand-icon">👤</span>
            <span className="mobile-brand-name">CarePulse Health</span>
          </div>
        </div>

        <div className="mobile-topbar-user">
          <div className="mobile-user-avatar">
            {displayName[0]?.toUpperCase() || "P"}
          </div>
        </div>
      </header>

      {/* BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ASIDE SIDEBAR DRAWER */}
      <aside className={`patient-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="patient-sidebar-logo">
          <div className="hospital-icon" style={{ width: 42, height: 42, fontSize: 24 }}>
            🏥
          </div>
          <div>
            <h2>CarePulse Health</h2>
            <span>Patient Portal</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#94a3b8",
              padding: "8px 12px 4px",
            }}
          >
            Patient Services
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "patient-nav-item active" : "patient-nav-item"
              }
            >
              <span style={{ fontSize: "18px", width: "24px", display: "inline-flex", justifyContent: "center" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer User Info & Logout */}
        <div className="sidebar-footer" style={{ borderTop: "1.5px solid #e2e8f0", marginTop: "auto", padding: "14px 0 0" }}>
          <div className="sidebar-user-card">
            <div className="user-avatar" style={{ background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", color: "#fff" }}>
              {displayName[0]?.toUpperCase() || "P"}
            </div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span>VERIFIED PATIENT</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button" style={{ marginTop: "10px", width: "100%" }}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
