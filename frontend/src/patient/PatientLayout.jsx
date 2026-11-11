import PatientSidebar from "./PatientSidebar";
import "./patient.css";

export default function PatientLayout({ children }) {
  return (
    <div className="patient-layout">
      <PatientSidebar />
      <main className="patient-main">
        {children}
      </main>
    </div>
  );
}
