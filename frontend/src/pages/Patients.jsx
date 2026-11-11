import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";

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
        setPatients(res.data);
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
        // UPDATE VIA PUT
        await API.put(`patients/${editingPatient.id}/`, formData);
        showAlert("success", `Patient ${formData.first_name} ${formData.last_name} updated successfully!`);
      } else {
        // CREATE VIA POST
        await API.post("patients/", formData);
        showAlert("success", `Patient ${formData.first_name} ${formData.last_name} registered successfully!`);
      }
      setShowFormModal(false);
      fetchPatients();
    } catch (err) {
      console.error("Save error:", err);
      showAlert("error", "Failed to save patient record. Please check the inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE PATIENT VIA API
  const confirmDelete = async () => {
    if (!deletingPatient) return;
    setSubmitting(true);

    try {
      await API.delete(`patients/${deletingPatient.id}/`);
      showAlert("success", `Patient record #${deletingPatient.id} deleted successfully.`);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("error", "Failed to delete patient. The record might be referenced in appointments or billing.");
    } finally {
      setSubmitting(false);
    }
  };

  // STATISTICAL CALCULATIONS
  const stats = useMemo(() => {
    const total = patients.length;
    const male = patients.filter((p) => p.gender === "Male").length;
    const female = patients.filter((p) => p.gender === "Female").length;

    // Patients registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPatients = patients.filter((p) => {
      if (!p.created_at) return false;
      return new Date(p.created_at) >= thirtyDaysAgo;
    }).length;

    return { total, male, female, newPatients: newPatients || total };
  }, [patients]);

  return (
    <div style={{ padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#1e293b", fontSize: "28px" }}>
            👤 Patients Dashboard
          </h1>
          <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "15px" }}>
            Manage hospital patients, medical profiles, and demographic records
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "12px 22px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>➕</span> Add Patient
        </button>
      </div>

      {/* ALERT NOTIFICATION */}
      {alert.message && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: alert.type === "success" ? "#dcfce7" : "#fee2e2",
            color: alert.type === "success" ? "#15803d" : "#b91c1c",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* STATS CARDS (Total, Male, Female, New Patients) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <div style={statCardStyle("#2563eb")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Total Patients</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>{stats.total}</div>
          <div style={{ fontSize: "12px", color: "#2563eb" }}>Active Hospital Records</div>
        </div>

        <div style={statCardStyle("#0284c7")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Male Patients</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>{stats.male}</div>
          <div style={{ fontSize: "12px", color: "#0284c7" }}>Demographic Ratio</div>
        </div>

        <div style={statCardStyle("#ec4899")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Female Patients</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>{stats.female}</div>
          <div style={{ fontSize: "12px", color: "#ec4899" }}>Demographic Ratio</div>
        </div>

        <div style={statCardStyle("#10b981")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>New Patients</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>{stats.newPatients}</div>
          <div style={{ fontSize: "12px", color: "#10b981" }}>Registered Recently</div>
        </div>
      </div>

      {/* SEARCH, FILTER & REFRESH BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
          <input
            type="text"
            placeholder="🔍 Search patient by name, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setGenderFilter("All");
              fetchPatients();
            }}
            style={{
              padding: "10px 16px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* PATIENT LIST TABLE */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>
            Patient Directory
          </h2>
          <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
            Showing {patients.length} records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
            Loading patient records from server...
          </div>
        ) : patients.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
            No patients match your search criteria. Click "+ Add Patient" to register a new record.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#1e293b", color: "#ffffff", textAlign: "left" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Patient Name</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Gender</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Address</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "700", color: "#64748b" }}>#{patient.id}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                        {patient.first_name} {patient.last_name}
                      </div>
                      {patient.created_at && (
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          Reg: {new Date(patient.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{patient.age} yrs</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            patient.gender === "Male"
                              ? "#e0f2fe"
                              : patient.gender === "Female"
                              ? "#fce7f3"
                              : "#f3f4f6",
                          color:
                            patient.gender === "Male"
                              ? "#0369a1"
                              : patient.gender === "Female"
                              ? "#be185d"
                              : "#4b5563",
                        }}
                      >
                        {patient.gender}
                      </span>
                    </td>
                    <td style={tdStyle}>📞 {patient.phone}</td>
                    <td style={tdStyle}>{patient.address || "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                        <button
                          onClick={() => setViewingPatient(patient)}
                          title="View Details"
                          style={actionBtnStyle("#3b82f6", "#eff6ff")}
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => openEditModal(patient)}
                          title="Edit Patient"
                          style={actionBtnStyle("#d97706", "#fffbeb")}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingPatient(patient)}
                          title="Delete Patient"
                          style={actionBtnStyle("#dc2626", "#fef2f2")}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingPatient && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>
                📄 Patient File: #{viewingPatient.id}
              </h2>
              <button
                onClick={() => setViewingPatient(null)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <div style={detailLabelStyle}>Full Name</div>
                <div style={detailValueStyle}>{viewingPatient.first_name} {viewingPatient.last_name}</div>
              </div>
              <div>
                <div style={detailLabelStyle}>Age & Gender</div>
                <div style={detailValueStyle}>{viewingPatient.age} Years • {viewingPatient.gender}</div>
              </div>
              <div>
                <div style={detailLabelStyle}>Contact Phone</div>
                <div style={detailValueStyle}>📞 {viewingPatient.phone}</div>
              </div>
              <div>
                <div style={detailLabelStyle}>Registration Date</div>
                <div style={detailValueStyle}>
                  🕒 {viewingPatient.created_at ? new Date(viewingPatient.created_at).toLocaleString() : "Registered"}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={detailLabelStyle}>Residential Address</div>
              <div style={{ ...detailValueStyle, backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                {viewingPatient.address || "No address provided on record."}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  const pat = viewingPatient;
                  setViewingPatient(null);
                  openEditModal(pat);
                }}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit Record
              </button>
              <button
                onClick={() => setViewingPatient(null)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>
                {editingPatient ? `✏️ Edit Patient Record #${editingPatient.id}` : "➕ Add New Patient"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh"
                    required
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Varma"
                    required
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Age *</label>
                  <input
                    type="number"
                    name="age"
                    min="0"
                    max="130"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 35"
                    required
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Contact Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  required
                  style={modalInputStyle}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Residential Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, Postal Code"
                  required
                  style={{ ...modalInputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 22px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: editingPatient ? "#d97706" : "#2563eb",
                    color: "#ffffff",
                    cursor: submitting ? "wait" : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {submitting ? "Saving to Database..." : editingPatient ? "Save Changes" : "Create Patient Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPatient && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: "460px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>
              <h2 style={{ margin: "0 0 10px", color: "#1e293b", fontSize: "20px" }}>
                Confirm Deletion
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                Are you sure you want to delete patient{" "}
                <strong>{deletingPatient.first_name} {deletingPatient.last_name}</strong> (ID #{deletingPatient.id})? This action will permanently remove their record from the hospital database.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
              <button
                onClick={() => setDeletingPatient(null)}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#475569",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Deleting..." : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statCardStyle = (accent) => ({
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  borderLeft: `4px solid ${accent}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
});

const thStyle = {
  padding: "14px 16px",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#334155",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155",
  marginBottom: "4px",
};

const detailLabelStyle = {
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const detailValueStyle = {
  fontSize: "15px",
  color: "#1e293b",
  fontWeight: "600",
};

const actionBtnStyle = (color, bg) => ({
  padding: "6px 12px",
  borderRadius: "6px",
  border: `1px solid ${color}40`,
  backgroundColor: bg,
  color: color,
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
});

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalBoxStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  maxWidth: "540px",
  width: "100%",
  padding: "28px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
};

const modalInputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box",
};
