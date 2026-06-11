// Services/adminAuthServices
import api from "../config/api";

// ===== SIGNUP =====
export const adminSignup = async (firstName, lastName, email, password) => {
  const res = await api.post("/auth/signup", {
    firstName,
    lastName,
    email,
    password,
  });
  return res.data;
};

// ===== LOGIN =====
export const adminLoginService = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });

  localStorage.setItem("adminToken", res.data.token);
  return res.data;
};

// ===== LOGOUT =====
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
};

// ===== VERIFY EMAIL =====
export const sendVerificationCode = async (email) => {
  const res = await api.post("/send-verification", { email });
  return res.data;
};

export const verifyAdminCode = async (email, code) => {
  const res = await api.post("/verify-code", { email, code });
  localStorage.setItem("adminToken", res.data.token);
  return res.data;
};

// ===== PASSWORD =====
export const adminForgotPassword = async (email) => {
  const res = await api.post("/forgot-password", { email });
  return res.data;
};

export const adminResetPassword = async (token, password) => {
  const res = await api.post(`/reset-password/${token}`, { password });
  return res.data;
};

export const adminChangePassword = async (currentPassword, newPassword) => {
  const res = await api.post("/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

// ===== DASHBOARD & USERS =====
export const adminGetDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const adminGetUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const adminGetUsersWithRequests = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const adminDeleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};

// ===== PROFILE =====
export const adminGetProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const adminUpdateProfile = async (profile) => {
  const res = await api.put("/profile", profile);
  return res.data;
};

// ===== CHECK IF ADMIN EXISTS =====
export const checkAdminExists = async () => {
  const res = await api.get("/exists");
  return res.data.exists;
};

// ===== APPROVE / REJECT USER REQUESTS =====
export const adminApproveDeposit = async (depositId) => {
  const res = await api.patch(`/deposit/approve/${depositId}`);
  return res.data;
};

export const adminRejectDeposit = async (depositId) => {
  const res = await api.patch(`/deposit/reject/${depositId}`);
  return res.data;
};

export const adminApproveWithdrawal = async (withdrawalId) => {
  const res = await api.patch(`/withdrawal/approve/${withdrawalId}`);
  return res.data;
};

export const adminRejectWithdrawal = async (withdrawalId) => {
  const res = await api.patch(`/withdrawal/reject/${withdrawalId}`);
  return res.data;
};

export const adminApprovePayment = async (paymentId) => {
  const res = await api.patch(`/payment/approve/${paymentId}`);
  return res.data;
};