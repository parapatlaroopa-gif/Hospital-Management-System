import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import "./AdminPages.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
  });

  // View Details Modal State
  const [viewingPatient, setViewingPatient] = useState(null);

  // Delete Confirmation Modal State
  const [deletingPatient, setDeletingPatient] = useState(null);

  // Alerts & Notifications
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // FETCH PATIENTS FROM DJANGO REST API
  const fetchPatients = () => {
    setLoading(true);
    let url = "patients/";
    const params = [];
    if (searchTerm.trim()) {
      params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
    }
    if (genderFilter && genderFilter !== "All") {
      params.push(`gender=${encodeURIComponent(genderFilter)}`);
    }
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    API.get(url)
      .then((res) => {
        setPatients(Array.isArray(res.data) ? res.data : res.data?.results || []);
      })
      .catch((err) => {
        console.error("Failed to fetch patients:", err);
        showAlert("error", "Failed to retrieve patients from database.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [genderFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 5000);
  };

  // FORM HANDLING
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({
      first_name: "",
      last_name: "",
      age: "",
      gender: "Male",
      phone: "",
      address: "",
    });
    setShowFormModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      phone: patient.phone || "",
      address: patient.address || "",
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showAlert("error", "First name and Last name are required.");
      return;
    }
    if (!formData.phone.trim()) {
      showAlert("error", "Phone number is required.");
      return;
    }
    if (parseInt(formData.age, 10) < 0 || parseInt(formData.age, 10) > 130) {
      showAlert("error", "Please provide a valid age between 0 and 130.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingPatient) {
        await API.put(`patients/${editingPatient.id}/`, formData);
        showAlert("success", `Patient ${formData.first_name} ${formData.last_name} updated successfully!`);
      } else {
        await API.post("patients/", formData);
        showAlert("success", `Patient ${formData.first_name} ${formData.last_name} registered successfully!`);
      }
      setShowFormModal(false);
      fetchPatients();
    } catch (err) {
      console.error("Failed to save patient:", err);
      const detail = err.response?.data?.detail || "Failed to save patient record.";
      showAlert("error", typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPatient) return;
    setSubmitting(true);
    try {
      await API.delete(`patients/${deletingPatient.id}/`);
      showAlert("success", `Patient ${deletingPatient.first_name} ${deletingPatient.last_name} removed.`);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient:", err);
      showAlert("error", "Failed to delete patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  // STATS MEMO
  const stats = useMemo(() => {
    const total = patients.length;
    const male = patients.filter((p) => {
      const g = (p.gender || "").trim().toLowerCase();
      return g === "male" || g === "m";
    }).length;
    const female = patients.filter((p) => {
      const g = (p.gender || "").trim().toLowerCase();
      return g === "female" || g === "f";
    }).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPatients = patients.filter((p) => {
      if (!p.created_at) return false;
      return new Date(p.created_at) >= thirtyDaysAgo;
    }).length;

    return { total, male, female, newPatients: newPatients || total };
  }, [patients]);

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>👥 Patients Medical Roster</h1>
          <p>
            Manage hospital patient registry, clinical demographics, health records, and admission files
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={openAddModal} className="admin-btn-primary">
            <span>＋</span> Register New Patient
          </button>
          <button onClick={fetchPatients} className="admin-btn-secondary" title="Refresh records">
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">🏥</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CLINICAL CENSUS</span>
            <span className="ds-telemetry-value">{stats.total} Patients Registered</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">👨‍👩‍👧</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">DEMOGRAPHIC RATIO</span>
            <span className="ds-telemetry-value highlight">
              {stats.male} Male · {stats.female} Female
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">🆕</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">RECENT ADMISSIONS</span>
            <span className="ds-telemetry-value highlight">
              {stats.newPatients} In Active Care
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

      {/* ALERT NOTIFICATION */}
      {alert.message && (
        <div
          className={`admin-alert ${
            alert.type === "success" ? "admin-alert-success" : "admin-alert-error"
          }`}
        >
          <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* 4 STATS METRIC CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Patients</span>
            <div className="admin-stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👨</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Male Patients</span>
            <div className="admin-stat-value">{stats.male}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👩</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Female Patients</span>
            <div className="admin-stat-value">{stats.female}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Recent Admissions</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>
              {stats.newPatients}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & GENDER FILTER TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: "280px", marginBottom: 0 }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search patient by full name, phone number, address, or PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                fetchPatients();
              }}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#475569" }}>Filter:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="admin-input"
            style={{ width: "auto", padding: "10px 16px", cursor: "pointer" }}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setGenderFilter("All");
              fetchPatients();
            }}
            className="admin-btn-secondary"
            style={{ padding: "10px 16px" }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* PATIENT LIST TABLE CARD */}
      <div className="admin-table-card">
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1.5px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
              Registered Hospital Patients
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
              Active medical health records and patient contact credentials.
            </p>
          </div>
          <span className="admin-badge admin-badge-info">
            {patients.length} Records Found
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>👥</div>
            <p style={{ margin: 0 }}>Loading patient records from server...</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>👥</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Patients Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {searchTerm ? "No patient matches your search filter." : "Click '+ Register New Patient' above to add a patient."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Identity</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone Number</th>
                <th>Residential Address</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase() || "P";
                const isMale = patient.gender === "Male";

                return (
                  <tr key={patient.id}>
                    <td>
                      <span className="admin-badge admin-badge-info">
                        #{patient.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            background: isMale
                              ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
                              : "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
                            color: isMale ? "#0369a1" : "#be185d",
                            fontWeight: 800,
                            fontSize: "13.5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: isMale ? "1.5px solid #7dd3fc" : "1.5px solid #f472b6",
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <strong style={{ color: "#0f172a", fontSize: "14.5px", display: "block" }}>
                            {patient.first_name} {patient.last_name}
                          </strong>
                          {patient.created_at && (
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              Reg: {new Date(patient.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#334155" }}>
                        {patient.age} Yrs
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          isMale ? "admin-badge-info" : "admin-badge-warning"
                        }`}
                        style={
                          !isMale
                            ? { background: "#fce7f3", color: "#be185d", border: "1px solid #fbcfe8" }
                            : {}
                        }
                      >
                        {isMale ? "👨 " : "👩 "} {patient.gender}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#0284c7", fontWeight: 600, fontSize: "13.5px" }}>
                        📞 {patient.phone}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#475569", fontSize: "13px" }}>
                        {patient.address || "—"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setViewingPatient(patient)}
                        className="admin-btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px", marginRight: "6px" }}
                        title="View Full Patient File"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => openEditModal(patient)}
                        className="admin-action-btn-edit"
                        title="Edit Details"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeletingPatient(patient)}
                        className="admin-action-btn-delete"
                        title="Delete Record"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingPatient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setViewingPatient(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1.5px solid rgba(186, 230, 253, 0.8)",
              overflow: "hidden",
              animation: "fadeIn 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                borderBottom: "1.5px solid #bae6fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0369a1" }}>
                  📄 Patient Dossier: #{viewingPatient.id}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#0284c7" }}>
                  Verified hospital registration and medical contact profile
                </p>
              </div>
              <button
                onClick={() => setViewingPatient(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Full Patient Name
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                    {viewingPatient.first_name} {viewingPatient.last_name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Age & Biological Gender
                  </span>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0284c7", marginTop: "2px" }}>
                    {viewingPatient.age} Years · {viewingPatient.gender}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Contact Telephone
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                    📞 {viewingPatient.phone}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Registration Date
                  </span>
                  <div style={{ fontSize: "13.5px", color: "#475569", marginTop: "2px" }}>
                    🕒 {viewingPatient.created_at ? new Date(viewingPatient.created_at).toLocaleString() : "Active Record"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                  Residential Address
                </span>
                <div
                  style={{
                    marginTop: "4px",
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    fontSize: "13.5px",
                  }}
                >
                  {viewingPatient.address || "No residential address recorded."}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "16px",
                }}
              >
                <button
                  onClick={() => {
                    const pat = viewingPatient;
                    setViewingPatient(null);
                    openEditModal(pat);
                  }}
                  className="admin-btn-primary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => setViewingPatient(null)}
                  className="admin-btn-cancel"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowFormModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1.5px solid rgba(186, 230, 253, 0.8)",
              overflow: "hidden",
              animation: "fadeIn 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                borderBottom: "1.5px solid #bae6fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0369a1" }}>
                  {editingPatient ? `✏️ Update Patient Record #${editingPatient.id}` : "➕ Register New Patient"}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#0284c7" }}>
                  Enter verified demographic details and clinical contact phone.
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="admin-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh"
                    required
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Varma"
                    required
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
                <div className="admin-form-group">
                  <label>Age in Years *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 35"
                    required
                    min="0"
                    max="130"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label>Contact Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label>Residential Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g. Flat 402, Green Valley Apartments, Hyderabad"
                  className="admin-input"
                  style={{ resize: "vertical" }}
                ></textarea>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "20px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn-primary"
                >
                  {submitting ? "Saving..." : editingPatient ? "💾 Update Patient" : "✓ Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPatient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setDeletingPatient(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1.5px solid #fee2e2",
              padding: "24px",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "44px", display: "inline-block", marginBottom: "10px" }}>⚠️</span>
              <h3 style={{ margin: "0 0 6px", color: "#991b1b", fontSize: "18px", fontWeight: 800 }}>
                Confirm Patient Deletion
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px", lineHeight: 1.5 }}>
                Are you sure you want to permanently remove patient{" "}
                <strong>
                  {deletingPatient.first_name} {deletingPatient.last_name} (#{deletingPatient.id})
                </strong>{" "}
                from the hospital registry?
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                onClick={() => setDeletingPatient(null)}
                className="admin-btn-cancel"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Deleting..." : "🗑️ Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
