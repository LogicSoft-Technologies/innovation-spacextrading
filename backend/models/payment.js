// payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    investmentType: { type: String, enum: ["stock", "crypto"], required: true },
    symbol: { type: String, required: true }, // e.g., Tesla, SpaceX, BTC, ETH
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    receiptImage: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "completed"], default: "pending" },
    approvedAt: { type: Date },
    completedAt: { type: Date },
    returns: { type: Number }, // 10x returns
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
