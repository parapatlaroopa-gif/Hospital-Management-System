import { Navigate, useLocation } from "react-router-dom";
import authService from "../services/auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const currentRole = authService.getRole();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Administrator has elevated universal access across all hospital workspaces
  if (currentRole === "ADMIN") {
    return children;
  }

  // If this route strictly requires ADMIN, show the role-restricted screen for non-admins
  if (allowedRoles.includes("ADMIN") && currentRole !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if current role is permitted for this workspace
  if (allowedRoles.length > 0) {
    const isDoctorOrNurse = currentRole === "DOCTOR" || currentRole === "NURSE";
    const allowsStaff = allowedRoles.includes("DOCTOR") || allowedRoles.includes("NURSE") || allowedRoles.includes("STAFF");
    
    // Clinical staff (doctors/nurses) can also inspect patient health portals
    const isAllowed = 
      allowedRoles.includes(currentRole) || 
      (isDoctorOrNurse && (allowsStaff || allowedRoles.includes("PATIENT")));

    if (!isAllowed) {
      // Direct others straight to their designated account dashboard to perform actions
      const destination = authService.getDashboardPath();
      return <Navigate to={destination} replace />;
    }
  }

  return children;
}
