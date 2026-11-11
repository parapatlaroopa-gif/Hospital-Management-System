import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import "./Public.css";

export default function About() {
  return (
    <div className="public-page">
      {/* NAVBAR */}
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="public-hero" style={{ padding: "60px 48px 50px" }}>
        <div className="hero-badge">
          <span>🏛️</span> Institutional Overview & Healthcare Philosophy
        </div>
        <h1 className="hero-title">
          Pioneering Clinical Excellence, <br />
          <span className="hero-title-highlight">Empowered by Compassionate Care</span>
        </h1>
        <p className="hero-subtitle">
          CarePulse Hospital is a tertiary care institution uniting senior medical consultants, advanced surgical suites,
          round-the-clock intensive care, and real-time electronic health records to deliver exceptional patient outcomes.
        </p>
      </section>

      {/* CORE PILLARS SECTION */}
      <section className="public-section" style={{ paddingTop: "20px" }}>
        <div className="section-header">
          <span className="section-badge">Platform Architecture</span>
          <h2 className="section-title">Three Synchronized Healthcare Portals</h2>
          <p className="section-subtitle">
            Engineered to streamline hospital workflow between administration, medical staff, and patients.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon-wrap">🛡️</div>
            <h3 className="service-title">Command & Administration</h3>
            <p className="service-text">
              Real-time executive dashboard monitoring hospital bed occupancy, surgical suite scheduling, clinical inventory,
              laboratory output, and financial billing auditing.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">🩺</div>
            <h3 className="service-title">Physician & Nurse Stations</h3>
            <p className="service-text">
              Digital clinical station enabling doctors to consult patients, track biometric telemetry (BP, Heart Rate, SpO2),
              prescribe medications, and coordinate assigned nursing care.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">👤</div>
            <h3 className="service-title">Patient Portal & Health Record</h3>
            <p className="service-text">
              Empowers patients to register online, view upcoming appointments, access electronic prescriptions, review
              laboratory test reports, and inspect itemized hospital bills.
            </p>
          </div>
        </div>
      </section>

      {/* PREMIER FOOTER */}
      <footer className="public-footer">
        <div className="footer-bottom" style={{ border: "none", padding: "0" }}>
          <div>© 2026 CarePulse AI Smart Hospital. All rights reserved.</div>
          <div>NABH & JCI Accredited Medical Center</div>
        </div>
      </footer>
    </div>
  );
}
