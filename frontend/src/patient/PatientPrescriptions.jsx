import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import authService from "../services/auth";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientPrescriptions() {
  const user = authService.getCurrentUser();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("pharmacy/prescriptions/")
      .then((res) => {
        setPrescriptions(Array.isArray(res.data) ? res.data : res.data.results || []);
      })
      .catch((err) => console.error("Error loading prescriptions:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const med = (rx.medicine_name || "").toLowerCase();
    const doc = (rx.doctor_name || "").toLowerCase();
    const ins = (rx.instructions || "").toLowerCase();
    const q = search.toLowerCase();
    return med.includes(q) || doc.includes(q) || ins.includes(q);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="patient-layout">
      <PatientSidebar />

      <main className="patient-main">
        {/* HEADER */}
        <div className="patient-header">
          <div>
            <div className="patient-page-label">
              <span>●</span>
              <span>ELECTRONIC MEDICAL RECORDS</span>
            </div>
            <h1>My Prescriptions & Pharmacy Medications</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "14px" }}>
              Official medical prescriptions issued by your attending hospital physicians and dispensed via the hospital pharmacy.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                border: "1.5px solid #bae6fd",
                background: "#ffffff",
                color: "#0284c7",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.1)",
              }}
            >
              <span>🖨️</span>
              <span>Print Rx Records</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="patient-stats-grid">
          <div className="patient-stat-card">
            <div className="patient-stat-icon">💊</div>
            <div>
              <span className="patient-stat-label">Total Prescriptions</span>
              <div className="patient-stat-val">{prescriptions.length}</div>
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-icon">✅</div>
            <div>
              <span className="patient-stat-label">Active Regimens</span>
              <div className="patient-stat-val">{prescriptions.length}</div>
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-icon">🏥</div>
            <div>
              <span className="patient-stat-label">Pharmacy Status</span>
              <div className="patient-stat-val" style={{ fontSize: "16px", color: "#059669" }}>
                Synchronized
              </div>
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-icon">👨‍⚕️</div>
            <div>
              <span className="patient-stat-label">Consulting Physicians</span>
              <div className="patient-stat-val">
                {new Set(prescriptions.map((p) => p.doctor_name || "Doctor")).size}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH FILTER */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ position: "relative", maxWidth: "420px" }}>
            <span style={{ position: "absolute", left: "14px", top: "12px", fontSize: "16px" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medication name or prescribing doctor..."
              className="patient-input"
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                borderRadius: "12px",
                border: "1.5px solid #e2e8f0",
                fontSize: "13.5px",
                boxSizing: "border-box",
                background: "#ffffff",
              }}
            />
          </div>
        </div>

        {/* PRESCRIPTIONS CARDS / LIST */}
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px", animation: "pulse 1.5s infinite" }}>💊</div>
            <strong style={{ color: "#0f172a", fontSize: "16px" }}>Loading Your Prescriptions...</strong>
            <p style={{ margin: "4px 0 0" }}>Retrieving authorized prescriptions from Hospital Pharmacy registry.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "60px 20px",
              textAlign: "center",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
            }}
          >
            <span style={{ fontSize: "44px", display: "block", marginBottom: "12px" }}>💊</span>
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>No Prescriptions on File</h3>
            <p style={{ color: "#64748b", margin: "6px 0 16px", fontSize: "14px" }}>
              {search
                ? "No medications matched your search query."
                : "When your consulting doctor writes an electronic prescription, it will appear here with dosage and pharmacy details."}
            </p>
            <Link
              to="/patient/appointments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#ffffff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
              }}
            >
              <span>📅 Book Doctor Consultation</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {filtered.map((rx) => (
              <div
                key={rx.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px",
                  border: "1.5px solid #e0f2fe",
                  boxShadow: "0 8px 24px -6px rgba(2, 132, 199, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  {/* CARD HEADER */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                          color: "#0284c7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          border: "1px solid #7dd3fc",
                        }}
                      >
                        💊
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                          {rx.medicine_name}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Category: <strong>{rx.medicine_category}</strong> · ₹{rx.medicine_price || "0.00"}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#ecfdf5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      <span>✓</span>
                      <span>Verified Rx</span>
                    </span>
                  </div>

                  {/* CLINICAL DOSAGE & FREQUENCY */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Dosage
                        </span>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                          {rx.dosage}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Duration
                        </span>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284c7" }}>
                          ⏱️ {rx.duration}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Intake Regimen
                      </span>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0369a1", marginTop: "2px" }}>
                        {rx.frequency}
                      </div>
                    </div>
                  </div>

                  {/* INSTRUCTIONS */}
                  {rx.instructions && (
                    <div style={{ marginBottom: "16px", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                      <strong style={{ color: "#0f172a" }}>Doctor's Advice: </strong>
                      {rx.instructions}
                    </div>
                  )}
                </div>

                {/* CARD FOOTER */}
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <span style={{ display: "block", fontWeight: 700, color: "#0f172a" }}>
                      👨‍⚕️ {rx.doctor_name || "Attending Physician"}
                    </span>
                    <span>Prescribed: {rx.prescribed_date}</span>
                  </div>

                  <span
                    style={{
                      background: "#f0f9ff",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "11.5px",
                    }}
                  >
                    Pharmacy Dispensed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
