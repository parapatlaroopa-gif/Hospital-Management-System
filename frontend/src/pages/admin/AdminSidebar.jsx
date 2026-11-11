import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import "../../components/Sidebar.css";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { name: "Patients", path: "/admin/patients", icon: "👥" },
    { name: "Doctors", path: "/admin/doctors", icon: "👨‍⚕️" },
    { name: "Staff & Nurses", path: "/admin/staff", icon: "👨‍💼" },
    { name: "User Management", path: "/admin/users", icon: "🔐" },
    { name: "Appointments", path: "/admin/appointments", icon: "📅" },
    { name: "Departments", path: "/admin/departments", icon: "🏥" },
    { name: "Admissions", path: "/admin/admissions", icon: "🛏️" },
    { name: "Billing", path: "/admin/billing", icon: "💳" },
    { name: "Laboratory", path: "/admin/laboratory", icon: "🧪" },
    { name: "Pharmacy", path: "/admin/pharmacy", icon: "💊" },
    { name: "Inventory", path: "/admin/inventory", icon: "📦" },
    { name: "Reports", path: "/admin/reports", icon: "📊" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
    : "Hospital Admin";

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
            <span className="mobile-brand-icon">🏥</span>
            <span className="mobile-brand-name">AI Hospital Admin</span>
          </div>
        </div>

        <div className="mobile-topbar-user">
          <div className="mobile-user-avatar">
            {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : "A"}
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
            <h2>AI Smart Hospital</h2>
            <p>Admin Portal</p>
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
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={
                location.pathname === item.path
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* FOOTER USER & LOGOUT */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : "A"}
            </div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span>ADMINISTRATOR</span>
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
