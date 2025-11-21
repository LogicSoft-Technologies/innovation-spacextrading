// withdrawal routes
import express from "express";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";
import {
  createWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  getAllWithdrawals,
} from "../controllers/withdrawalController.js";

const router = express.Router();

// User routes
router.post("/", protect, createWithdrawal);

// Admin routes
router.get("/", protectAdmin, getAllWithdrawals);
router.patch("/approve/:withdrawalId", protectAdmin, approveWithdrawal);
router.patch("/reject/:withdrawalId", protectAdmin, rejectWithdrawal);

export default router;
