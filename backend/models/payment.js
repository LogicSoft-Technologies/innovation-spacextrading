// payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    investmentType: {
      type: String,
      enum: ["stock", "crypto"],
      required: true,
    },

    symbol: { type: String, required: true },

    amount: { type: Number, required: true },

    paymentMethod: { type: String, required: true },

    receiptImage: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "completed"],
      default: "pending",
    },

    durationValue: {
      type: Number,
      required: true,
      min: 1,
    },

    durationUnit: {
      type: String,
      enum: ["days", "weeks", "months", "years"],
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    twoDayCycles: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },

    // Final wallet credit: original amount + profit
    returns: {
      type: Number,
      default: 0,
    },

    approvedAt: { type: Date },

    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);