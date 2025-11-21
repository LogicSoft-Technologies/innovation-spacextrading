// deposit controller
import Deposit from "../models/Deposit.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";

// User submits deposit
export const createDeposit = async (req, res) => {
  const { amount, method } = req.body;
  const receipt = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const deposit = await Deposit.create({
      user: req.user._id,
      amount,
      method,
      receipt,
    });

    // Notify admin
    const emailData = {
      to: process.env.ADMIN_EMAIL,
      subject: "New Deposit Request",
      text: `User ${req.user.firstName} ${req.user.lastName} deposited $${amount}. Please review.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Deposit Request</title>
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
                      <p>User <b>${req.user.firstName} ${req.user.lastName}</b> has submitted a deposit of <b>$${amount}</b>. Please review and take action.</p>
                      ${receipt ? `<p>Deposit Receipt:</p><img src="cid:receiptImage" style="max-width:100%;border-radius:8px;margin-top:10px;" />` : ""}
                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://innovationspacextrading.com/admin/deposits" 
                           style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                          View Deposits
                        </a>
                      </div>
                      <p style="color:#666;font-size:14px;margin-top:30px;">
                        If you did not expect this email, please contact support immediately.
                      </p>
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
      attachments: []
    };

    // Attach receipt if it exists
    if (receipt) {
      emailData.attachments.push({
        filename: req.file.originalname,
        path: req.file.path,
        cid: 'receiptImage' 
      });
    }

    await sendEmail(emailData);

    res.status(201).json({ message: "Deposit request submitted", deposit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves deposit
export const approveDeposit = async (req, res) => {
  const { depositId } = req.params;

  try {
    const deposit = await Deposit.findById(depositId).populate("user");
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });
    if (deposit.status !== "pending") return res.status(400).json({ message: "Deposit already processed" });

    deposit.status = "approved";
    await deposit.save();

    // Update user wallet
    const user = await User.findById(deposit.user._id);
    user.walletBalance += deposit.amount;
    await user.save();

    // Notify user
    await sendEmail({
      to: user.email,
      subject: "Deposit Approved",
      text: `Your deposit of $${deposit.amount} has been approved and credited to your wallet.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Deposit Approved</title>
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
                      <p>Your deposit of <b>$${deposit.amount}</b> has been <span style="color:#A72703;font-weight:bold;">approved</span> and credited to your wallet.</p>
                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://innovationspacextrading.com/dashboard" 
                           style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                          View Wallet
                        </a>
                      </div>
                      <p style="color:#666;font-size:14px;margin-top:30px;">
                        If you did not expect this email, please contact support immediately.
                      </p>
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

    res.json({ message: "Deposit approved", deposit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin rejects deposit
export const rejectDeposit = async (req, res) => {
  const { depositId } = req.params;

  try {
    const deposit = await Deposit.findById(depositId).populate("user");
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    deposit.status = "rejected";
    await deposit.save();

    // Notify user
    await sendEmail({
      to: deposit.user.email,
      subject: "Deposit Rejected",
      text: `Your deposit of $${deposit.amount} has been rejected.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Deposit Rejected</title>
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
                      <p>Hi <b>${deposit.user.firstName}</b>,</p>
                      <p>Your deposit of <b>$${deposit.amount}</b> has been <span style="color:#A72703;font-weight:bold;">rejected</span>.</p>
                      <p style="color:#666;font-size:14px;">If you believe this is an error, please contact support immediately.</p>
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

    res.json({ message: "Deposit rejected", deposit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all deposits (admin)
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("user", "firstName lastName email");
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
