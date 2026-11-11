
import React, { useEffect, useState } from "react";
import api from "../services/api";
import PatientSidebar from "./PatientSidebar";
import "./patient.css";

function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Get bills and patients
      const [billResponse, patientResponse] = await Promise.all([
        api.get("billing/"),
        api.get("patients/"),
      ]);

      console.log("Bills:", billResponse.data);
      console.log("Patients:", patientResponse.data);

      setBills(billResponse.data);
      setPatients(patientResponse.data);

      setError("");
    } catch (err) {
      console.error("Billing API Error:", err);

      setError("Unable to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  // Find patient name using patient ID
  const getPatientName = (patientId) => {
    const patient = patients.find(
      (item) => item.id === patientId
    );

    if (!patient) {
      return `Patient ID: ${patientId}`;
    }

    return `${patient.first_name} ${patient.last_name}`;
  };

  // Calculate totals
  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.payment_status === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill) => bill.payment_status === "Pending"
  ).length;

  const totalAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.total_amount),
    0
  );

  const paidAmount = bills
    .filter((bill) => bill.payment_status === "Paid")
    .reduce(
      (sum, bill) => sum + Number(bill.total_amount),
      0
    );

  const pendingAmount = bills
    .filter((bill) => bill.payment_status === "Pending")
    .reduce(
      (sum, bill) => sum + Number(bill.total_amount),
      0
    );

  return (
    <div className="patient-layout">

      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <main className="patient-main">

        {/* Header */}
        <header className="patient-header">

          <div>

            <span className="patient-page-label">
              PATIENT PORTAL
            </span>

            <h1>My Billing 💳</h1>

            <p>
              View your hospital bills and payment information.
            </p>

          </div>

        </header>


        {/* Loading */}
        {loading && (
          <div className="patient-message">

            <h3>Loading billing information...</h3>

            <p>
              Please wait while we get your billing records.
            </p>

          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="patient-message error-message">

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button onClick={fetchBillingData}>
              Try Again
            </button>

          </div>
        )}


        {/* Billing Data */}
        {!loading &&
          !error &&
          bills.length > 0 && (
            <>

              {/* Summary Cards */}
              <section className="billing-summary-grid">

                <div className="billing-summary-card">

                  <div className="billing-summary-icon">
                    🧾
                  </div>

                  <div>
                    <span>Total Bills</span>
                    <strong>{totalBills}</strong>
                  </div>

                </div>


                <div className="billing-summary-card">

                  <div className="billing-summary-icon">
                    ✅
                  </div>

                  <div>
                    <span>Paid Bills</span>
                    <strong>{paidBills}</strong>
                  </div>

                </div>


                <div className="billing-summary-card">

                  <div className="billing-summary-icon">
                    ⏳
                  </div>

                  <div>
                    <span>Pending Bills</span>
                    <strong>{pendingBills}</strong>
                  </div>

                </div>


                <div className="billing-summary-card">

                  <div className="billing-summary-icon">
                    💰
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>
                      ₹{totalAmount.toFixed(2)}
                    </strong>
                  </div>

                </div>

              </section>


              {/* Amount Summary */}
              <section className="billing-money-grid">

                <div className="billing-money-card">

                  <div>
                    <small>Total Paid</small>

                    <h2>
                      ₹{paidAmount.toFixed(2)}
                    </h2>
                  </div>

                  <span>✅</span>

                </div>


                <div className="billing-money-card">

                  <div>
                    <small>Total Pending</small>

                    <h2>
                      ₹{pendingAmount.toFixed(2)}
                    </h2>
                  </div>

                  <span>⏳</span>

                </div>

              </section>


              {/* Bills */}
              <section className="billing-section">

                <div className="billing-section-title">

                  <div>
                    <h2>Billing Records</h2>

                    <p>
                      All available hospital billing records
                    </p>
                  </div>

                </div>


                <div className="billing-table-wrapper">

                  <table className="billing-table">

                    <thead>

                      <tr>
                        <th>Bill Number</th>
                        <th>Patient</th>
                        <th>Consultation</th>
                        <th>Medicine</th>
                        <th>Lab</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>

                    </thead>


                    <tbody>

                      {bills.map((bill) => (

                        <tr key={bill.id}>

                          <td>
                            <strong>
                              {bill.bill_number}
                            </strong>
                          </td>

                          <td>
                            {getPatientName(bill.patient)}
                          </td>

                          <td>
                            ₹{Number(
                              bill.consultation_fee
                            ).toFixed(2)}
                          </td>

                          <td>
                            ₹{Number(
                              bill.medicine_fee
                            ).toFixed(2)}
                          </td>

                          <td>
                            ₹{Number(
                              bill.lab_fee
                            ).toFixed(2)}
                          </td>

                          <td>
                            <strong>
                              ₹{Number(
                                bill.total_amount
                              ).toFixed(2)}
                            </strong>
                          </td>

                          <td>

                            <span
                              className={`billing-status ${
                                bill.payment_status
                                  .toLowerCase()
                              }`}
                            >
                              {bill.payment_status}
                            </span>

                          </td>

                          <td>
                            {new Date(
                              bill.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </section>

            </>
          )}


        {/* No Bills */}
        {!loading &&
          !error &&
          bills.length === 0 && (
            <div className="patient-message">

              <h3>No billing records found</h3>

              <p>
                There are currently no bills registered.
              </p>

            </div>
          )}

      </main>
    </div>
  );
}

export default PatientBilling;

