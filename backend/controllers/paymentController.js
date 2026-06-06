// controllers/paymentController.js
import Payment from "../models/payment.js";
import {
  getDurationInDays,
  calculateInvestmentReturns,
} from "../utils/investmentCalculator.js";

export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      symbol,
      investmentType,
      paymentMethod,
      durationValue,
      durationUnit,
    } = req.body;

    const receiptImage = req.file
      ? `/uploads/receipts/${req.file.filename}`
      : "";

    if (
      !amount ||
      !symbol ||
      !investmentType ||
      !paymentMethod ||
      !receiptImage ||
      !durationValue ||
      !durationUnit
    ) {
      return res.status(400).json({
        message:
          "Amount, symbol, investment type, payment method, receipt image, duration value, and duration unit are required",
      });
    }

    const investmentAmount = Number(amount);
    const selectedDurationValue = Number(durationValue);

    if (Number.isNaN(investmentAmount) || investmentAmount <= 0) {
      return res.status(400).json({
        message: "Investment amount must be greater than 0",
      });
    }

    if (Number.isNaN(selectedDurationValue) || selectedDurationValue <= 0) {
      return res.status(400).json({
        message: "Investment duration must be greater than 0",
      });
    }

    if (!["stock", "crypto"].includes(investmentType)) {
      return res.status(400).json({
        message: "Investment type must be stock or crypto",
      });
    }

    const durationDays = getDurationInDays(selectedDurationValue, durationUnit);

    const { profit, returns, twoDayCycles } = calculateInvestmentReturns(
      investmentAmount,
      durationDays,
    );

    const payment = await Payment.create({
      user: req.user._id,
      amount: investmentAmount,
      symbol,
      investmentType,
      paymentMethod,
      receiptImage,
      durationValue: selectedDurationValue,
      durationUnit,
      durationDays,
      twoDayCycles,
      profit,
      returns,
      status: "pending",
    });

    res.status(201).json({
      message: "Investment submitted successfully and is pending approval",
      payment,
    });
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};
