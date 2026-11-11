import { useEffect, useState } from "react";
import api from "../services/api";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientLaboratory() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("laboratory/tests/")
      .then((response) => {
        const data = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        setLabTests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Laboratory error:", error);
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
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#8b5cf6", textTransform: "uppercase" }}>
            DIAGNOSTIC PATHOLOGY & LAB
          </span>
          <h1 style={{ margin: "4px 0", color: "#1e293b", fontSize: "28px" }}>🧪 My Laboratory Reports</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Access ordered clinical tests, pathologist findings, and specimen analysis reports.
          </p>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading laboratory reports...</p>
        ) : labTests.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ color: "#1e293b" }}>No Laboratory Reports Found</h3>
            <p style={{ color: "#64748b" }}>Your diagnostic laboratory reports will appear here once processed.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {labTests.map((test) => (
              <div
                key={test.id}
                style={{
                  background: "white",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "17px", color: "#1e293b" }}>{test.test_name}</h2>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      background: test.status === "Completed" ? "#d1fae5" : "#fef3c7",
                      color: test.status === "Completed" ? "#065f46" : "#92400e",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {test.status}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                  <strong>Report Date:</strong> {test.test_date}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Pathologist Clinical Findings:
                  </span>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#1e293b",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {test.test_result || <span style={{ color: "#94a3b8" }}>Specimen received; analysis in progress.</span>}
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