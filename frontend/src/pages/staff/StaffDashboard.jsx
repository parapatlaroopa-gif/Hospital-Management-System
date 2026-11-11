import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import authService from "../../services/auth";
import "./StaffDashboard.css";

export default function StaffDashboard() {
  const role = authService.getRole();
  const user = authService.getCurrentUser();
  const doctor = role === "DOCTOR";
  const rxSectionRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Nurse vitals state
  const [vitals, setVitals] = useState({
    patient: "",
    blood_pressure: "120/80",
    heart_rate: 75,
    temperature: 98.6,
    spo2: 98,
    blood_sugar: 100,
    respiratory_rate: 16,
    notes: "",
  });

  // Doctor prescription state
  const [rxForm, setRxForm] = useState({
    patient: "",
    medicine: "",
    dosage: "1 Tablet (500mg)",
    frequency: "Twice Daily (Morning / Night)",
    duration: "5 Days",
    instructions: "Take after meals with water.",
  });
  const [submittingRx, setSubmittingRx] = useState(false);

  // Doctor nurse delegation state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    patient: "",
    nurse: "",
    notes: "Hourly vitals monitoring, medication administration, and routine patient care.",
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, p, m, rx, stf, asg] = await Promise.all([
        api.get("appointments/"),
        api.get("patients/"),
        api.get("pharmacy/medicines/"),
        api.get("pharmacy/prescriptions/"),
        api.get("staff/"),
        api.get("accounts/assignments/"),
      ]);
      setAppointments(Array.isArray(a.data) ? a.data : a.data.results || []);
      setPatients(Array.isArray(p.data) ? p.data : p.data.results || []);
      setMedicines(Array.isArray(m.data) ? m.data : m.data.results || []);
      setPrescriptions(Array.isArray(rx.data) ? rx.data : rx.data.results || []);
      setStaffList(Array.isArray(stf.data) ? stf.data : stf.data.results || []);
      setAssignments(Array.isArray(asg.data) ? asg.data : asg.data.results || []);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Unable to load your clinical workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`appointments/${id}/`, { status });
      setMessage(`Appointment marked as ${status.toLowerCase()}.`);
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Unable to update appointment.");
    }
  };

  const recordVitals = async (e) => {
    e.preventDefault();
    if (!vitals.patient) return;
    try {
      await api.post("patients/vitals/", {
        ...vitals,
        patient: Number(vitals.patient),
        recorded_by: `${user?.first_name || "Nurse"} ${user?.last_name || ""}`.trim(),
      });
      setMessage("Patient vitals successfully recorded to clinical registry.");
      setVitals((v) => ({ ...v, patient: "", notes: "" }));
      setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Unable to record vitals.");
    }
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!rxForm.patient) {
      setMessage("Please select a patient to prescribe medicine.");
      return;
    }
    if (!rxForm.medicine) {
      setMessage("Please choose a medication from the hospital pharmacy inventory.");
      return;
    }

    setSubmittingRx(true);
    try {
      await api.post("pharmacy/prescriptions/", {
        ...rxForm,
        patient: Number(rxForm.patient),
        medicine: Number(rxForm.medicine),
      });

      const selectedMed = medicines.find((m) => String(m.id) === String(rxForm.medicine));
      setMessage(`✅ Prescription for "${selectedMed?.name || 'Medication'}" successfully issued and sent to Hospital Pharmacy!`);
      
      // Reset form
      setRxForm({
        patient: "",
        medicine: "",
        dosage: "1 Tablet (500mg)",
        frequency: "Twice Daily (Morning / Night)",
        duration: "5 Days",
        instructions: "Take after meals with water.",
      });

      // Reload data to reflect decreased stock and new prescription
      loadData();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to submit prescription.");
    } finally {
      setSubmittingRx(false);
    }
  };

  const openPrescribeForPatient = (patientId) => {
    setRxForm((prev) => ({ ...prev, patient: String(patientId) }));
    if (rxSectionRef.current) {
      rxSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openAssignModalForPatient = (patientId) => {
    setAssignmentForm((prev) => ({
      ...prev,
      patient: String(patientId),
    }));
    setAssignModalOpen(true);
  };

  const handleAssignNurse = async (e) => {
    e.preventDefault();
    if (!assignmentForm.patient) {
      setMessage("Please select a patient to assign a nurse.");
      return;
    }
    if (!assignmentForm.nurse) {
      setMessage("Please select a staff nurse for this clinical care duty.");
      return;
    }
    setSubmittingAssign(true);
    try {
      await api.post("accounts/assignments/", {
        patient: Number(assignmentForm.patient),
        nurse: Number(assignmentForm.nurse),
        notes: assignmentForm.notes,
        status: "Active",
      });
      const pObj = patients.find((p) => String(p.id) === String(assignmentForm.patient));
      const nObj = staffList.find((s) => String(s.id) === String(assignmentForm.nurse));
      const nurseName = nObj ? `${nObj.first_name} ${nObj.last_name}` : "Staff Nurse";
      const patientName = pObj ? `${pObj.first_name} ${pObj.last_name}` : "Patient";
      setMessage(`✅ ${nurseName} successfully assigned to ${patientName} and reported to hospital administration!`);
      setAssignModalOpen(false);
      setAssignmentForm({
        patient: "",
        nurse: "",
        notes: "Hourly vitals monitoring, medication administration, and routine patient care.",
      });
      loadData();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Failed to assign staff nurse.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleUpdateAssignmentStatus = async (id, status) => {
    try {
      await api.patch(`accounts/assignments/${id}/`, { status });
      setMessage(`Assignment successfully marked as ${status.toLowerCase()}.`);
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage("Failed to update duty assignment status.");
    }
  };

  if (loading) {
    return (
      <div className="ds-dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>🩺</div>
          <h2 style={{ color: "#0f172a", margin: "0 0 6px" }}>Initializing Clinical Station...</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Syncing appointments, pharmacy inventory, and assigned patients.</p>
        </div>
      </div>
    );
  }

  const pending = appointments.filter((a) => ["Pending", "Confirmed"].includes(a.status)).length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="ds-dashboard">
      {/* CLINICAL HEADER */}
      <header className="ds-header">
        <div>
          <div className="ds-small-title">
            <span>●</span>
            <span>{doctor ? "PHYSICIAN CLINICAL DESK" : "NURSING CARE STATION"}</span>
          </div>
          <h1>
            <span className="ds-icon">{doctor ? "🩺" : "👩‍⚕️"}</span>
            <span>Welcome, {doctor ? "Dr. " : ""}{user?.first_name || "Clinician"}</span>
          </h1>
          <p className="ds-subtitle">
            {doctor
              ? "Clinical consultation queue, electronic pharmacy prescriptions, and patient care records."
              : "Inpatient bed telemetry, vital signs registration, and ward monitoring."}
          </p>
        </div>

        {/* PROFILE BADGE */}
        <div className="ds-profile">
          <div className="ds-profile-icon">{user?.first_name?.[0]?.toUpperCase() || (doctor ? "D" : "N")}</div>
          <div className="ds-profile-info">
            <span className="ds-profile-name">
              {doctor ? "Dr. " : ""}{user?.first_name || "Staff"} {user?.last_name || ""}
            </span>
            <span className="ds-profile-role">
              {doctor ? "Attending Physician" : "Registered Nurse"} · On Duty
            </span>
          </div>
        </div>
      </header>

      {/* VITALS / TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip">
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">🏥</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CLINICAL WARD</span>
            <span className="ds-telemetry-value">Main Wing B</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">💊</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">PHARMACY STATUS</span>
            <span className="ds-telemetry-value highlight">
              {medicines.length} Medications Ready
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">📜</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">PRESCRIPTIONS ISSUED</span>
            <span className="ds-telemetry-value highlight">
              {prescriptions.length} Active Rx
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon status">📡</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">STATION STATUS</span>
            <span className="ds-telemetry-value online">
              <span className="ds-pulse-dot"></span>
              Online & Syncing
            </span>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={`ds-alert ${message.includes("Unable") || message.includes("Failed") ? "ds-alert-error" : "ds-alert-success"}`}>
          <span style={{ fontSize: "18px" }}>{message.includes("Unable") || message.includes("Failed") ? "⚠️" : "✅"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* 4 STATS CARDS */}
      <div className="ds-stats-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-icon">📅</div>
          <div className="ds-stat-content">
            <span className="ds-stat-label">Total Appointments</span>
            <div className="ds-stat-number">{appointments.length}</div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">⏳</div>
          <div className="ds-stat-content">
            <span className="ds-stat-label">Pending / Confirmed</span>
            <div className="ds-stat-number">{pending}</div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">👥</div>
          <div className="ds-stat-content">
            <span className="ds-stat-label">Assigned Patients</span>
            <div className="ds-stat-number">{patients.length}</div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">💊</div>
          <div className="ds-stat-content">
            <span className="ds-stat-label">Pharmacy Rx Prescribed</span>
            <div className="ds-stat-number">{prescriptions.length}</div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">👩‍⚕️</div>
          <div className="ds-stat-content">
            <span className="ds-stat-label">Nurse Care Delegations</span>
            <div className="ds-stat-number">{assignments.filter((a) => a.status === "Active").length} Active</div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="ds-columns-grid">
        {/* LEFT PANEL: CONSULTATION QUEUE */}
        <section className="ds-panel-card">
          <div className="ds-panel-header">
            <div>
              <h3>📋 Clinical Appointment Queue</h3>
              <p>Patients scheduled for clinical consultation.</p>
            </div>
            <Link
              to="/staff/appointments"
              style={{
                color: "#0284c7",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              View all ({appointments.length}) →
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>🩺</span>
              <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>No Appointments in Queue</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Your consultation list is clear.</p>
            </div>
          ) : (
            appointments.slice(0, 5).map((a) => {
              const pName = a.patient_name || `Patient #${a.patient}`;
              const initial = pName[0]?.toUpperCase() || "P";
              const isPending = a.status === "Pending";
              const isConfirmed = a.status === "Confirmed";

              return (
                <div key={a.id} className="ds-queue-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="ds-queue-avatar">{initial}</div>
                    <div>
                      <div className="ds-queue-name">{pName}</div>
                      <div className="ds-queue-meta">
                        <span>🗓️ {a.appointment_date}</span>
                        <span>⏰ {a.appointment_time}</span>
                        <span>·</span>
                        <span style={{ color: "#334155" }}>{a.reason || "General Consultation"}</span>
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
                        <span>Confirm</span>
                      </button>
                    )}

                    {doctor && isConfirmed && (
                      <button onClick={() => updateStatus(a.id, "Completed")} className="ds-btn-complete">
                        <span>🩺</span>
                        <span>Complete</span>
                      </button>
                    )}

                    {doctor && a.patient && (
                      <button
                        onClick={() => openPrescribeForPatient(a.patient)}
                        className="ds-btn-prescribe"
                        title="Prescribe medication from pharmacy"
                      >
                        <span>💊</span>
                        <span>Prescribe</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* RIGHT PANEL: ASSIGNED PATIENTS */}
        <section className="ds-panel-card">
          <div className="ds-panel-header">
            <div>
              <h3>👥 Patients in Clinical Care</h3>
              <p>Active patients in your registry.</p>
            </div>
            <Link
              to="/staff/patients"
              style={{
                color: "#0284c7",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Directory →
            </Link>
          </div>

          {patients.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>👥</span>
              <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>No Assigned Patients</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Patients will appear here once booked or admitted.</p>
            </div>
          ) : (
            patients.slice(0, 5).map((p) => {
              const name = `${p.first_name} ${p.last_name}`;
              const initial = p.first_name?.[0]?.toUpperCase() || "P";

              return (
                <div key={p.id} className="ds-patient-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="ds-queue-avatar" style={{ width: "36px", height: "36px", fontSize: "13px" }}>
                      {initial}
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>{name}</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {p.gender} · Age {p.age || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {doctor && (
                      <>
                        <button
                          onClick={() => openAssignModalForPatient(p.id)}
                          className="ds-btn-confirm"
                          style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          title="Assign Staff Nurse to this Patient"
                        >
                          <span>👩‍⚕️ Nurse</span>
                        </button>
                        <button
                          onClick={() => openPrescribeForPatient(p.id)}
                          className="ds-btn-prescribe"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          <span>💊 Rx</span>
                        </button>
                      </>
                    )}
                    <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>
                      {p.phone || "No Phone"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* DOCTOR STAFF NURSE DELEGATION & CLINICAL DUTY ROSTER */}
      {doctor && (
        <section className="ds-panel-card" style={{ marginTop: "28px" }}>
          <div className="ds-panel-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>👩‍⚕️</span>
                <h3 style={{ margin: 0 }}>Staff Nurse Care Delegations & Clinical Orders</h3>
              </div>
              <p style={{ margin: "4px 0 0" }}>
                Assign verified hospital staff nurses to patients under your care with specific clinical orders. All duty updates are synchronized directly to the Administrative Census and Clinical Audit Reports.
              </p>
            </div>
            <button
              onClick={() => setAssignModalOpen(true)}
              className="ds-btn-confirm"
              style={{ padding: "8px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>＋</span>
              <span>Assign Staff Nurse</span>
            </button>
          </div>

          {/* ACTIVE ASSIGNMENTS TABLE */}
          {assignments.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>👩‍⚕️</span>
              <strong style={{ color: "#0f172a", fontSize: "15px", display: "block" }}>No Staff Nurses Currently Assigned</strong>
              <p style={{ color: "#64748b", margin: "4px 0 14px", fontSize: "13px" }}>
                Click "+ Assign Staff Nurse" above to delegate patient care, monitoring, or medication tasks to on-duty nurses.
              </p>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="ds-btn-submit"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                ＋ Delegate First Nurse Care Assignment
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ color: "#64748b", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
                    <th style={{ padding: "8px 14px" }}>Patient</th>
                    <th style={{ padding: "8px 14px" }}>Assigned Nurse</th>
                    <th style={{ padding: "8px 14px" }}>Clinical Care Instructions</th>
                    <th style={{ padding: "8px 14px" }}>Date Assigned</th>
                    <th style={{ padding: "8px 14px" }}>Status</th>
                    <th style={{ padding: "8px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asg) => {
                    const isActive = asg.status === "Active";
                    return (
                      <tr key={asg.id} style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                        <td style={{ padding: "14px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px", border: "1px solid #e2e8f0", borderRight: "none" }}>
                          <strong style={{ color: "#0f172a", fontSize: "14px", display: "block" }}>
                            {asg.patient_name || `Patient #${asg.patient}`}
                          </strong>
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>ID #{asg.patient}</span>
                        </td>
                        <td style={{ padding: "14px", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "16px" }}>👩‍⚕️</span>
                            <span style={{ fontWeight: 700, color: "#0369a1", fontSize: "13.5px" }}>
                              {asg.nurse_name || `Staff #${asg.nurse}`}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none", maxWidth: "280px" }}>
                          <span style={{ fontSize: "13px", color: "#334155" }}>
                            {asg.notes || "Standard clinical care and telemetry vitals"}
                          </span>
                        </td>
                        <td style={{ padding: "14px", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none" }}>
                          <span style={{ fontSize: "12.5px", color: "#64748b" }}>🗓️ {asg.assigned_date}</span>
                        </td>
                        <td style={{ padding: "14px", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none" }}>
                          <span
                            className={`ds-status-badge ${
                              isActive ? "ds-status-confirmed" : "ds-status-completed"
                            }`}
                          >
                            {asg.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "none", textAlign: "right" }}>
                          {isActive ? (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(asg.id, "Completed")}
                              className="ds-btn-complete"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              <span>✓</span>
                              <span>Mark Done</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                              ✓ Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* DOCTOR ELECTRONIC PRESCRIPTION STATION (PHARMACY INTEGRATED) */}
      {doctor && (
        <section ref={rxSectionRef} className="ds-panel-card" style={{ marginTop: "28px" }}>
          <div className="ds-panel-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>💊</span>
                <h3 style={{ margin: 0 }}>Doctor Electronic Prescription Desk (Hospital Pharmacy)</h3>
              </div>
              <p style={{ margin: "4px 0 0" }}>
                Prescribe verified medications directly from the Hospital Pharmacy inventory to patients with automated stock deduction.
              </p>
            </div>
            <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "12px", fontWeight: 700 }}>
              DOCTOR Rx DESK
            </span>
          </div>

          <form onSubmit={handlePrescribe} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {/* PATIENT SELECT */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Select Patient *
              </label>
              <select
                required
                value={rxForm.patient}
                onChange={(e) => setRxForm({ ...rxForm, patient: e.target.value })}
                className="ds-select"
              >
                <option value="">Choose patient for Rx...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} (#{p.id}) · {p.gender}, Age {p.age || "N/A"}
                  </option>
                ))}
              </select>
            </div>

            {/* MEDICINE FROM PHARMACY */}
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
                <option value="">Choose medication from inventory...</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.quantity <= 0}>
                    {m.name} ({m.category}) — {m.quantity > 0 ? `${m.quantity} in stock` : "OUT OF STOCK"} [₹{m.price}]
                  </option>
                ))}
              </select>
            </div>

            {/* DOSAGE */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Dosage Amount *
              </label>
              <input
                required
                value={rxForm.dosage}
                onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                placeholder="e.g. 1 Tablet (500mg)"
                className="ds-input"
              />
              <div className="ds-chip-group">
                {["1 Tab (500mg)", "1 Tab (650mg)", "1 Capsule", "5ml Syrup", "10ml Syrup"].map((chip) => (
                  <span
                    key={chip}
                    onClick={() => setRxForm({ ...rxForm, dosage: chip })}
                    className={`ds-chip ${rxForm.dosage === chip ? "active" : ""}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* FREQUENCY */}
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
              <div className="ds-chip-group">
                {["Twice Daily (Morning/Night)", "Thrice Daily (1-1-1)", "Once Daily (Morning)", "Once Daily (Bedtime)", "SOS (As Needed)"].map((f) => (
                  <span
                    key={f}
                    onClick={() => setRxForm({ ...rxForm, frequency: f })}
                    className={`ds-chip ${rxForm.frequency === f ? "active" : ""}`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* DURATION */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Prescription Duration *
              </label>
              <input
                required
                value={rxForm.duration}
                onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                placeholder="e.g. 5 Days"
                className="ds-input"
              />
              <div className="ds-chip-group">
                {["3 Days", "5 Days", "7 Days", "14 Days", "30 Days"].map((d) => (
                  <span
                    key={d}
                    onClick={() => setRxForm({ ...rxForm, duration: d })}
                    className={`ds-chip ${rxForm.duration === d ? "active" : ""}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Special Clinical Instructions
              </label>
              <input
                value={rxForm.instructions}
                onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                placeholder="e.g. Take after food with warm water..."
                className="ds-input"
              />
              <div className="ds-chip-group">
                {["Take after meals", "Take on empty stomach", "With warm water", "Avoid alcohol"].map((ins) => (
                  <span
                    key={ins}
                    onClick={() => setRxForm({ ...rxForm, instructions: ins })}
                    className={`ds-chip ${rxForm.instructions === ins ? "active" : ""}`}
                  >
                    {ins}
                  </span>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submittingRx}
                className="ds-btn-submit"
                style={{ minWidth: "260px" }}
              >
                <span>💊</span>
                <span>{submittingRx ? "Transmitting Rx..." : "Issue Prescription to Pharmacy"}</span>
              </button>
            </div>
          </form>

          {/* RECENT DOCTOR PRESCRIPTIONS TABLE */}
          <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, color: "#0f172a", fontSize: "15px", fontWeight: 800 }}>
                📜 Recent Prescriptions Issued ({prescriptions.length})
              </h4>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Real-time sync with Hospital Pharmacy Dispensation Desk
              </span>
            </div>

            {prescriptions.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>
                <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>💊</span>
                <strong style={{ color: "#0f172a" }}>No Prescriptions Issued Yet</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Use the form above to prescribe pharmacy medications for patients.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="ds-rx-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Prescribed Medication</th>
                      <th>Dosage & Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(0, 8).map((rx) => (
                      <tr key={rx.id}>
                        <td>
                          <strong style={{ color: "#0f172a", display: "block" }}>{rx.patient_name || `Patient #${rx.patient}`}</strong>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>PID: #{rx.patient}</span>
                        </td>
                        <td>
                          <span className={`ds-med-badge ${rx.medicine_category || 'Tablet'}`}>
                            <span>💊</span>
                            <span>{rx.medicine_name || `Medicine #${rx.medicine}`}</span>
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                            {rx.medicine_category} · ₹{rx.medicine_price || '0'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{rx.dosage}</div>
                          <div style={{ fontSize: "12px", color: "#0369a1" }}>{rx.frequency}</div>
                        </td>
                        <td>
                          <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                            ⏱️ {rx.duration}
                          </span>
                        </td>
                        <td style={{ maxWidth: "220px", fontSize: "12.5px", color: "#475569" }}>
                          {rx.instructions || "Standard prescription regimen."}
                        </td>
                        <td style={{ fontSize: "12.5px", color: "#64748b", whiteSpace: "nowrap" }}>
                          {rx.prescribed_date}
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                            <span>✓</span>
                            <span>Dispensed / Active</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* NURSE TELEMETRY RECORDING STATION */}
      {!doctor && (
        <section className="ds-panel-card" style={{ marginTop: "28px" }}>
          <div className="ds-panel-header">
            <div>
              <h3>🩺 Record Patient Vitals Telemetry</h3>
              <p>Enter clinical readings to attach directly to patient medical chart.</p>
            </div>
            <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "12px", fontWeight: 700 }}>
              NURSING DESK ONLY
            </span>
          </div>

          <form onSubmit={recordVitals} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Select Patient *
              </label>
              <select
                required
                value={vitals.patient}
                onChange={(e) => setVitals({ ...vitals, patient: e.target.value })}
                className="ds-select"
              >
                <option value="">Choose patient for vitals log...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} (#{p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Blood Pressure
              </label>
              <input
                value={vitals.blood_pressure}
                onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                placeholder="120/80"
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={vitals.heart_rate}
                onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                placeholder="75"
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Temperature (°F)
              </label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                placeholder="98.6"
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                SpO2 Oxygen (%)
              </label>
              <input
                type="number"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                placeholder="98"
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Blood Sugar (mg/dL)
              </label>
              <input
                type="number"
                value={vitals.blood_sugar}
                onChange={(e) => setVitals({ ...vitals, blood_sugar: e.target.value })}
                placeholder="100"
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Resp Rate (/min)
              </label>
              <input
                type="number"
                value={vitals.respiratory_rate}
                onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })}
                placeholder="16"
                className="ds-input"
              />
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Clinical Observation Notes
              </label>
              <input
                value={vitals.notes}
                onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                placeholder="Patient is conscious, alert, and resting comfortably..."
                className="ds-input"
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="ds-btn-submit" style={{ width: "100%", height: "46px" }}>
                <span>💾 Record Vitals</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* QUICK NURSE ASSIGNMENT MODAL */}
      {assignModalOpen && (
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
                    Delegate patient care and sync to hospital administrative reports
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignNurse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Select Patient under Care *
                </label>
                <select
                  required
                  value={assignmentForm.patient}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, patient: e.target.value })}
                  className="ds-select"
                >
                  <option value="">Choose patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (#{p.id}) · {p.gender}, Age {p.age || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

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
                  placeholder="e.g. Monitor hourly blood pressure and heart rate, administer IV antibiotic at 2 PM, check wound dressing..."
                  className="ds-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
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
