import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth";
import "../Login.css";

const PORTAL_ROLES = [
  { id: "ADMIN", label: "Admin", title: "Hospital Administrator", icon: "🛡️", desc: "Executive command, staff management & hospital telemetry" },
  { id: "DOCTOR", label: "Doctor", title: "Specialist Physician", icon: "🩺", desc: "Consultation desk, e-prescriptions & diagnostic orders" },
  { id: "NURSE", label: "Nurse", title: "Clinical Nursing Station", icon: "👩‍⚕️", desc: "Inpatient bed monitor, vitals telemetry & care queue" },
  { id: "PATIENT", label: "Patient", title: "Patient Health Portal", icon: "👤", desc: "Personal health records, appointments, labs & billing" },
];

export default function Login({ portalTitle = "", defaultRole = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial role if passed via props or query params
  const [selectedRole, setSelectedRole] = useState(() => {
    if (defaultRole) return defaultRole.toUpperCase();
    return "DOCTOR";
  });

  // Keep credentials completely clean and empty - NO AUTOMATIC FILL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if query param preset role exists, to select the tab without auto-filling credentials
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const presetRole = params.get("preset");
    if (presetRole) {
      const match = PORTAL_ROLES.find(r => r.id === presetRole.toUpperCase());
      if (match) {
        setSelectedRole(match.id);
      }
    }
  }, [location.search]);

  const activeRoleMeta = PORTAL_ROLES.find(r => r.id === selectedRole) || PORTAL_ROLES[1];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your registered email and password.");
      return;
    }

    setLoading(true);

    try {
      // Only require ADMIN verification if specifically logging in as Administrator; others log in directly
      const data = await authService.login(
        email.trim(),
        password,
        selectedRole === "ADMIN" ? "ADMIN" : ""
      );
      const userRole = (data.role || "PATIENT").toUpperCase();

      // Check if user came from an allowed protected route attempt
      const fromPath = location.state?.from?.pathname;
      const isPathAllowed =
        fromPath &&
        ((userRole === "ADMIN") ||
          ((userRole === "DOCTOR" || userRole === "NURSE") && (fromPath.startsWith("/staff") || fromPath.startsWith("/patient"))) ||
          (userRole === "PATIENT" && fromPath.startsWith("/patient")));

      if (
        isPathAllowed &&
        !fromPath.includes("login") &&
        !fromPath.includes("register") &&
        !fromPath.includes("unauthorized")
      ) {
        navigate(fromPath, { replace: true });
      } else {
        // Direct routing based on authentic role - others directly enter account to perform actions
        if (userRole === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "DOCTOR" || userRole === "NURSE") {
          navigate("/staff/dashboard", { replace: true });
        } else if (userRole === "PATIENT") {
          navigate("/patient/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Authentication failed. Please verify your credentials or ensure the server is online.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* NAVIGATION ARROW TO HOME */}
      <Link to="/" className="back-to-home-link" title="Return to CarePulse Home">
        <span className="back-arrow-icon">←</span>
        <span>Back to Home</span>
      </Link>

      <div className="login-ambient-orb"></div>

      <div className="login-shell">
        {/* LEFT INFRASTRUCTURE PANEL */}
        <div className="login-hero-panel">
          <div>
            <div className="hero-brand-capsule">
              <div className="brand-hologram-logo">🏥</div>
              <div className="brand-text-block">
                <h1>CarePulse</h1>
                <span>Clinical AI Operating System</span>
              </div>
            </div>

            <div className="hero-intro-title">
              Precision Healthcare, <br />
              <span>Role-Secured Intelligence</span>
            </div>

            <p className="hero-intro-desc">
              Unified hospital information system connecting critical care stations, electronic medical records,
              and patient services with real-time biometric telemetry.
            </p>

            {/* LIVE CARDIOGRAM TELEMETRY CARD */}
            <div className="ecg-monitor-card">
              <div className="ecg-header">
                <div className="ecg-status-pill">
                  <span className="ecg-live-dot"></span>
                  <span>Hospital Telemetry Stream</span>
                </div>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700 }}>24/7 ACTIVE</span>
              </div>
              <svg className="ecg-wave-svg" viewBox="0 0 400 50">
                <path
                  className="ecg-path"
                  d="M 0 25 L 70 25 L 85 25 L 95 10 L 105 40 L 115 5 L 125 45 L 135 25 L 200 25 L 210 12 L 220 38 L 230 25 L 400 25"
                />
              </svg>
            </div>
          </div>

          <div className="hero-footer-badges">
            <div className="trust-badge-pill">
              <span>🔒</span> 256-Bit SSL Encryption
            </div>
            <div className="trust-badge-pill">
              <span>🛡️</span> HIPAA Compliant
            </div>
            <div className="trust-badge-pill">
              <span>⚡</span> Zero-Latency Sync
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE AUTHENTICATION CARD */}
        <div className="login-auth-card">
          <div className="auth-header">
            <div className="auth-portal-badge">
              <span>{activeRoleMeta.icon}</span>
              <span>{portalTitle || activeRoleMeta.title}</span>
            </div>
            <h2>Portal Authentication</h2>
            <p>Select your hospital role below and provide your authorized credentials to enter.</p>
          </div>

          {/* INTERACTIVE ROLE SELECTION CARDS - USER MUST EXPLICITLY SELECT */}
          <div className="role-selection-wrapper">
            <span className="role-selection-label">Select Target Department / Role:</span>
            <div className="role-cards-grid">
              {PORTAL_ROLES.map((role) => (
                <div
                  key={role.id}
                  className={`role-select-card ${selectedRole === role.id ? "active" : ""}`}
                  onClick={() => handleRoleSelect(role.id)}
                  title={role.desc}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-name">{role.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {errorMessage && (
            <div className="auth-error-banner">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AUTHENTICATION FORM (NO AUTO-FILLS) */}
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="auth-form-group">
              <label className="auth-form-label">
                <span>Authorized Hospital Email</span>
                <span style={{ fontSize: "11px", color: "#0284c7" }}>{activeRoleMeta.label} Login</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`Enter your ${activeRoleMeta.label.toLowerCase()} email address...`}
                  className="auth-input-field"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">
                <span>Secure Password</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Case-sensitive</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔑</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password..."
                  className="auth-input-field"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="remember-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this terminal</span>
              </label>
              <span style={{ fontSize: "12px", color: "#0284c7", cursor: "pointer" }} onClick={() => alert("Please contact hospital IT helpdesk for password reset assistance.")}>
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter {activeRoleMeta.label} Portal</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>New patient seeking healthcare enrollment?</span>
            <Link to="/register">Create Patient Record →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
