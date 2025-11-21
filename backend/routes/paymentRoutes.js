// payment Routes 
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  createPayment,
  approvePayment,
  getUserPayments,
  getPendingPayments,
  completeInvestment,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Ensure uploads/receipts folder exists
const receiptsPath = path.join("uploads", "receipts");
if (!fs.existsSync(receiptsPath)) {
  fs.mkdirSync(receiptsPath, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, receiptsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// User routes
router.post("/", protect, upload.single("receiptImage"), createPayment);
router.get("/user", protect, getUserPayments);

// Admin routes
router.get("/pending", protectAdmin, getPendingPayments);
router.put("/:id/approve", protectAdmin, approvePayment);

router.post("/complete", completeInvestment);


export default router;
