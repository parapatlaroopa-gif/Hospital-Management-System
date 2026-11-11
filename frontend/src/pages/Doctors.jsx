
import React, { useEffect, useState } from "react";
import api from "../services/api";
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
        first_name: formData.first_name,
        last_name: formData.last_name,
        specialization: formData.specialization,
        phone: formData.phone,
        email: formData.email,
        experience: Number(formData.experience),
        room_number: formData.room_number,
      };

      // EDIT DOCTOR
      if (editingDoctor) {
        await api.put(
          `doctors/${editingDoctor.id}/`,
          doctorData
        );

        alert("Doctor updated successfully!");
      }

      // ADD DOCTOR
      else {
        await api.post("doctors/", doctorData);

        alert("Doctor added successfully!");
      }

      resetForm();
      getDoctors();

    } catch (error) {
      console.error("Error saving doctor:", error);

      if (error.response) {
        console.log("Django error:", error.response.data);
        alert("Failed to save doctor. Check console for details.");
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
    });

    setEditingDoctor(null);
    setShowForm(false);
  };

  return (
    <div className="doctors-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="doctors-header">

        <div>
          <h1>Doctors</h1>
          <p>Manage doctor information</p>
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
              });

              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close" : "+ Add Doctor"}
        </button>

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
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>


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

