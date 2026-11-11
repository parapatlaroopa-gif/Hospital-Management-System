
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Emergency() {
  const navigate = useNavigate();

  const [showContact, setShowContact] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [teamVisible, setTeamVisible] = useState(false);
  const [message, setMessage] = useState("");

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    condition: "",
  });

  const handleChange = (e) => {
    setPatient({
      ...patient,
      [e.target.name]: e.target.value,
    });
  };

  const registerPatient = (e) => {
    e.preventDefault();

    if (!patient.name || !patient.age || !patient.condition) {
      setMessage("Please enter all patient details.");
      return;
    }

    setMessage(
      `Emergency case created successfully for ${patient.name}.`
    );

    setPatient({
      name: "",
      age: "",
      condition: "",
    });

    setShowPatientForm(false);
  };

  // CONTACT FUNCTIONALITY
  const emergencyContact = () => {
    setShowContact((previous) => !previous);
    setMessage("");
  };

  const requestAmbulance = () => {
    setAmbulanceRequested(true);

    setMessage(
      "Ambulance request has been submitted successfully."
    );
  };

  const showMedicalTeam = () => {
    setTeamVisible(!teamVisible);
    setMessage("");
  };

  const checkStatus = () => {
    setMessage(
      "Emergency Department is currently available."
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#17396b",
              fontSize: "28px",
            }}
          >
            🚨 Emergency
          </h1>

          <p
            style={{
              marginTop: "7px",
              color: "#71829d",
              fontSize: "13px",
            }}
          >
            Emergency services and assistance
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={dashboardButton}
        >
          ← Dashboard
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            background: "#e8f8ef",
            border: "1px solid #b7e4c7",
            color: "#16834b",
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ✓ {message}
        </div>
      )}

      {/* TOP CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "18px",
        }}
      >
        {/* EMERGENCY SERVICES */}
        <div style={cardStyle}>
          <div style={iconStyle}>🚨</div>

          <h2 style={headingStyle}>
            Emergency Services Available
          </h2>

          <p style={paragraphStyle}>
            Emergency department is available for immediate medical assistance.
          </p>

          <span style={availableBadge}>
            Available
          </span>

          <button
            onClick={() => {
              setShowPatientForm(true);
              setMessage("");
            }}
            style={{
              ...actionButton,
              background: "#dc2626",
            }}
          >
            🚨 Start Emergency Case
          </button>

          <button
            onClick={checkStatus}
            style={{
              ...secondaryButton,
              marginTop: "10px",
            }}
          >
            Check Status
          </button>
        </div>

        {/* EMERGENCY CONTACT */}
        <div style={cardStyle}>
          <div style={iconStyle}>📞</div>

          <h2 style={headingStyle}>
            Emergency Contact
          </h2>

          <p style={paragraphStyle}>
            Contact the emergency department for immediate assistance.
          </p>

          <button
            onClick={emergencyContact}
            style={{
              ...actionButton,
              background: "#2878f0",
            }}
          >
            {showContact
              ? "Hide Contact Information"
              : "Contact Emergency Department"}
          </button>

          {/* CONTACT INFORMATION */}
          {showContact && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "#f3f7ff",
                border: "1px solid #dce8ff",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#19375f",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                📞 Emergency Department
              </p>

              <p
                style={{
                  margin: "5px 0",
                  color: "#71829d",
                  fontSize: "12px",
                }}
              >
                📞 Emergency Phone: +91 98765 43210
              </p>

              <p
                style={{
                  margin: "5px 0",
                  color: "#71829d",
                  fontSize: "12px",
                }}
              >
                🕐 Emergency Desk: Available 24/7
              </p>

              <p
                style={{
                  margin: "5px 0",
                  color: "#71829d",
                  fontSize: "12px",
                }}
              >
                👨‍⚕️ Emergency Medical Team: On Duty
              </p>
            </div>
          )}
        </div>

        {/* EMERGENCY DEPARTMENT */}
        <div style={cardStyle}>
          <div style={iconStyle}>🏥</div>

          <h2 style={headingStyle}>
            Emergency Department
          </h2>

          <p style={paragraphStyle}>
            View emergency department services and manage urgent patient cases.
          </p>

          <button
            onClick={() => navigate("/emergency")}
            style={{
              ...actionButton,
              background: "#17396b",
            }}
          >
            🚨 Emergency Department
          </button>
        </div>
      </div>

      {/* ADDITIONAL SERVICES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "18px",
          marginTop: "20px",
        }}
      >
        {/* MEDICAL TEAM */}
        <div style={cardStyle}>
          <div style={iconStyle}>👨‍⚕️</div>

          <h2 style={headingStyle}>
            Emergency Medical Team
          </h2>

          <p style={paragraphStyle}>
            Check the current availability of emergency doctors and medical staff.
          </p>

          <button
            onClick={showMedicalTeam}
            style={{
              ...actionButton,
              background: "#2878f0",
            }}
          >
            {teamVisible
              ? "Hide Team Status"
              : "View Team Status"}
          </button>

          {teamVisible && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "#f3f7ff",
                border: "1px solid #dce8ff",
                borderRadius: "8px",
              }}
            >
              <p style={teamText}>
                ✓ Emergency Doctor — Available
              </p>

              <p style={teamText}>
                ✓ Emergency Nurse — Available
              </p>

              <p style={teamText}>
                ✓ Medical Staff — On Duty
              </p>
            </div>
          )}
        </div>

        {/* AMBULANCE */}
        <div style={cardStyle}>
          <div style={iconStyle}>🚑</div>

          <h2 style={headingStyle}>
            Ambulance Service
          </h2>

          <p style={paragraphStyle}>
            Request ambulance transportation for emergency patient cases.
          </p>

          <span
            style={{
              ...availableBadge,
              background: ambulanceRequested ? "#fff4e5" : "#e8f8ef",
              color: ambulanceRequested ? "#b45309" : "#16834b",
            }}
          >
            {ambulanceRequested
              ? "Request Submitted"
              : "Available"}
          </span>

          <button
            onClick={requestAmbulance}
            disabled={ambulanceRequested}
            style={{
              ...actionButton,
              background: ambulanceRequested ? "#9ca3af" : "#f59e0b",
              cursor: ambulanceRequested
                ? "not-allowed"
                : "pointer",
            }}
          >
            {ambulanceRequested
              ? "Ambulance Requested"
              : "Request Ambulance"}
          </button>
        </div>
      </div>

      {/* EMERGENCY PATIENT FORM */}
      {showPatientForm && (
        <div
          style={{
            ...cardStyle,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#17396b",
              fontSize: "20px",
            }}
          >
            🚨 Emergency Patient Registration
          </h2>

          <p style={paragraphStyle}>
            Enter the patient's basic information to create an emergency case.
          </p>

          <form onSubmit={registerPatient}>
            <input
              type="text"
              name="name"
              placeholder="Patient Name"
              value={patient.name}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="number"
              name="age"
              placeholder="Patient Age"
              value={patient.age}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="condition"
              placeholder="Emergency Condition"
              value={patient.condition}
              onChange={handleChange}
              style={inputStyle}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                type="submit"
                style={{
                  ...actionButton,
                  background: "#dc2626",
                  width: "auto",
                  marginTop: 0,
                }}
              >
                Register Emergency Patient
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPatientForm(false);
                  setMessage("");
                }}
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMERGENCY ASSISTANCE */}
      <div
        style={{
          ...cardStyle,
          marginTop: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#17396b",
            fontSize: "18px",
          }}
        >
          Emergency Assistance
        </h2>

        <p style={paragraphStyle}>
          Use the options below to manage emergency patients,
          contact emergency services, request ambulance
          assistance, and view admissions.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "18px",
          }}
        >
          <button
            onClick={() => {
              setShowPatientForm(true);
              setMessage("");
            }}
            style={{
              ...actionButton,
              background: "#dc2626",
              width: "auto",
              marginTop: 0,
            }}
          >
            🚨 Register Emergency Patient
          </button>

          <button
            onClick={requestAmbulance}
            disabled={ambulanceRequested}
            style={{
              ...actionButton,
              background: ambulanceRequested ? "#9ca3af" : "#f59e0b",
              width: "auto",
              marginTop: 0,
              cursor: ambulanceRequested
                ? "not-allowed"
                : "pointer",
            }}
          >
            🚑
            {ambulanceRequested
              ? " Ambulance Requested"
              : " Request Ambulance"}
          </button>

          <button
            onClick={() => navigate("/admissions")}
            style={{
              ...actionButton,
              background: "#2878f0",
              width: "auto",
              marginTop: 0,
            }}
          >
            🏥 View Admissions
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e9f2",
  borderRadius: "12px",
  padding: "22px",
};

const iconStyle = {
  fontSize: "30px",
  marginBottom: "12px",
};

const headingStyle = {
  margin: 0,
  color: "#19375f",
  fontSize: "16px",
};

const paragraphStyle = {
  color: "#71829d",
  fontSize: "12px",
  lineHeight: "1.7",
};

const availableBadge = {
  display: "inline-block",
  background: "#e8f8ef",
  color: "#16834b",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "600",
};

const actionButton = {
  display: "block",
  marginTop: "15px",
  width: "100%",
  padding: "10px",
  border: "none",
  borderRadius: "7px",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "12px",
};

const secondaryButton = {
  display: "block",
  width: "100%",
  padding: "10px",
  border: "1px solid #d7deea",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#19375f",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "12px",
};

const dashboardButton = {
  border: "none",
  cursor: "pointer",
  background: "#2878f0",
  color: "#ffffff",
  padding: "10px 18px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
};

const cancelButton = {
  padding: "10px 18px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontWeight: "600",
};

const teamText = {
  margin: "7px 0",
  color: "#71829d",
  fontSize: "12px",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  marginTop: "10px",
  border: "1px solid #d7deea",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "13px",
};

export default Emergency;

