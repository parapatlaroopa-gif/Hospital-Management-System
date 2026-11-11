import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminPages.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "DOCTOR",
    phone: "",
    specialization: "Cardiology",
    experience: 5,
    room_number: "Room 101",
    salary: 45000,
    age: 30,
    gender: "Male",
    address: "Registered Hospital Patient",
  });

  const fetchUsers = () => {
    setLoading(true);
    API.get("accounts/users/")
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : res.data?.results || []);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setMessage("Failed to load hospital user accounts.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecruitSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await API.post("accounts/recruit-staff/", formData);
      setMessage(res.data.message || `User ${formData.first_name} successfully registered as ${formData.role}!`);
      setShowRecruitModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "DOCTOR",
        phone: "",
        specialization: "Cardiology",
        experience: 5,
        room_number: "Room 101",
        salary: 45000,
        age: 30,
        gender: "Male",
        address: "Registered Hospital Patient",
      });
      fetchUsers();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("User creation error:", err);
      const data = err.response?.data;
      let errDetail = "Failed to create user account.";
      if (typeof data === "object" && data !== null) {
        if (data.email) errDetail = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.password) errDetail = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.phone) errDetail = Array.isArray(data.phone) ? data.phone[0] : data.phone;
        else if (data.error) errDetail = data.error;
        else if (data.detail) errDetail = data.detail;
      }
      setMessage(`Error: ${errDetail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (userId) => {
    API.post(`accounts/users/${userId}/toggle/`)
      .then((res) => {
        setMessage(res.data.message || "User status updated successfully.");
        fetchUsers();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((err) => {
        console.error("Toggle error:", err);
        setMessage("Failed to update user status.");
      });
  };

  const handleDeleteUser = (u) => {
    const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username;
    if (u.email === "nithinkumarreddy1538@gmail.com") {
      alert("Primary Administrator account cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete account "${name}" (${u.email}) and all associated clinical records?`)) {
      return;
    }

    API.delete(`accounts/users/${u.id}/`)
      .then(() => {
        setMessage(`User account "${name}" successfully deleted.`);
        fetchUsers();
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        const detail = err.response?.data?.[0] || err.response?.data?.error || "Failed to delete user account.";
        setMessage(`Error: ${detail}`);
      });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase());

    const role = (u.role || u.profile?.role || (u.is_superuser ? "ADMIN" : "PATIENT")).toUpperCase();
    const matchesRole = roleFilter === "ALL" || role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.is_superuser || (u.role || u.profile?.role) === "ADMIN").length;
  const totalDoctors = users.filter((u) => (u.role || u.profile?.role) === "DOCTOR").length;
  const totalNurses = users.filter((u) => (u.role || u.profile?.role) === "NURSE").length;
  const totalPatients = users.filter((u) => (u.role || u.profile?.role) === "PATIENT" && !u.is_superuser).length;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>🔐 Hospital Accounts & User Directory</h1>
          <p>Create, manage, monitor, and remove Doctors, Nurses, Patients, and Administrator accounts</p>
        </div>

        <button
          onClick={() => {
            setShowRecruitModal(true);
            setMessage("");
          }}
          className="admin-btn-primary"
        >
          ＋ Add New User / Staff
        </button>
      </header>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={`admin-alert ${message.includes("successfully") || message.includes("created") ? "admin-alert-success" : "admin-alert-error"}`}>
          <span>{message.includes("successfully") || message.includes("created") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* METRIC SUMMARY CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🛡️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Administrators</span>
            <div className="admin-stat-value">{totalAdmins}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🩺</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Doctors / Specialists</span>
            <div className="admin-stat-value">{totalDoctors}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👩‍⚕️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Nurses & Ward Staff</span>
            <div className="admin-stat-value">{totalNurses}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Registered Patients</span>
            <div className="admin-stat-value">{totalPatients}</div>
          </div>
        </div>
      </div>

      {/* ROLE FILTER TABS & SEARCH */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "ADMIN", "DOCTOR", "NURSE", "PATIENT"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: roleFilter === role ? "1.5px solid #0284c7" : "1px solid #cbd5e1",
                background: roleFilter === role ? "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" : "#ffffff",
                color: roleFilter === role ? "#0369a1" : "#475569",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {role === "ALL" ? `All Users (${users.length})` : role === "ADMIN" ? `Admins (${totalAdmins})` : role === "DOCTOR" ? `Doctors (${totalDoctors})` : role === "NURSE" ? `Nurses (${totalNurses})` : `Patients (${totalPatients})`}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <span style={{ position: "absolute", left: "12px", top: "10px", fontSize: "15px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}>👥</div>
            <p style={{ margin: 0 }}>Loading hospital user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748b" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>👥</span>
            <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>No Users Found</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              {searchTerm ? "No users match your search filter." : "Click '+ Add New User / Staff' above to register accounts."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Assigned Role</th>
                <th>Contact Details</th>
                <th>Associated Entity</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const role = (u.role || u.profile?.role || (u.is_superuser ? "ADMIN" : "PATIENT")).toUpperCase();
                const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username;
                const isPrimaryAdmin = u.email === "nithinkumarreddy1538@gmail.com";
                const phone = u.phone || u.profile?.phone || "—";
                const doctorId = u.doctor_id || u.profile?.doctor;
                const staffId = u.staff_id || u.profile?.staff;
                const patientId = u.patient_id || u.profile?.patient;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background:
                              role === "ADMIN"
                                ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
                                : role === "DOCTOR"
                                ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                                : role === "NURSE"
                                ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                                : "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                            color:
                              role === "ADMIN"
                                ? "#0284c7"
                                : role === "DOCTOR"
                                ? "#1d4ed8"
                                : role === "NURSE"
                                ? "#15803d"
                                : "#6d28d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 800,
                          }}
                        >
                          {name[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <strong style={{ color: "#0f172a", fontSize: "14px", display: "block" }}>{name}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          role === "ADMIN"
                            ? "admin-badge-info"
                            : role === "DOCTOR"
                            ? "admin-badge-success"
                            : role === "NURSE"
                            ? "admin-badge-warning"
                            : "admin-badge-info"
                        }`}
                      >
                        {role === "ADMIN" ? "🛡️ ADMIN" : role === "DOCTOR" ? "🩺 DOCTOR" : role === "NURSE" ? "👩‍⚕️ NURSE" : "👤 PATIENT"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "#334155" }}>
                        {phone}
                      </span>
                    </td>
                    <td>
                      {doctorId ? (
                        <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 600 }}>
                          Doctor Record #{doctorId}
                        </span>
                      ) : staffId ? (
                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                          Staff Record #{staffId}
                        </span>
                      ) : patientId ? (
                        <span style={{ fontSize: "12px", color: "#6d28d9", fontWeight: 600 }}>
                          Patient Record #{patientId}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#64748b" }}>System Console</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          u.is_active ? "admin-badge-success" : "admin-badge-danger"
                        }`}
                      >
                        {u.is_active ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {!isPrimaryAdmin && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className="admin-action-btn-edit"
                            style={{ marginRight: "6px" }}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="admin-action-btn-delete"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {isPrimaryAdmin && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", background: "#e0f2fe", padding: "4px 8px", borderRadius: "6px" }}>
                          Primary Admin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE NEW USER / STAFF MODAL */}
      {showRecruitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "680px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.25)",
              border: "1px solid #e0f2fe",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                  ＋ Register New Hospital Account
                </h2>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Create separate user accounts for Doctors, Nurses, Patients, or Administrators
                </span>
              </div>
              <button
                onClick={() => setShowRecruitModal(false)}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecruitSubmit}>
              <div className="admin-form-grid">
                {/* ROLE SELECTOR */}
                <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
                  <label>Select Target Hospital Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="admin-select"
                    style={{ fontWeight: 700, color: "#0284c7", fontSize: "14px" }}
                  >
                    <option value="DOCTOR">🩺 Doctor / Specialist Physician</option>
                    <option value="NURSE">👩‍⚕️ Registered Staff Nurse</option>
                    <option value="PATIENT">👤 Hospital Patient</option>
                    <option value="ADMIN">🛡️ Hospital Administrator</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Ramesh"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Kumar"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address (Username) *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. user@hospital.com"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Account Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum 6 characters"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone Contact *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 9876543210"
                    className="admin-input"
                  />
                </div>

                {/* DOCTOR SPECIFIC FIELDS */}
                {formData.role === "DOCTOR" && (
                  <>
                    <div className="admin-form-group">
                      <label>Medical Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g. Cardiology, Neurology, Pediatrics"
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Consultation Room</label>
                      <input
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleInputChange}
                        placeholder="e.g. Room 102"
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Years of Clinical Experience</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g. 5"
                        className="admin-input"
                      />
                    </div>
                  </>
                )}

                {/* NURSE / STAFF SPECIFIC FIELDS */}
                {formData.role === "NURSE" && (
                  <div className="admin-form-group">
                    <label>Monthly Salary (₹)</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. 35000"
                      className="admin-input"
                    />
                  </div>
                )}

                {/* PATIENT SPECIFIC FIELDS */}
                {formData.role === "PATIENT" && (
                  <>
                    <div className="admin-form-group">
                      <label>Patient Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g. 30"
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="admin-select"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
                      <label>Residential Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g. 123 Healthcare Ave, City"
                        className="admin-input"
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowRecruitModal(false)}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn-primary"
                >
                  {submitting ? "Registering..." : `＋ Register ${formData.role}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
