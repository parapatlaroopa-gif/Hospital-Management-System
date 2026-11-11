import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Patients", path: "/patients", icon: "👥" },
    { name: "Doctors", path: "/doctors", icon: "👨‍⚕️" },
    { name: "Appointments", path: "/appointments", icon: "📅" },
    { name: "Departments", path: "/departments", icon: "🏥" },
    { name: "Admissions", path: "/admissions", icon: "🛏️" },
    { name: "Billing", path: "/billing", icon: "💳" },
    { name: "Laboratory", path: "/laboratory", icon: "🧪" },
    { name: "Pharmacy", path: "/pharmacy", icon: "💊" },
    { name: "Inventory", path: "/inventory", icon: "📦" },
    { name: "Staff", path: "/staff", icon: "👨‍💼" },
    { name: "Reports", path: "/reports", icon: "📊" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="hospital-icon">🏥</div>
        <div>
          <h2>AI Smart Hospital</h2>
          <p>Hospital Management</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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
    </aside>
  );
}

export default Sidebar;
