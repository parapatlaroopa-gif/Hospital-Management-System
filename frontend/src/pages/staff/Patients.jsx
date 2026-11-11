import { useEffect, useState } from "react";
import API from "../../services/api";
import authService from "../../services/auth";
import "./StaffDashboard.css";

export default function StaffPatients() {
  const role = authService.getRole();
  const doctor = role === "DOCTOR";
  const [patients, setPatients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  // Nurse Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetPatient, setTargetPatient] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    nurse: "",
    notes: "Hourly vitals monitoring, medication administration, and routine patient care.",
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      API.get("patients/"),
      API.get("staff/"),
    ])
      .then(([rPat, rStf]) => {
        setPatients(Array.isArray(rPat.data) ? rPat.data : rPat.data.results || []);
        setStaffList(Array.isArray(rStf.data) ? rStf.data : rStf.data.results || []);
      })
      .catch((e) => setError(e.response?.data?.detail || "Unable to load patient records."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssignNurse = async (e) => {
    e.preventDefault();
    if (!targetPatient?.id) return;
    if (!assignmentForm.nurse) {
      alert("Please choose a staff nurse for this care assignment.");
      return;
    }
    setSubmittingAssign(true);
    try {
      await API.post("accounts/assignments/", {
        patient: Number(targetPatient.id),
        nurse: Number(assignmentForm.nurse),
        notes: assignmentForm.notes,
        status: "Active",
      });
      const nurseObj = staffList.find((s) => String(s.id) === String(assignmentForm.nurse));
      const nurseName = nurseObj ? `${nurseObj.first_name} ${nurseObj.last_name}` : "Staff Nurse";
      setSuccessMsg(`✅ ${nurseName} successfully assigned to ${targetPatient.first_name} ${targetPatient.last_name} and reported to hospital administration!`);
      setAssignModalOpen(false);
      setTargetPatient(null);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to assign staff nurse.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const address = (p.address || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || phone.includes(q) || address.includes(q);
  });

  return (
    <div className="ds-dashboard">
      {/* HEADER */}
      <header className="ds-header">
        <div>
          <div className="ds-small-title">
            <span>●</span>
            <span>CLINICAL PATIENT DIRECTORY</span>
          </div>
          <h1>
            <span className="ds-icon">👥</span>
            <span>{doctor ? "My Clinical Patients" : "Assigned Patient Care List"}</span>
          </h1>
          <p className="ds-subtitle">
            {doctor
              ? "Patients connected to your consultation roster and medical appointments."
              : "Patients assigned to your nursing ward and clinical telemetry monitoring."}
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #bae6fd",
            padding: "10px 20px",
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(148, 163, 184, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "24px" }}>📋</span>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Total Patients
            </div>
            <strong style={{ fontSize: "20px", color: "#0f172a" }}>{patients.length}</strong>
          </div>
        </div>
      </header>

      {/* ALERTS */}
      {error && (
        <div className="ds-alert ds-alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="ds-alert ds-alert-success">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* SEARCH BAR */}
      <div
        style={{
          background: "#ffffff",
          border: "1.5px solid rgba(186, 230, 253, 0.85)",
          borderRadius: "18px",
          padding: "16px 22px",
          marginBottom: "26px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          boxShadow: "0 4px 16px rgba(148, 163, 184, 0.08)",
        }}
      >
        <span style={{ fontSize: "20px" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by patient name, contact number, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ds-input"
          style={{ border: "none", padding: "6px 0", fontSize: "14px", boxShadow: "none" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px" }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* PATIENTS GRID */}
      {loading ? (
        <div className="ds-panel-card" style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>🩺</div>
          <p style={{ margin: 0 }}>Retrieving patient medical charts...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="ds-panel-card" style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          <span style={{ fontSize: "44px", display: "block", marginBottom: "12px" }}>👥</span>
          <strong style={{ fontSize: "17px", color: "#0f172a", display: "block" }}>No Patients Found</strong>
          <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
            {search ? "No patient matches your search query." : "There are currently no patients linked to your station."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredPatients.map((p) => {
            const initial = `${p.first_name?.[0] || ""}${p.last_name?.[0] || ""}`.toUpperCase() || "P";

            return (
              <div
                key={p.id}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid rgba(186, 230, 253, 0.9)",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 6px 20px rgba(148, 163, 184, 0.08)",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 60%, #7dd3fc 100%)",
                        color: "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "800",
                        boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
                        border: "2px solid #ffffff",
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>

                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#0284c7",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Patient #{p.id}
                      </span>
                      <h3 style={{ margin: "2px 0 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                        {p.first_name} {p.last_name}
                      </h3>
                    </div>

                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#059669",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      Active
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 700 }}>AGE</span>
                      <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{p.age ? `${p.age} Yrs` : "N/A"}</strong>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 700 }}>GENDER</span>
                      <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{p.gender || "Other"}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📱</span>
                    <span>{p.phone || "No Phone Recorded"}</span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span>📍</span>
                    <span style={{ wordBreak: "break-word" }}>{p.address || "CarePulse Registered Patient"}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "14px",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Registered Record</span>
                  <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>CarePulse Registry</span>
                </div>

                {doctor && (
                  <button
                    onClick={() => {
                      setTargetPatient(p);
                      setAssignmentForm({
                        nurse: "",
                        notes: `Hourly vitals monitoring, medication administration, and clinical care for ${p.first_name} ${p.last_name}.`,
                      });
                      setAssignModalOpen(true);
                    }}
                    className="ds-btn-confirm"
                    style={{ width: "100%", marginTop: "14px", justifyContent: "center", borderRadius: "10px", padding: "8px 12px" }}
                  >
                    <span>👩‍⚕️</span>
                    <span>Assign Staff Nurse</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK NURSE ASSIGNMENT MODAL */}
      {assignModalOpen && targetPatient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "560px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.25)",
              border: "1px solid #e0f2fe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                  👩‍⚕️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                    Assign Staff Nurse
                  </h3>
                  <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                    Patient: <strong style={{ color: "#0284c7" }}>{targetPatient.first_name} {targetPatient.last_name}</strong> (#{targetPatient.id})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setTargetPatient(null);
                }}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignNurse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Select On-Duty Staff Nurse *
                </label>
                <select
                  required
                  value={assignmentForm.nurse}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, nurse: e.target.value })}
                  className="ds-select"
                >
                  <option value="">Choose staff nurse...</option>
                  {(staffList.filter((s) => (s.role || "").toLowerCase().includes("nurse") || !s.role).length > 0
                    ? staffList.filter((s) => (s.role || "").toLowerCase().includes("nurse") || !s.role)
                    : staffList
                  ).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.role || "Nurse"}) - Ph: {s.phone || "On Station"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Clinical Care Orders & Nurse Instructions *
                </label>
                <textarea
                  rows="3"
                  required
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  placeholder="e.g. Hourly vitals monitoring, medication administration, routine patient care..."
                  className="ds-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalOpen(false);
                    setTargetPatient(null);
                  }}
                  style={{
                    padding: "10px 18px",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="ds-btn-submit"
                  style={{ padding: "10px 22px" }}
                >
                  <span>👩‍⚕️</span>
                  <span>{submittingAssign ? "Saving..." : "Assign & Report to Administration"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
