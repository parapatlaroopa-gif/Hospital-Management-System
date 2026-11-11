import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import "./Public.css";

export default function Contact() {
  return (
    <div className="public-page">
      {/* NAVBAR */}
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="public-hero" style={{ padding: "60px 48px 50px" }}>
        <div className="hero-badge">
          <span>📞</span> 24/7 Patient Helpdesk & Emergency Lines
        </div>
        <h1 className="hero-title">
          Contact CarePulse <br />
          <span className="hero-title-highlight">Hospital Front Desk</span>
        </h1>
        <p className="hero-subtitle">
          Have an urgent question, need to schedule a consultation, or require emergency trauma transport?
          Our healthcare administrative team is at your service 24 hours a day, 365 days a year.
        </p>
      </section>

      {/* CONTACT DIRECTORY & FORM */}
      <section className="public-section" style={{ paddingTop: "20px" }}>
        <div className="contact-section-grid">
          <div className="contact-info-cards">
            <div className="contact-card-item">
              <div className="contact-card-icon">📍</div>
              <div className="contact-card-text">
                <h4>Main Campus Location</h4>
                <p>123 Healthcare Boulevard, Medical Enclave, New Delhi, India</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">🚨</div>
              <div className="contact-card-text">
                <h4>Emergency & Trauma Hotline</h4>
                <p style={{ color: "#dc2626", fontWeight: "bold" }}>Dial 108 or +91 98765 43210 (Direct ICU)</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">✉️</div>
              <div className="contact-card-text">
                <h4>Front Desk & Admissions</h4>
                <p>helpdesk@carepulse-hospital.com</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">🕐</div>
              <div className="contact-card-text">
                <h4>Outpatient Department (OPD) Hours</h4>
                <p>Monday - Saturday: 8:00 AM - 8:00 PM (Emergency 24/7)</p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3>Direct Helpdesk Communication</h3>
            <p>Submit your inquiry and our duty officer will reply shortly.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry delivered successfully. Our helpdesk team will contact you shortly."); }}>
              <div className="form-group">
                <label>Your Full Name</label>
                <input type="text" placeholder="e.g. Dr. / Mr. / Ms. Full Name" required />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@domain.com" required />
              </div>

              <div className="form-group">
                <label>Department / Subject</label>
                <input type="text" placeholder="e.g. Inpatient Admission, Doctor Availability, Lab Report" required />
              </div>

              <div className="form-group">
                <label>Detailed Message</label>
                <textarea rows="4" placeholder="How can our clinical helpdesk assist you?" required></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Message to Helpdesk →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="public-footer">
        <div className="footer-bottom" style={{ border: "none", padding: "0" }}>
          <div>© 2026 CarePulse AI Smart Hospital. All rights reserved.</div>
          <div>NABH & JCI Accredited Medical Institution</div>
        </div>
      </footer>
    </div>
  );
}
