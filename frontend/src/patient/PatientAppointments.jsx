import { useEffect, useState } from "react";
import api from "../services/api";
import authService from "../services/auth";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientAppointments() {
  const currentUser = authService.getCurrentUser();
  const userRole = (authService.getRole() || currentUser?.role || "").toUpperCase();
  const isPrivilegedUser = ["ADMIN", "DOCTOR", "NURSE"].includes(userRole);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [bookingForm, setBookingForm] = useState({
    patientId: "",
    doctorId: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "10:00",
    reason: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [aptRes, docRes, patRes] = await Promise.allSettled([
        api.get("appointments/"),
        api.get("doctors/"),
        api.get("patients/"),
      ]);

      const extract = (res) => {
        if (res.status === "fulfilled" && res.value?.data) {
          if (Array.isArray(res.value.data.results)) return res.value.data.results;
          if (Array.isArray(res.value.data)) return res.value.data;
        }
        return [];
      };

      setAppointments(extract(aptRes));
      setDoctors(extract(docRes));
      setPatients(extract(patRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh user profile in background to keep patient_id synced
    api.get("accounts/me/").then((res) => {
      if (res.data) {
        const existing = authService.getCurrentUser() || {};
        localStorage.setItem("currentUser", JSON.stringify({ ...existing, ...res.data }));
      }
    }).catch(() => {});
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    try {
      let userObj = authService.getCurrentUser() || {};
      let patientId = bookingForm.patientId || userObj.patient_id;

      // If patientId is missing in localStorage cache, query /accounts/me/
      if (!patientId) {
        try {
          const meRes = await api.get("accounts/me/");
          if (meRes.data?.patient_id) {
            patientId = meRes.data.patient_id;
            userObj = { ...userObj, ...meRes.data };
            localStorage.setItem("currentUser", JSON.stringify(userObj));
          }
        } catch (meErr) {
          console.warn("Unable to fetch patient profile from /accounts/me/:", meErr);
        }
      }

      // If still missing and patients exist (e.g. Admin booking), use the first patient
      if (!patientId && patients.length > 0) {
        patientId = patients[0].id;
      }

      const payload = {
        doctor: Number(bookingForm.doctorId),
        appointment_date: bookingForm.appointment_date,
        appointment_time: bookingForm.appointment_time,
        reason: bookingForm.reason || "General checkup",
        status: "Pending",
      };

      if (patientId) {
        payload.patient = Number(patientId);
      }

      await api.post("appointments/", payload);

      setSuccessMsg("✅ Appointment booked successfully!");
      setBookModalOpen(false);
      setBookingForm({
        patientId: "",
        doctorId: "",
        appointment_date: new Date().toISOString().split("T")[0],
        appointment_time: "10:00",
        reason: "",
      });
      loadData();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      let msg = "Failed to book appointment.";
      if (typeof data === "object" && data !== null) {
        if (data.patient) msg = Array.isArray(data.patient) ? data.patient[0] : data.patient;
        else if (data.appointment_date) msg = Array.isArray(data.appointment_date) ? data.appointment_date[0] : data.appointment_date;
        else if (data.appointment_time) msg = Array.isArray(data.appointment_time) ? data.appointment_time[0] : data.appointment_time;
        else if (data.reason) msg = Array.isArray(data.reason) ? data.reason[0] : data.reason;
        else if (data.error) msg = data.error;
        else if (data.detail) msg = data.detail;
      } else if (err.message) {
        msg = err.message;
      }
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="patient-layout">
      <PatientSidebar />

      <main className="patient-main" style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#ffffff",
            padding: "24px 28px",
            borderRadius: "14px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
              PATIENT CLINICAL VISITS
            </span>
            <h1 style={{ margin: "4px 0", color: "#1e293b", fontSize: "28px" }}>📅 My Doctor Appointments</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              View upcoming hospital visits, consultation schedule, and book new doctor appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBookModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
            }}
          >
            <span>➕</span>
            <span>Book New Appointment</span>
          </button>
        </div>

        {successMsg && (
          <div style={{ padding: "14px 18px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "10px", marginBottom: "20px", fontWeight: "600", border: "1px solid #bbf7d0" }}>
            {successMsg}
          </div>
        )}

        {/* Appointments List */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#1e293b" }}>Scheduled Appointments</h2>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading your appointments...</p>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <p>No appointments found. Click "Book New Appointment" to schedule your visit.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {appointments.map((apt) => {
                const isCompleted = (apt.status || "").toLowerCase() === "completed";
                const isConfirmed = (apt.status || "").toLowerCase() === "confirmed";

                const docName =
                  typeof apt.doctor === "object" && apt.doctor
                    ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}`
                    : apt.doctor_name || "Doctor";

                return (
                  <div
                    key={apt.id}
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: isCompleted ? "#f8fafc" : "#ffffff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>🩺</span>
                        <strong style={{ fontSize: "16px", color: "#1e293b" }}>{docName}</strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>• Ref #{apt.id}</span>
                      </div>

                      <div style={{ fontSize: "13px", color: "#475569", marginTop: "6px" }}>
                        <span>📅 Date: <strong>{apt.appointment_date || apt.date}</strong></span> •{" "}
                        <span>⏰ Time: <strong>{apt.appointment_time || apt.time}</strong></span>
                      </div>

                      <div style={{ fontSize: "13px", color: "#0284c7", marginTop: "4px" }}>
                        Reason: {apt.reason || "General consultation"}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        backgroundColor: isCompleted ? "#dcfce7" : isConfirmed ? "#dbeafe" : "#fef3c7",
                        color: isCompleted ? "#15803d" : isConfirmed ? "#1e40af" : "#b45309",
                      }}
                    >
                      {apt.status || "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOK APPOINTMENT MODAL */}
        {bookModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                padding: "28px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Book Doctor Appointment</h2>
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBook}>
                {isPrivilegedUser && (
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                      Patient Record (Admin / Staff Mode)
                    </label>
                    <select
                      value={bookingForm.patientId}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #0284c7", background: "#f0f9ff" }}
                    >
                      <option value="">-- Auto-Assign to Active Profile --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.first_name} {p.last_name} (#{p.id}) - {p.phone || "No Phone"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Select Doctor *
                  </label>
                  <select
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.first_name} {d.last_name} ({d.specialization}) - {d.room_number || "Cabin 101"}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingForm.appointment_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                      required
                      style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                      Time *
                    </label>
                    <select
                      value={bookingForm.appointment_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, appointment_time: e.target.value })}
                      style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="09:30">09:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:30">03:30 PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Reason for Visit / Symptoms *
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe your health symptoms..."
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setBookModalOpen(false)}
                    style={{ padding: "10px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "700",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}