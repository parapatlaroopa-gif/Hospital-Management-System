import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Public.css";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";
  const isContact = location.pathname === "/contact";

  return (
    <>
      <nav className="public-navbar">
        <Link to="/" className="public-brand">
          <div className="public-logo-icon">🏥</div>
          <div>
            <span className="public-brand-title">CarePulse</span>
            <span className="public-brand-subtitle">Smart Clinical OS</span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="public-nav-links">
          <Link to="/" className={`public-nav-link ${isHome ? "active" : ""}`}>
            Home
          </Link>
          {isHome ? (
            <>
              <a href="#portals" className="public-nav-link">
                Portals
              </a>
              <a href="#specialties" className="public-nav-link">
                Specialties
              </a>
            </>
          ) : (
            <Link to="/#portals" className="public-nav-link">
              Portals
            </Link>
          )}
          <Link to="/about" className={`public-nav-link ${isAbout ? "active" : ""}`}>
            About
          </Link>
          <Link to="/contact" className={`public-nav-link ${isContact ? "active" : ""}`}>
            Contact
          </Link>
        </div>

        {/* DESKTOP NAV ACTIONS */}
        <div className="public-nav-actions">
          <Link to="/login" className="nav-btn-signin">
            Unified Login
          </Link>
          <Link to="/register" className="nav-btn-register">
            Patient Intake
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="public-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MOBILE DROPDOWN / DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="public-mobile-menu">
          <div className="public-mobile-menu-links">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`public-mobile-nav-link ${isHome ? "active" : ""}`}
            >
              <span>🏠</span> Home
            </Link>
            {isHome ? (
              <>
                <a
                  href="#portals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="public-mobile-nav-link"
                >
                  <span>🚪</span> Select Portal
                </a>
                <a
                  href="#specialties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="public-mobile-nav-link"
                >
                  <span>🩺</span> Specialties
                </a>
              </>
            ) : (
              <Link
                to="/#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="public-mobile-nav-link"
              >
                <span>🚪</span> Select Portal
              </Link>
            )}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`public-mobile-nav-link ${isAbout ? "active" : ""}`}
            >
              <span>🏛️</span> About CarePulse
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`public-mobile-nav-link ${isContact ? "active" : ""}`}
            >
              <span>📞</span> Contact & Emergency
            </Link>
          </div>

          <div className="public-mobile-actions">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-btn-signin"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Unified Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-btn-register"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Patient Intake
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

