import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "10:00",
    reason: "",
    status: "Pending",
  });

  const fetchAppointments = () => {
    setLoading(true);
    API.get("appointments/")
      .then((response) => {
        setAppointments(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Appointment API Error:", error);
        setMessage("Failed to load appointment schedule.");
      })
      .finally(() => setLoading(false));
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const [pRes, dRes] = await Promise.all([API.get("patients/"), API.get("doctors/")]);
      setPatients(Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []);
      setDoctors(Array.isArray(dRes.data) ? dRes.data : dRes.data?.results || []);
    } catch (err) {
      console.error("Error loading doctors/patients:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...formData,
      patient: Number(formData.patient),
      doctor: Number(formData.doctor),
    };

    const req = editingId
      ? API.put(`appointments/${editingId}/`, payload)
      : API.post("appointments/", payload);

    req
      .then(() => {
        setMessage(editingId ? "Appointment updated successfully!" : "Appointment scheduled successfully!");
        resetForm();
        fetchAppointments();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving appointment:", error);
        const data = error.response?.data;
        let errMsg = "Failed to save appointment.";
        if (data && typeof data === "object") {
          if (data.appointment_time) errMsg = Array.isArray(data.appointment_time) ? data.appointment_time[0] : data.appointment_time;
          else if (data.appointment_date) errMsg = Array.isArray(data.appointment_date) ? data.appointment_date[0] : data.appointment_date;
          else if (data.detail) errMsg = data.detail;
        }
        setMessage(errMsg);
      });
  };

  const handleEdit = (apt) => {
    setEditingId(apt.id);
    setFormData({
      patient: apt.patient || "",
      doctor: apt.doctor || "",
      appointment_date: apt.appointment_date || "",
      appointment_time: apt.appointment_time || "10:00",
      reason: apt.reason || "",
      status: apt.status || "Pending",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to cancel and delete this appointment?")) return;

    API.delete(`appointments/${id}/`)
      .then(() => {
        setMessage("Appointment deleted successfully!");
        fetchAppointments();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
        setMessage("Failed to delete appointment.");
      });
  };

  const resetForm = () => {
    setFormData({
      patient: "",
      doctor: "",
      appointment_date: new Date().toISOString().split("T")[0],
      appointment_time: "10:00",
      reason: "",
      status: "Pending",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const q = search.toLowerCase();
    const pName = (apt.patient_name || `Patient #${apt.patient}`).toLowerCase();
    const dName = (apt.doctor_name || `Doctor #${apt.doctor}`).toLowerCase();
    const reason = (apt.reason || "").toLowerCase();
    const matchesSearch = pName.includes(q) || dName.includes(q) || reason.includes(q);
    const matchesStatus = statusFilter === "ALL" || (apt.status || "").toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAppts = appointments.length;
  const pendingCount = appointments.filter((a) => (a.status || "").toLowerCase() === "pending").length;
  const confirmedCount = appointments.filter((a) => (a.status || "").toLowerCase() === "confirmed").length;
  const completedCount = appointments.filter((a) => (a.status || "").toLowerCase() === "completed").length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>📅 Clinical Appointments</h1>
          <p>Schedule doctor consultations, review pending visits, and manage hospital outpatient rosters</p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else {
              setShowForm(true);
              setMessage("");
            }
          }}
          className={showForm ? "admin-btn-cancel" : "admin-btn-primary"}
        >
          {showForm ? "✕ Cancel" : "＋ Schedule Appointment"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">📅</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CONSULTATION QUEUE</span>
            <span className="ds-telemetry-value">{totalAppts} Booked Roster</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">⏳</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">PENDING VISITS</span>
            <span className="ds-telemetry-value highlight">
              {pendingCount} Awaiting Triage
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">✅</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CONFIRMED CONSULTATIONS</span>
            <span className="ds-telemetry-value highlight" style={{ color: "#16a34a" }}>
              {confirmedCount} Ready to See Doctor
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
        <div className={`admin-alert ${message.includes("successfully") ? "admin-alert-success" : "admin-alert-error"}`}>
          <span>{message.includes("successfully") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* 4 STATS METRIC SUMMARY */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📅</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Appointments</span>
            <div className="admin-stat-value">{totalAppts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Triage</span>
            <div className="admin-stat-value" style={{ color: "#d97706" }}>{pendingCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🩺</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Confirmed Sessions</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>{confirmedCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Completed Consults</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Consultation Booking" : "📅 Schedule Doctor Consultation"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Patient *</label>
                <select
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">Select registered patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (#{p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Consulting Physician *</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">Select doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Appointment Date *</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Appointment Time *</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Appointment Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="admin-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Reason for Visit / Clinical Notes</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g., General checkup, Routine cardiovascular follow-up"
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Update Booking" : "＋ Confirm Appointment"}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH & FILTERS */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "22px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: "260px", marginBottom: 0 }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by patient, physician, or clinical reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: statusFilter === st ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                background: statusFilter === st ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" : "#ffffff",
                color: statusFilter === st ? "#0369a1" : "#475569",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>📅</div>
            <p style={{ margin: 0 }}>Loading appointment schedules...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>📅</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Appointments Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No appointment matches your search criteria." : "Click '+ Schedule Appointment' above to book a visit."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Consulting Physician</th>
                <th>Date</th>
                <th>Time</th>
                <th>Clinical Reason</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">#{apt.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                      {apt.patient_name || `Patient #${apt.patient}`}
                    </strong>
                  </td>
                  <td>{apt.doctor_name || `Dr. #${apt.doctor}`}</td>
                  <td>{apt.appointment_date}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#0369a1" }}>⏰ {apt.appointment_time}</span>
                  </td>
                  <td style={{ maxWidth: "200px", color: "#475569" }}>{apt.reason || "General Checkup"}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        apt.status === "Confirmed"
                          ? "admin-badge-success"
                          : apt.status === "Pending"
                          ? "admin-badge-warning"
                          : apt.status === "Completed"
                          ? "admin-badge-info"
                          : "admin-badge-danger"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(apt)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(apt.id)} className="admin-action-btn-delete">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Appointments;
