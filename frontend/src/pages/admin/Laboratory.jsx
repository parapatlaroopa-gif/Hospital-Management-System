import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    test_name: "",
    test_result: "",
    test_date: new Date().toISOString().split("T")[0],
    status: "Pending",
  });

  const fetchTests = () => {
    setLoading(true);
    API.get("laboratory/tests/")
      .then((response) => {
        setTests(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Laboratory API Error:", error);
        setMessage("Failed to load laboratory diagnostic tests.");
      })
      .finally(() => setLoading(false));
  };

  const fetchPatients = () => {
    API.get("patients/")
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setPatients(data);
        if (data.length > 0) {
          setFormData((prev) => (prev.patient ? prev : { ...prev, patient: data[0].id }));
        }
      })
      .catch((error) => console.error("Patient API Error:", error));
  };

  useEffect(() => {
    fetchTests();
    fetchPatients();
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

    let patientId = formData.patient ? Number(formData.patient) : null;
    if (!patientId && patients.length > 0) {
      patientId = patients[0].id;
    }

    if (!patientId) {
      setMessage("Please create or select a patient before submitting a lab test.");
      return;
    }

    const payload = {
      ...formData,
      patient: patientId,
    };

    const req = editingId
      ? API.put(`laboratory/tests/${editingId}/`, payload)
      : API.post("laboratory/tests/", payload);

    req
      .then(() => {
        setMessage(editingId ? "Lab test updated successfully!" : "Lab test order submitted successfully!");
        resetForm();
        fetchTests();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving lab test:", error);
        const errDetail = error.response?.data
          ? typeof error.response.data === "object"
            ? Object.entries(error.response.data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ")
            : String(error.response.data)
          : "Failed to save laboratory test.";
        setMessage(`Failed to save laboratory test: ${errDetail}`);
      });
  };

  const handleEdit = (test) => {
    setEditingId(test.id);
    setFormData({
      patient: test.patient || "",
      test_name: test.test_name || "",
      test_result: test.test_result || "",
      test_date: test.test_date || "",
      status: test.status || "Pending",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lab test?")) return;

    API.delete(`laboratory/tests/${id}/`)
      .then(() => {
        setMessage("Lab test deleted successfully!");
        fetchTests();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting lab test:", error);
        setMessage("Failed to delete lab test.");
      });
  };

  const resetForm = () => {
    setFormData({
      patient: patients[0]?.id || "",
      test_name: "",
      test_result: "",
      test_date: new Date().toISOString().split("T")[0],
      status: "Pending",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTests = tests.filter((t) => {
    const q = search.toLowerCase();
    const pName = (t.patient_name || `Patient #${t.patient}`).toLowerCase();
    const tName = (t.test_name || "").toLowerCase();
    return pName.includes(q) || tName.includes(q);
  });

  const totalTests = tests.length;
  const completedTests = tests.filter((t) => (t.status || "").toLowerCase() === "completed").length;
  const pendingTests = tests.filter((t) => (t.status || "").toLowerCase() === "pending").length;
  const uniqueTestTypes = Array.from(new Set(tests.map((t) => t.test_name).filter(Boolean))).length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>🧪 Laboratory & Diagnostic Tests</h1>
          <p>Order pathology tests, manage specimen findings, and track diagnostic reports</p>
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
          {showForm ? "✕ Cancel" : "＋ Order Lab Test"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">🧪</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">PATHOLOGY CENSUS</span>
            <span className="ds-telemetry-value">{totalTests} Diagnostics Logged</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">⏳</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">SPECIMEN QUEUE</span>
            <span className="ds-telemetry-value highlight">
              {pendingTests} Awaiting Processing
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">🔬</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">VERIFIED FINDINGS</span>
            <span className="ds-telemetry-value highlight" style={{ color: "#16a34a" }}>
              {completedTests} Reports Released
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
          <div className="admin-stat-icon">🧪</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Lab Tests</span>
            <div className="admin-stat-value">{totalTests}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Processing</span>
            <div className="admin-stat-value" style={{ color: "#d97706" }}>{pendingTests}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🔬</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Completed Results</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>{completedTests}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📋</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Unique Test Panels</span>
            <div className="admin-stat-value">{uniqueTestTypes}</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Diagnostic Test" : "🧪 Order New Diagnostic Test"}</h2>
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
                <label>Diagnostic Test Name *</label>
                <input
                  type="text"
                  name="test_name"
                  value={formData.test_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Complete Blood Count (CBC), Lipid Panel"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Date of Test *</label>
                <input
                  type="date"
                  name="test_date"
                  value={formData.test_date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Diagnostic Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="admin-select"
                >
                  <option value="Pending">Pending Analysis</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed & Verified</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Diagnostic Findings / Results Summary</label>
                <textarea
                  name="test_result"
                  value={formData.test_result}
                  onChange={handleChange}
                  placeholder="Enter pathology results, reference ranges, and lab technician remarks..."
                  rows={3}
                  className="admin-textarea"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Save Lab Test" : "＋ Submit Test Order"}
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
          placeholder="Search by test name or patient name..."
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
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>🧪</div>
            <p style={{ margin: 0 }}>Loading laboratory tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🧪</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Lab Tests Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No test matches your search filter." : "Click '+ Order Lab Test' above to register a test."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Diagnostic Test</th>
                <th>Test Date</th>
                <th>Lab Findings / Results</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">#{test.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                      {test.patient_name || `Patient #${test.patient}`}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#0369a1" }}>{test.test_name}</span>
                  </td>
                  <td>{test.test_date}</td>
                  <td style={{ maxWidth: "260px", color: "#475569", fontSize: "13px" }}>
                    {test.test_result || <span style={{ color: "#94a3b8" }}>Awaiting Specimen Analysis</span>}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        test.status === "Completed"
                          ? "admin-badge-success"
                          : test.status === "In Progress"
                          ? "admin-badge-info"
                          : "admin-badge-warning"
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(test)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(test.id)} className="admin-action-btn-delete">
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

export default Laboratory;
