
import { useEffect, useState } from "react";
import API from "../../services/api";

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    supplier: "",
    quantity: "",
    price: "",
    availability: true,
  });

  // =========================
  // FETCH INVENTORY
  // =========================
  const fetchItems = () => {
    setLoading(true);

    API.get("inventory/items/")
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Inventory API Error:", error);
        setMessage("Failed to load inventory");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // =========================
  // ADD / UPDATE
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.item_name.trim()) {
      setMessage("Please enter item name");
      return;
    }

    if (!formData.category) {
      setMessage("Please select category");
      return;
    }

    if (!formData.supplier.trim()) {
      setMessage("Please enter supplier");
      return;
    }

    if (formData.quantity === "") {
      setMessage("Please enter quantity");
      return;
    }

    if (formData.price === "") {
      setMessage("Please enter price");
      return;
    }

    if (editingId) {
      // UPDATE
      API.put(`inventory/items/${editingId}/`, formData)
        .then(() => {
          setMessage("Inventory item updated successfully");
          resetForm();
          fetchItems();
        })
        .catch((error) => {
          console.error("Error updating inventory item:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to update inventory item");
        });
    } else {
      // ADD
      API.post("inventory/items/", formData)
        .then(() => {
          setMessage("Inventory item added successfully");
          resetForm();
          fetchItems();
        })
        .catch((error) => {
          console.error("Error adding inventory item:", error);
          console.error("Server response:", error.response?.data);
          setMessage("Failed to add inventory item");
        });
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      item_name: item.item_name || "",
      category: item.category || "",
      supplier: item.supplier || "",
      quantity: item.quantity ?? "",
      price: item.price ?? "",
      availability:
        item.availability !== undefined ? item.availability : true,
    });

    setShowForm(true);
    setMessage("");
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (!confirmDelete) return;

    API.delete(`inventory/items/${id}/`)
      .then(() => {
        setMessage("Inventory item deleted successfully");
        fetchItems();
      })
      .catch((error) => {
        console.error("Error deleting inventory item:", error);
        console.error("Server response:", error.response?.data);
        setMessage("Failed to delete inventory item");
      });
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      item_name: "",
      category: "",
      supplier: "",
      quantity: "",
      price: "",
      availability: true,
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
            Inventory
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Manage hospital inventory items
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
          + Add Inventory Item
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
            {editingId ? "Edit Inventory Item" : "Add Inventory Item"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* ITEM NAME */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Item Name
            </label>

            <input
              type="text"
              name="item_name"
              placeholder="Enter item name"
              value={formData.item_name}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* CATEGORY */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              <option value="Equipment">Equipment</option>
              <option value="Surgical">Surgical</option>
              <option value="Medical Supply">Medical Supply</option>
              <option value="Other">Other</option>
            </select>

            {/* SUPPLIER */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Supplier
            </label>

            <input
              type="text"
              name="supplier"
              placeholder="Enter supplier name"
              value={formData.supplier}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* QUANTITY */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* PRICE */}
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Price
            </label>

            <input
              type="number"
              name="price"
              placeholder="Enter price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* AVAILABILITY */}
            <div
              style={{
                marginTop: "5px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />

              <label
                style={{
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Item Available
              </label>
            </div>

            {/* BUTTONS */}
            <button type="submit" style={saveButtonStyle}>
              {editingId ? "Update Item" : "Save Item"}
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
          INVENTORY TABLE
      ========================= */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#172033",
          }}
        >
          Inventory Items
        </h2>

        {loading ? (
          <p>Loading inventory...</p>
        ) : items.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No inventory items found.
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
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Availability</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.id}</td>

                  <td style={tdStyle}>
                    {item.item_name}
                  </td>

                  <td style={tdStyle}>
                    {item.category}
                  </td>

                  <td style={tdStyle}>
                    {item.supplier}
                  </td>

                  <td style={tdStyle}>
                    {item.quantity}
                  </td>

                  <td style={tdStyle}>
                    ₹{item.price}
                  </td>

                  <td style={tdStyle}>
                    {item.availability ? (
                      <span
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Available
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Not Available
                      </span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDelete(item.id)}
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

export default Inventory;

