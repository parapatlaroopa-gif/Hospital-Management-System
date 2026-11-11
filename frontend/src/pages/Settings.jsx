import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Settings</h1>
          <p style={styles.headerSubtitle}>
            Manage your hospital system preferences
          </p>
        </div>

        <div style={styles.profile}>
          <div style={styles.avatar}>A</div>

          <div>
            <div style={styles.profileName}>Admin</div>
            <div style={styles.profileRole}>Administrator</div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main style={styles.content}>

        {/* Account Settings */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>👤</div>

            <div>
              <h2 style={styles.sectionTitle}>
                Account Settings
              </h2>

              <p style={styles.sectionSubtitle}>
                Manage your administrator account
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>

            <div style={styles.field}>
              <label style={styles.label}>
                Full Name
              </label>

              <input
                type="text"
                value="Admin"
                readOnly
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email Address
              </label>

              <input
                type="email"
                value="admin@gmail.com"
                readOnly
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Role
              </label>

              <input
                type="text"
                value="Administrator"
                readOnly
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Hospital
              </label>

              <input
                type="text"
                value="Hospital Management System"
                readOnly
                style={styles.input}
              />
            </div>

          </div>

        </section>


        {/* Notification Settings */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>🔔</div>

            <div>
              <h2 style={styles.sectionTitle}>
                Notifications
              </h2>

              <p style={styles.sectionSubtitle}>
                Control how you receive system notifications
              </p>
            </div>
          </div>


          <div style={styles.settingRow}>

            <div>
              <div style={styles.settingTitle}>
                System Notifications
              </div>

              <div style={styles.settingDescription}>
                Receive important hospital system notifications
              </div>
            </div>

            <button
              onClick={() =>
                setNotifications(!notifications)
              }
              style={{
                ...styles.toggle,
                background: notifications
                  ? "#2563eb"
                  : "#cbd5e1",
              }}
            >
              <span
                style={{
                  ...styles.toggleCircle,
                  transform: notifications
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </button>

          </div>


          <div style={styles.settingRow}>

            <div>
              <div style={styles.settingTitle}>
                Email Alerts
              </div>

              <div style={styles.settingDescription}>
                Receive important updates through email
              </div>
            </div>

            <button
              onClick={() =>
                setEmailAlerts(!emailAlerts)
              }
              style={{
                ...styles.toggle,
                background: emailAlerts
                  ? "#2563eb"
                  : "#cbd5e1",
              }}
            >
              <span
                style={{
                  ...styles.toggleCircle,
                  transform: emailAlerts
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </button>

          </div>

        </section>


        {/* Appearance */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>🎨</div>

            <div>
              <h2 style={styles.sectionTitle}>
                Appearance
              </h2>

              <p style={styles.sectionSubtitle}>
                Customize the dashboard appearance
              </p>
            </div>
          </div>


          <div style={styles.settingRow}>

            <div>
              <div style={styles.settingTitle}>
                Dark Mode
              </div>

              <div style={styles.settingDescription}>
                Use dark theme across the application
              </div>
            </div>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              style={{
                ...styles.toggle,
                background: darkMode
                  ? "#2563eb"
                  : "#cbd5e1",
              }}
            >
              <span
                style={{
                  ...styles.toggleCircle,
                  transform: darkMode
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </button>

          </div>

        </section>


        {/* Save Button */}
        <div style={styles.actions}>

          <button
            onClick={handleSave}
            style={styles.saveButton}
          >
            Save Changes
          </button>

        </div>

      </main>

    </div>
  );
}


/* =========================================
   STYLES
========================================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e9f0",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
  },

  headerSubtitle: {
    margin: "6px 0 0",
    color: "#7d8798",
    fontSize: "13px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e8f0ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  profileName: {
    fontSize: "13px",
    fontWeight: "700",
  },

  profileRole: {
    fontSize: "11px",
    color: "#8b95a7",
    marginTop: "2px",
  },

  content: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e5e9f0",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 3px 12px rgba(20, 35, 60, 0.04)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "24px",
  },

  sectionIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#8b95a7",
    fontSize: "11px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#505b6e",
  },

  input: {
    height: "42px",
    border: "1px solid #dfe4ec",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    color: "#4b5563",
    background: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
  },

  settingRow: {
    minHeight: "68px",
    borderTop: "1px solid #edf0f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  settingTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#303b50",
  },

  settingDescription: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#8b95a7",
  },

  toggle: {
    width: "42px",
    height: "22px",
    border: "none",
    borderRadius: "20px",
    padding: "2px",
    cursor: "pointer",
    transition: "0.2s",
    flexShrink: 0,
  },

  toggleCircle: {
    display: "block",
    width: "18px",
    height: "18px",
    background: "#ffffff",
    borderRadius: "50%",
    transition: "0.2s",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.2)",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
  },

  saveButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "11px 24px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 4px 10px rgba(37, 99, 235, 0.20)",
  },
};

export default Settings;