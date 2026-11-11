import { useEffect, useState } from "react";
import API from "../../services/api";
import authService from "../../services/auth";

export default function PatientAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = authService.getCurrentUser();
  const currentRole = authService.getRole();

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    nurse: "",
    notes: "",
    status: "Active",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, patRes, docRes, staffRes] = await Promise.all([
        API.get("accounts/assignments/"),
        API.get("patients/"),
        API.get("doctors/"),
        API.get("staff/"),
      ]);

      setAssignments(assignRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
      // Filter nurses from staff
      const nurseList = staffRes.data.filter((s) => (s.role || "").toLowerCase() === "nurse");
      setNurses(nurseList.length > 0 ? nurseList : staffRes.data);

      // Default doctor if logged in as doctor
      if (currentUser?.doctor_id) {
        setFormData((prev) => ({ ...prev, doctor: currentUser.doctor_id }));
      }
    } catch (err) {
      console.error("Error loading assignments data:", err);
      setMessage("Failed to load assignment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.doctor) {
      setMessage("Please select both a patient and an attending doctor.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: parseInt(formData.patient, 10),
        doctor: parseInt(formData.doctor, 10),
        nurse: formData.nurse ? parseInt(formData.nurse, 10) : null,
        notes: formData.notes,
        status: formData.status,
      };

      await API.post("accounts/assignments/", payload);
      setMessage("Patient assigned successfully!");
      setShowModal(false);
      setFormData({
        patient: "",
        doctor: currentUser?.doctor_id || "",
        nurse: "",
        notes: "",
        status: "Active",
      });
      fetchData();
    } catch (err) {
      console.error("Assignment error:", err);
      setMessage("Failed to create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(`accounts/assignments/${id}/`, { status: newStatus });
      setMessage(`Assignment #${id} updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      console.error("Status update error:", err);
      setMessage("Failed to update assignment status.");
    }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#1e293b", fontSize: "28px" }}>
            🩺 Patient & Nurse Care Assignments
          </h1>
          <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "15px" }}>
            Assign patients to attending doctors and designate supporting nurses for direct care.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setMessage("");
          }}
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
          <span>➕</span> Assign Patient & Nurse
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: message.toLowerCase().includes("fail") ? "#fee2e2" : "#dcfce7",
            color: message.toLowerCase().includes("fail") ? "#b91c1c" : "#15803d",
            fontWeight: "500",
          }}
        >
          {message}
        </div>
      )}

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <div style={statCardStyle("#2563eb")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Total Assignments</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>{assignments.length}</div>
          <div style={{ fontSize: "12px", color: "#2563eb" }}>Care Relationships Established</div>
        </div>

        <div style={statCardStyle("#10b981")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Active In-Care</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>
            {assignments.filter((a) => a.status === "Active").length}
          </div>
          <div style={{ fontSize: "12px", color: "#10b981" }}>Currently Under Monitoring</div>
        </div>

        <div style={statCardStyle("#64748b")}>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Completed / Discharged</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "6px 0" }}>
            {assignments.filter((a) => a.status !== "Active").length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Past Care Cases</div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>Current Patient Assignments</h2>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading care assignments...</div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No patient care assignments recorded. Click "+ Assign Patient & Nurse" to begin.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1e293b", color: "#ffffff", textAlign: "left" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Attending Doctor</th>
                <th style={thStyle}>Assigned Nurse</th>
                <th style={thStyle}>Assigned Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Doctor's Instructions / Notes</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}>#{item.id}</td>
                  <td style={tdStyle}>
                    <strong>👤 {item.patient_name}</strong>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#0369a1", fontWeight: "600" }}>🩺 {item.doctor_name}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#7c3aed", fontWeight: "600" }}>
                      👩‍⚕️ {item.nurse_name}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.assigned_date}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: item.status === "Active" ? "#dcfce7" : "#f1f5f9",
                        color: item.status === "Active" ? "#15803d" : "#64748b",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.notes || "No special notes."}</td>
                  <td style={tdStyle}>
                    {item.status === "Active" ? (
                      <button
                        onClick={() => handleUpdateStatus(item.id, "Completed")}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          backgroundColor: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(item.id, "Active")}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                        }}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ASSIGNMENT MODAL */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>
                🩺 Assign Patient & Designate Nurse
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              {/* SELECT PATIENT */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Select Patient *</label>
                <select
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  required
                  style={modalInputStyle}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.first_name} {p.last_name} ({p.gender}, {p.age} yrs)
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT DOCTOR */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Attending Doctor *</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  required
                  style={modalInputStyle}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT NURSE */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Assigned Nurse (Optional)</label>
                <select
                  name="nurse"
                  value={formData.nurse}
                  onChange={handleInputChange}
                  style={modalInputStyle}
                >
                  <option value="">-- None (Assign Later) --</option>
                  {nurses.map((n) => (
                    <option key={n.id} value={n.id}>
                      Nurse {n.first_name} {n.last_name} (Phone: {n.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* CARE NOTES */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Care Instructions & Clinical Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="e.g. Daily vitals check, BP monitoring, post-op care..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  style={{ ...modalInputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 16px",
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
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    cursor: submitting ? "wait" : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {submitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
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
  maxWidth: "520px",
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
