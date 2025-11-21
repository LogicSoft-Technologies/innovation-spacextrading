// admin routes 
import express from "express";
import Admin from "../models/admin.js";
import {
  createFirstAdmin,
  adminLogin,
  sendVerificationCode,
  verifyCode,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  getAllUsersWithRequests,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  adminApprovePayment,
  getDashboardData,
  adminSendEmail
} from "../controllers/adminController.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";
import { uploadEmailAttachment } from "../middlewares/adminMulter.js"; 

const router = express.Router();

// Free access routes
router.post("/auth/signup", createFirstAdmin);
router.post("/auth/login", adminLogin);
router.post("/send-verification", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected admin routes
router.get("/profile", protectAdmin, getProfile);
router.post("/change-password", protectAdmin, changePassword);
router.get("/users", protectAdmin, getAllUsersWithRequests);

// Deposits
router.patch("/deposit/approve/:depositId", protectAdmin, adminApproveDeposit);
router.patch("/deposit/reject/:depositId", protectAdmin, adminRejectDeposit);

// Withdrawals
router.patch("/withdrawal/approve/:withdrawalId", protectAdmin, adminApproveWithdrawal);
router.patch("/withdrawal/reject/:withdrawalId", protectAdmin, adminRejectWithdrawal);

// Payments / investments
router.patch("/payment/approve/:paymentId", protectAdmin, adminApprovePayment);

// Dashboard Routes
router.get("/dashboard", protectAdmin, getDashboardData);

//admin email endpoint
router.post("/send-email", protectAdmin, uploadEmailAttachment.single("image"), adminSendEmail);

// Check if an admin already exists
router.get("/exists", async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ exists: adminCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error checking admin existence" });
  }
});

export default router;
