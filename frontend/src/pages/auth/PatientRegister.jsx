import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import "../Register.css";

export default function PatientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const setGender = (g) => {
    setFormData((prev) => ({ ...prev, gender: g }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password confirmation.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        age: parseInt(formData.age, 10) || 18,
        gender: formData.gender,
        address: formData.address.trim(),
      };

      await authService.registerPatient(payload);
      setSuccessMessage("Patient account created successfully! Initializing secure health portal...");

      setTimeout(() => {
        navigate("/login?preset=PATIENT");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === "string") {
          setErrorMessage(errData);
        } else if (errData.email) {
          setErrorMessage(Array.isArray(errData.email) ? errData.email[0] : errData.email);
        } else if (errData.error) {
          setErrorMessage(errData.error);
        } else {
          setErrorMessage("Failed to create patient record. Please check the entered data.");
        }
      } else {
        setErrorMessage("Network error. Please make sure the hospital backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="register-page">
      {/* NAVIGATION ARROW TO HOME */}
      <Link to="/" className="back-to-home-link" title="Return to CarePulse Home">
        <span className="back-arrow-icon">←</span>
        <span>Back to Home</span>
      </Link>

      <div className="register-container">
        {/* HEADER */}
        <div className="register-header">
          <div className="register-badge">
            <span>🛡️</span> New Patient Electronic Health Record (EHR) Intake
          </div>
          <h1>Create Patient Account</h1>
          <p>
            Join CarePulse Digital Healthcare. Access clinical consultations, electronic prescriptions,
            vital sign records, and diagnostic lab reports online.
          </p>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="reg-error-banner">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="reg-success-banner">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* SECTION 1: PERSONAL DEMOGRAPHICS */}
          <div className="form-section-title">
            <span>👤</span>
            <span>Personal Demographics</span>
          </div>

          <div className="register-form-grid">
            <div className="reg-field-group">
              <label className="reg-label">First Name *</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">👤</span>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  className="reg-input"
                  required
                />
              </div>
            </div>

            <div className="reg-field-group">
              <label className="reg-label">Last Name *</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">👤</span>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="reg-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-grid" style={{ marginTop: "18px" }}>
            <div className="reg-field-group">
              <label className="reg-label">Age (Years) *</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">🎂</span>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  className="reg-input"
                  min="1"
                  max="125"
                  required
                />
              </div>
            </div>

            <div className="reg-field-group">
              <label className="reg-label">Biological Gender *</label>
              <div className="gender-pill-group">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`gender-pill-btn ${formData.gender === g ? "active" : ""}`}
                    onClick={() => setGender(g)}
                  >
                    <span>{g === "Male" ? "👨" : g === "Female" ? "👩" : "⚧"}</span>
                    <span>{g}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT & RESIDENCE */}
          <div className="form-section-title">
            <span>📍</span>
            <span>Contact & Residential Information</span>
          </div>

          <div className="register-form-grid">
            <div className="reg-field-group">
              <label className="reg-label">Contact Mobile Number *</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">📞</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="reg-input"
                  required
                />
              </div>
            </div>

            <div className="reg-field-group">
              <label className="reg-label">Residential Address</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">🏠</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State"
                  className="reg-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PORTAL LOGIN CREDENTIALS */}
          <div className="form-section-title">
            <span>🔒</span>
            <span>Patient Portal Credentials</span>
          </div>

          <div className="register-form-grid full">
            <div className="reg-field-group">
              <label className="reg-label">
                <span>Account Email Address *</span>
                <span style={{ fontSize: "11px", color: "#0284c7" }}>Used for secure portal sign-in</span>
              </label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="reg-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-grid" style={{ marginTop: "18px" }}>
            <div className="reg-field-group">
              <label className="reg-label">
                <span>Create Security Password *</span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Min 6 characters</span>
              </label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">🔑</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create strong password..."
                  className="reg-input"
                  required
                />
              </div>
            </div>

            <div className="reg-field-group">
              <label className="reg-label">Confirm Security Password *</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">🔐</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password..."
                  className="reg-input"
                  required
                />
              </div>
              {formData.confirmPassword && (
                <div className={`password-match-status ${passwordsMatch ? "valid" : "invalid"}`}>
                  <span>{passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}</span>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" className="reg-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Enrolling Patient Record...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Open Health Portal</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="register-footer">
          <span>Already registered in CarePulse Healthcare system?</span>
          <Link to="/login?preset=PATIENT">Access Patient Login →</Link>
        </div>
      </div>
    </div>
  );
}
