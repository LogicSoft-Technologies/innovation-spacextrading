// withdrawal controller
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";

// User requests withdrawal
export const createWithdrawal = async (req, res) => {
  const { amount, method, paymentInfo } = req.body;

  try {
    if (amount > req.user.walletBalance)
      return res.status(400).json({ message: "Insufficient wallet balance" });

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      method,
      paymentInfo,
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "Withdrawal Request",
      text: `User ${req.user.firstName} ${req.user.lastName} requested withdrawal of $${amount}.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Request</title>
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
                      <p>Hi Admin,</p>
                      <p>User <b>${req.user.firstName} ${req.user.lastName}</b> has requested a withdrawal of <b>$${amount}</b> via <b>${method}</b>. Please review and approve/reject.</p>
                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://innovationspacextrading.com/admin/withdrawals" 
                           style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                          Review Withdrawals
                        </a>
                      </div>
                      <p style="color:#666;font-size:14px;margin-top:30px;">If you did not expect this email, please contact support immediately.</p>
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

    res.status(201).json({ message: "Withdrawal request submitted", withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves withdrawal
export const approveWithdrawal = async (req, res) => {
  const { withdrawalId } = req.params;

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ message: "Already processed" });

    const user = await User.findById(withdrawal.user._id);
    if (withdrawal.amount > user.walletBalance)
      return res.status(400).json({ message: "User has insufficient wallet balance" });

    user.walletBalance -= withdrawal.amount;
    await user.save();

    withdrawal.status = "approved";
    await withdrawal.save();

    // Notify user
    await sendEmail({
      to: user.email,
      subject: "Withdrawal Approved",
      text: `Your withdrawal of $${withdrawal.amount} has been approved and processed.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Withdrawal Approved</title></head>
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
                      <p>Your withdrawal request of <b>$${withdrawal.amount}</b> has been approved and processed successfully.</p>
                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://innovationspacextrading.com/dashboard" 
                           style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                          Go to Dashboard
                        </a>
                      </div>
                      <p style="color:#666;font-size:14px;margin-top:30px;">If you did not expect this email, please contact support immediately.</p>
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

    res.json({ message: "Withdrawal approved", withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin rejects withdrawal
export const rejectWithdrawal = async (req, res) => {
  const { withdrawalId } = req.params;

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

    withdrawal.status = "rejected";
    await withdrawal.save();

    // Notify user
    await sendEmail({
      to: withdrawal.user.email,
      subject: "Withdrawal Rejected",
      text: `Your withdrawal of $${withdrawal.amount} has been rejected.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Withdrawal Rejected</title></head>
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
                      <p>Hi <b>${withdrawal.user.firstName}</b>,</p>
                      <p>We’re sorry, but your withdrawal request of <b>$${withdrawal.amount}</b> has been rejected. Please contact support for more information.</p>
                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://innovationspacextrading.com/dashboard" 
                           style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                          Go to Dashboard
                        </a>
                      </div>
                      <p style="color:#666;font-size:14px;margin-top:30px;">If you did not expect this email, please contact support immediately.</p>
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

    res.json({ message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin view all withdrawals
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate("user", "firstName lastName email");
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
