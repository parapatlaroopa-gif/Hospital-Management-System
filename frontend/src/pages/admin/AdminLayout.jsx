import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
