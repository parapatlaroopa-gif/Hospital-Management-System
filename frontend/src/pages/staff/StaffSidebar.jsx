import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import "../../components/Sidebar.css";

export default function StaffSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const role = authService.getRole();
  const doctor = role === "DOCTOR";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItems = doctor
    ? [
        { path: "/staff/dashboard", icon: "🏠", label: "Dashboard" },
        { path: "/staff/appointments", icon: "📅", label: "My Appointments" },
        { path: "/staff/patients", icon: "👥", label: "My Patients" },
        { path: "/staff/profile", icon: "👤", label: "My Profile" },
      ]
    : [
        { path: "/staff/dashboard", icon: "🏠", label: "Dashboard" },
        { path: "/staff/patients", icon: "👥", label: "Assigned Patients" },
        { path: "/staff/appointments", icon: "📅", label: "Appointments" },
        { path: "/staff/profile", icon: "👤", label: "My Profile" },
      ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
    : "Staff Member";

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
            <span className="mobile-brand-icon">🩺</span>
            <span className="mobile-brand-name">
              {doctor ? "CarePulse Doctor Desk" : "CarePulse Nursing"}
            </span>
          </div>
        </div>

        <div className="mobile-topbar-user">
          <div className="mobile-user-avatar">
            {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : "S"}
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
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="hospital-icon">🏥</div>
          <div>
            <h2>CarePulse Staff</h2>
            <p>{doctor ? "Doctor Station" : "Nursing Station"}</p>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-category-title">Clinical Station</div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* FOOTER USER & LOGOUT */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : "S"}
            </div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span>{doctor ? "PHYSICIAN" : "NURSE"}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
