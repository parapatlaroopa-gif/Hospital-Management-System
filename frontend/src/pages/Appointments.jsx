
import { useEffect, useState } from "react";
import API from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "Pending",
  });

  // ================================
  // FETCH APPOINTMENTS
  // ================================
  const fetchAppointments = () => {
    setLoading(true);

    API.get("appointments/")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        console.error("Appointment API Error:", error);
        setMessage("Failed to load appointments");
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
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  // ================================
  // HANDLE INPUT CHANGE
  // ================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================================
  // ADD / UPDATE APPOINTMENT
  // ================================
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.patient ||
      !formData.doctor ||
      !formData.appointment_date ||
      !formData.appointment_time ||
      !formData.reason
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    if (editingId) {
      API.put(`appointments/${editingId}/`, formData)
        .then(() => {
          setMessage("Appointment updated successfully");
          resetForm();
          fetchAppointments();
        })
        .catch((error) => {
          console.error("Error updating appointment:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to update appointment");
        });
    } else {
      API.post("appointments/", formData)
        .then(() => {
          setMessage("Appointment added successfully");
          resetForm();
          fetchAppointments();
        })
        .catch((error) => {
          console.error("Error adding appointment:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to add appointment");
        });
    }
  };

  // ================================
  // EDIT APPOINTMENT
  // ================================
  const handleEdit = (appointment) => {
    setEditingId(appointment.id);

    setFormData({
      patient:
        appointment.patient?.id ||
        appointment.patient ||
        "",

      doctor:
        appointment.doctor?.id ||
        appointment.doctor ||
        "",

      appointment_date: appointment.appointment_date || "",

      appointment_time:
        appointment.appointment_time?.slice(0, 5) || "",

      reason: appointment.reason || "",

      status: appointment.status || "Pending",
    });

    setShowForm(true);
    setMessage("");
  };

  // ================================
  // DELETE APPOINTMENT
  // ================================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    API.delete(`appointments/${id}/`)
      .then(() => {
        setMessage("Appointment deleted successfully");
        fetchAppointments();
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
        setMessage("Failed to delete appointment");
      });
  };

  // ================================
  // RESET FORM
  // ================================
  const resetForm = () => {
    setFormData({
      patient: "",
      doctor: "",
      appointment_date: "",
      appointment_time: "",
      reason: "",
      status: "Pending",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ================================
  // GET PATIENT NAME
  // ================================
  const getPatientName = (patientId) => {
    if (typeof patientId === "object" && patientId !== null) {
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
    if (typeof doctorId === "object" && doctorId !== null) {
      return `${doctorId.first_name || ""} ${
        doctorId.last_name || ""
      }`.trim();
    }

    const doctor = doctors.find(
      (item) => item.id === Number(doctorId)
    );

    if (doctor) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }

    return doctorId || "Unknown";
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

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* ================================
          HEADER
      ================================= */}
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
            📅 Appointments
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Manage hospital appointments
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
            : "➕ Add Appointment"}
        </button>
      </div>

      {/* ================================
          MESSAGE
      ================================= */}
      {message && (
        <div
          style={{
            backgroundColor: message.includes("success")
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

      {/* ================================
          FORM
      ================================= */}
      {showForm && (
        <div style={formContainerStyle}>
          <h2
            style={{
              marginTop: 0,
              color: "#1e293b",
            }}
          >
            {editingId
              ? "Edit Appointment"
              : "Add New Appointment"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* PATIENT */}
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              style={inputStyle}
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
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">
                Select Doctor
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

            {/* DATE */}
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* TIME */}
            <input
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* REASON */}
            <textarea
              name="reason"
              placeholder="Reason for appointment"
              value={formData.reason}
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "100px",
                resize: "vertical",
              }}
            />

            {/* STATUS */}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <button
              type="submit"
              style={saveButtonStyle}
            >
              {editingId
                ? "Update Appointment"
                : "Save Appointment"}
            </button>
          </form>
        </div>
      )}

      {/* ================================
          APPOINTMENTS TABLE
      ================================= */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          Appointment List
        </h2>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p
            style={{
              color: "#64748b",
              padding: "20px 0",
            }}
          >
            No appointments found.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1000px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td style={tdStyle}>
                    {appointment.id}
                  </td>

                  <td style={tdStyle}>
                    {getPatientName(
                      appointment.patient
                    )}
                  </td>

                  <td style={tdStyle}>
                    {getDoctorName(
                      appointment.doctor
                    )}
                  </td>

                  <td style={tdStyle}>
                    {appointment.appointment_date}
                  </td>

                  <td style={tdStyle}>
                    {appointment.appointment_time}
                  </td>

                  <td style={tdStyle}>
                    {appointment.reason}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        backgroundColor:
                          appointment.status ===
                          "Confirmed"
                            ? "#dcfce7"
                            : appointment.status ===
                              "Completed"
                            ? "#dbeafe"
                            : appointment.status ===
                              "Cancelled"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          appointment.status ===
                          "Confirmed"
                            ? "#166534"
                            : appointment.status ===
                              "Completed"
                            ? "#1d4ed8"
                            : appointment.status ===
                              "Cancelled"
                            ? "#991b1b"
                            : "#92400e",
                      }}
                    >
                      {appointment.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() =>
                        handleEdit(appointment)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() =>
                        handleDelete(
                          appointment.id
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

export default Appointments;

