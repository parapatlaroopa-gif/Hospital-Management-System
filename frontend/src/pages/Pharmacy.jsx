
import { useEffect, useState } from "react";
import API from "../services/api";

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    quantity: "",
    price: "",
    expiry_date: "",
  });

  // =========================
  // FETCH MEDICINES
  // =========================
  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const response = await API.get("pharmacy/medicines/");

      if (Array.isArray(response.data)) {
        setMedicines(response.data);
      } else if (response.data.results) {
        setMedicines(response.data.results);
      } else {
        setMedicines([]);
      }
    } catch (error) {
      console.error("Pharmacy API Error:", error);
      setMessage("Failed to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // RESET FORM
  // =========================
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

  // =========================
  // ADD / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await API.put(
          `pharmacy/medicines/${editingId}/`,
          formData
        );

        setMessage("Medicine updated successfully!");
      } else {
        await API.post(
          "pharmacy/medicines/",
          formData
        );

        setMessage("Medicine added successfully!");
      }

      resetForm();
      fetchMedicines();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Medicine error:", error);
      console.error(
        "Backend response:",
        error.response?.data
      );

      if (editingId) {
        setMessage("Failed to update medicine.");
      } else {
        setMessage("Failed to add medicine.");
      }
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (medicine) => {
    setEditingId(medicine.id);

    setFormData({
      name: medicine.name || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      quantity: medicine.quantity || "",
      price: medicine.price || "",
      expiry_date: medicine.expiry_date || "",
    });

    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(
        `pharmacy/medicines/${id}/`
      );

      setMessage("Medicine deleted successfully!");

      fetchMedicines();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete error:", error);
      console.error(
        "Backend response:",
        error.response?.data
      );

      setMessage("Failed to delete medicine.");
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* =========================
          HEADER
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
              margin: "0",
              color: "#1e293b",
              fontSize: "28px",
            }}
          >
            💊 Pharmacy
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Manage medicines and pharmacy information
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
          {showForm ? "✕ Cancel" : "+ Add Medicine"}
        </button>
      </div>

      {/* =========================
          MESSAGE
      ========================= */}
      {message && (
        <div
          style={{
            padding: "12px 15px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: message.includes(
              "successfully"
            )
              ? "#dcfce7"
              : "#fee2e2",
            color: message.includes(
              "successfully"
            )
              ? "#166534"
              : "#991b1b",
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
              marginTop: "0",
              color: "#1e293b",
            }}
          >
            {editingId
              ? "Edit Medicine"
              : "Add New Medicine"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              {/* Medicine Name */}
              <div>
                <label style={labelStyle}>
                  Medicine Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Medicine Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  <option value="Tablet">
                    Tablet
                  </option>

                  <option value="Syrup">
                    Syrup
                  </option>

                  <option value="Injection">
                    Injection
                  </option>

                  <option value="Capsule">
                    Capsule
                  </option>
                </select>
              </div>

              {/* Manufacturer */}
              <div>
                <label style={labelStyle}>
                  Manufacturer
                </label>

                <input
                  type="text"
                  name="manufacturer"
                  placeholder="Manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label style={labelStyle}>
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  style={inputStyle}
                  min="0"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label style={labelStyle}>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  style={inputStyle}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label style={labelStyle}>
                  Expiry Date
                </label>

                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                style={saveButtonStyle}
              >
                {editingId
                  ? "Update Medicine"
                  : "Save Medicine"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={cancelButtonStyle}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* =========================
          MEDICINE LIST
      ========================= */}
      <div style={tableContainerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                marginTop: "0",
                color: "#1e293b",
              }}
            >
              Medicine List
            </h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: "0",
              }}
            >
              <strong>
                Total Medicines: {medicines.length}
              </strong>
            </p>
          </div>

          <button
            onClick={fetchMedicines}
            style={refreshButtonStyle}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading medicines...
          </p>
        )}

        {/* Empty */}
        {!loading && medicines.length === 0 && (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No medicines found.
          </p>
        )}

        {/* Table */}
        {!loading && medicines.length > 0 && (
          <div
            style={{
              overflowX: "auto",
              marginTop: "20px",
            }}
          >
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

                  <th style={thStyle}>
                    Medicine Name
                  </th>

                  <th style={thStyle}>
                    Category
                  </th>

                  <th style={thStyle}>
                    Manufacturer
                  </th>

                  <th style={thStyle}>
                    Quantity
                  </th>

                  <th style={thStyle}>
                    Price
                  </th>

                  <th style={thStyle}>
                    Expiry Date
                  </th>

                  <th style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td style={tdStyle}>
                      {medicine.id}
                    </td>

                    <td style={tdStyle}>
                      {medicine.name}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "15px",
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {medicine.category}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {medicine.manufacturer}
                    </td>

                    <td style={tdStyle}>
                      {medicine.quantity}
                    </td>

                    <td style={tdStyle}>
                      ₹{medicine.price}
                    </td>

                    <td style={tdStyle}>
                      {medicine.expiry_date}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleEdit(medicine)
                          }
                          style={editButtonStyle}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(medicine.id)
                          }
                          style={deleteButtonStyle}
                        >
                          🗑️ Delete
                        </button>
                      </div>
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

/* =========================
   STYLES
========================= */

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

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const saveButtonStyle = {
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
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
};

const refreshButtonStyle = {
  backgroundColor: "#f1f5f9",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "9px 15px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
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
  whiteSpace: "nowrap",
};

const editButtonStyle = {
  backgroundColor: "#f59e0b",
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const deleteButtonStyle = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

export default Pharmacy;

