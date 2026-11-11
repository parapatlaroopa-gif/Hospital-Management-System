import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    supplier: "",
    quantity: "",
    price: "",
    availability: true,
  });

  const fetchItems = () => {
    setLoading(true);
    API.get("inventory/items/")
      .then((response) => {
        setItems(Array.isArray(response.data) ? response.data : response.data?.results || []);
      })
      .catch((error) => {
        console.error("Inventory API Error:", error);
        setMessage("Failed to load hospital inventory supplies.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity, 10) || 0,
      price: parseFloat(formData.price) || 0,
    };

    const req = editingId
      ? API.put(`inventory/items/${editingId}/`, payload)
      : API.post("inventory/items/", payload);

    req
      .then(() => {
        setMessage(editingId ? "Inventory item updated successfully!" : "Inventory supply registered successfully!");
        resetForm();
        fetchItems();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error saving inventory item:", error);
        setMessage("Failed to save inventory item.");
      });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      item_name: item.item_name || "",
      category: item.category || "",
      supplier: item.supplier || "",
      quantity: item.quantity || "",
      price: item.price || "",
      availability: item.availability !== false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this item from inventory?")) return;

    API.delete(`inventory/items/${id}/`)
      .then(() => {
        setMessage("Item deleted successfully!");
        fetchItems();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        setMessage("Failed to delete inventory item.");
      });
  };

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

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const name = (item.item_name || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();
    const sup = (item.supplier || "").toLowerCase();
    return name.includes(q) || cat.includes(q) || sup.includes(q);
  });

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, it) => sum + (parseInt(it.quantity, 10) || 0), 0);
  const lowStock = items.filter((it) => (parseInt(it.quantity, 10) || 0) <= 15).length;
  const totalValuation = items.reduce(
    (sum, it) => sum + ((parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 0)),
    0
  );

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>📦 Hospital Supplies & Equipment Inventory</h1>
          <p>Track medical assets, surgical instruments, ward consumables, and vendor suppliers</p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else {
              setShowForm(true);
              setMessage("");
            }
          }}
          className={showForm ? "admin-btn-cancel" : "admin-btn-primary"}
        >
          {showForm ? "✕ Cancel" : "＋ Register Supply Item"}
        </button>
      </header>

      {/* CLINICAL TELEMETRY STATUS BAR */}
      <div className="ds-telemetry-strip" style={{ marginBottom: "24px" }}>
        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon ward">📦</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">SUPPLY CATALOG</span>
            <span className="ds-telemetry-value">{totalItems} Registered SKUs</span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon pharmacy">🔢</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">WAREHOUSE UNITS</span>
            <span className="ds-telemetry-value highlight">
              {totalUnits} Units In Central Store
            </span>
          </div>
        </div>

        <div className="ds-telemetry-divider"></div>

        <div className="ds-telemetry-item">
          <div className="ds-telemetry-icon rx">💎</div>
          <div className="ds-telemetry-text">
            <span className="ds-telemetry-label">TOTAL ASSET VALUATION</span>
            <span className="ds-telemetry-value highlight">
              ₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* ALERT MESSAGE */}
      {message && (
        <div className={`admin-alert ${message.includes("successfully") ? "admin-alert-success" : "admin-alert-error"}`}>
          <span>{message.includes("successfully") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* 4 STATS METRIC SUMMARY */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total SKUs</span>
            <div className="admin-stat-value">{totalItems}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🔢</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">In-Stock Units</span>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>{totalUnits}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💵</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Asset Valuation</span>
            <div className="admin-stat-value" style={{ color: "#16a34a" }}>
              ₹{totalValuation >= 100000 ? `${(totalValuation / 100000).toFixed(1)}L` : totalValuation.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⚠️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Low Stock Alerts</span>
            <div className="admin-stat-value" style={{ color: lowStock > 0 ? "#dc2626" : "#0284c7" }}>
              {lowStock}
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "✏️ Edit Inventory Record" : "📦 Add Supply or Equipment to Inventory"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Item / Asset Name *</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Surgical Gloves Box (100ct), ECG Electrodes"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Supply Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., PPE, Surgical, Diagnostic, Sanitation"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Vendor / Supplier Name</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="e.g., MedTech Global, Cardinal Health"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="50"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Unit Cost (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="24.99"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group" style={{ justifyContent: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "18px" }}>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleChange}
                    style={{ width: "18px", height: "18px", accentColor: "#0284c7" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Available For Order</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="admin-btn-primary">
                {editingId ? "💾 Save Changes" : "＋ Register Supply Item"}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="admin-search-wrapper">
        <span style={{ fontSize: "18px" }}>🔍</span>
        <input
          type="text"
          placeholder="Search inventory by item name, classification category, or vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>📦</div>
            <p style={{ margin: 0 }}>Loading inventory records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>📦</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Inventory Supplies Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {search ? "No item matches your search filter." : "Click '+ Register Supply Item' above to track stock."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item / Supply Name</th>
                <th>Category</th>
                <th>Vendor / Supplier</th>
                <th>Current Units</th>
                <th>Unit Cost</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="admin-badge admin-badge-info">#{item.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>{item.item_name}</strong>
                  </td>
                  <td>{item.category || "General"}</td>
                  <td>{item.supplier || "—"}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        item.quantity <= 10 ? "admin-badge-danger" : "admin-badge-success"
                      }`}
                    >
                      {item.quantity} In Stock {item.quantity <= 10 ? "(Critical)" : ""}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#0284c7" }}>₹{parseFloat(item.price || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        item.availability ? "admin-badge-success" : "admin-badge-danger"
                      }`}
                    >
                      {item.availability ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(item)} className="admin-action-btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="admin-action-btn-delete">
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

export default Inventory;
