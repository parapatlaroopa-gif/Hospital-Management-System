
import axios from "axios";

export const LOCAL_API_URL =
  import.meta.env.VITE_LOCAL_API_URL ||
  "http://127.0.0.1:8000/api/";

export const RENDER_API_URL =
  import.meta.env.VITE_RENDER_API_URL ||
  "https://hospital-management-587l.onrender.com/api/";

export const getActiveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && envUrl !== "undefined" && envUrl !== "/") {
    return envUrl;
  }

  return import.meta.env.PROD
    ? RENDER_API_URL
    : LOCAL_API_URL;
};

const API = axios.create({
  baseURL: getActiveApiUrl(),
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getActiveApiUrl();
  }
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("accounts/login");
      if (!isLoginRequest) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("currentUser");
      }
    }

    return Promise.reject(error);
  }
);

export default API;