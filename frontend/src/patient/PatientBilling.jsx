import React, { useEffect, useState } from "react";
import api from "../services/api";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get("billing/");
      const data = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : [];
      setBills(data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const paidAmount = bills
    .filter((b) => (b.payment_status || "").toLowerCase() === "paid")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!payingBill) return;

    setPaymentProcessing(true);
    try {
      await api.patch(`billing/${payingBill.id}/`, {
        payment_status: "Paid",
      });

      setPaymentSuccess(`✅ Payment of ₹${payingBill.total_amount} for Bill #${payingBill.bill_number} successful!`);
      setPayingBill(null);
      fetchBills();
      setTimeout(() => setPaymentSuccess(""), 6000);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment processing failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="patient-layout">
      <PatientSidebar />

      <main className="patient-main" style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px" }}>
        {/* Header */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px 28px",
            borderRadius: "14px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px" }}>
            FINANCIAL INVOICES & PAYMENTS
          </span>
          <h1 style={{ margin: "6px 0 4px", color: "#1e293b", fontSize: "28px" }}>My Hospital Bills & Payments</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Review itemized medical invoices, consultation fees, pharmacy charges, and settle pending payments.
          </p>
        </div>

        {paymentSuccess && (
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#dcfce7",
              color: "#15803d",
              borderRadius: "10px",
              marginBottom: "24px",
              fontWeight: "700",
              border: "1px solid #bbf7d0",
            }}
          >
            {paymentSuccess}
          </div>
        )}

        {/* Billing Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Total Invoices</p>
            <h2 style={{ margin: "8px 0 0", color: "#1e293b", fontSize: "24px" }}>{totalBills}</h2>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Total Billed</p>
            <h2 style={{ margin: "8px 0 0", color: "#1e293b", fontSize: "24px" }}>₹{totalAmount.toLocaleString()}</h2>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#15803d", fontSize: "13px", fontWeight: "600" }}>Paid Amount</p>
            <h2 style={{ margin: "8px 0 0", color: "#15803d", fontSize: "24px" }}>₹{paidAmount.toLocaleString()}</h2>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#b91c1c", fontSize: "13px", fontWeight: "600" }}>Pending Amount</p>
            <h2 style={{ margin: "8px 0 0", color: "#b91c1c", fontSize: "24px" }}>₹{pendingAmount.toLocaleString()}</h2>
          </div>
        </div>

        {/* Billing Table */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#1e293b", fontSize: "18px" }}>Itemized Billing Statement</h2>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading bills...</p>
          ) : bills.length === 0 ? (
            <p style={{ color: "#64748b", padding: "20px 0" }}>No hospital bills on record.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px" }}>Bill Number</th>
                    <th style={{ padding: "12px 16px" }}>Date</th>
                    <th style={{ padding: "12px 16px" }}>Consultation Fee</th>
                    <th style={{ padding: "12px 16px" }}>Pharmacy Fee</th>
                    <th style={{ padding: "12px 16px" }}>Lab Tests Fee</th>
                    <th style={{ padding: "12px 16px" }}>Total Amount</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    const isPaid = (bill.payment_status || "").toLowerCase() === "paid";

                    return (
                      <tr key={bill.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1e293b" }}>{bill.bill_number}</td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>
                          {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : "2026-09-19"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>₹{Number(bill.consultation_fee).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>₹{Number(bill.medicine_fee).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>₹{Number(bill.lab_fee).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>
                          ₹{Number(bill.total_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: isPaid ? "#dcfce7" : "#fee2e2",
                              color: isPaid ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {isPaid ? "PAID" : "PENDING"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {!isPaid ? (
                            <button
                              type="button"
                              onClick={() => setPayingBill(bill)}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                              }}
                            >
                              Pay Now
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => alert(`Receipt printed for Bill #${bill.bill_number} - Amount: ₹${bill.total_amount}`)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              📄 Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAYMENT MODAL */}
        {payingBill && (
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
                maxWidth: "460px",
                padding: "28px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Hospital Bill Payment</h2>
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "10px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Bill Reference:</span>
                  <strong>{payingBill.bill_number}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold", color: "#1e293b", paddingTop: "8px", borderTop: "1px solid #cbd5e1" }}>
                  <span>Total Due:</span>
                  <span style={{ color: "#2563eb" }}>₹{Number(payingBill.total_amount).toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleSimulatePayment}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Payment Mode
                  </label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <option value="card">💳 Credit / Debit Card</option>
                    <option value="upi">📱 UPI / QR Transfer</option>
                    <option value="insurance">🛡️ Health Insurance Claim</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Card / UPI ID
                  </label>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8921"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => setPayingBill(null)}
                    style={{ padding: "10px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    style={{
                      padding: "10px 22px",
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: paymentProcessing ? "wait" : "pointer",
                      fontWeight: "700",
                      boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                      opacity: paymentProcessing ? 0.7 : 1,
                    }}
                  >
                    {paymentProcessing ? "Processing..." : `Pay ₹${Number(payingBill.total_amount).toLocaleString()} Now`}
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
