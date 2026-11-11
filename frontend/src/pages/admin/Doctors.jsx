
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Doctors.css";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    specialization: "",
    phone: "",
    email: "",
    experience: "",
    room_number: "",
    password: "",
  });

  // =========================
  // GET DOCTORS
  // =========================
  const getDoctors = async () => {
    try {
      const response = await api.get("doctors/");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD / EDIT DOCTOR
  // =========================
  const saveDoctor = async (e) => {
    e.preventDefault();

    try {
      const doctorData = {
        first_name: (formData.first_name || "").trim(),
        last_name: (formData.last_name || "").trim(),
        specialization: (formData.specialization || "General Physician").trim(),
        phone: (formData.phone || "").trim(),
        email: (formData.email || "").trim().toLowerCase(),
        experience: parseInt(formData.experience, 10) || 1,
        room_number: (formData.room_number || "").trim(),
      };

      // EDIT DOCTOR
      if (editingDoctor) {
        await api.put(
          `doctors/${editingDoctor.id}/`,
          doctorData
        );

        alert("Doctor updated successfully!");
      }

      // ADD DOCTOR + LOGIN ACCOUNT
      else {
        if (!formData.password || formData.password.length < 6) {
          alert("Set a password of at least 6 characters for the doctor login.");
          return;
        }
        await api.post("accounts/recruit-staff/", {
          first_name: (formData.first_name || "").trim(),
          last_name: (formData.last_name || "").trim(),
          email: (formData.email || "").trim().toLowerCase(),
          password: formData.password,
          role: "DOCTOR",
          phone: (formData.phone || "").trim(),
          specialization: (formData.specialization || "General Physician").trim(),
          experience: parseInt(formData.experience, 10) || 1,
          room_number: (formData.room_number || "").trim(),
        });
        alert("Doctor and login account created successfully!");
      }

      resetForm();
      getDoctors();

    } catch (error) {
      console.error("Error saving doctor:", error);

      if (error.response) {
        console.log("Django error:", error.response.data);
        const data = error.response.data;
        let msg = "Failed to save doctor.";
        if (typeof data === "object" && data !== null) {
          if (data.email) msg = Array.isArray(data.email) ? data.email[0] : data.email;
          else if (data.password) msg = Array.isArray(data.password) ? data.password[0] : data.password;
          else if (data.phone) msg = Array.isArray(data.phone) ? data.phone[0] : data.phone;
          else if (data.error) msg = data.error;
          else if (data.detail) msg = data.detail;
          else msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
        }
        alert(`Error: ${msg}`);
      } else {
        alert("Cannot connect to Django server.");
      }
    }
  };

  // =========================
  // EDIT DOCTOR
  // =========================
  const editDoctor = (doctor) => {
    setEditingDoctor(doctor);

    setFormData({
      first_name: doctor.first_name || "",
      last_name: doctor.last_name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      experience: doctor.experience ?? "",
      room_number: doctor.room_number || "",
      password: "",
    });

    setShowForm(true);
  };

  // =========================
  // DELETE DOCTOR
  // =========================
  const deleteDoctor = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`doctors/${id}/`);

      alert("Doctor deleted successfully!");

      getDoctors();

    } catch (error) {
      console.error("Error deleting doctor:", error);

      if (error.response) {
        console.log("Django error:", error.response.data);
        alert("Failed to delete doctor.");
      } else {
        alert("Cannot connect to Django server.");
      }
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      specialization: "",
      phone: "",
      email: "",
      experience: "",
      room_number: "",
      password: "",
    });

    setEditingDoctor(null);
    setShowForm(false);
  };

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean)));
  const totalExp = doctors.reduce((sum, d) => sum + (parseInt(d.experience, 10) || 0), 0);
  const avgExp = doctors.length ? (totalExp / doctors.length).toFixed(1) : "0.0";
  const totalRooms = Array.from(new Set(doctors.map((d) => d.room_number).filter(Boolean))).length;

  return (
    <div className="doctors-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="doctors-header">

        <div>
          <h1>Specialist Physicians & Doctors</h1>
          <p>Manage clinical specialists, consultation rooms, and practitioner credentials</p>
        </div>

        <button
          className="add-doctor-btn"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditingDoctor(null);

              setFormData({
                first_name: "",
                last_name: "",
                specialization: "",
                phone: "",
                email: "",
                experience: "",
                room_number: "",
                password: "",
              });

              setShowForm(true);
            }
          }}
        >
          {showForm ? "✕ Close Form" : "＋ Register Doctor"}
        </button>

      </div>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">👨‍⚕️</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">CLINICAL CADRE</span>
            <span className="ds-telemetry-value">{doctors.length} Physicians On Duty</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">🏥</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">SPECIALTIES</span>
            <span className="ds-telemetry-value highlight">
              {specializations.length} Medical Wings
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">⭐</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">AVERAGE EXPERIENCE</span>
            <span className="ds-telemetry-value highlight">
              {avgExp} Yrs Seniority
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

      {/* 4 STATS METRIC SUMMARY */}
      <div className="admin-stats-grid">
        <div className="doctor-stat-card" style={{ background: "#ffffff", padding: "18px 22px", borderRadius: "16px", border: "1.5px solid rgba(186, 230, 253, 0.8)", boxShadow: "0 4px 14px rgba(148, 163, 184, 0.08)" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Total Specialists</span>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{doctors.length}</div>
        </div>

        <div className="doctor-stat-card" style={{ background: "#ffffff", padding: "18px 22px", borderRadius: "16px", border: "1.5px solid rgba(186, 230, 253, 0.8)", boxShadow: "0 4px 14px rgba(148, 163, 184, 0.08)" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Specialty Departments</span>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>{specializations.length}</div>
        </div>

        <div className="doctor-stat-card" style={{ background: "#ffffff", padding: "18px 22px", borderRadius: "16px", border: "1.5px solid rgba(186, 230, 253, 0.8)", boxShadow: "0 4px 14px rgba(148, 163, 184, 0.08)" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Average Seniority</span>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>{avgExp} yrs</div>
        </div>

        <div className="doctor-stat-card" style={{ background: "#ffffff", padding: "18px 22px", borderRadius: "16px", border: "1.5px solid rgba(186, 230, 253, 0.8)", boxShadow: "0 4px 14px rgba(148, 163, 184, 0.08)" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Consultation Rooms</span>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>{totalRooms || doctors.length}</div>
        </div>
      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (

        <div className="doctor-form">

          <h2>
            {editingDoctor ? "Edit Doctor" : "Add Doctor"}
          </h2>

          <form onSubmit={saveDoctor}>

            {/* FIRST ROW */}

            <div className="doctor-form-row">

              <div>
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>


              <div>
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>


              <div>
                <label>Specialization</label>

                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Enter specialization"
                  required
                />
              </div>

            </div>


            {/* SECOND ROW */}

            <div className="doctor-form-row">

              <div>
                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>


              <div>
                <label>Email / Login</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Doctor login email"
                  required
                />
              </div>

              {!editingDoctor && (
                <div>
                  <label>Login Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              )}

              <div>
                <label>Experience (Years)</label>

                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter years"
                  min="0"
                  required
                />
              </div>

            </div>


            {/* THIRD ROW */}

            <div className="doctor-form-row">

              <div>
                <label>Room Number</label>

                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="Enter room number"
                  required
                />
              </div>

            </div>


            {/* FORM BUTTONS */}

            <div className="doctor-form-actions">

              <button
                type="submit"
                className="save-doctor-btn"
              >
                {editingDoctor
                  ? "Update Doctor"
                  : "Save Doctor"}
              </button>


              <button
                type="button"
                className="cancel-doctor-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =========================
          DOCTOR LIST
      ========================= */}

      <div className="doctors-card">

        <div className="doctor-card-header">

          <div>
            <h2>Doctor List</h2>

            <p>
              Total Doctors: {doctors.length}
            </p>
          </div>

        </div>


        <div className="doctor-table-container">

          <table>

            <thead>

              <tr>

                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Specialization</th>
                <th>Room</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {doctors.length > 0 ? (

                doctors.map((doctor) => (

                  <tr key={doctor.id}>

                    <td>
                      {doctor.id}
                    </td>

                    <td>
                      {doctor.first_name}
                    </td>

                    <td>
                      {doctor.last_name}
                    </td>

                    <td>
                      {doctor.specialization}
                    </td>

                    <td>
                      {doctor.room_number || "Not assigned"}
                    </td>

                    <td>
                      {doctor.phone}
                    </td>

                    <td>
                      {doctor.email}
                    </td>

                    <td>
                      {doctor.experience} years
                    </td>


                    {/* ACTION BUTTONS */}

                    <td className="doctor-actions">

                      <button
                        className="edit-doctor-btn"
                        onClick={() => editDoctor(doctor)}
                      >
                        Edit
                      </button>


                      <button
                        className="delete-doctor-btn"
                        onClick={() => deleteDoctor(doctor.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="9">
                    No doctors found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Doctors;

