
import { useEffect, useState } from "react";
import API from "../services/api";

function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    room_number: "",
    admission_date: "",
    discharge_date: "",
    status: "Admitted",
  });

  // ================================
  // FETCH ADMISSIONS
  // ================================
  const fetchAdmissions = () => {
    setLoading(true);

    API.get("admissions/")
      .then((response) => {
        setAdmissions(response.data);
      })
      .catch((error) => {
        console.error("Admission API Error:", error);
        setMessage("Failed to load admissions");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ================================
  // FETCH PATIENTS
  // ================================
  const fetchPatients = () => {
    API.get("patients/")
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error("Patient API Error:", error);
      });
  };

  // ================================
  // FETCH DOCTORS
  // ================================
  const fetchDoctors = () => {
    API.get("doctors/")
      .then((response) => {
        setDoctors(response.data);
      })
      .catch((error) => {
        console.error("Doctor API Error:", error);
      });
  };

  // ================================
  // LOAD DATA
  // ================================
  useEffect(() => {
    fetchAdmissions();
    fetchPatients();
    fetchDoctors();
  }, []);

  // ================================
  // HANDLE INPUT CHANGE
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ================================
  // ADD / UPDATE ADMISSION
  // ================================
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    // Required fields
    if (
      !formData.patient ||
      !formData.room_number ||
      !formData.admission_date
    ) {
      setMessage(
        "Please fill Patient, Room Number and Admission Date"
      );
      return;
    }

    // Discharge date required when discharged
    if (
      formData.status === "Discharged" &&
      !formData.discharge_date
    ) {
      setMessage(
        "Please select Discharge Date for a discharged patient"
      );
      return;
    }

    // Discharge date cannot be before admission date
    if (
      formData.discharge_date &&
      formData.discharge_date < formData.admission_date
    ) {
      setMessage(
        "Discharge Date cannot be before Admission Date"
      );
      return;
    }

    const dataToSend = {
      patient: Number(formData.patient),
      doctor: formData.doctor
        ? Number(formData.doctor)
        : null,
      room_number: formData.room_number,
      admission_date: formData.admission_date,
      discharge_date:
        formData.discharge_date || null,
      status: formData.status,
    };

    // ================================
    // UPDATE
    // ================================
    if (editingId) {
      API.put(
        `admissions/${editingId}/`,
        dataToSend
      )
        .then(() => {
          setMessage(
            "Admission updated successfully"
          );

          resetForm();
          fetchAdmissions();
        })
        .catch((error) => {
          console.error(
            "Error updating admission:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to update admission"
          );
        });
    }

    // ================================
    // ADD
    // ================================
    else {
      API.post("admissions/", dataToSend)
        .then(() => {
          setMessage(
            "Admission added successfully"
          );

          resetForm();
          fetchAdmissions();
        })
        .catch((error) => {
          console.error(
            "Error adding admission:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to add admission"
          );
        });
    }
  };

  // ================================
  // EDIT ADMISSION
  // ================================
  const handleEdit = (admission) => {
    setEditingId(admission.id);

    setFormData({
      patient:
        admission.patient?.id ||
        admission.patient ||
        "",

      doctor:
        admission.doctor?.id ||
        admission.doctor ||
        "",

      room_number:
        admission.room_number || "",

      admission_date:
        admission.admission_date || "",

      discharge_date:
        admission.discharge_date || "",

      status:
        admission.status || "Admitted",
    });

    setShowForm(true);
    setMessage("");
  };

  // ================================
  // DELETE ADMISSION
  // ================================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admission?"
    );

    if (!confirmDelete) {
      return;
    }

    API.delete(`admissions/${id}/`)
      .then(() => {
        setMessage(
          "Admission deleted successfully"
        );

        fetchAdmissions();
      })
      .catch((error) => {
        console.error(
          "Error deleting admission:",
          error
        );

        console.error(
          "Server response:",
          error.response?.data
        );

        setMessage(
          "Failed to delete admission"
        );
      });
  };

  // ================================
  // RESET FORM
  // ================================
  const resetForm = () => {
    setFormData({
      patient: "",
      doctor: "",
      room_number: "",
      admission_date: "",
      discharge_date: "",
      status: "Admitted",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ================================
  // GET PATIENT NAME
  // ================================
  const getPatientName = (patientId) => {
    if (
      typeof patientId === "object" &&
      patientId !== null
    ) {
      return `${patientId.first_name || ""} ${
        patientId.last_name || ""
      }`.trim();
    }

    const patient = patients.find(
      (item) => item.id === Number(patientId)
    );

    if (patient) {
      return `${patient.first_name} ${patient.last_name}`;
    }

    return patientId || "Unknown";
  };

  // ================================
  // GET DOCTOR NAME
  // ================================
  const getDoctorName = (doctorId) => {
    if (
      typeof doctorId === "object" &&
      doctorId !== null
    ) {
      return `Dr. ${
        doctorId.first_name || ""
      } ${
        doctorId.last_name || ""
      }`.trim();
    }

    if (!doctorId) {
      return "Not Assigned";
    }

    const doctor = doctors.find(
      (item) => item.id === Number(doctorId)
    );

    if (doctor) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }

    return `Doctor ${doctorId}`;
  };

  // ================================
  // STYLES
  // ================================
  const addButtonStyle = {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  };

  const formContainerStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: "25px",
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "500px",
    padding: "12px",
    marginBottom: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
    display: "block",
  };

  const saveButtonStyle = {
    display: "block",
    marginTop: "5px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  };

  const editButtonStyle = {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px",
  };

  const deleteButtonStyle = {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  };

  const tableContainerStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    overflowX: "auto",
  };

  const thStyle = {
    padding: "15px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "1px solid #ddd",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "15px",
    border: "1px solid #ddd",
    color: "#333",
  };

  // ================================
  // UI
  // ================================
  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "28px",
            }}
          >
            🏥 Admissions
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Manage hospital patient admissions
          </p>
        </div>

        <button
          style={addButtonStyle}
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setMessage("");
            }
          }}
        >
          {showForm
            ? "✖ Cancel"
            : "➕ Add Admission"}
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            backgroundColor: message.includes(
              "success"
            )
              ? "#dcfce7"
              : "#fee2e2",

            color: message.includes("success")
              ? "#166534"
              : "#991b1b",

            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div style={formContainerStyle}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#1e293b",
            }}
          >
            {editingId
              ? "Edit Admission"
              : "Add New Admission"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* PATIENT */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Patient
            </label>

            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.first_name}{" "}
                  {patient.last_name}
                </option>
              ))}
            </select>

            {/* DOCTOR */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Doctor
            </label>

            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">
                Select Doctor (Optional)
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  Dr. {doctor.first_name}{" "}
                  {doctor.last_name}
                </option>
              ))}
            </select>

            {/* ROOM NUMBER */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Room Number
            </label>

            <input
              type="text"
              name="room_number"
              placeholder="Enter Room Number"
              value={formData.room_number}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            {/* ADMISSION DATE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Admission Date
            </label>

            <input
              type="date"
              name="admission_date"
              value={formData.admission_date}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            {/* DISCHARGE DATE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Discharge Date
            </label>

            <input
              type="date"
              name="discharge_date"
              value={formData.discharge_date}
              onChange={handleChange}
              style={inputStyle}
              required={
                formData.status === "Discharged"
              }
            />

            {/* STATUS */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="Admitted">
                Admitted
              </option>

              <option value="Discharged">
                Discharged
              </option>
            </select>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              style={saveButtonStyle}
            >
              {editingId
                ? "Update Admission"
                : "Save Admission"}
            </button>
          </form>
        </div>
      )}

      {/* ADMISSION TABLE */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          Admission List
        </h2>

        {loading ? (
          <p>Loading admissions...</p>
        ) : admissions.length === 0 ? (
          <p
            style={{
              color: "#64748b",
              padding: "20px 0",
            }}
          >
            No admissions found.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>
                  Admission Date
                </th>
                <th style={thStyle}>
                  Discharge Date
                </th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {admissions.map((admission) => (
                <tr key={admission.id}>
                  {/* ID */}
                  <td style={tdStyle}>
                    {admission.id}
                  </td>

                  {/* PATIENT */}
                  <td style={tdStyle}>
                    {getPatientName(
                      admission.patient
                    )}
                  </td>

                  {/* DOCTOR */}
                  <td style={tdStyle}>
                    {getDoctorName(
                      admission.doctor
                    )}
                  </td>

                  {/* ROOM */}
                  <td style={tdStyle}>
                    {admission.room_number}
                  </td>

                  {/* ADMISSION DATE */}
                  <td style={tdStyle}>
                    {admission.admission_date}
                  </td>

                  {/* DISCHARGE DATE */}
                  <td style={tdStyle}>
                    {admission.discharge_date
                      ? admission.discharge_date
                      : "-"}
                  </td>

                  {/* STATUS */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",

                        backgroundColor:
                          admission.status ===
                          "Admitted"
                            ? "#dcfce7"
                            : "#dbeafe",

                        color:
                          admission.status ===
                          "Admitted"
                            ? "#166534"
                            : "#1d4ed8",
                      }}
                    >
                      {admission.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() =>
                        handleEdit(admission)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() =>
                        handleDelete(
                          admission.id
                        )
                      }
                    >
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

