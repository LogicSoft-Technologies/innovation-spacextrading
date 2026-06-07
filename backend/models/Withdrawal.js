import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },

    method: { type: String, required: true },

    paymentInfo: { type: Object, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    totalInvestedAtRequest: {
      type: Number,
      default: 0,
    },

    walletBalanceAtRequest: {
      type: Number,
      default: 0,
    },

    thresholdRequired: {
      type: Number,
      default: 500000,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Withdrawal", withdrawalSchema);