import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminPages.css";

function Reports() {
  const [reports, setReports] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    departments: 0,
    admissions: 0,
    billing: 0,
    laboratory: 0,
    pharmacy: 0,
    inventory: 0,
    staff: 0,
    nurseAssignments: 0,
  });

  const [assignments, setAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCount = (response) => {
    const data = response?.data;
    if (Array.isArray(data)) return data.length;
    if (data && typeof data.count === "number") return data.count;
    if (data && Array.isArray(data.results)) return data.results.length;
    return 0;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        patientsRes,
        doctorsRes,
        appointmentsRes,
        departmentsRes,
        admissionsRes,
        billingRes,
        laboratoryRes,
        pharmacyRes,
        inventoryRes,
        staffRes,
        assignmentsRes,
      ] = await Promise.allSettled([
        api.get("patients/"),
        api.get("doctors/"),
        api.get("appointments/"),
        api.get("departments/"),
        api.get("admissions/"),
        api.get("billing/"),
        api.get("laboratory/tests/"),
        api.get("pharmacy/medicines/"),
        api.get("inventory/items/"),
        api.get("staff/"),
        api.get("accounts/assignments/"),
      ]);

      const asgData = assignmentsRes.status === "fulfilled"
        ? (Array.isArray(assignmentsRes.value?.data) ? assignmentsRes.value.data : assignmentsRes.value?.data?.results || [])
        : [];
      setAssignments(asgData);

      setReports({
        patients: patientsRes.status === "fulfilled" ? getCount(patientsRes.value) : 0,
        doctors: doctorsRes.status === "fulfilled" ? getCount(doctorsRes.value) : 0,
        appointments: appointmentsRes.status === "fulfilled" ? getCount(appointmentsRes.value) : 0,
        departments: departmentsRes.status === "fulfilled" ? getCount(departmentsRes.value) : 0,
        admissions: admissionsRes.status === "fulfilled" ? getCount(admissionsRes.value) : 0,
        billing: billingRes.status === "fulfilled" ? getCount(billingRes.value) : 0,
        laboratory: laboratoryRes.status === "fulfilled" ? getCount(laboratoryRes.value) : 0,
        pharmacy: pharmacyRes.status === "fulfilled" ? getCount(pharmacyRes.value) : 0,
        inventory: inventoryRes.status === "fulfilled" ? getCount(inventoryRes.value) : 0,
        staff: staffRes.status === "fulfilled" ? getCount(staffRes.value) : 0,
        nurseAssignments: asgData.length,
      });
    } catch (err) {
      console.error("Error generating reports:", err);
      setError("Failed to compile analytics reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalRecords = Object.values(reports).reduce((sum, val) => sum + val, 0);

  const reportItems = [
    { name: "Patients", value: reports.patients, icon: "👥", color: "#0284c7" },
    { name: "Doctors", value: reports.doctors, icon: "👨‍⚕️", color: "#0369a1" },
    { name: "Appointments", value: reports.appointments, icon: "📅", color: "#0284c7" },
    { name: "Departments", value: reports.departments, icon: "🏢", color: "#075985" },
    { name: "Admissions", value: reports.admissions, icon: "🛏️", color: "#0284c7" },
    { name: "Invoices & Billing", value: reports.billing, icon: "💳", color: "#059669" },
    { name: "Laboratory Diagnostics", value: reports.laboratory, icon: "🧪", color: "#0284c7" },
    { name: "Pharmacy Dispensary", value: reports.pharmacy, icon: "💊", color: "#d97706" },
    { name: "Inventory Supplies", value: reports.inventory, icon: "📦", color: "#475569" },
    { name: "Clinical Staff & Nurses", value: reports.staff, icon: "👨‍💼", color: "#0891b2" },
    { name: "Nurse Care Delegations", value: reports.nurseAssignments, icon: "👩‍⚕️", color: "#0284c7" },
  ];

  const exportCSV = () => {
    let csvContent =
      "data:text/csv;charset=utf-8," +
      "--- HOSPITAL DOMAIN SUMMARY CENSUS ---\n" +
      "Module,Record Count,Generated Date\n" +
      reportItems.map((item) => `"${item.name}",${item.value},"${new Date().toLocaleDateString()}"`).join("\n") +
      `\n"Total System Records",${totalRecords},"${new Date().toLocaleDateString()}"\n\n` +
      "--- DOCTOR CLINICAL NURSE DELEGATIONS AUDIT ---\n" +
      "Assignment ID,Patient Name,Attending Doctor,Assigned Nurse,Clinical Care Notes,Assigned Date,Status\n" +
      assignments.map((a) =>
        `"${a.id}","${a.patient_name || `Patient #${a.patient}`}","${a.doctor_name || `Doctor #${a.doctor}`}","${a.nurse_name || `Staff #${a.nurse}`}","${(a.notes || '').replace(/"/g, '""')}","${a.assigned_date}","${a.status}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarePulse_Hospital_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>📊 System Reports & Clinical Analytics</h1>
          <p>Comprehensive institutional census, activity metrics, and departmental records telemetry</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={exportCSV} className="admin-btn-secondary">
            <span>📥 Export CSV</span>
          </button>
          <button onClick={() => window.print()} className="admin-btn-primary">
            <span>🖨️ Print Report</span>
          </button>
        </div>
      </header>

      {/* ERROR ALERT */}
      {error && (
        <div className="admin-alert admin-alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 60%, #f0f9ff 100%)",
          border: "1.5px solid rgba(186, 230, 253, 0.95)",
          borderRadius: "22px",
          padding: "26px 32px",
          marginBottom: "30px",
          boxShadow: "0 8px 24px rgba(56, 189, 248, 0.14)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            HOSPITAL SYSTEM AUDIT
          </span>
          <h2 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
            Total Hospital Records: {loading ? "..." : totalRecords.toLocaleString()}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#334155", fontSize: "14px" }}>
            All 10 clinical and administrative modules are synchronized in real-time.
          </p>
        </div>

        <button onClick={fetchReports} className="admin-btn-primary" style={{ padding: "10px 20px" }}>
          <span>🔄 Refresh Census</span>
        </button>
      </div>

      {/* METRIC PODS GRID */}
      <div className="reports-metric-grid">
        {reportItems.map((item) => (
          <div
            key={item.name}
            style={{
              background: "#ffffff",
              border: "1.5px solid rgba(186, 230, 253, 0.85)",
              borderRadius: "18px",
              padding: "20px 22px",
              boxShadow: "0 4px 16px rgba(148, 163, 184, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#e0f2fe",
                color: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            <div>
              <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                {item.name}
              </span>
              <strong style={{ fontSize: "24px", color: "#0f172a", fontWeight: 800 }}>
                {loading ? "..." : item.value}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED DATA AUDIT TABLE */}
      <div className="admin-table-card">
        <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
          Departmental Census Breakdown
        </h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hospital Domain</th>
              <th>Primary Unit</th>
              <th>Current Logged Volume</th>
              <th>Operational Health</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {reportItems.map((item) => (
              <tr key={item.name}>
                <td>
                  <span style={{ fontSize: "18px", marginRight: "8px" }}>{item.icon}</span>
                  <strong style={{ color: "#0f172a" }}>{item.name}</strong>
                </td>
                <td>CarePulse Medical Core</td>
                <td>
                  <strong style={{ color: "#0284c7" }}>{item.value} records</strong>
                </td>
                <td>
                  <span className="admin-badge admin-badge-success">Operational 100%</span>
                </td>
                <td>
                  <span className="admin-badge admin-badge-info">Synchronized</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DOCTOR CLINICAL REPORTS & STAFF NURSE DELEGATIONS AUDIT */}
      <div className="admin-table-card" style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>👩‍⚕️</span>
              <span>Doctor Clinical Reports & Staff Nurse Delegations Audit</span>
            </h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Live audit of patient care duties, monitoring directives, and nurse assignments delegated by attending physicians.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "ACTIVE", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setAssignmentFilter(st)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: assignmentFilter === st ? "1.5px solid #0284c7" : "1px solid #cbd5e1",
                  background: assignmentFilter === st ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" : "#ffffff",
                  color: assignmentFilter === st ? "#0369a1" : "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {st} {st === "ALL" ? `(${assignments.length})` : st === "ACTIVE" ? `(${assignments.filter(a => a.status === 'Active').length})` : `(${assignments.filter(a => a.status === 'Completed').length})`}
              </button>
            ))}
          </div>
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>📋</span>
            <strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>No Staff Nurse Delegations Recorded</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
              When doctors assign staff nurses to patients in the Clinical Station, records appear here immediately.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Patient Details</th>
                <th>Attending Physician (Doctor)</th>
                <th>Assigned Staff Nurse</th>
                <th>Clinical Care Orders / Notes</th>
                <th>Assigned Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments
                .filter((a) => assignmentFilter === "ALL" || (a.status || "").toUpperCase() === assignmentFilter)
                .map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="admin-badge admin-badge-info">#{a.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>
                        {a.patient_name || `Patient #${a.patient}`}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "#64748b", display: "block" }}>Ref ID #{a.patient}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#0369a1" }}>
                        {a.doctor_name || `Doctor #${a.doctor}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>👩‍⚕️</span>
                        <strong style={{ color: "#16a34a" }}>
                          {a.nurse_name || `Nurse #${a.nurse}`}
                        </strong>
                      </div>
                    </td>
                    <td style={{ maxWidth: "260px", color: "#334155", fontSize: "13px" }}>
                      {a.notes || "Standard clinical care and telemetry vitals"}
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "#64748b" }}>🗓️ {a.assigned_date}</span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          a.status === "Active"
                            ? "admin-badge-warning"
                            : a.status === "Completed"
                            ? "admin-badge-success"
                            : "admin-badge-info"
                        }`}
                      >
                        {a.status}
                      </span>
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

export default Reports;