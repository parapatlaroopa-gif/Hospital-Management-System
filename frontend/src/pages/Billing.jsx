
import { useEffect, useState } from "react";
import API from "../services/api";

function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    bill_number: "",
    consultation_fee: "",
    medicine_fee: "",
    lab_fee: "",
    total_amount: "0.00",
    payment_status: "Pending",
  });

  // ========================================
  // FETCH BILLS
  // ========================================
  const fetchBills = () => {
    setLoading(true);

    API.get("billing/")
      .then((response) => {
        setBills(response.data);
      })
      .catch((error) => {
        console.error("Billing API Error:", error);
        setMessage("Failed to load bills");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ========================================
  // FETCH PATIENTS
  // ========================================
  const fetchPatients = () => {
    API.get("patients/")
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error("Patient API Error:", error);
      });
  };

  // ========================================
  // LOAD DATA
  // ========================================
  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  // ========================================
  // CALCULATE TOTAL
  // ========================================
  const calculateTotal = (
    consultation,
    medicine,
    lab
  ) => {
    const consultationAmount =
      parseFloat(consultation) || 0;

    const medicineAmount =
      parseFloat(medicine) || 0;

    const labAmount =
      parseFloat(lab) || 0;

    return (
      consultationAmount +
      medicineAmount +
      labAmount
    ).toFixed(2);
  };

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    // Automatically calculate total
    if (
      name === "consultation_fee" ||
      name === "medicine_fee" ||
      name === "lab_fee"
    ) {
      updatedData.total_amount =
        calculateTotal(
          name === "consultation_fee"
            ? value
            : formData.consultation_fee,

          name === "medicine_fee"
            ? value
            : formData.medicine_fee,

          name === "lab_fee"
            ? value
            : formData.lab_fee
        );
    }

    setFormData(updatedData);
  };

  // ========================================
  // ADD / UPDATE BILL
  // ========================================
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    // Required fields
    if (
      !formData.patient ||
      !formData.bill_number ||
      !formData.consultation_fee
    ) {
      setMessage(
        "Please fill Patient, Bill Number and Consultation Fee"
      );
      return;
    }

    const dataToSend = {
      patient: Number(formData.patient),

      bill_number: formData.bill_number,

      consultation_fee:
        parseFloat(formData.consultation_fee) || 0,

      medicine_fee:
        parseFloat(formData.medicine_fee) || 0,

      lab_fee:
        parseFloat(formData.lab_fee) || 0,

      total_amount:
        parseFloat(formData.total_amount) || 0,

      payment_status:
        formData.payment_status,
    };

    // ========================================
    // UPDATE BILL
    // ========================================
    if (editingId) {
      API.put(
        `billing/${editingId}/`,
        dataToSend
      )
        .then(() => {
          setMessage(
            "Bill updated successfully"
          );

          resetForm();
          fetchBills();
        })
        .catch((error) => {
          console.error(
            "Error updating bill:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to update bill"
          );
        });
    }

    // ========================================
    // ADD BILL
    // ========================================
    else {
      API.post("billing/", dataToSend)
        .then(() => {
          setMessage(
            "Bill added successfully"
          );

          resetForm();
          fetchBills();
        })
        .catch((error) => {
          console.error(
            "Error adding bill:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to add bill"
          );
        });
    }
  };

  // ========================================
  // EDIT BILL
  // ========================================
  const handleEdit = (bill) => {
    setEditingId(bill.id);

    setFormData({
      patient:
        bill.patient?.id ||
        bill.patient ||
        "",

      bill_number:
        bill.bill_number || "",

      consultation_fee:
        bill.consultation_fee || "",

      medicine_fee:
        bill.medicine_fee || "",

      lab_fee:
        bill.lab_fee || "",

      total_amount:
        bill.total_amount || "0.00",

      payment_status:
        bill.payment_status || "Pending",
    });

    setShowForm(true);
    setMessage("");
  };

  // ========================================
  // DELETE BILL
  // ========================================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmDelete) {
      return;
    }

    API.delete(`billing/${id}/`)
      .then(() => {
        setMessage(
          "Bill deleted successfully"
        );

        fetchBills();
      })
      .catch((error) => {
        console.error(
          "Error deleting bill:",
          error
        );

        console.error(
          "Server response:",
          error.response?.data
        );

        setMessage(
          "Failed to delete bill"
        );
      });
  };

  // ========================================
  // RESET FORM
  // ========================================
  const resetForm = () => {
    setFormData({
      patient: "",
      bill_number: "",
      consultation_fee: "",
      medicine_fee: "",
      lab_fee: "",
      total_amount: "0.00",
      payment_status: "Pending",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ========================================
  // GET PATIENT NAME
  // ========================================
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

  // ========================================
  // STYLES
  // ========================================
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)",
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)",
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
    whiteSpace: "nowrap",
  };

  // ========================================
  // UI
  // ========================================
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
            💳 Billing
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Manage hospital patient bills
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
            : "➕ Add Bill"}
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            backgroundColor:
              message.includes("success")
                ? "#dcfce7"
                : "#fee2e2",

            color:
              message.includes("success")
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
              ? "Edit Bill"
              : "Add New Bill"}
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

            {/* BILL NUMBER */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Bill Number
            </label>

            <input
              type="text"
              name="bill_number"
              placeholder="Enter Bill Number"
              value={formData.bill_number}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            {/* CONSULTATION FEE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Consultation Fee
            </label>

            <input
              type="number"
              name="consultation_fee"
              placeholder="Enter Consultation Fee"
              value={formData.consultation_fee}
              onChange={handleChange}
              style={inputStyle}
              min="0"
              step="0.01"
              required
            />

            {/* MEDICINE FEE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Medicine Fee
            </label>

            <input
              type="number"
              name="medicine_fee"
              placeholder="Enter Medicine Fee"
              value={formData.medicine_fee}
              onChange={handleChange}
              style={inputStyle}
              min="0"
              step="0.01"
            />

            {/* LAB FEE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Lab Fee
            </label>

            <input
              type="number"
              name="lab_fee"
              placeholder="Enter Lab Fee"
              value={formData.lab_fee}
              onChange={handleChange}
              style={inputStyle}
              min="0"
              step="0.01"
            />

            {/* TOTAL AMOUNT */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Total Amount
            </label>

            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              style={{
                ...inputStyle,
                backgroundColor: "#f1f5f9",
                fontWeight: "700",
                color: "#1e293b",
              }}
              readOnly
            />

            {/* PAYMENT STATUS */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Payment Status
            </label>

            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              style={saveButtonStyle}
            >
              {editingId
                ? "Update Bill"
                : "Save Bill"}
            </button>
          </form>
        </div>
      )}

      {/* BILL TABLE */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          Bill List
        </h2>

        {loading ? (
          <p>Loading bills...</p>
        ) : bills.length === 0 ? (
          <p
            style={{
              color: "#64748b",
              padding: "20px 0",
            }}
          >
            No bills found.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1200px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Bill Number</th>
                <th style={thStyle}>
                  Consultation Fee
                </th>
                <th style={thStyle}>
                  Medicine Fee
                </th>
                <th style={thStyle}>
                  Lab Fee
                </th>
                <th style={thStyle}>
                  Total Amount
                </th>
                <th style={thStyle}>
                  Payment Status
                </th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  {/* ID */}
                  <td style={tdStyle}>
                    {bill.id}
                  </td>

                  {/* PATIENT */}
                  <td style={tdStyle}>
                    {getPatientName(
                      bill.patient
                    )}
                  </td>

                  {/* BILL NUMBER */}
                  <td style={tdStyle}>
                    {bill.bill_number}
                  </td>

                  {/* CONSULTATION */}
                  <td style={tdStyle}>
                    ₹{bill.consultation_fee}
                  </td>

                  {/* MEDICINE */}
                  <td style={tdStyle}>
                    ₹{bill.medicine_fee}
                  </td>

                  {/* LAB */}
                  <td style={tdStyle}>
                    ₹{bill.lab_fee}
                  </td>

                  {/* TOTAL */}
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: "700",
                    }}
                  >
                    ₹{bill.total_amount}
                  </td>

                  {/* PAYMENT STATUS */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",

                        backgroundColor:
                          bill.payment_status ===
                          "Paid"
                            ? "#dcfce7"
                            : bill.payment_status ===
                              "Cancelled"
                            ? "#fee2e2"
                            : "#fef3c7",

                        color:
                          bill.payment_status ===
                          "Paid"
                            ? "#166534"
                            : bill.payment_status ===
                              "Cancelled"
                            ? "#991b1b"
                            : "#92400e",
                      }}
                    >
                      {bill.payment_status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() =>
                        handleEdit(bill)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() =>
                        handleDelete(bill.id)
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

export default Billing;

