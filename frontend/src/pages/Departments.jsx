
import { useEffect, useState } from "react";
import API from "../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_doctor: "",
    phone: "",
    location: "",
  });

  const fetchDepartments = () => {
    setLoading(true);

    API.get("departments/")
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Department API Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ADD / UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (editingId) {
      API.put(`departments/${editingId}/`, formData)
        .then(() => {
          setMessage("Department updated successfully");
          resetForm();
          fetchDepartments();
        })
        .catch((error) => {
          console.error("Error updating department:", error);
          setMessage("Failed to update department");
        });
    } else {
      API.post("departments/", formData)
        .then(() => {
          setMessage("Department added successfully");
          resetForm();
          fetchDepartments();
        })
        .catch((error) => {
          console.error("Error adding department:", error);
          setMessage("Failed to add department");
        });
    }
  };

  // EDIT
  const handleEdit = (department) => {
    setEditingId(department.id);

    setFormData({
      name: department.name || "",
      description: department.description || "",
      head_doctor: department.head_doctor || "",
      phone: department.phone || "",
      location: department.location || "",
    });

    setShowForm(true);
    setMessage("");
  };

  // DELETE
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) {
      return;
    }

    API.delete(`departments/${id}/`)
      .then(() => {
        setMessage("Department deleted successfully");
        fetchDepartments();
      })
      .catch((error) => {
        console.error("Error deleting department:", error);
        setMessage("Failed to delete department");
      });
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      head_doctor: "",
      phone: "",
      location: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

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
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: "0", color: "#1e293b" }}>
            🏢 Departments
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Manage hospital departments
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setMessage("");
            }
          }}
          style={addButtonStyle}
        >
          {showForm ? "Cancel" : "+ Add Department"}
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            padding: "12px 15px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: message.includes("successfully")
              ? "#dcfce7"
              : "#fee2e2",
            color: "#1e293b",
          }}
        >
          {message}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div style={formContainerStyle}>
          <h2 style={{ marginTop: "0", color: "#1e293b" }}>
            {editingId ? "Edit Department" : "Add New Department"}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Department Name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              style={inputStyle}
              rows="3"
            />

            <input
              type="text"
              name="head_doctor"
              placeholder="Head Doctor"
              value={formData.head_doctor}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle}
            />

            <button type="submit" style={saveButtonStyle}>
              {editingId ? "Update Department" : "Save Department"}
            </button>
          </form>
        </div>
      )}

      {/* DEPARTMENT LIST */}
      <div style={tableContainerStyle}>
        <h2 style={{ marginTop: "0", color: "#1e293b" }}>
          Department List
        </h2>

        <p style={{ color: "#64748b" }}>
          <strong>Total Departments: {departments.length}</strong>
        </p>

        {loading && <p>Loading departments...</p>}

        {!loading && departments.length === 0 && (
          <p>No departments found.</p>
        )}

        {!loading && departments.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Department Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Head Doctor</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td style={tdStyle}>{department.id}</td>

                    <td style={tdStyle}>
                      {department.name}
                    </td>

                    <td style={tdStyle}>
                      {department.description || "-"}
                    </td>

                    <td style={tdStyle}>
                      {department.head_doctor || "-"}
                    </td>

                    <td style={tdStyle}>
                      {department.phone || "-"}
                    </td>

                    <td style={tdStyle}>
                      {department.location || "-"}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => handleEdit(department)}
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(department.id)}
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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

export default Departments;

