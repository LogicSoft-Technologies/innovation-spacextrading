// controllers/dashboardController.js
import User from "../models/user.js";
import Deposit from "../models/Deposit.js";
import Withdrawal from "../models/Withdrawal.js";
import Payment from "../models/payment.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const maturedPayments = await Payment.find({
      user: userId,
      status: "approved",
      completedAt: { $lte: now },
    }).populate("user");

    for (const payment of maturedPayments) {
      if (payment.status !== "approved") continue;

      // Credit user's wallet
      const user = await User.findById(payment.user._id);
      if (!user) continue;

      user.walletBalance = (user.walletBalance || 0) + (payment.returns || 0);
      await user.save();

      // Update payment status
      payment.status = "completed";
      await payment.save();

      // Notify user by email
      try {
        await sendEmail({
          to: user.email,
          subject: "Investment Matured",
          text: `Congratulations ${user.firstName}, your investment of $${payment.amount} in ${payment.symbol} has matured. Your wallet has been credited with $${payment.returns}.`,
          html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Matured</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:#000000;text-align:center;padding:28px;">
                    <h1 style="color:#ffffff;margin:0;font-size:26px;">Innovation SpaceX Trading</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;color:#333;font-size:16px;line-height:1.6;">
                    <p>Hi <b>${user.firstName}</b>,</p>
                    <p>Congratulations! Your investment of <b>$${
                      payment.amount
                    }</b> in <b>${
            payment.symbol
          }</b> has <span style="color:#A72703;font-weight:bold;">matured</span>.</p>
                    <p>Your wallet has been credited with <b>$${
                      payment.returns
                    }</b>.</p>
                    <p>Thank you for investing with <b>Innovation SpaceX Trading</b>! Keep investing to grow your wealth.</p>
                    <div style="text-align:center; margin-top:30px;">
                      <a href="https://innovationspacextrading.com/dashboard" 
                         style="background:#A72703; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-size:16px; display:inline-block;">
                        Go to Dashboard
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#000000;text-align:center;padding:18px;">
                    <p style="color:#ffffff;font-size:13px;margin:0;">© ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.</p>
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
      } catch (emailErr) {
        console.error("Failed to send matured email:", emailErr);
      }
    }

    const user = await User.findById(userId).select(
      "walletBalance firstName lastName email"
    );

    const deposits = await Deposit.find({ user: userId });
    const withdrawals = await Withdrawal.find({ user: userId });
    const payments = await Payment.find({ user: userId }).sort({
      createdAt: -1,
    });

    // aggregates
    const totalDeposits = deposits
      .filter((d) => d.status === "approved")
      .reduce((sum, d) => sum + d.amount, 0);

    const totalWithdrawals = withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingInvestments = payments.filter(
      (p) => p.status === "pending"
    ).length;
    const activeInvestments = payments.filter(
      (p) => p.status === "approved"
    ).length;
    const completedInvestments = payments.filter(
      (p) => p.status === "completed"
    ).length;

    const totalInvested = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalReturns = payments.reduce((sum, p) => sum + (p.returns || 0), 0);

    const nowMs = Date.now();
    const paymentsWithTimes = payments.map((p) => {
      let timeLeft = null;
      if (p.status === "approved" && p.completedAt) {
        timeLeft = Math.max(
          0,
          Math.floor((new Date(p.completedAt).getTime() - nowMs) / 1000)
        ); // seconds
      }
      return {
        _id: p._id,
        symbol: p.symbol,
        amount: p.amount,
        status: p.status,
        investmentType: p.investmentType,
        paymentMethod: p.paymentMethod,
        receiptImage: p.receiptImage,
        approvedAt: p.approvedAt,
        completedAt: p.completedAt,
        returns: p.returns,
        createdAt: p.createdAt,
        timeLeft, // seconds or null
      };
    });

    res.json({
      user,
      walletBalance: user.walletBalance || 0,
      totalDeposits,
      totalWithdrawals,
      totalInvested,
      totalReturns,
      pendingInvestments,
      activeInvestments,
      completedInvestments,
      payments: paymentsWithTimes,
      deposits,
      withdrawals,
    });
  } catch (err) {
    console.error("getUserDashboardData error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
