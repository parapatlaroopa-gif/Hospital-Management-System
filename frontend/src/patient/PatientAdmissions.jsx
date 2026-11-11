import React, { useEffect, useState } from "react";
import api from "../services/api";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("admissions/")
      .then((response) => {
        const records = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        setAdmissions(records);
      })
      .catch((error) => {
        console.error("Admissions error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="patient-layout">
      <PatientSidebar />

      <main className="patient-main" style={{ minHeight: "100vh", padding: "30px", background: "#f8fafc" }}>
        <div
          style={{
            background: "#ffffff",
            padding: "24px 28px",
            borderRadius: "14px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
            INPATIENT WARD CARE
          </span>
          <h1 style={{ margin: "4px 0", color: "#1e293b", fontSize: "28px" }}>🏥 My Inpatient Admissions</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Track hospital room allocations, admitted dates, attending physicians, and discharge summaries.
          </p>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading admissions...</p>
        ) : admissions.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ color: "#1e293b" }}>No Inpatient Admissions</h3>
            <p style={{ color: "#64748b" }}>You currently have no active or historical hospital ward admissions.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {admissions.map((admission) => (
              <div
                key={admission.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "22px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px", fontSize: "18px", color: "#1e293b" }}>
                      {admission.patient_name || "Inpatient Care"}
                    </h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Attending Doctor: <strong>{admission.doctor_name || "Dr. John Smith"}</strong>
                    </p>
                  </div>

                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: admission.status === "Admitted" ? "#dcfce7" : "#f1f5f9",
                      color: admission.status === "Admitted" ? "#15803d" : "#475569",
                    }}
                  >
                    {admission.status || "Admitted"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "14px",
                    padding: "14px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Room / Bed</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>{admission.room_number || "ICU-Bed 04"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Admission Date</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>{admission.admission_date}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Discharge Date</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>{admission.discharge_date || "Still In Care"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Admission ID</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>#ADM-{admission.id}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}