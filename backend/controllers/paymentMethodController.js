import asyncHandler from "express-async-handler";
import PaymentMethod from "../models/paymentMethod.js";

export const createPaymentMethod = asyncHandler(async (req, res) => {
  const { name, details } = req.body;

  if (!name || !details) {
    return res.status(400).json({ message: "Please provide name and details" });
  }

  const exists = await PaymentMethod.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: "Payment method already exists" });
  }

  const method = await PaymentMethod.create({ name, details });

  res.status(201).json({
    message: "Payment method added",
    method,
  });
});

export const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find().sort({ createdAt: -1 });
  res.json(methods);
});

export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const method = await PaymentMethod.findById(id);
  if (!method) {
    return res.status(404).json({ message: "Payment method not found" });
  }

  await method.deleteOne();
  res.json({ message: "Deleted successfully" });
});


export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, details } = req.body;

  const method = await PaymentMethod.findById(id);
  if (!method) return res.status(404).json({ message: "Method not found" });

  method.name = name || method.name;
  method.details = details || method.details;

  await method.save();
  res.json({ message: "Updated successfully", method });
});
