import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_doctor: "",
    phone: "",
    location: "",
  });

  const fetchDepartments = () => {
    setLoading(true);
    API.get("departments/")
      .then((response) => {
        setDepartments(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Department API Error:", error);
        setMessage("Failed to load departments from hospital database.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDepartments();
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

    const req = editingId
      ? API.put(`departments/${editingId}/`, formData)
      : API.post("departments/", formData);

    req
      .then(() => {
        setMessage(editingId ? "Department updated successfully!" : "Department created successfully!");
        resetForm();
        fetchDepartments();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving department:", error);
        setMessage("Failed to save department. Please verify the details.");
      });
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name || "",
      description: dept.description || "",
      head_doctor: dept.head_doctor || "",
      phone: dept.phone || "",
      location: dept.location || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    API.delete(`departments/${id}/`)
      .then(() => {
        setMessage("Department deleted successfully!");
        fetchDepartments();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting department:", error);
        setMessage("Failed to delete department.");
      });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      head_doctor: "",
      phone: "",
      location: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredDepartments = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name || "").toLowerCase().includes(q) ||
      (d.head_doctor || "").toLowerCase().includes(q) ||
      (d.location || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>🏢 Hospital Departments</h1>
          <p>Configure medical units, clinical specialties, and department leadership</p>
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
          {showForm ? "✕ Cancel" : "＋ Add Department"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">🏢</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CLINICAL DIVISIONS</span>
            <span className="ds-telemetry-value">{departments.length} Operational Units</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">👨‍⚕️</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">LEADERSHIP CADRE</span>
            <span className="ds-telemetry-value highlight">
              {departments.filter((d) => d.head_doctor).length} Appointed Department Heads
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">📍</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">FACILITY LOCATIONS</span>
            <span className="ds-telemetry-value highlight">
              Main Wing B, ICU, Trauma
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
          <div className="admin-stat-icon">🏢</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Departments</span>
            <div className="admin-stat-value">{departments.length}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👨‍⚕️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Headed Departments</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>
              {departments.filter((d) => d.head_doctor).length}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📍</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Facility Wings</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>
              {Array.from(new Set(departments.map((d) => d.location).filter(Boolean))).length || 4}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Clinical Care Level</span>
            <div className="admin-stat-value" style={{ color: "#0ea5e9" }}>Tertiary</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Department Details" : "🏢 Create New Medical Department"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Cardiology, Neurology"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Head Doctor / Lead</label>
                <input
                  type="text"
                  name="head_doctor"
                  value={formData.head_doctor}
                  onChange={handleChange}
                  placeholder="e.g., Dr. John Smith, MD"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Department Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +1 234 567 890"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Location / Hospital Wing</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Building B, 3rd Floor"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Department Clinical Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide scope of services and specialized equipment..."
                  rows={3}
                  className="admin-textarea"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Update Department" : "＋ Save Department"}
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
          placeholder="Search department by name, head physician, or building wing..."
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
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>🏢</div>
            <p style={{ margin: 0 }}>Loading departments from hospital registry...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🏢</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Departments Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No department matches your search filter." : "Click '+ Add Department' above to create one."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Head Physician</th>
                <th>Direct Contact</th>
                <th>Location / Wing</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">#{dept.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>{dept.name}</strong>
                  </td>
                  <td>{dept.head_doctor || "Not Assigned"}</td>
                  <td>{dept.phone || "—"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span>📍</span>
                      <span>{dept.location || "Main Campus"}</span>
                    </span>
                  </td>
                  <td style={{ maxWidth: "250px", color: "#64748b", fontSize: "13px" }}>
                    {dept.description || "—"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(dept)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="admin-action-btn-delete">
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

export default Departments;
