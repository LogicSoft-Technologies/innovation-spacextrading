// deposit routes 
import express from "express";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";
import multer from "multer";
import {
  createDeposit,
  approveDeposit,
  rejectDeposit,
  getAllDeposits,
} from "../controllers/depositController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// User routes
router.post("/", protect, upload.single("receipt"), createDeposit);

// Admin routes
router.get("/", protectAdmin, getAllDeposits);
router.patch("/approve/:depositId", protectAdmin, approveDeposit);
router.patch("/reject/:depositId", protectAdmin, rejectDeposit);

export default router;
