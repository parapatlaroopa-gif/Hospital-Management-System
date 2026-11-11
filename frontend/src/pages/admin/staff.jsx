import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "Nurse",
    phone: "",
    email: "",
    salary: "35000",
    joining_date: new Date().toISOString().split("T")[0],
    password: "",
  });

  const fetchStaff = () => {
    setLoading(true);
    API.get("staff/")
      .then((response) => {
        setStaffList(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Staff API Error:", error);
        setMessage("Failed to load hospital medical staff roster.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await API.put(`staff/${editingId}/`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          phone: formData.phone,
          email: formData.email,
          salary: parseFloat(formData.salary) || 0,
          joining_date: formData.joining_date,
        });
        setMessage("Staff profile updated successfully!");
      } else {
        // Recruit staff member with user account
        await API.post("accounts/recruit-staff/", {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role.toUpperCase() === "NURSE" ? "NURSE" : "DOCTOR",
          phone: formData.phone,
          email: formData.email,
          salary: parseFloat(formData.salary) || 0,
          joining_date: formData.joining_date,
          password: formData.password || "Hospital@123",
        });
        setMessage(`Staff member ${formData.first_name} successfully recruited and onboarded!`);
      }

      resetForm();
      fetchStaff();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error saving staff:", error);
      const errDetail = error.response?.data?.detail || error.response?.data?.email?.[0] || "Failed to save staff record.";
      setMessage(errDetail);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      first_name: s.first_name || "",
      last_name: s.last_name || "",
      role: s.role || "Nurse",
      phone: s.phone || "",
      email: s.email || "",
      salary: s.salary || "35000",
      joining_date: s.joining_date || new Date().toISOString().split("T")[0],
      password: "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member from duty?")) return;

    API.delete(`staff/${id}/`)
      .then(() => {
        setMessage("Staff member deleted successfully!");
        fetchStaff();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting staff:", error);
        setMessage("Failed to remove staff member.");
      });
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      role: "Nurse",
      phone: "",
      email: "",
      salary: "35000",
      joining_date: new Date().toISOString().split("T")[0],
      password: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase();
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const role = (s.role || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const matchesSearch = name.includes(q) || role.includes(q) || email.includes(q);
    const matchesRole = roleFilter === "ALL" || (s.role || "").toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalStaff = staffList.length;
  const nurseCount = staffList.filter((s) => (s.role || "").toUpperCase() === "NURSE").length;
  const doctorCount = staffList.filter((s) => (s.role || "").toUpperCase() === "DOCTOR").length;
  const otherCount = Math.max(0, totalStaff - nurseCount - doctorCount);
  const totalPayroll = staffList.reduce((sum, s) => sum + (parseFloat(s.salary) || 0), 0);

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>👨‍⚕️ Clinical Staff & Nurses</h1>
          <p>Recruit medical staff, assign clinical designations, and manage employee records</p>
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
          {showForm ? "✕ Cancel" : "＋ Recruit Staff Member"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">👩‍⚕️</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">NURSING CADRE</span>
            <span className="ds-telemetry-value">{nurseCount} Registered Nurses</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">👨‍⚕️</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CLINICAL OFFICERS</span>
            <span className="ds-telemetry-value highlight">
              {doctorCount} Attending Staff
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">💼</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">MONTHLY PAYROLL</span>
            <span className="ds-telemetry-value highlight">
              ₹{totalPayroll.toLocaleString()} /mo
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
        <div className={`admin-alert ${message.includes("successfully") || message.includes("recruited") ? "admin-alert-success" : "admin-alert-error"}`}>
          <span>{message.includes("successfully") || message.includes("recruited") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* 4 STATS METRIC SUMMARY */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Staff</span>
            <div className="admin-stat-value">{totalStaff}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👩‍⚕️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Registered Nurses</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>{nurseCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🩺</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Medical Staff</span>
            <div className="admin-stat-value">{doctorCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💵</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Monthly Payroll</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>₹{totalPayroll.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Staff Credentials" : "👨‍⚕️ Recruit New Staff Member (Auto-Creates Account)"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Sarah"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Jenkins"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Clinical Role / Designation *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="admin-select"
                >
                  <option value="Nurse">Registered Nurse</option>
                  <option value="Doctor">Physician / Doctor</option>
                  <option value="Receptionist">Medical Receptionist</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Other">Clinical Staff (Other)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Primary Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 234-5678"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Work Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@hospital.com"
                  className="admin-input"
                />
              </div>

              {!editingId && (
                <div className="admin-form-group">
                  <label>Initial Login Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Defaults to Hospital@123"
                    className="admin-input"
                  />
                </div>
              )}

              <div className="admin-form-group">
                <label>Monthly Compensation ($)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="35000"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Joining Date *</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Update Profile" : "＋ Onboard Staff Member"}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH & ROLE FILTERS */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "22px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: "260px", marginBottom: 0 }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search staff by name, designation, or email..."
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
          {["ALL", "NURSE", "DOCTOR", "RECEPTIONIST"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: roleFilter === r ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                background: roleFilter === r ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" : "#ffffff",
                color: roleFilter === r ? "#0369a1" : "#475569",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>👨‍⚕️</div>
            <p style={{ margin: 0 }}>Loading staff roster...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>👨‍⚕️</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Staff Records Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No staff matches your search filter." : "Click '+ Recruit Staff Member' above to onboard clinical staff."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff Name</th>
                <th>Designation / Role</th>
                <th>Phone Contact</th>
                <th>Work Email</th>
                <th>Monthly Salary</th>
                <th>Joining Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => {
                const initial = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase() || "S";
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="admin-badge admin-badge-info">#{s.id}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "13px",
                          }}
                        >
                          {initial}
                        </div>
                        <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                          {s.first_name} {s.last_name}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          s.role?.toLowerCase() === "nurse"
                            ? "admin-badge-success"
                            : s.role?.toLowerCase() === "doctor"
                            ? "admin-badge-info"
                            : "admin-badge-warning"
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td>{s.phone}</td>
                    <td>{s.email}</td>
                    <td>${parseFloat(s.salary || 0).toLocaleString()}</td>
                    <td>{s.joining_date || "—"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => handleEdit(s)} className="admin-action-btn-edit">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="admin-action-btn-delete">
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
    </div>
  );
}

export default Staff;
