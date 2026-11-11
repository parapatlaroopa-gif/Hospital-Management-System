import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDetail, setErrorDetail] = useState("");
  const [activeTab, setActiveTab] = useState("INVENTORY"); // "INVENTORY" | "PRESCRIPTIONS"
  const [showForm, setShowForm] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [submittingRx, setSubmittingRx] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    quantity: "",
    price: "",
    expiry_date: "",
  });

  const [rxFormData, setRxFormData] = useState({
    patient: "",
    doctor: "",
    medicine: "",
    dosage: "500mg",
    frequency: "1-0-1 (Twice Daily after meals)",
    duration: "5 Days",
    instructions: "Take with warm water after meals.",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorDetail("");

      const [medRes, rxRes, patRes, docRes] = await Promise.allSettled([
        API.get("pharmacy/medicines/"),
        API.get("pharmacy/prescriptions/?all=1"),
        API.get("patients/"),
        API.get("doctors/"),
      ]);

      if (medRes.status === "fulfilled") {
        const mData = medRes.value.data;
        setMedicines(Array.isArray(mData) ? mData : mData.results || []);
      } else {
        console.warn("Medicines endpoint unavailable:", medRes.reason);
      }

      if (rxRes.status === "fulfilled") {
        const rData = rxRes.value.data;
        setPrescriptions(Array.isArray(rData) ? rData : rData.results || []);
      } else {
        console.warn("Prescriptions endpoint unavailable:", rxRes.reason);
      }

      if (patRes.status === "fulfilled") {
        const pData = patRes.value.data;
        setPatients(Array.isArray(pData) ? pData : pData.results || []);
      }

      if (docRes.status === "fulfilled") {
        const dData = docRes.value.data;
        setDoctors(Array.isArray(dData) ? dData : dData.results || []);
      }

      if (medRes.status === "rejected" && rxRes.status === "rejected") {
        setErrorDetail(
          "Backend API connection failed. Please ensure the Django development server is running."
        );
      }
    } catch (error) {
      console.error("Pharmacy API Error:", error);
      setErrorDetail("Failed to load pharmacy dispensary stock and prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Medication Inventory Handlers
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
      quantity: parseInt(formData.quantity, 10) || 0,
      price: parseFloat(formData.price) || 0,
    };

    const req = editingId
      ? API.put(`pharmacy/medicines/${editingId}/`, payload)
      : API.post("pharmacy/medicines/", payload);

    req
      .then(() => {
        setMessage(
          editingId
            ? "Medication updated successfully!"
            : "Medication registered successfully!"
        );
        resetForm();
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving medicine:", error);
        setMessage("Failed to save medication record.");
      });
  };

  const handleEdit = (med) => {
    setEditingId(med.id);
    setFormData({
      name: med.name || "",
      category: med.category || "",
      manufacturer: med.manufacturer || "",
      quantity: med.quantity || "",
      price: med.price || "",
      expiry_date: med.expiry_date || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this medication from inventory?"
      )
    )
      return;

    API.delete(`pharmacy/medicines/${id}/`)
      .then(() => {
        setMessage("Medication deleted successfully!");
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting medicine:", error);
        setMessage("Failed to delete medication.");
      });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      manufacturer: "",
      quantity: "",
      price: "",
      expiry_date: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Prescription Form Handlers
  const handleRxChange = (e) => {
    setRxFormData({
      ...rxFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenRxModal = (preselectedPatientId = null, preselectedMedicineId = null) => {
    setRxFormData({
      patient: preselectedPatientId || (patients[0]?.id ? String(patients[0].id) : ""),
      doctor: doctors[0]?.id ? String(doctors[0].id) : "",
      medicine: preselectedMedicineId || (medicines[0]?.id ? String(medicines[0].id) : ""),
      dosage: "500mg",
      frequency: "1-0-1 (Twice Daily after meals)",
      duration: "5 Days",
      instructions: "Take with warm water after food.",
    });
    setShowRxModal(true);
  };

  const handleRxSubmit = async (e) => {
    e.preventDefault();
    if (!rxFormData.patient) {
      setMessage("Please select a patient.");
      return;
    }
    if (!rxFormData.medicine) {
      setMessage("Please select a medication from the pharmacy inventory.");
      return;
    }

    setSubmittingRx(true);
    try {
      const payload = {
        patient: Number(rxFormData.patient),
        medicine: Number(rxFormData.medicine),
        dosage: rxFormData.dosage || "500mg",
        frequency: rxFormData.frequency || "1-0-1 (Twice Daily)",
        duration: rxFormData.duration || "5 Days",
        instructions: rxFormData.instructions || "Take after meals.",
      };
      if (rxFormData.doctor) {
        payload.doctor = Number(rxFormData.doctor);
      }

      await API.post("pharmacy/prescriptions/", payload);

      const targetPatient = patients.find((p) => String(p.id) === String(rxFormData.patient));
      const targetMed = medicines.find((m) => String(m.id) === String(rxFormData.medicine));
      const pName = targetPatient ? `${targetPatient.first_name} ${targetPatient.last_name}` : "Patient";
      const mName = targetMed ? targetMed.name : "Medication";

      setMessage(`Prescription for ${mName} successfully issued & dispensed to ${pName}!`);
      setShowRxModal(false);
      setActiveTab("PRESCRIPTIONS");
      await fetchData();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Prescription Issue Error:", err);
      const errMsg = err.response?.data?.detail || err.response?.data?.error || "Failed to issue prescription.";
      setMessage(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleDeleteRx = async (rxId) => {
    if (!window.confirm(`Cancel Prescription Rx #${rxId}? Stock will be restored to inventory.`)) return;
    try {
      await API.delete(`pharmacy/prescriptions/${rxId}/`);
      setMessage(`Prescription Rx #${rxId} cancelled and unit restored to stock.`);
      fetchData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Cancel prescription error:", err);
      setMessage("Failed to cancel prescription.");
    }
  };

  const handlePrintRx = (rx) => {
    const printContent = `
      =======================================================
               CAREPULSE AI SMART HOSPITAL PHARMACY
                    OFFICIAL DISPENSATION SLIP
      =======================================================
      Prescription Rx ID: #${rx.id}
      Date: ${rx.prescribed_date || new Date().toISOString().split("T")[0]}
      
      PATIENT DETAILS:
      Name: ${rx.patient_name || "Patient #" + rx.patient}
      
      PRESCRIBING PHYSICIAN:
      ${rx.doctor_name || "Attending Physician"}
      
      PHARMACEUTICAL MEDICATION:
      Drug: ${rx.medicine_name || "Medicine #" + rx.medicine} (${rx.medicine_category || "General"})
      Dosage: ${rx.dosage}
      Frequency: ${rx.frequency}
      Duration: ${rx.duration}
      
      SPECIAL CLINICAL INSTRUCTIONS:
      ${rx.instructions || "Standard prescription regimen."}
      
      STATUS: DISPENSED BY PHARMACY
      =======================================================
    `;
    const printWindow = window.open("", "_blank", "width=600,height=600");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 14px; padding: 24px; line-height: 1.6;">${printContent}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = search.toLowerCase();
    const name = (m.name || "").toLowerCase();
    const cat = (m.category || "").toLowerCase();
    const mfg = (m.manufacturer || "").toLowerCase();
    return name.includes(q) || cat.includes(q) || mfg.includes(q);
  });

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    const pName = (rx.patient_name || "").toLowerCase();
    const mName = (rx.medicine_name || "").toLowerCase();
    const dName = (rx.doctor_name || "").toLowerCase();
    return pName.includes(q) || mName.includes(q) || dName.includes(q);
  });

  const totalUnits = medicines.reduce(
    (sum, m) => sum + (parseInt(m.quantity, 10) || 0),
    0
  );
  const lowStockCount = medicines.filter((m) => m.quantity <= 15).length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>💊 Pharmacy & Clinical Dispensary</h1>
          <p>
            Manage pharmaceutical stock, doctor prescriptions to patients, pricing, and automated inventory sync
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleOpenRxModal()}
            className="admin-btn-primary"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
            }}
          >
            📜＋ Prescribe to Patient
          </button>

          {activeTab === "INVENTORY" && (
            <button
              onClick={() => {
                if (showForm) resetForm();
                else {
                  setShowForm(true);
                  setMessage("");
                }
              }}
              className={showForm ? "admin-btn-cancel" : "admin-btn-secondary"}
            >
              {showForm ? "✕ Close Form" : "💊＋ Add Medication"}
            </button>
          )}

          <button
            onClick={fetchData}
            className="admin-btn-secondary"
            title="Refresh dispensary records from backend"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
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

      {/* ERROR DIAGNOSTIC BANNER */}
      {errorDetail && (
        <div
          style={{
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>⚠️</span>
            <div>
              <strong style={{ color: "#991b1b", fontSize: "14px", display: "block" }}>
                API Connection Issue
              </strong>
              <span style={{ color: "#b91c1c", fontSize: "13px" }}>{errorDetail}</span>
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              padding: "8px 16px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "12.5px",
              cursor: "pointer",
            }}
          >
            🔄 Retry Connection
          </button>
        </div>
      )}

      {/* ALERT MESSAGE */}
      {message && (
        <div
          className={`admin-alert ${
            message.includes("successfully") || message.includes("restored")
              ? "admin-alert-success"
              : "admin-alert-error"
          }`}
        >
          <span>{message.includes("successfully") || message.includes("restored") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* 4 STATS METRIC CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💊</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Drug SKUs</span>
            <div className="admin-stat-value">{medicines.length}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">In-Stock Units</span>
            <div className="admin-stat-value">{totalUnits}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📜</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Prescriptions Dispensed</span>
            <div className="admin-stat-value">{prescriptions.length}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⚠️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Low Stock Alerts</span>
            <div
              className="admin-stat-value"
              style={{ color: lowStockCount > 0 ? "#dc2626" : "#0284c7" }}
            >
              {lowStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("INVENTORY")}
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            border:
              activeTab === "INVENTORY"
                ? "1.5px solid #0284c7"
                : "1px solid #cbd5e1",
            background:
              activeTab === "INVENTORY"
                ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)"
                : "#ffffff",
            color: activeTab === "INVENTORY" ? "#0369a1" : "#475569",
            fontWeight: 800,
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>💊</span> Medication Inventory ({medicines.length})
        </button>

        <button
          onClick={() => setActiveTab("PRESCRIPTIONS")}
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            border:
              activeTab === "PRESCRIPTIONS"
                ? "1.5px solid #0284c7"
                : "1px solid #cbd5e1",
            background:
              activeTab === "PRESCRIPTIONS"
                ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)"
                : "#ffffff",
            color: activeTab === "PRESCRIPTIONS" ? "#0369a1" : "#475569",
            fontWeight: 800,
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📜</span> Doctor Prescriptions Ledger ({prescriptions.length})
        </button>
      </div>

      {/* ADD / EDIT FORM (INVENTORY ONLY) */}
      {showForm && activeTab === "INVENTORY" && (
        <div className="admin-form-card">
          <h2>
            {editingId
              ? "✏️ Edit Medication Specifications"
              : "💊 Register New Pharmaceutical Product"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Medicine / Drug Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Amoxicillin 500mg, Paracetamol"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Therapeutic Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Tablet, Syrup, Injection, Capsule"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Pharmaceutical Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Pfizer, Novartis, Cipla"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>In-Stock Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="100"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Unit Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="12.50"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Expiration Date *</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Update Stock" : "＋ Register Medicine"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="admin-btn-cancel"
              >
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
          placeholder={
            activeTab === "INVENTORY"
              ? "Search medicines by brand name, active category, or manufacturer..."
              : "Search prescriptions by patient name, prescribed medication, or doctor..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
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

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === "INVENTORY" && (
        <div className="admin-table-card">
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  animation: "pulse 1.5s infinite",
                }}
              >
                💊
              </div>
              <p style={{ margin: 0 }}>Loading pharmacy dispensaries...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <span
                style={{
                  fontSize: "40px",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                💊
              </span>
              <strong
                style={{
                  fontSize: "16px",
                  color: "#0f172a",
                  display: "block",
                }}
              >
                No Medications Found
              </strong>
              <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
                {search
                  ? "No medicine matches your search filter."
                  : "Click '+ Add Medication' above to register stock."}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Medication Name</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Available Units</th>
                  <th>Unit Price</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => {
                  const isLowStock = med.quantity <= 15;
                  const isExpired =
                    med.expiry_date && new Date(med.expiry_date) < new Date();

                  return (
                    <tr key={med.id}>
                      <td>
                        <span className="admin-badge admin-badge-info">
                          #{med.id}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
                          {med.name}
                        </strong>
                      </td>
                      <td>{med.category || "General"}</td>
                      <td>{med.manufacturer || "—"}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            isLowStock
                              ? "admin-badge-danger"
                              : "admin-badge-success"
                          }`}
                        >
                          {med.quantity} Units {isLowStock ? "(Low)" : ""}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#0284c7" }}>
                          ₹{parseFloat(med.price || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            color: isExpired ? "#dc2626" : "#475569",
                            fontWeight: isExpired ? 700 : 500,
                          }}
                        >
                          {med.expiry_date || "—"}{" "}
                          {isExpired ? "⚠️ Expired" : ""}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleOpenRxModal(null, String(med.id))}
                          className="admin-btn-secondary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            marginRight: "6px",
                            color: "#0369a1",
                            background: "#e0f2fe",
                            borderColor: "#7dd3fc",
                          }}
                          title="Prescribe this medication to a patient"
                        >
                          📜 Prescribe
                        </button>
                        <button
                          onClick={() => handleEdit(med)}
                          className="admin-action-btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="admin-action-btn-delete"
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
      )}

      {/* TAB 2: DOCTOR PRESCRIPTIONS REGISTRY */}
      {activeTab === "PRESCRIPTIONS" && (
        <div className="admin-table-card">
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1.5px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                Doctor Prescription Dispensation Ledger
              </h3>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Direct clinical prescriptions from doctors & pharmacists to patients with automated stock deduction.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className="admin-badge admin-badge-info">
                {filteredPrescriptions.length} Prescriptions Logged
              </span>
              <button
                onClick={() => handleOpenRxModal()}
                className="admin-btn-primary"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                ＋ Issue Prescription
              </button>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <p style={{ margin: 0 }}>Loading prescription orders...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <span
                style={{
                  fontSize: "40px",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                📜
              </span>
              <strong
                style={{
                  fontSize: "16px",
                  color: "#0f172a",
                  display: "block",
                }}
              >
                No Prescriptions Found
              </strong>
              <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
                {search
                  ? "No prescriptions match your search filter."
                  : "Click '+ Issue Prescription' to prescribe medications directly to patients."}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Prescribed Medication</th>
                  <th>Dosage & Frequency</th>
                  <th>Duration</th>
                  <th>Clinical Instructions</th>
                  <th>Date</th>
                  <th>Dispensation</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td>
                      <span className="admin-badge admin-badge-info">
                        Rx #{rx.id}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a", display: "block" }}>
                        {rx.patient_name || `Patient #${rx.patient}`}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        PID: #{rx.patient}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#0284c7" }}>
                        👨‍⚕️ {rx.doctor_name || "Physician"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a", display: "block" }}>
                        💊 {rx.medicine_name || `Medicine #${rx.medicine}`}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                        {rx.medicine_category} · ₹
                        {rx.medicine_price || "0.00"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>
                        {rx.dosage}
                      </div>
                      <div style={{ fontSize: "12px", color: "#0369a1" }}>
                        {rx.frequency}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        ⏱️ {rx.duration}
                      </span>
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        fontSize: "12.5px",
                        color: "#475569",
                      }}
                    >
                      {rx.instructions || "Standard prescription regimen."}
                    </td>
                    <td
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rx.prescribed_date}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-success">
                        ✓ Dispensed
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handlePrintRx(rx)}
                        className="admin-btn-secondary"
                        style={{
                          padding: "6px 10px",
                          fontSize: "12px",
                          marginRight: "6px",
                        }}
                        title="Print prescription slip"
                      >
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => handleDeleteRx(rx.id)}
                        className="admin-action-btn-delete"
                        title="Cancel prescription and restore stock"
                      >
                        🗑️ Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL: ISSUE PRESCRIPTION TO PATIENT DIRECTLY FROM PHARMACY */}
      {showRxModal && (
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
          onClick={() => setShowRxModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "640px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1.5px solid rgba(186, 230, 253, 0.8)",
              overflow: "hidden",
              animation: "fadeIn 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
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
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#0369a1",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  📜 Issue Doctor Prescription to Patient
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "12.5px",
                    color: "#0284c7",
                  }}
                >
                  Select patient, attending doctor, and pharmacy medication. Stock will automatically deduct upon dispensation.
                </p>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleRxSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* SELECT PATIENT */}
                <div className="admin-form-group">
                  <label>Select Patient *</label>
                  <select
                    name="patient"
                    value={rxFormData.patient}
                    onChange={handleRxChange}
                    required
                    className="admin-input"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} (PID: #{p.id}{p.gender ? ` · ${p.gender}` : ""})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SELECT DOCTOR */}
                <div className="admin-form-group">
                  <label>Prescribing Doctor *</label>
                  <select
                    name="doctor"
                    value={rxFormData.doctor}
                    onChange={handleRxChange}
                    className="admin-input"
                  >
                    <option value="">-- Attending Physician / Auto --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.first_name} {d.last_name} ({d.specialization || "General Medicine"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SELECT MEDICINE FROM PHARMACY */}
              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label>Select Pharmacy Medication *</label>
                <select
                  name="medicine"
                  value={rxFormData.medicine}
                  onChange={handleRxChange}
                  required
                  className="admin-input"
                >
                  <option value="">-- Choose Medicine from Dispensary --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.quantity <= 0}>
                      {m.name} ({m.category || "General"}) — ₹{parseFloat(m.price || 0).toFixed(2)} — In Stock: {m.quantity} units {m.quantity <= 0 ? "(OUT OF STOCK)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* DOSAGE & QUICK CHIPS */}
              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label>Dosage *</label>
                <input
                  type="text"
                  name="dosage"
                  value={rxFormData.dosage}
                  onChange={handleRxChange}
                  required
                  placeholder="e.g., 500mg, 1 tablet, 5ml"
                  className="admin-input"
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                  {["250mg", "500mg", "650mg", "1 Tablet", "5ml Syrup", "1 Ampoule"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRxFormData({ ...rxFormData, dosage: chip })}
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: rxFormData.dosage === chip ? "#e0f2fe" : "#f8fafc",
                        color: rxFormData.dosage === chip ? "#0369a1" : "#475569",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* FREQUENCY & DURATION */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
                <div className="admin-form-group">
                  <label>Frequency *</label>
                  <input
                    type="text"
                    name="frequency"
                    value={rxFormData.frequency}
                    onChange={handleRxChange}
                    required
                    placeholder="e.g., 1-0-1 (Twice Daily)"
                    className="admin-input"
                  />
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                    {["1-0-1 (Twice Daily)", "1-1-1 (Thrice Daily)", "1-0-0 (Morning)", "0-0-1 (Night)"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setRxFormData({ ...rxFormData, frequency: chip })}
                        style={{
                          padding: "2px 6px",
                          fontSize: "10.5px",
                          borderRadius: "5px",
                          border: "1px solid #cbd5e1",
                          background: rxFormData.frequency === chip ? "#e0f2fe" : "#f8fafc",
                          color: rxFormData.frequency === chip ? "#0369a1" : "#475569",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={rxFormData.duration}
                    onChange={handleRxChange}
                    required
                    placeholder="e.g., 5 Days, 1 Week"
                    className="admin-input"
                  />
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                    {["3 Days", "5 Days", "7 Days", "14 Days", "30 Days"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setRxFormData({ ...rxFormData, duration: chip })}
                        style={{
                          padding: "2px 6px",
                          fontSize: "10.5px",
                          borderRadius: "5px",
                          border: "1px solid #cbd5e1",
                          background: rxFormData.duration === chip ? "#e0f2fe" : "#f8fafc",
                          color: rxFormData.duration === chip ? "#0369a1" : "#475569",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SPECIAL INSTRUCTIONS */}
              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label>Clinical Instructions</label>
                <textarea
                  name="instructions"
                  value={rxFormData.instructions}
                  onChange={handleRxChange}
                  rows="2"
                  placeholder="e.g., Take with a full glass of water after meals. Complete the entire course."
                  className="admin-input"
                  style={{ resize: "vertical" }}
                ></textarea>
              </div>

              {/* MODAL ACTIONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "20px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRx}
                  className="admin-btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  }}
                >
                  {submittingRx ? "Dispensing..." : "✓ Confirm & Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pharmacy;
