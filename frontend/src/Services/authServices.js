import api from "../../config/api";

// Signup
export const userSignup = async (firstName, lastName, email, password) => {
  const res = await api.post("/api/user/auth/signup", {
    firstName,
    lastName,
    email,
    password,
  });
  return res.data;
};

// Login
export const userLogin = async (email, password) => {
  const res = await api.post("/api/user/auth/login", { email, password });
  return res.data;
};

// Verify Email
export const userVerifyEmail = async (email, code) => {
  const res = await api.post("/api/user/auth/verify-email", { email, code });
  return res.data;
};

// Resend Verification Code
export const userResendVerification = async (email) => {
  const res = await api.post("/api/user/auth/resend-verification", { email });
  return res.data;
};

// Forgot Password
export const userForgotPassword = async (email) => {
  const res = await api.post("/api/user/auth/forgot-password", { email });
  return res.data;
};

// Reset Password
export const userResetPassword = async (token, newPassword) => {
  const res = await api.post("/api/user/auth/reset-password", {
    token,
    password: newPassword,
  });
  return res.data;
};

// Change Password
export const userChangePassword = async (currentPassword, newPassword) => {
  const res = await api.post("/api/user/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

// Get Profile
export const userGetProfile = async () => {
  const res = await api.get("/api/user/profile");
  return res.data;
};

// Update Profile
export const userUpdateProfile = async (profileData) => {
  const res = await api.put("/api/user/profile", profileData);
  return res.data;
};

// Dashboard
export const userGetDashboardData = async () => {
  const res = await api.get("/api/user/dashboard");
  return res.data;
};

// Admin payment methods for user investment payment
export const getAdminPaymentMethods = async () => {
  const res = await api.get("/api/admin/payment-methods");
  return res.data?.paymentMethods || res.data || [];
};

// Create investment payment
export const userCreateInvestment = async (formData) => {
  const res = await api.post("/api/payments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};