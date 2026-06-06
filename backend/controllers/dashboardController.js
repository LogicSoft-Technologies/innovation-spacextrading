// controllers/dashboardController.js
import User from "../models/user.js";
import Deposit from "../models/Deposit.js";
import Withdrawal from "../models/Withdrawal.js";
import Payment from "../models/payment.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateInvestmentReturns } from "../utils/investmentCalculator.js";

const getComputedPaymentValues = (payment) => {
  const amount = Number(payment.amount || 0);
  const durationDays = Number(payment.durationDays || 0);

  if (durationDays > 0) {
    return calculateInvestmentReturns(amount, durationDays);
  }

  const returns = Number(payment.returns || 0);
  const profit = Number(payment.profit || Math.max(returns - amount, 0));

  return {
    profit,
    returns,
    twoDayCycles: Number(payment.twoDayCycles || 0),
  };
};

const recalculateWalletBalance = async (userId) => {
  const deposits = await Deposit.find({ user: userId });
  const withdrawals = await Withdrawal.find({ user: userId });
  const payments = await Payment.find({ user: userId });

  const totalDeposits = deposits
    .filter((d) => d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const totalWithdrawals = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const completedReturns = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => {
      const computed = getComputedPaymentValues(p);
      return sum + Number(computed.returns || 0);
    }, 0);

  return {
    walletBalance: totalDeposits - totalWithdrawals + completedReturns,
    deposits,
    withdrawals,
    payments,
    totalDeposits,
    totalWithdrawals,
  };
};

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

      const computed = getComputedPaymentValues(payment);

      payment.status = "completed";
      payment.profit = computed.profit;
      payment.returns = computed.returns;
      payment.twoDayCycles = computed.twoDayCycles;
      await payment.save();

      try {
        const dashboardUrl = `${
          process.env.FRONTEND_URL || "https://innovationspacextrading.com"
        }/dashboard`;

        await sendEmail({
          to: payment.user.email,
          subject: "Investment Matured",
          text: `Congratulations ${payment.user.firstName}, your investment of $${payment.amount} in ${payment.symbol} has matured. Your wallet has been credited with $${computed.returns}, including $${computed.profit} profit.`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Investment Matured</title>
            </head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:36px 12px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                      <tr>
                        <td style="background:#0f172a;padding:28px 32px;">
                          <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                            Investment Matured
                          </p>
                          <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;line-height:1.25;">
                            Innovation SpaceX Trading
                          </h1>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:32px;">
                          <p style="margin:0 0 14px;font-size:16px;line-height:1.7;">
                            Hi <strong>${payment.user.firstName}</strong>,
                          </p>

                          <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">
                            Congratulations. Your investment in <strong>${payment.symbol}</strong> has matured and your wallet has been credited.
                          </p>

                          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
                            <tr>
                              <td style="width:50%;padding:10px;">
                                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                                  <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:700;">Invested Amount</p>
                                  <p style="margin:8px 0 0;color:#0f172a;font-size:22px;font-weight:800;">$${Number(payment.amount || 0).toLocaleString()}</p>
                                </div>
                              </td>
                              <td style="width:50%;padding:10px;">
                                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                                  <p style="margin:0;color:#15803d;font-size:12px;text-transform:uppercase;font-weight:700;">Profit Earned</p>
                                  <p style="margin:8px 0 0;color:#15803d;font-size:22px;font-weight:800;">$${Number(computed.profit || 0).toLocaleString()}</p>
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td style="width:50%;padding:10px;">
                                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;">
                                  <p style="margin:0;color:#9a3412;font-size:12px;text-transform:uppercase;font-weight:700;">Wallet Credit</p>
                                  <p style="margin:8px 0 0;color:#A72703;font-size:22px;font-weight:800;">$${Number(computed.returns || 0).toLocaleString()}</p>
                                </div>
                              </td>
                              <td style="width:50%;padding:10px;">
                                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;">
                                  <p style="margin:0;color:#1d4ed8;font-size:12px;text-transform:uppercase;font-weight:700;">Duration</p>
                                  <p style="margin:8px 0 0;color:#1e293b;font-size:22px;font-weight:800;">
                                    ${
                                      payment.durationValue &&
                                      payment.durationUnit
                                        ? `${payment.durationValue} ${payment.durationUnit}`
                                        : `${payment.durationDays || 0} days`
                                    }
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin:0 0 24px;">
                            <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:700;">Investment Summary</p>
                            <p style="margin:0;color:#475569;font-size:14px;line-height:1.8;">
                              Profit rule: <strong>30% every 2 days</strong><br/>
                              Profit cycles: <strong>${computed.twoDayCycles || 0}</strong><br/>
                              Total duration: <strong>${payment.durationDays || 0} days</strong><br/>
                              Completed on: <strong>${new Date().toLocaleString()}</strong>
                            </p>
                          </div>

                          <div style="text-align:center;margin:28px 0;">
                            <a href="${dashboardUrl}"
                              style="display:inline-block;background:#A72703;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:15px;font-weight:700;">
                              View Dashboard
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
      } catch (emailErr) {
        console.error("Failed to send matured email:", emailErr);
      }
    }

    const walletData = await recalculateWalletBalance(userId);

    const user = await User.findById(userId).select(
      "walletBalance firstName lastName email"
    );

    user.walletBalance = walletData.walletBalance;
    await user.save();

    const payments = await Payment.find({ user: userId }).sort({
      createdAt: -1,
    });

    const deposits = walletData.deposits;
    const withdrawals = walletData.withdrawals;

    const totalDeposits = walletData.totalDeposits;
    const totalWithdrawals = walletData.totalWithdrawals;

    const pendingInvestments = payments.filter(
      (p) => p.status === "pending"
    ).length;

    const activeInvestments = payments.filter(
      (p) => p.status === "approved"
    ).length;

    const completedInvestments = payments.filter(
      (p) => p.status === "completed"
    ).length;

    const totalInvested = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const totalReturns = payments.reduce((sum, p) => {
      const computed = getComputedPaymentValues(p);
      return sum + Number(computed.returns || 0);
    }, 0);

    const totalProfit = payments.reduce((sum, p) => {
      const computed = getComputedPaymentValues(p);
      return sum + Number(computed.profit || 0);
    }, 0);

    const nowMs = Date.now();

    const paymentsWithTimes = payments.map((p) => {
      let timeLeft = null;

      if (p.status === "approved" && p.completedAt) {
        timeLeft = Math.max(
          0,
          Math.floor((new Date(p.completedAt).getTime() - nowMs) / 1000)
        );
      }

      const computed = getComputedPaymentValues(p);

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
        returns: computed.returns,
        profit: computed.profit,
        durationValue: p.durationValue,
        durationUnit: p.durationUnit,
        durationDays: p.durationDays,
        twoDayCycles: computed.twoDayCycles,
        createdAt: p.createdAt,
        timeLeft,
      };
    });

    res.json({
      user,
      walletBalance: user.walletBalance || 0,
      totalDeposits,
      totalWithdrawals,
      totalInvested,
      totalReturns,
      totalProfit,
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