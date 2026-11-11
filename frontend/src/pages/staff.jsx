
import { useEffect, useState } from "react";
import API from "../services/api";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "",
    phone: "",
    email: "",
    salary: "",
    joining_date: "",
  });

  // =========================
  // FETCH STAFF
  // =========================
  const fetchStaff = () => {
    setLoading(true);

    API.get("staff/")
      .then((response) => {
        setStaff(response.data);
      })
      .catch((error) => {
        console.error("Staff API Error:", error);
        setMessage("Failed to load staff");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStaff();
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
  // ADD / UPDATE STAFF
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.first_name.trim()) {
      setMessage("Please enter first name");
      return;
    }

    if (!formData.last_name.trim()) {
      setMessage("Please enter last name");
      return;
    }

    if (!formData.role) {
      setMessage("Please select role");
      return;
    }

    if (!formData.phone.trim()) {
      setMessage("Please enter phone number");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Please enter email");
      return;
    }

    if (formData.salary === "") {
      setMessage("Please enter salary");
      return;
    }

    if (!formData.joining_date) {
      setMessage("Please select joining date");
      return;
    }

    if (editingId) {
      // UPDATE
      API.put(`staff/${editingId}/`, formData)
        .then(() => {
          setMessage("Staff member updated successfully");
          resetForm();
          fetchStaff();
        })
        .catch((error) => {
          console.error("Error updating staff:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to update staff member");
        });
    } else {
      // ADD
      API.post("staff/", formData)
        .then(() => {
          setMessage("Staff member added successfully");
          resetForm();
          fetchStaff();
        })
        .catch((error) => {
          console.error("Error adding staff:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to add staff member");
        });
    }
  };

  // =========================
  // EDIT STAFF
  // =========================
  const handleEdit = (member) => {
    setEditingId(member.id);

    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      salary: member.salary ?? "",
      joining_date: member.joining_date || "",
    });

    setShowForm(true);
    setMessage("");
  };

  // =========================
  // DELETE STAFF
  // =========================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmDelete) return;

    API.delete(`staff/${id}/`)
      .then(() => {
        setMessage("Staff member deleted successfully");
        fetchStaff();
      })
      .catch((error) => {
        console.error("Error deleting staff:", error);
        console.error("Server response:", error.response?.data);
        setMessage("Failed to delete staff member");
      });
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      role: "",
      phone: "",
      email: "",
      salary: "",
      joining_date: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // STYLES
  // =========================
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
    display: "inline-block",
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

  const cancelButtonStyle = {
    backgroundColor: "#64748b",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    marginLeft: "10px",
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
    <div style={{ padding: "25px" }}>
      {/* =========================
          PAGE HEADER
      ========================= */}
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
              color: "#172033",
              fontSize: "28px",
            }}
          >
            Staff
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Manage hospital staff members
          </p>
        </div>

        <button
          style={addButtonStyle}
          onClick={() => {
            resetForm();
            setShowForm(true);
            setMessage("");
          }}
        >
          + Add Staff
        </button>
      </div>

      {/* =========================
          MESSAGE
      ========================= */}
      {message && (
        <div
          style={{
            backgroundColor: "#f1f5f9",
            color: "#334155",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}

      {/* =========================
          ADD / EDIT FORM
      ========================= */}
      {showForm && (
        <div style={formContainerStyle}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#172033",
            }}
          >
            {editingId ? "Edit Staff" : "Add Staff"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* FIRST NAME */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              First Name
            </label>

            <input
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* LAST NAME */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Last Name
            </label>

            <input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* ROLE */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Other">Other</option>
            </select>

            {/* PHONE */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Phone
            </label>

            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* EMAIL */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* SALARY */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Salary
            </label>

            <input
              type="number"
              name="salary"
              placeholder="Enter salary"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* JOINING DATE */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Joining Date
            </label>

            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* BUTTONS */}
            <button type="submit" style={saveButtonStyle}>
              {editingId ? "Update Staff" : "Save Staff"}
            </button>

            <button
              type="button"
              style={cancelButtonStyle}
              onClick={resetForm}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* =========================
          STAFF TABLE
      ========================= */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#172033",
          }}
        >
          Staff Members
        </h2>

        {loading ? (
          <p>Loading staff...</p>
        ) : staff.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No staff members found.
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
                <th style={thStyle}>First Name</th>
                <th style={thStyle}>Last Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Salary</th>
                <th style={thStyle}>Joining Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td style={tdStyle}>{member.id}</td>

                  <td style={tdStyle}>
                    {member.first_name}
                  </td>

                  <td style={tdStyle}>
                    {member.last_name}
                  </td>

                  <td style={tdStyle}>
                    {member.role}
                  </td>

                  <td style={tdStyle}>
                    {member.phone}
                  </td>

                  <td style={tdStyle}>
                    {member.email}
                  </td>

                  <td style={tdStyle}>
                    ₹{member.salary}
                  </td>

                  <td style={tdStyle}>
                    {member.joining_date}
                  </td>

                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() => handleEdit(member)}
                    >
                      Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDelete(member.id)}
                    >
                      Delete
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

export default Staff;

