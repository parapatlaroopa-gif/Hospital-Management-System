
import { useEffect, useState } from "react";
import API from "../services/api";

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    patient: "",
    test_name: "",
    test_result: "",
    test_date: "",
    status: "Pending",
  });

  // ========================================
  // FETCH LABORATORY TESTS
  // ========================================
  const fetchTests = () => {
    setLoading(true);

    API.get("laboratory/tests/")
      .then((response) => {
        setTests(response.data);
      })
      .catch((error) => {
        console.error(
          "Laboratory API Error:",
          error
        );

        setMessage(
          "Failed to load laboratory tests"
        );
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
        console.error(
          "Patient API Error:",
          error
        );
      });
  };

  // ========================================
  // LOAD DATA
  // ========================================
  useEffect(() => {
    fetchTests();
    fetchPatients();
  }, []);

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ========================================
  // ADD / UPDATE TEST
  // ========================================
  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");

    // Required fields
    if (
      !formData.patient ||
      !formData.test_name ||
      !formData.test_date
    ) {
      setMessage(
        "Please fill Patient, Test Name and Test Date"
      );

      return;
    }

    const dataToSend = {
      patient: Number(formData.patient),

      test_name: formData.test_name,

      test_result: formData.test_result,

      test_date: formData.test_date,

      status: formData.status,
    };

    // ========================================
    // UPDATE TEST
    // ========================================
    if (editingId) {
      API.put(
        `laboratory/tests/${editingId}/`,
        dataToSend
      )
        .then(() => {
          setMessage(
            "Laboratory test updated successfully"
          );

          resetForm();

          fetchTests();
        })
        .catch((error) => {
          console.error(
            "Error updating laboratory test:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to update laboratory test"
          );
        });
    }

    // ========================================
    // ADD TEST
    // ========================================
    else {
      API.post(
        "laboratory/tests/",
        dataToSend
      )
        .then(() => {
          setMessage(
            "Laboratory test added successfully"
          );

          resetForm();

          fetchTests();
        })
        .catch((error) => {
          console.error(
            "Error adding laboratory test:",
            error
          );

          console.error(
            "Server response:",
            error.response?.data
          );

          setMessage(
            "Failed to add laboratory test"
          );
        });
    }
  };

  // ========================================
  // EDIT TEST
  // ========================================
  const handleEdit = (test) => {
    setEditingId(test.id);

    setFormData({
      patient:
        test.patient?.id ||
        test.patient ||
        "",

      test_name:
        test.test_name || "",

      test_result:
        test.test_result || "",

      test_date:
        test.test_date || "",

      status:
        test.status || "Pending",
    });

    setShowForm(true);

    setMessage("");
  };

  // ========================================
  // DELETE TEST
  // ========================================
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this laboratory test?"
    );

    if (!confirmDelete) {
      return;
    }

    API.delete(
      `laboratory/tests/${id}/`
    )
      .then(() => {
        setMessage(
          "Laboratory test deleted successfully"
        );

        fetchTests();
      })
      .catch((error) => {
        console.error(
          "Error deleting laboratory test:",
          error
        );

        console.error(
          "Server response:",
          error.response?.data
        );

        setMessage(
          "Failed to delete laboratory test"
        );
      });
  };

  // ========================================
  // RESET FORM
  // ========================================
  const resetForm = () => {
    setFormData({
      patient: "",
      test_name: "",
      test_result: "",
      test_date: "",
      status: "Pending",
    });

    setEditingId(null);

    setShowForm(false);
  };

  // ========================================
  // GET PATIENT NAME
  // ========================================
  const getPatientName = (patientId) => {
    // If API returns patient as an object
    if (
      typeof patientId === "object" &&
      patientId !== null
    ) {
      return `${patientId.first_name || ""} ${
        patientId.last_name || ""
      }`.trim();
    }

    // If API returns patient ID
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
      {/* ======================================
          HEADER
      ====================================== */}
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
            🧪 Laboratory
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Manage hospital laboratory tests
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
            : "➕ Add Test"}
        </button>
      </div>

      {/* ======================================
          MESSAGE
      ====================================== */}
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

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}
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
              ? "Edit Laboratory Test"
              : "Add New Laboratory Test"}
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

            {/* TEST NAME */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Test Name
            </label>

            <input
              type="text"
              name="test_name"
              placeholder="Enter Test Name"
              value={formData.test_name}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            {/* TEST RESULT */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Test Result
            </label>

            <textarea
              name="test_result"
              placeholder="Enter Test Result"
              value={formData.test_result}
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "100px",
                resize: "vertical",
              }}
            />

            {/* TEST DATE */}
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Test Date
            </label>

            <input
              type="date"
              name="test_date"
              value={formData.test_date}
              onChange={handleChange}
              style={inputStyle}
              required
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
              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              style={saveButtonStyle}
            >
              {editingId
                ? "Update Test"
                : "Save Test"}
            </button>
          </form>
        </div>
      )}

      {/* ======================================
          TEST TABLE
      ====================================== */}
      <div style={tableContainerStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          Laboratory Test List
        </h2>

        {loading ? (
          <p>Loading laboratory tests...</p>
        ) : tests.length === 0 ? (
          <p
            style={{
              color: "#64748b",
              padding: "20px 0",
            }}
          >
            No laboratory tests found.
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

                <th style={thStyle}>
                  Patient
                </th>

                <th style={thStyle}>
                  Test Name
                </th>

                <th style={thStyle}>
                  Test Result
                </th>

                <th style={thStyle}>
                  Test Date
                </th>

                <th style={thStyle}>
                  Status
                </th>

                <th style={thStyle}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  {/* ID */}
                  <td style={tdStyle}>
                    {test.id}
                  </td>

                  {/* PATIENT */}
                  <td style={tdStyle}>
                    {getPatientName(
                      test.patient
                    )}
                  </td>

                  {/* TEST NAME */}
                  <td style={tdStyle}>
                    {test.test_name}
                  </td>

                  {/* TEST RESULT */}
                  <td style={tdStyle}>
                    {test.test_result
                      ? test.test_result
                      : "-"}
                  </td>

                  {/* TEST DATE */}
                  <td style={tdStyle}>
                    {test.test_date}
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
                          test.status ===
                          "Completed"
                            ? "#dcfce7"
                            : "#fef3c7",

                        color:
                          test.status ===
                          "Completed"
                            ? "#166534"
                            : "#92400e",
                      }}
                    >
                      {test.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() =>
                        handleEdit(test)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={deleteButtonStyle}
                      onClick={() =>
                        handleDelete(test.id)
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

export default Laboratory;

