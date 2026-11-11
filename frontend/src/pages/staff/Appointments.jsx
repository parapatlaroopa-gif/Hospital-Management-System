import { useEffect, useState } from "react";
import API from "../../services/api";
import authService from "../../services/auth";
import "./StaffDashboard.css";

export default function StaffAppointments() {
  const role = authService.getRole();
  const doctor = role === "DOCTOR";
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Prescription Modal State
  const [rxModalAppt, setRxModalAppt] = useState(null);
  const [rxForm, setRxForm] = useState({
    medicine: "",
    dosage: "1 Tablet (500mg)",
    frequency: "Twice Daily (Morning / Night)",
    duration: "5 Days",
    instructions: "Take after meals with warm water.",
  });
  const [submittingRx, setSubmittingRx] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      API.get("appointments/"),
      API.get("pharmacy/medicines/"),
    ])
      .then(([rAppt, rMed]) => {
        setAppointments(Array.isArray(rAppt.data) ? rAppt.data : rAppt.data.results || []);
        setMedicines(Array.isArray(rMed.data) ? rMed.data : rMed.data.results || []);
      })
      .catch((e) => setMessage(e.response?.data?.detail || "Unable to load appointments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, next) => {
    try {
      await API.patch(`appointments/${id}/`, { status: next });
      setMessage(`Appointment successfully marked as ${next.toLowerCase()}.`);
      load();
      setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Unable to update appointment status.");
    }
  };

  const handleOpenRxModal = (appt) => {
    setRxModalAppt(appt);
    setRxForm({
      medicine: "",
      dosage: "1 Tablet (500mg)",
      frequency: "Twice Daily (Morning / Night)",
      duration: "5 Days",
      instructions: "Take after meals with warm water.",
    });
  };

  const handleCloseRxModal = () => {
    setRxModalAppt(null);
  };

  const handlePrescribeSubmit = async (e) => {
    e.preventDefault();
    if (!rxForm.medicine) {
      setMessage("Please choose a medication from the hospital pharmacy inventory.");
      return;
    }

    setSubmittingRx(true);
    try {
      await API.post("pharmacy/prescriptions/", {
        ...rxForm,
        patient: Number(rxModalAppt.patient),
        medicine: Number(rxForm.medicine),
      });

      const selectedMed = medicines.find((m) => String(m.id) === String(rxForm.medicine));
      setMessage(`✅ Prescription for "${selectedMed?.name || 'Medication'}" successfully issued for ${rxModalAppt.patient_name || 'Patient'} and sent to Pharmacy!`);
      setRxModalAppt(null);
      load();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to submit prescription.");
    } finally {
      setSubmittingRx(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesFilter = filter === "ALL" || a.status?.toUpperCase() === filter;
    const pName = (a.patient_name || `Patient #${a.patient}`).toLowerCase();
    const reason = (a.reason || "").toLowerCase();
    const matchesSearch = pName.includes(search.toLowerCase()) || reason.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="ds-dashboard">
      {/* HEADER */}
      <header className="ds-header">
        <div>
          <div className="ds-small-title">
            <span>●</span>
            <span>CLINICAL CONSULTATION SCHEDULE</span>
          </div>
          <h1>
            <span className="ds-icon">📅</span>
            <span>{doctor ? "My Doctor Appointments" : "Clinical Appointments Queue"}</span>
          </h1>
          <p className="ds-subtitle">
            Manage your consultation roster, triage incoming patients, and prescribe medications directly from the pharmacy.
          </p>
        </div>

        {/* Filter Quick-Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                border: filter === f ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                background: filter === f ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" : "#ffffff",
                color: filter === f ? "#0369a1" : "#475569",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {f} {f === "PENDING" ? `(${pendingCount})` : f === "CONFIRMED" ? `(${confirmedCount})` : f === "COMPLETED" ? `(${completedCount})` : `(${appointments.length})`}
            </button>
          ))}
        </div>
      </header>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={`ds-alert ${message.includes("Unable") || message.includes("Failed") ? "ds-alert-error" : "ds-alert-success"}`}>
          <span style={{ fontSize: "18px" }}>{message.includes("Unable") || message.includes("Failed") ? "⚠️" : "✅"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "14px", fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments by patient name or consultation reason..."
            className="ds-input"
            style={{ paddingLeft: "42px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
            Showing {filteredAppointments.length} of {appointments.length} Consultations
          </span>
        </div>
      </div>

      {/* APPOINTMENTS LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "18px", padding: "60px 20px", textAlign: "center", border: "1.5px solid #e2e8f0" }}>
            <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>🗓️</span>
            <strong style={{ fontSize: "17px", color: "#0f172a", display: "block" }}>No Appointments Found</strong>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "14px" }}>
              {search ? "No consultation matches your query." : "No patient consultations in this category."}
            </p>
          </div>
        ) : (
          filteredAppointments.map((a) => {
            const pName = a.patient_name || `Patient #${a.patient}`;
            const initial = pName[0]?.toUpperCase() || "P";
            const isPending = a.status === "Pending";
            const isConfirmed = a.status === "Confirmed";

            return (
              <div key={a.id} className="ds-queue-item" style={{ padding: "18px 24px", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="ds-queue-avatar" style={{ width: "50px", height: "50px", fontSize: "18px" }}>
                    {initial}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span className="ds-queue-name" style={{ fontSize: "16px", margin: 0 }}>{pName}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>· ID #{a.patient}</span>
                    </div>
                    <div className="ds-queue-meta">
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>🗓️ {a.appointment_date}</span>
                      <span>⏰ {a.appointment_time}</span>
                      <span>·</span>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
                        {a.reason || "General Consultation"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ds-queue-actions">
                  <span
                    className={`ds-status-badge ${
                      a.status === "Confirmed"
                        ? "ds-status-confirmed"
                        : a.status === "Pending"
                        ? "ds-status-pending"
                        : a.status === "Completed"
                        ? "ds-status-completed"
                        : "ds-status-cancelled"
                    }`}
                  >
                    {a.status}
                  </span>

                  {doctor && isPending && (
                    <button onClick={() => updateStatus(a.id, "Confirmed")} className="ds-btn-confirm">
                      <span>✓</span>
                      <span>Confirm Visit</span>
                    </button>
                  )}

                  {doctor && isConfirmed && (
                    <button onClick={() => updateStatus(a.id, "Completed")} className="ds-btn-complete">
                      <span>🩺</span>
                      <span>Complete Consultation</span>
                    </button>
                  )}

                  {/* DOCTOR PRESCRIBE BUTTON */}
                  {doctor && a.patient && (
                    <button
                      onClick={() => handleOpenRxModal(a)}
                      className="ds-btn-prescribe"
                      title="Issue Doctor Prescription from Pharmacy"
                    >
                      <span>💊</span>
                      <span>Prescribe Rx</span>
                    </button>
                  )}

                  {doctor && !["Completed", "Cancelled"].includes(a.status) && (
                    <button
                      onClick={() => updateStatus(a.id, "Cancelled")}
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        color: "#e11d48",
                        padding: "7px 12px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QUICK PRESCRIPTION MODAL */}
      {rxModalAppt && (
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
              maxWidth: "580px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.25)",
              border: "1px solid #e0f2fe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                  💊
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                    Doctor Prescription (Rx)
                  </h3>
                  <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                    Prescribing for: <strong style={{ color: "#0284c7" }}>{rxModalAppt.patient_name || `Patient #${rxModalAppt.patient}`}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseRxModal}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePrescribeSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Select Medication from Pharmacy *
                </label>
                <select
                  required
                  value={rxForm.medicine}
                  onChange={(e) => setRxForm({ ...rxForm, medicine: e.target.value })}
                  className="ds-select"
                >
                  <option value="">Choose medicine from inventory...</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.quantity <= 0}>
                      {m.name} ({m.category}) — {m.quantity > 0 ? `${m.quantity} in stock` : "OUT OF STOCK"} [₹{m.price}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Dosage *
                  </label>
                  <input
                    required
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    placeholder="e.g. 1 Tablet (500mg)"
                    className="ds-input"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Duration *
                  </label>
                  <input
                    required
                    value={rxForm.duration}
                    onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                    placeholder="e.g. 5 Days"
                    className="ds-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Intake Frequency *
                </label>
                <input
                  required
                  value={rxForm.frequency}
                  onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                  placeholder="e.g. Twice Daily (Morning / Night)"
                  className="ds-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Instructions for Patient
                </label>
                <input
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  placeholder="e.g. Take after meals with plenty of water..."
                  className="ds-input"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseRxModal}
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
                  disabled={submittingRx}
                  className="ds-btn-submit"
                  style={{ padding: "10px 22px" }}
                >
                  <span>💊</span>
                  <span>{submittingRx ? "Saving..." : "Issue & Send to Pharmacy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
