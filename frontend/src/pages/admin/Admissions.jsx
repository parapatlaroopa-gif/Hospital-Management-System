import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    room_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    discharge_date: "",
    status: "Admitted",
  });

  const fetchAdmissions = () => {
    setLoading(true);
    API.get("admissions/")
      .then((response) => {
        setAdmissions(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Admission API Error:", error);
        setMessage("Failed to load in-patient admissions.");
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
    fetchAdmissions();
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
      discharge_date: formData.discharge_date || null,
    };

    const req = editingId
      ? API.put(`admissions/${editingId}/`, payload)
      : API.post("admissions/", payload);

    req
      .then(() => {
        setMessage(editingId ? "Admission record updated successfully!" : "Patient successfully admitted!");
        resetForm();
        fetchAdmissions();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving admission:", error);
        setMessage("Failed to save admission record.");
      });
  };

  const handleEdit = (adm) => {
    setEditingId(adm.id);
    setFormData({
      patient: adm.patient || "",
      doctor: adm.doctor || "",
      room_number: adm.room_number || "",
      admission_date: adm.admission_date || "",
      discharge_date: adm.discharge_date || "",
      status: adm.status || "Admitted",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this admission record?")) return;

    API.delete(`admissions/${id}/`)
      .then(() => {
        setMessage("Admission record deleted successfully!");
        fetchAdmissions();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting admission:", error);
        setMessage("Failed to delete admission record.");
      });
  };

  const resetForm = () => {
    setFormData({
      patient: "",
      doctor: "",
      room_number: "",
      admission_date: new Date().toISOString().split("T")[0],
      discharge_date: "",
      status: "Admitted",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredAdmissions = admissions.filter((adm) => {
    const q = search.toLowerCase();
    const pName = (adm.patient_name || `Patient #${adm.patient}`).toLowerCase();
    const dName = (adm.doctor_name || `Doctor #${adm.doctor}`).toLowerCase();
    return pName.includes(q) || dName.includes(q) || room.includes(q);
  });

  const totalAdmissions = admissions.length;
  const admittedCount = admissions.filter((a) => a.status === "Admitted").length;
  const dischargedCount = admissions.filter((a) => a.status === "Discharged").length;
  const roomsOccupied = Array.from(new Set(admissions.filter((a) => a.status === "Admitted").map((a) => a.room_number).filter(Boolean))).length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>🛏️ Inpatient Admissions</h1>
          <p>Manage hospital bed allocation, ward admissions, and patient discharge tracking</p>
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
          {showForm ? "✕ Cancel" : "＋ Admit New Patient"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">🛏️</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">INPATIENT CENSUS</span>
            <span className="ds-telemetry-value">{admittedCount} Inpatients In Beds</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">🚪</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">WARD OCCUPANCY</span>
            <span className="ds-telemetry-value highlight">
              {roomsOccupied} Active Rooms
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">📋</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">TOTAL LOGGED</span>
            <span className="ds-telemetry-value highlight">
              {totalAdmissions} Lifetime Cases
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
          <div className="admin-stat-icon">🛏️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Admissions</span>
            <div className="admin-stat-value">{totalAdmissions}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🩺</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Currently Admitted</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>{admittedCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Discharged Cases</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>{dischargedCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚪</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Occupied Rooms</span>
            <div className="admin-stat-value">{roomsOccupied}</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Admission Record" : "🛏️ Admit Patient to Ward"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Admitting Patient *</label>
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
                <label>Supervising Doctor *</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">Select attending physician...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Room / Bed Number *</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Ward 3 - Bed 12"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Admission Date *</label>
                <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Discharge Date (Optional)</label>
                <input
                  type="date"
                  name="discharge_date"
                  value={formData.discharge_date}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Admission Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="admin-select"
                >
                  <option value="Admitted">Admitted</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Under Observation">Under Observation</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Save Changes" : "＋ Confirm Admission"}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="admin-search-wrapper">
        <span style={{ fontSize: "18px" }}>🔍</span>
        <input
          type="text"
          placeholder="Search admissions by patient name, attending doctor, or room number..."
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

      {/* DATA TABLE */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>🛏️</div>
            <p style={{ margin: 0 }}>Loading admission records...</p>
          </div>
        ) : filteredAdmissions.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🛏️</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Admissions Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No records match your search filter." : "Click '+ Admit New Patient' above to record an admission."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Attending Doctor</th>
                <th>Room / Bed</th>
                <th>Admission Date</th>
                <th>Discharge Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.map((adm) => (
                <tr key={adm.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">#{adm.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                      {adm.patient_name || `Patient #${adm.patient}`}
                    </strong>
                  </td>
                  <td>{adm.doctor_name || `Dr. #${adm.doctor}`}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                      <span>🚪</span>
                      <span>{adm.room_number}</span>
                    </span>
                  </td>
                  <td>{adm.admission_date}</td>
                  <td>{adm.discharge_date || <span style={{ color: "#94a3b8" }}>Still Admitted</span>}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        adm.status === "Admitted"
                          ? "admin-badge-info"
                          : adm.status === "Discharged"
                          ? "admin-badge-success"
                          : "admin-badge-warning"
                      }`}
                    >
                      {adm.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(adm)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(adm.id)} className="admin-action-btn-delete">
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

export default Admissions;
