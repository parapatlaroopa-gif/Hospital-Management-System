import React, { useEffect, useState } from "react";
import api from "../api";

function Reports() {
  const [reports, setReports] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    departments: 0,
    admissions: 0,
    billing: 0,
    laboratory: 0,
    pharmacy: 0,
    inventory: 0,
    staff: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const getCount = (response) => {
    const data = response.data;

    if (Array.isArray(data)) {
      return data.length;
    }

    if (data && typeof data.count === "number") {
      return data.count;
    }

    if (data && Array.isArray(data.results)) {
      return data.results.length;
    }

    return 0;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        patientsRes,
        doctorsRes,
        appointmentsRes,
        departmentsRes,
        admissionsRes,
        billingRes,
        laboratoryRes,
        pharmacyRes,
        inventoryRes,
        staffRes,
      ] = await Promise.allSettled([
        api.get("patients/"),
        api.get("doctors/"),
        api.get("appointments/"),
        api.get("departments/"),
        api.get("admissions/"),
        api.get("billing/"),
        api.get("laboratory/tests/"),
        api.get("pharmacy/"),
        api.get("inventory/items/"),
        api.get("staff/"),
      ]);

      setReports({
        patients:
          patientsRes.status === "fulfilled"
            ? getCount(patientsRes.value)
            : 0,

        doctors:
          doctorsRes.status === "fulfilled"
            ? getCount(doctorsRes.value)
            : 0,

        appointments:
          appointmentsRes.status === "fulfilled"
            ? getCount(appointmentsRes.value)
            : 0,

        departments:
          departmentsRes.status === "fulfilled"
            ? getCount(departmentsRes.value)
            : 0,

        admissions:
          admissionsRes.status === "fulfilled"
            ? getCount(admissionsRes.value)
            : 0,

        billing:
          billingRes.status === "fulfilled"
            ? getCount(billingRes.value)
            : 0,

        laboratory:
          laboratoryRes.status === "fulfilled"
            ? getCount(laboratoryRes.value)
            : 0,

        pharmacy:
          pharmacyRes.status === "fulfilled"
            ? getCount(pharmacyRes.value)
            : 0,

        inventory:
          inventoryRes.status === "fulfilled"
            ? getCount(inventoryRes.value)
            : 0,

        staff:
          staffRes.status === "fulfilled"
            ? getCount(staffRes.value)
            : 0,
      });
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Unable to load hospital reports.");
    } finally {
      setLoading(false);
    }
  };

  const totalRecords =
    reports.patients +
    reports.doctors +
    reports.appointments +
    reports.departments +
    reports.admissions +
    reports.billing +
    reports.laboratory +
    reports.pharmacy +
    reports.inventory +
    reports.staff;

  const reportItems = [
    {
      name: "Patients",
      value: reports.patients,
      icon: "👥",
    },
    {
      name: "Doctors",
      value: reports.doctors,
      icon: "👨‍⚕️",
    },
    {
      name: "Appointments",
      value: reports.appointments,
      icon: "📅",
    },
    {
      name: "Departments",
      value: reports.departments,
      icon: "🏢",
    },
    {
      name: "Admissions",
      value: reports.admissions,
      icon: "🏥",
    },
    {
      name: "Billing",
      value: reports.billing,
      icon: "💳",
    },
    {
      name: "Laboratory",
      value: reports.laboratory,
      icon: "🧪",
    },
    {
      name: "Pharmacy",
      value: reports.pharmacy,
      icon: "💊",
    },
    {
      name: "Inventory",
      value: reports.inventory,
      icon: "📦",
    },
    {
      name: "Staff",
      value: reports.staff,
      icon: "👨‍💼",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "30px",
            }}
          >
            Reports
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Hospital management reports and overall statistics
          </p>
        </div>

        <button
          onClick={fetchReports}
          style={{
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "11px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Loading */}

      {loading && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Loading reports...
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "15px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Reports */}

      {!loading && (
        <>
          {/* Total Records */}

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "25px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Total Hospital Records
            </div>

            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {totalRecords}
            </div>
          </div>

          {/* Report Cards */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "20px",
            }}
          >
            {reportItems.map((item) => (
              <div
                key={item.name}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "12px",
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginTop: "25px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                color: "#1f2937",
                fontSize: "21px",
              }}
            >
              Hospital Summary
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <strong>Patients:</strong> {reports.patients}
              </div>

              <div>
                <strong>Doctors:</strong> {reports.doctors}
              </div>

              <div>
                <strong>Appointments:</strong>{" "}
                {reports.appointments}
              </div>

              <div>
                <strong>Departments:</strong>{" "}
                {reports.departments}
              </div>

              <div>
                <strong>Admissions:</strong>{" "}
                {reports.admissions}
              </div>

              <div>
                <strong>Billing:</strong> {reports.billing}
              </div>

              <div>
                <strong>Laboratory Tests:</strong>{" "}
                {reports.laboratory}
              </div>

              <div>
                <strong>Pharmacy:</strong>{" "}
                {reports.pharmacy}
              </div>

              <div>
                <strong>Inventory:</strong>{" "}
                {reports.inventory}
              </div>

              <div>
                <strong>Staff:</strong> {reports.staff}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;