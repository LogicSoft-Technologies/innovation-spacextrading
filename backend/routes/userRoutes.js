// user routes 
import express from "express";
import {
  userSignup,
  userLogin,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { getUserDashboardData } from "../controllers/dashboardController.js";


const router = express.Router();

// Auth routes
router.post("/auth/signup", userSignup);
router.post("/auth/login", userLogin);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerificationCode);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/change-password", protect, changePassword);

// Protected profile route
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

//  User dashboard data 
router.get("/dashboard", protect, getUserDashboardData);

export default router;
