import express from "express";
import {
  createPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
  updatePaymentMethod
} from "../controllers/paymentMethodController.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// USERS → see payment methods
router.get("/", getPaymentMethods);

// ADMIN
router.post("/", protectAdmin, createPaymentMethod);
router.delete("/:id", protectAdmin, deletePaymentMethod);
router.put("/:id", protectAdmin, updatePaymentMethod);


export default router;
