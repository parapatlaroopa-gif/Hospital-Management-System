import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    bill_number: `INV-${Date.now().toString().slice(-6)}`,
    consultation_fee: "0.00",
    medicine_fee: "0.00",
    lab_fee: "0.00",
    total_amount: "0.00",
    payment_status: "Pending",
  });

  const fetchBills = () => {
    setLoading(true);
    API.get("billing/")
      .then((response) => {
        setBills(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Billing API Error:", error);
        setMessage("Failed to load billing invoices.");
      })
      .finally(() => setLoading(false));
  };

  const fetchPatients = () => {
    API.get("patients/")
      .then((response) => {
        setPatients(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => console.error("Error loading patients:", error));
  };

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (["consultation_fee", "medicine_fee", "lab_fee"].includes(name)) {
      const c = parseFloat(name === "consultation_fee" ? value : updated.consultation_fee) || 0;
      const m = parseFloat(name === "medicine_fee" ? value : updated.medicine_fee) || 0;
      const l = parseFloat(name === "lab_fee" ? value : updated.lab_fee) || 0;
      updated.total_amount = (c + m + l).toFixed(2);
    }

    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...formData,
      patient: Number(formData.patient),
      consultation_fee: parseFloat(formData.consultation_fee) || 0,
      medicine_fee: parseFloat(formData.medicine_fee) || 0,
      lab_fee: parseFloat(formData.lab_fee) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
    };

    const req = editingId
      ? API.put(`billing/${editingId}/`, payload)
      : API.post("billing/", payload);

    req
      .then(() => {
        setMessage(editingId ? "Invoice updated successfully!" : "Invoice generated successfully!");
        resetForm();
        fetchBills();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving bill:", error);
        setMessage("Failed to save billing record.");
      });
  };

  const handleEdit = (bill) => {
    setEditingId(bill.id);
    setFormData({
      patient: bill.patient || "",
      bill_number: bill.bill_number || "",
      consultation_fee: bill.consultation_fee || "0.00",
      medicine_fee: bill.medicine_fee || "0.00",
      lab_fee: bill.lab_fee || "0.00",
      total_amount: bill.total_amount || "0.00",
      payment_status: bill.payment_status || "Pending",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    API.delete(`billing/${id}/`)
      .then(() => {
        setMessage("Invoice deleted successfully!");
        fetchBills();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting bill:", error);
        setMessage("Failed to delete invoice.");
      });
  };

  const resetForm = () => {
    setFormData({
      patient: "",
      bill_number: `INV-${Date.now().toString().slice(-6)}`,
      consultation_fee: "0.00",
      medicine_fee: "0.00",
      lab_fee: "0.00",
      total_amount: "0.00",
      payment_status: "Pending",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    const pName = (b.patient_name || `Patient #${b.patient}`).toLowerCase();
    return pName.includes(q) || inv.includes(q);
  });

  const totalRevenue = bills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const paidRevenue = bills
    .filter((b) => b.payment_status === "Paid")
    .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const pendingRevenue = Math.max(0, totalRevenue - paidRevenue);
  const paidCount = bills.filter((b) => b.payment_status === "Paid").length;
  const pendingCount = bills.filter((b) => b.payment_status === "Pending").length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>💳 Patient Billing & Invoicing</h1>
          <p>Generate hospital invoices, record consultation and lab fees, and track payment settlements</p>
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
          {showForm ? "✕ Cancel" : "＋ Generate Invoice"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">💳</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">BILLING CENSUS</span>
            <span className="ds-telemetry-value">₹{totalRevenue.toFixed(2)} Invoiced</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">💰</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">SETTLED COLLECTIONS</span>
            <span className="ds-telemetry-value highlight">
              ₹{paidRevenue.toFixed(2)} Paid ({paidCount} Invoices)
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">⏳</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">OUTSTANDING DUES</span>
            <span className="ds-telemetry-value highlight" style={{ color: pendingRevenue > 0 ? "#dc2626" : "#0284c7" }}>
              ₹{pendingRevenue.toFixed(2)} ({pendingCount} Due)
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
          <div className="admin-stat-icon">📄</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Invoices</span>
            <div className="admin-stat-value">{bills.length}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💵</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Revenue</span>
            <div className="admin-stat-value">₹{totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Paid Settlements</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>
              ₹{paidRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⚠️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Dues</span>
            <div className="admin-stat-value" style={{ color: pendingRevenue > 0 ? "#dc2626" : "#0284c7" }}>
              ₹{pendingRevenue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Invoice Details" : "💳 Issue New Patient Invoice"}</h2>
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
                <label>Invoice / Bill Number *</label>
                <input
                  type="text"
                  name="bill_number"
                  value={formData.bill_number}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Consultation Fee (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Pharmacy / Medication Fee (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="medicine_fee"
                  value={formData.medicine_fee}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Laboratory Diagnostics Fee (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="lab_fee"
                  value={formData.lab_fee}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Payment Settlement Status *</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="admin-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ gridColumn: "1 / -1", background: "#f0f9ff", padding: "16px", borderRadius: "14px", border: "1px solid #bae6fd" }}>
                <span style={{ fontSize: "12px", color: "#0369a1", fontWeight: 700, textTransform: "uppercase" }}>Calculated Total Amount</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
                  ${formData.total_amount}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Update Invoice" : "＋ Issue Invoice"}
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
          placeholder="Search by invoice number or patient name..."
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
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>💳</div>
            <p style={{ margin: 0 }}>Loading invoice records...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>💳</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Invoices Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No invoice matches your search filter." : "Click '+ Generate Invoice' above to issue a bill."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Consultation</th>
                <th>Medications</th>
                <th>Diagnostics</th>
                <th>Total Bill</th>
                <th>Payment Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">{bill.bill_number}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                      {bill.patient_name || `Patient #${bill.patient}`}
                    </strong>
                  </td>
                  <td>₹{parseFloat(bill.consultation_fee || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(bill.medicine_fee || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(bill.lab_fee || 0).toFixed(2)}</td>
                  <td>
                    <strong style={{ color: "#0284c7", fontSize: "15px" }}>
                      ₹{parseFloat(bill.total_amount || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        bill.payment_status === "Paid"
                          ? "admin-badge-success"
                          : bill.payment_status === "Pending"
                          ? "admin-badge-warning"
                          : "admin-badge-danger"
                      }`}
                    >
                      {bill.payment_status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(bill)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(bill.id)} className="admin-action-btn-delete">
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

export default Billing;
