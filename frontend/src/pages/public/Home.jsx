import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import "./Public.css";

const PORTALS = [
  {
    id: "ADMIN",
    badge: "Executive Console",
    title: "Hospital Administrator",
    icon: "🛡️",
    desc: "Oversee operational bed admissions, recruit doctors & nurses, audit billing, and monitor system telemetry.",
    path: "/login?preset=ADMIN",
    action: "Access Admin Console",
  },
  {
    id: "DOCTOR",
    badge: "Clinical Station",
    title: "Medical Specialist",
    icon: "🩺",
    desc: "Manage outpatient queues, conduct consultations, issue electronic prescriptions, and review diagnostic lab results.",
    path: "/login?preset=DOCTOR",
    action: "Enter Doctor Desk",
  },
  {
    id: "NURSE",
    badge: "Ward Station",
    title: "Clinical Nursing",
    icon: "👩‍⚕️",
    desc: "Record patient vital signs (BP, Heart Rate, SpO2, Temp), track inpatient beds, and monitor patient queues.",
    path: "/login?preset=NURSE",
    action: "Open Ward Station",
  },
  {
    id: "PATIENT",
    badge: "Health Portal",
    title: "Patient Self-Service",
    icon: "👤",
    desc: "Register online, schedule doctor appointments, view active prescriptions, and inspect lab diagnostics & invoices.",
    path: "/login?preset=PATIENT",
    action: "Open Patient Portal",
  },
];

export default function Home() {
  return (
    <div className="public-page">
      {/* 24/7 EMERGENCY TICKER */}
      <div className="emergency-top-bar">
        <div>
          <span>🚨 24/7 Acute Trauma & Resuscitation Center: </span>
          <strong>+91 (0) 98765 43210</strong>
          <span style={{ margin: "0 12px", opacity: 0.6 }}>|</span>
          <span>Ambulance Hotline: <strong>108</strong></span>
        </div>
        <div>
          <a href="#contact">Emergency Triage Desk →</a>
        </div>
      </div>

      {/* STICKY GLASS NAVBAR */}
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="public-hero">
        <div className="hero-badge">
          <span>⚡</span> Next-Gen Hospital Operating System • NABH & JCI Certified
        </div>

        <h1 className="hero-title">
          Precision Healthcare Reimagined with <br />
          <span className="hero-title-highlight">Real-Time Clinical Intelligence</span>
        </h1>

        <p className="hero-subtitle">
          CarePulse unites board-certified physicians, inpatient ward nurses, and patients under a secure,
          role-governed clinical infrastructure with synchronized biometric telemetry and automated diagnostics.
        </p>

        {/* LIVE ECG PULSE STRIP */}
        <div className="hero-ecg-strip">
          <div className="ecg-strip-info">
            <span className="ecg-live-dot"></span>
            <span>Live Telemetry</span>
          </div>
          <svg className="ecg-strip-svg" viewBox="0 0 500 40">
            <path
              className="ecg-path"
              d="M 0 20 L 90 20 L 105 20 L 115 8 L 125 32 L 135 4 L 145 36 L 155 20 L 260 20 L 270 10 L 280 30 L 290 20 L 500 20"
            />
          </svg>
          <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 800 }}>72 BPM STABLE</span>
        </div>
      </section>

      {/* DIRECT ROLE PORTAL LAUNCHER - USER MUST EXPLICITLY SELECT THEIR DESIRED LOGIN */}
      <section id="portals" className="portal-launcher-section">
        <div className="launcher-header">
          <h2 className="launcher-title">
            Select Your <span>Authorized Portal</span>
          </h2>
          <p className="launcher-subtitle">
            Choose your hospital role below to access your role-specific console and authentication desk.
          </p>
        </div>

        <div className="portal-cards-grid">
          {PORTALS.map((portal) => (
            <Link key={portal.id} to={portal.path} className="portal-hub-card">
              <div className="portal-card-icon-wrap">{portal.icon}</div>
              <span className="portal-card-badge">{portal.badge}</span>
              <h3 className="portal-card-title">{portal.title}</h3>
              <p className="portal-card-desc">{portal.desc}</p>
              <div className="portal-card-action">
                <span>{portal.action}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE TELEMETRY RIBBON */}
      <div className="telemetry-ribbon-grid">
        <div className="telemetry-cell">
          <div className="telemetry-val">50<span>+</span></div>
          <div className="telemetry-lbl">Board-Certified Specialists</div>
        </div>
        <div className="telemetry-cell">
          <div className="telemetry-val">99.8<span>%</span></div>
          <div className="telemetry-lbl">Patient Clinical Recovery</div>
        </div>
        <div className="telemetry-cell">
          <div className="telemetry-val">24<span>/7</span></div>
          <div className="telemetry-lbl">Resuscitation Trauma Unit</div>
        </div>
        <div className="telemetry-cell">
          <div className="telemetry-val">&lt;5<span>m</span></div>
          <div className="telemetry-lbl">Emergency Triage Response</div>
        </div>
      </div>

      {/* CENTERS OF CLINICAL EXCELLENCE */}
      <section id="specialties" className="public-section">
        <div className="section-header">
          <span className="section-badge">Medical Excellence</span>
          <h2 className="section-title">Specialized Clinical Departments</h2>
          <p className="section-subtitle">
            Equipped with state-of-the-art medical technologies, robotic surgical suites, and dedicated intensive care units.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon-wrap">🫀</div>
            <h3 className="service-title">Cardiology & Cath Lab</h3>
            <p className="service-text">
              Comprehensive interventional cardiology, cardiac surgery, echocardiography, and 24/7 coronary care units.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">🧠</div>
            <h3 className="service-title">Neurology & Neurosurgery</h3>
            <p className="service-text">
              Advanced stroke management, neuro-navigation surgical suites, electroencephalogram (EEG), and spine recovery.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">🦴</div>
            <h3 className="service-title">Orthopedics & Joint Care</h3>
            <p className="service-text">
              Minimally invasive joint replacement, sports injury rehabilitation, fracture trauma stabilization, and arthroscopy.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">👶</div>
            <h3 className="service-title">Pediatrics & Neonatal ICU</h3>
            <p className="service-text">
              Level-III Neonatal Intensive Care Unit (NICU), pediatric cardiology, immunizations, and developmental child health.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">🧪</div>
            <h3 className="service-title">Pathology & AI Laboratory</h3>
            <p className="service-text">
              Automated high-throughput biochemistry, hematology, immuno-assay testing, and instant digital result synchronization.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrap">💊</div>
            <h3 className="service-title">Automated Digital Pharmacy</h3>
            <p className="service-text">
              Direct electronic prescription routing, barcoded medication distribution, and zero-error dose tracking.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT & HELPDESK */}
      <section id="contact" className="public-section">
        <div className="section-header">
          <span className="section-badge">Direct Communication</span>
          <h2 className="section-title">24/7 Hospital Command & Helpdesk</h2>
          <p className="section-subtitle">
            Need emergency assistance, admission inquiries, or specialty appointment scheduling? Our hospital officers are ready.
          </p>
        </div>

        <div className="contact-section-grid">
          <div className="contact-info-cards">
            <div className="contact-card-item">
              <div className="contact-card-icon">📍</div>
              <div className="contact-card-text">
                <h4>Main Medical Campus</h4>
                <p>123 Healthcare Boulevard, Medical Enclave, New Delhi, India</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">🚨</div>
              <div className="contact-card-text">
                <h4>Emergency & Trauma Dispatch</h4>
                <p style={{ color: "#f87171", fontWeight: "bold" }}>Ambulance 108 • Direct ICU +91 98765 43210</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">✉️</div>
              <div className="contact-card-text">
                <h4>Front Desk & Admissions</h4>
                <p>admissions@carepulse-hospital.com</p>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-card-icon">🕐</div>
              <div className="contact-card-text">
                <h4>Hospital Operating Hours</h4>
                <p>OPD: Mon-Sat 8:00 AM - 8:00 PM | Emergency & ICU: 24/7/365</p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3>Transmit Inquiry to Duty Officer</h3>
            <p>Our patient relations desk will acknowledge within 30 minutes.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry delivered to CarePulse hospital helpdesk."); }}>
              <div className="form-group">
                <label>Your Full Name</label>
                <input type="text" placeholder="e.g. Dr. / Mr. / Ms. Full Name" required />
              </div>

              <div className="form-group">
                <label>Contact Phone or Email</label>
                <input type="text" placeholder="e.g. rahul@example.com or +91 9876..." required />
              </div>

              <div className="form-group">
                <label>Subject / Department</label>
                <input type="text" placeholder="e.g. Inpatient Admission, Doctor Availability, Billing" required />
              </div>

              <div className="form-group">
                <label>Message Details</label>
                <textarea rows="4" placeholder="Describe your query..." required></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Inquiry to Desk →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="public-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <h4>🏥 CarePulse Hospital</h4>
            <p>
              Leading multi-specialty tertiary hospital and clinical research center dedicated to precision diagnostics,
              patient safety, and advanced medical treatment.
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <span style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#2dd4bf" }}>NABH ACCREDITED</span>
              <span style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#38bdf8" }}>JCI CERTIFIED</span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Role Portals</h5>
            <ul>
              <li><Link to="/login?preset=ADMIN">Administrator Console</Link></li>
              <li><Link to="/login?preset=DOCTOR">Physician Clinical Desk</Link></li>
              <li><Link to="/login?preset=NURSE">Nursing Ward Station</Link></li>
              <li><Link to="/login?preset=PATIENT">Patient Health Portal</Link></li>
              <li><Link to="/register">Patient Registration</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Medical Specialties</h5>
            <ul>
              <li><a href="#specialties">Cardiology & ICU</a></li>
              <li><a href="#specialties">Neurology & Spine</a></li>
              <li><a href="#specialties">Orthopedics</a></li>
              <li><a href="#specialties">Pediatrics & NICU</a></li>
              <li><a href="#specialties">Clinical Pathology</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Emergency Contact</h5>
            <ul>
              <li style={{ color: "#f87171", fontWeight: "bold" }}>Acute Trauma: 108</li>
              <li>Ambulance Service: +91 98765 43210</li>
              <li>ICU Hotline: +91 (11) 2345 6789</li>
              <li>helpdesk@carepulse-hospital.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 CarePulse AI Smart Hospital Management System. All rights reserved.</div>
          <div>HIPAA Compliant • ISO 9001:2015 Certified • Role-Gated Electronic Health Record</div>
        </div>
      </footer>
    </div>
  );
}