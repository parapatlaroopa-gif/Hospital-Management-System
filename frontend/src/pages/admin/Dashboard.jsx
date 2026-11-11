
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import API from "../../services/api";
import Chatbot from "../../components/Chatbot";
import "./Dashboard.css";

function Dashboard() {
  const [counts, setCounts] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    admissions: 0,
    laboratory: 0,
    pharmacy: 0,
  });

  const [animatedCounts, setAnimatedCounts] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    admissions: 0,
    laboratory: 0,
    pharmacy: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================
  useEffect(() => {
    const getCount = (data) => {
      if (Array.isArray(data)) return data.length;

      if (data?.results && Array.isArray(data.results)) {
        return data.results.length;
      }

      if (typeof data?.count === "number") {
        return data.count;
      }

      return 0;
    };

    const fetchDashboardData = async () => {
      try {
        const [
          patientsRes,
          doctorsRes,
          appointmentsRes,
          admissionsRes,
          laboratoryRes,
          pharmacyRes,
        ] = await Promise.allSettled([
          API.get("patients/"),
          API.get("doctors/"),
          API.get("appointments/"),
          API.get("admissions/"),
          API.get("laboratory/tests/"),
          API.get("pharmacy/medicines/"),
        ]);

        setCounts({
          patients: patientsRes.status === "fulfilled" ? getCount(patientsRes.value.data) : 0,
          doctors: doctorsRes.status === "fulfilled" ? getCount(doctorsRes.value.data) : 0,
          appointments: appointmentsRes.status === "fulfilled" ? getCount(appointmentsRes.value.data) : 0,
          admissions: admissionsRes.status === "fulfilled" ? getCount(admissionsRes.value.data) : 0,
          laboratory: laboratoryRes.status === "fulfilled" ? getCount(laboratoryRes.value.data) : 0,
          pharmacy: pharmacyRes.status === "fulfilled" ? getCount(pharmacyRes.value.data) : 0,
        });
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // NUMBER COUNT-UP ANIMATION
  // =====================================================
  useEffect(() => {
    if (loading) return;

    const duration = 1200;
    const startTime = performance.now();
    let animId;

    const animateNumbers = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      // Smooth easing
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedCounts({
        patients: Math.floor((counts.patients || 0) * easeOut),
        doctors: Math.floor((counts.doctors || 0) * easeOut),
        appointments: Math.floor((counts.appointments || 0) * easeOut),
        admissions: Math.floor((counts.admissions || 0) * easeOut),
        laboratory: Math.floor((counts.laboratory || 0) * easeOut),
        pharmacy: Math.floor((counts.pharmacy || 0) * easeOut),
      });

      if (progress < 1) {
        animId = requestAnimationFrame(animateNumbers);
      }
    };

    animId = requestAnimationFrame(animateNumbers);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [counts, loading]);


  // =====================================================
  // SUMMARY CARDS
  // =====================================================
  const cards = [
    {
      title: "Total Patients",
      value: animatedCounts.patients,
      icon: "👤",
      path: "/admin/patients",
      bg: "#e8f1ff",
    },
    {
      title: "Total Doctors",
      value: animatedCounts.doctors,
      icon: "👨‍⚕️",
      path: "/admin/doctors",
      bg: "#e8f8ef",
    },
    {
      title: "Appointments",
      value: animatedCounts.appointments,
      icon: "📅",
      path: "/admin/appointments",
      bg: "#f0eaff",
    },
    {
      title: "Admissions",
      value: animatedCounts.admissions,
      icon: "🛏️",
      path: "/admin/admissions",
      bg: "#fff5df",
    },
    {
      title: "Laboratory Tests",
      value: animatedCounts.laboratory,
      icon: "🧪",
      path: "/admin/laboratory",
      bg: "#e5f9fa",
    },
    {
      title: "Pharmacy Records",
      value: animatedCounts.pharmacy,
      icon: "💊",
      path: "/admin/pharmacy",
      bg: "#ffeaf1",
    },
  ];

  // =====================================================
  // BAR CHART DATA
  // =====================================================
  const statisticsData = [
    {
      name: "Patients",
      value: counts.patients,
    },
    {
      name: "Doctors",
      value: counts.doctors,
    },
    {
      name: "Appointments",
      value: counts.appointments,
    },
    {
      name: "Admissions",
      value: counts.admissions,
    },
    {
      name: "Laboratory",
      value: counts.laboratory,
    },
    {
      name: "Pharmacy",
      value: counts.pharmacy,
    },
  ];

  // =====================================================
  // PATIENT & DOCTOR DONUT DATA
  // =====================================================
  const patientDoctorData = [
    {
      name: "Patients",
      value: counts.patients,
    },
    {
      name: "Doctors",
      value: counts.doctors,
    },
  ];

  const pieColors = ["#2878f0", "#19a66a"];

  // =====================================================
  // ACTIVITY DATA
  // =====================================================
  const activityData = [
    {
      name: "Patients",
      records: counts.patients,
    },
    {
      name: "Doctors",
      records: counts.doctors,
    },
    {
      name: "Appointments",
      records: counts.appointments,
    },
    {
      name: "Admissions",
      records: counts.admissions,
    },
    {
      name: "Laboratory",
      records: counts.laboratory,
    },
    {
      name: "Pharmacy",
      records: counts.pharmacy,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, Helvetica, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          ANIMATION STYLES
      ===================================================== */}
      <style>
        {`
          @keyframes sidebarSlide {
            from {
              opacity: 0;
              transform: translateX(-100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes headerDrop {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeScale {
            from {
              opacity: 0;
              transform: scale(0.94);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.08);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes notificationPulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.4);
              opacity: 0.6;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes emergencyPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(220,38,38,0.35);
            }
            70% {
              box-shadow: 0 0 0 12px rgba(220,38,38,0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(220,38,38,0);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -500px 0;
            }
            100% {
              background-position: 500px 0;
            }
          }

          .dashboard-sidebar {
            animation: sidebarSlide 0.7s ease-out;
          }

          .dashboard-header {
            animation: headerDrop 0.7s ease-out;
          }

          .dashboard-title {
            animation: fadeUp 0.8s ease-out;
          }

          .summary-card {
            animation: fadeUp 0.7s ease-out both;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease,
              border-color 0.3s ease;
          }

          .summary-card:hover {
            transform: translateY(-7px) scale(1.015);
            box-shadow: 0 12px 28px rgba(30, 64, 175, 0.12);
            border-color: #c7d7ef !important;
          }

          .summary-icon {
            transition: transform 0.35s ease;
          }

          .summary-card:hover .summary-icon {
            transform: rotate(8deg) scale(1.12);
          }

          .dashboard-chart {
            animation: fadeScale 0.8s ease-out both;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }

          .dashboard-chart:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 28px rgba(30, 64, 175, 0.10);
          }

          .emergency-card {
            animation: fadeScale 0.9s ease-out both;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }

          .emergency-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 28px rgba(220, 38, 38, 0.10);
          }

          .emergency-icon {
            animation: pulse 2s infinite ease-in-out;
          }

          .emergency-button {
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease;
          }

          .emergency-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 18px rgba(220, 38, 38, 0.25);
          }

          .activity-container {
            animation: fadeUp 1s ease-out both;
          }

          .activity-row {
            transition:
              background 0.25s ease,
              padding-left 0.25s ease,
              transform 0.25s ease;
          }

          .activity-row:hover {
            background: #f8fafc;
            padding-left: 8px;
            transform: translateX(3px);
          }

          .menu-link {
            transition:
              background 0.25s ease,
              transform 0.25s ease,
              padding-left 0.25s ease;
          }

          .menu-link:hover {
            background: rgba(255,255,255,0.12) !important;
            transform: translateX(5px);
            padding-left: 17px !important;
          }

          .admin-avatar {
            transition: transform 0.3s ease;
          }

          .admin-avatar:hover {
            transform: rotate(5deg) scale(1.08);
          }

          .search-box {
            transition:
              box-shadow 0.25s ease,
              background 0.25s ease;
          }

          .search-box:focus {
            box-shadow: 0 0 0 3px rgba(40,120,240,0.12);
            background: #ffffff !important;
          }

          .notification-dot {
            animation: notificationPulse 1.8s infinite;
          }

          .status-dot {
            animation: notificationPulse 1.7s infinite;
          }

          .logo-box {
            transition:
              transform 0.3s ease,
              background 0.3s ease;
          }

          .logo-box:hover {
            transform: rotate(-5deg) scale(1.08);
            background: rgba(255,255,255,0.22) !important;
          }

          .section-delay-1 {
            animation-delay: 0.15s;
          }

          .section-delay-2 {
            animation-delay: 0.3s;
          }

          .section-delay-3 {
            animation-delay: 0.45s;
          }

          .section-delay-4 {
            animation-delay: 0.6s;
          }

          @media (max-width: 1000px) {
            .summary-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            .chart-grid {
              grid-template-columns: 1fr !important;
            }

            .bottom-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            .summary-grid {
              grid-template-columns: 1fr !important;
            }

            .dashboard-header {
              padding: 0 15px !important;
            }

            .header-search {
              display: none !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <div
        className="dashboard-main"
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header
          className="dashboard-header"
          style={{
            height: "70px",
            background: "#ffffff",
            borderBottom: "1px solid #e5eaf1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#17396b",
              }}
            >
              🏥 Hospital Management
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* SEARCH */}
            <div
              className="header-search"
              style={{
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "9px",
                  fontSize: "15px",
                }}
              >
                🔍
              </span>

              <input
                className="search-box"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  width: "230px",
                  padding: "10px 12px 10px 38px",
                  border: "none",
                  outline: "none",
                  borderRadius: "8px",
                  background: "#f1f5fa",
                  fontSize: "12px",
                }}
              />
            </div>

            {/* NOTIFICATION */}
            <div
              style={{
                position: "relative",
                fontSize: "20px",
              }}
            >
              🔔

              <span
                className="notification-dot"
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            </div>

            {/* ADMIN */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                className="admin-avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#4b2bbf",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                A
              </div>

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#17396b",
                  }}
                >
                  Admin
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    color: "#71809a",
                    marginTop: "2px",
                  }}
                >
                  Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <main style={{ padding: "28px" }}>
          {/* TITLE & APPOINT STAFF ACTION */}
          <div
            className="dashboard-title"
            style={{
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "27px",
                  color: "#132f59",
                  fontWeight: "700",
                }}
              >
                Hospital Overview & Governance
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#71829d",
                  fontSize: "13px",
                }}
              >
                Welcome back, Administrator. Real-time hospital metrics, staff recruitment & operations.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link
                to="/admin/users"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.28)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>➕</span>
                <span>Appoint Doctor / Nurse</span>
              </Link>
            </div>
          </div>


          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}
          <div
            className="summary-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {cards.map((card, index) => (
              <Link
                key={card.title}
                to={card.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  className="summary-card"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: "#ffffff",
                    border: "1px solid #e3eaf3",
                    borderRadius: "12px",
                    padding: "17px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    className="summary-icon"
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#71829d",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      {card.title}
                    </div>

                    <div
                      style={{
                        color: "#143461",
                        fontSize: "25px",
                        fontWeight: "700",
                      }}
                    >
                      {loading ? "..." : card.value}
                    </div>
                  </div>

                  <div
                    style={{
                      marginLeft: "auto",
                      color: "#7890ae",
                      fontSize: "18px",
                      transition:
                        "transform 0.3s ease",
                    }}
                  >
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* =====================================================
              BAR + DONUT
          ===================================================== */}
          <div
            className="chart-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr",
              gap: "18px",
            }}
          >
            {/* BAR CHART */}
            <div
              className="dashboard-chart section-delay-1"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e9f2",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#163967",
                }}
              >
                Hospital Statistics
              </h2>

              <p
                style={{
                  margin: "5px 0 15px",
                  color: "#71829d",
                  fontSize: "12px",
                }}
              >
                Current records across hospital
                modules
              </p>

              <div
                style={{
                  width: "100%",
                  height: "280px",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={statisticsData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                        fill: "#607795",
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 10,
                        fill: "#607795",
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Records"
                      fill="#2878f0"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                      barSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DONUT CHART */}
            <div
              className="dashboard-chart section-delay-2"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e9f2",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#163967",
                }}
              >
                Patient & Doctor Overview
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#71829d",
                  fontSize: "12px",
                }}
              >
                Comparison of patients and doctors
              </p>

              <div
                style={{
                  width: "100%",
                  height: "280px",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={patientDoctorData}
                      dataKey="value"
                      nameKey="name"
                      cx="42%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      isAnimationActive={true}
                      animationDuration={1200}
                    >
                      {patientDoctorData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index]}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* =====================================================
              LINE CHART + EMERGENCY
          ===================================================== */}
          <div
            className="bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "18px",
              marginTop: "18px",
            }}
          >
            {/* LINE CHART */}
            <div
              className="dashboard-chart section-delay-3"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e9f2",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      color: "#163967",
                    }}
                  >
                    Hospital Activity
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#71829d",
                      fontSize: "12px",
                    }}
                  >
                    Current activity across hospital
                    modules
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "10px",
                    padding: "5px 9px",
                    borderRadius: "20px",
                    background: "#eef5ff",
                    color: "#2878f0",
                    fontWeight: "600",
                  }}
                >
                  Overview
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "250px",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={activityData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                        fill: "#607795",
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 10,
                        fill: "#607795",
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="records"
                      name="Hospital Records"
                      stroke="#2878f0"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationDuration={1400}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* EMERGENCY */}
            <div
              className="emergency-card section-delay-4"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e9f2",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              {/* EMERGENCY HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      color: "#163967",
                    }}
                  >
                    Emergency
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#71829d",
                      fontSize: "12px",
                    }}
                  >
                    Emergency services and assistance
                  </p>
                </div>

                <div
                  className="emergency-icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#fff0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  🚨
                </div>
              </div>

              {/* STATUS */}
              <div
                style={{
                  background: "#fff7f7",
                  border: "1px solid #fee2e2",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    marginBottom: "7px",
                  }}
                >
                  <span
                    className="status-dot"
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />

                  <strong
                    style={{
                      color: "#263b5c",
                      fontSize: "13px",
                    }}
                  >
                    Emergency Services Available
                  </strong>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#71829d",
                    fontSize: "11px",
                    lineHeight: "1.5",
                  }}
                >
                  Emergency department is available
                  for immediate medical assistance.
                </p>
              </div>

              {/* CONTACT */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom:
                    "1px solid #edf1f6",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9px",
                    background: "#f1f5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  📞
                </div>

                <div>
                  <div
                    style={{
                      color: "#19375f",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Emergency Contact
                  </div>

                  <div
                    style={{
                      color: "#71829d",
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    Contact emergency department
                  </div>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="emergency-button"
                onClick={() =>
                  navigate("/admin/emergency")
                }
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "11px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🚨 Emergency Department
              </button>
            </div>
          </div>

          {/* =====================================================
              RECENT ACTIVITY
          ===================================================== */}
          <div
            className="activity-container"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e9f2",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                color: "#163967",
              }}
            >
              Recent Activity
            </h2>

            <p
              style={{
                margin: "5px 0 18px",
                color: "#71829d",
                fontSize: "12px",
              }}
            >
              Latest updates from the hospital system
            </p>

            <ActivityRow
              icon="👤"
              title={`${counts.patients} ${
                counts.patients === 1
                  ? "patient"
                  : "patients"
              } registered`}
              text="Patient records"
              path="/admin/patients"
              delay="0.1s"
            />

            <ActivityRow
              icon="👨‍⚕️"
              title={`${counts.doctors} ${
                counts.doctors === 1
                  ? "doctor"
                  : "doctors"
              } registered`}
              text="Doctor records"
              path="/admin/doctors"
              delay="0.2s"
            />

            <ActivityRow
              icon="📅"
              title={`${counts.appointments} ${
                counts.appointments === 1
                  ? "appointment"
                  : "appointments"
              }`}
              text="Appointment records"
              path="/admin/appointments"
              delay="0.3s"
            />

            <ActivityRow
              icon="🧪"
              title={`${counts.laboratory} laboratory ${
                counts.laboratory === 1
                  ? "test"
                  : "tests"
              }`}
              text="Laboratory records"
              path="/admin/laboratory"
              delay="0.4s"
            />
          </div>
        </main>
      </div>

      {/* =====================================================
          CHATBOT
      ===================================================== */}
      <Chatbot />
    </div>
  );
}

// =====================================================
// ACTIVITY ROW
// =====================================================
function ActivityRow({
  icon,
  title,
  text,
  path,
  delay,
}) {
  return (
    <Link
      to={path}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="activity-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "13px 0",
          borderBottom:
            "1px solid #edf1f6",
          animation: "fadeUp 0.6s ease-out both",
          animationDelay: delay,
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "9px",
            background: "#f3f6fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            transition:
              "transform 0.3s ease",
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              color: "#19375f",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: "#8190a6",
              fontSize: "11px",
              marginTop: "3px",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Dashboard;

