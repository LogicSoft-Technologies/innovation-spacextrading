// frontend/config/api.js
import axios from "axios";

const ENV = import.meta.env.VITE_ENV; // "dev" or "prod"
const LOCAL_API = import.meta.env.VITE_LOCAL_API;
const PROD_API = import.meta.env.VITE_PROD_API;

export const API_BASE_URL = ENV === "prod" ? PROD_API : LOCAL_API;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
