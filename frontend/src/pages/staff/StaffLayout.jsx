import StaffSidebar from "./StaffSidebar";

export default function StaffLayout({ children }) {
  return (
    <div className="admin-layout staff-layout">
      <StaffSidebar />
      <main style={{ flex: 1, minWidth: 0, width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
