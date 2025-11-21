// models/Market.js
import mongoose from "mongoose";

const marketSchema = new mongoose.Schema(
  {
    type: {
      type: String, // "crypto" | "stock"
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Market", marketSchema);
