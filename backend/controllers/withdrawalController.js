// controllers/withdrawalController.js
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/user.js";
import Deposit from "../models/Deposit.js";
import Payment from "../models/payment.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateInvestmentReturns } from "../utils/investmentCalculator.js";

const WITHDRAWAL_INVESTMENT_THRESHOLD = 500000;

const getComputedInvestmentReturn = (payment) => {
  const amount = Number(payment.amount || 0);
  const durationDays = Number(payment.durationDays || 0);

  if (durationDays > 0) {
    return calculateInvestmentReturns(amount, durationDays).returns;
  }

  return Number(payment.returns || 0);
};

const getUserFinancialSnapshot = async (userId) => {
  const deposits = await Deposit.find({ user: userId, status: "approved" });
  const withdrawals = await Withdrawal.find({
    user: userId,
    status: "approved",
  });
  const payments = await Payment.find({ user: userId });

  const totalDeposits = deposits.reduce(
    (sum, deposit) => sum + Number(deposit.amount || 0),
    0
  );

  const totalWithdrawals = withdrawals.reduce(
    (sum, withdrawal) => sum + Number(withdrawal.amount || 0),
    0
  );

  const totalInvested = payments
    .filter((payment) =>
      ["approved", "completed"].includes(payment.status)
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const completedInvestmentReturns = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + getComputedInvestmentReturn(payment), 0);

  const walletBalance =
    totalDeposits - totalWithdrawals + completedInvestmentReturns;

  return {
    totalDeposits,
    totalWithdrawals,
    totalInvested,
    completedInvestmentReturns,
    walletBalance,
  };
};

// User requests withdrawal
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, method, paymentInfo } = req.body;

    const withdrawalAmount = Number(amount);

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return res.status(400).json({
        message: "Withdrawal amount must be greater than 0",
      });
    }

    if (!method || !paymentInfo) {
      return res.status(400).json({
        message: "Withdrawal method and payment information are required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const snapshot = await getUserFinancialSnapshot(user._id);

    user.walletBalance = snapshot.walletBalance;
    await user.save();

    if (snapshot.totalInvested < WITHDRAWAL_INVESTMENT_THRESHOLD) {
      return res.status(403).json({
        message:
          "Withdrawal is unavailable until you have invested at least $500,000.",
        rule: "MINIMUM_TOTAL_INVESTED_REQUIRED",
        threshold: WITHDRAWAL_INVESTMENT_THRESHOLD,
        totalInvested: snapshot.totalInvested,
        remainingRequired:
          WITHDRAWAL_INVESTMENT_THRESHOLD - snapshot.totalInvested,
      });
    }

    if (withdrawalAmount > snapshot.walletBalance) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
        walletBalance: snapshot.walletBalance,
      });
    }

    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount: withdrawalAmount,
      method,
      paymentInfo,
      totalInvestedAtRequest: snapshot.totalInvested,
      walletBalanceAtRequest: snapshot.walletBalance,
      thresholdRequired: WITHDRAWAL_INVESTMENT_THRESHOLD,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "Withdrawal Request",
      text: `User ${user.firstName} ${user.lastName} requested withdrawal of $${withdrawalAmount}.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Withdrawal Request</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:36px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                  <tr>
                    <td style="background:#0f172a;padding:28px 32px;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                        Withdrawal Request
                      </p>
                      <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;">
                        Innovation SpaceX Trading
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                        User <strong>${user.firstName} ${user.lastName}</strong> requested a withdrawal.
                      </p>

                      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin:0 0 24px;">
                        <p style="margin:0;color:#475569;font-size:14px;line-height:1.8;">
                          Amount: <strong>$${withdrawalAmount.toLocaleString()}</strong><br/>
                          Method: <strong>${method}</strong><br/>
                          Total Invested: <strong>$${snapshot.totalInvested.toLocaleString()}</strong><br/>
                          Wallet Balance: <strong>$${snapshot.walletBalance.toLocaleString()}</strong>
                        </p>
                      </div>

                      <div style="text-align:center;">
                        <a href="https://innovationspacextrading.com/admin/users"
                          style="display:inline-block;background:#A72703;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:15px;font-weight:700;">
                          Review Request
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#0f172a;text-align:center;padding:18px;">
                      <p style="margin:0;color:#cbd5e1;font-size:12px;">
                        &copy; ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal,
    });
  } catch (err) {
    console.error("createWithdrawal error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Admin approves withdrawal
export const approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    const user = await User.findById(withdrawal.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const snapshot = await getUserFinancialSnapshot(user._id);

    if (withdrawal.amount > snapshot.walletBalance) {
      return res.status(400).json({
        message: "User has insufficient wallet balance",
        walletBalance: snapshot.walletBalance,
      });
    }

    withdrawal.status = "approved";
    await withdrawal.save();

    const updatedSnapshot = await getUserFinancialSnapshot(user._id);
    user.walletBalance = updatedSnapshot.walletBalance;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Withdrawal Approved",
      text: `Your withdrawal of $${withdrawal.amount} has been approved and processed.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Withdrawal Approved</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:36px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                  <tr>
                    <td style="background:#0f172a;padding:28px 32px;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                        Withdrawal Approved
                      </p>
                      <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;">
                        Innovation SpaceX Trading
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                        Hi <strong>${user.firstName}</strong>,
                      </p>

                      <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">
                        Your withdrawal request has been approved and processed successfully.
                      </p>

                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin:0 0 24px;">
                        <p style="margin:0;color:#15803d;font-size:14px;line-height:1.8;">
                          Amount: <strong>$${Number(withdrawal.amount).toLocaleString()}</strong><br/>
                          Method: <strong>${withdrawal.method}</strong>
                        </p>
                      </div>

                      <div style="text-align:center;">
                        <a href="https://innovationspacextrading.com/dashboard"
                          style="display:inline-block;background:#A72703;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:15px;font-weight:700;">
                          Go to Dashboard
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#0f172a;text-align:center;padding:18px;">
                      <p style="margin:0;color:#cbd5e1;font-size:12px;">
                        &copy; ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({ message: "Withdrawal approved", withdrawal });
  } catch (err) {
    console.error("approveWithdrawal error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Admin rejects withdrawal
export const rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    withdrawal.status = "rejected";
    await withdrawal.save();

    await sendEmail({
      to: withdrawal.user.email,
      subject: "Withdrawal Rejected",
      text: `Your withdrawal of $${withdrawal.amount} has been rejected.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Withdrawal Rejected</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:36px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                  <tr>
                    <td style="background:#0f172a;padding:28px 32px;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                        Withdrawal Rejected
                      </p>
                      <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;">
                        Innovation SpaceX Trading
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                        Hi <strong>${withdrawal.user.firstName}</strong>,
                      </p>

                      <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">
                        Your withdrawal request of <strong>$${Number(withdrawal.amount).toLocaleString()}</strong> has been rejected.
                      </p>

                      <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">
                        Please contact support if you need more information.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#0f172a;text-align:center;padding:18px;">
                      <p style="margin:0;color:#cbd5e1;font-size:12px;">
                        &copy; ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({ message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    console.error("rejectWithdrawal error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Admin view all withdrawals
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};