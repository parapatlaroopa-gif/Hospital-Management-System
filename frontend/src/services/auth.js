import API from "./api";

export const authService = {
  // LOGIN
  async login(email, password, expectedRole = "") {
    const response = await API.post("accounts/login/", {
      email: email.trim(),
      password: password,
      ...(expectedRole ? { expected_role: expectedRole } : {}),
    });

    const data = response.data;
    if (data && data.user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token || "session-token");
      localStorage.setItem("role", (data.role || "PATIENT").toUpperCase());
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }
    return data;
  },

  // REGISTER PATIENT
  async registerPatient(formData) {
    const response = await API.post("accounts/register/", formData);
    return response.data;
  },

  // RECRUIT DOCTOR / NURSE (ADMIN ONLY)
  async recruitStaff(staffData) {
    const response = await API.post("accounts/recruit-staff/", staffData);
    return response.data;
  },

  // LOGOUT
  logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("currentUser");
  },

  // GET CURRENT USER
  getCurrentUser() {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // GET CURRENT ROLE
  getRole() {
    return (localStorage.getItem("role") || "").toUpperCase();
  },

  // CHECK AUTH STATUS
  isAuthenticated() {
    return localStorage.getItem("isLoggedIn") === "true";
  },

  // GET USER DASHBOARD BY ROLE
  getDashboardPath() {
    const role = this.getRole();
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "DOCTOR") return "/staff/dashboard";
    if (role === "NURSE") return "/staff/dashboard";
    if (role === "PATIENT") return "/patient/dashboard";
    return "/login";
  },

};

export default authService;
