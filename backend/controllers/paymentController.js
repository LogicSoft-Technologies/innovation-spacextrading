// payment controller
import asyncHandler from "express-async-handler";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import path from "path";
import { sendEmail } from "../utils/sendEmail.js";

// Create new payment (user submits investment proof)
export const createPayment = asyncHandler(async (req, res) => {
  const { investmentType, symbol, amount, paymentMethod } = req.body;
  const receiptImage = req.file?.path;

  if (
    !investmentType ||
    !symbol ||
    !amount ||
    !paymentMethod ||
    !receiptImage
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const payment = await Payment.create({
    user: req.user._id,
    investmentType,
    symbol,
    amount,
    paymentMethod,
    receiptImage,
    status: "pending",
  });

  // Email admin with receipt image
  const adminEmailData = {
    to: process.env.ADMIN_EMAIL,
    subject: "New Investment Submitted",
    text: `User ${req.user.firstName} ${req.user.lastName} invested $${amount} in ${symbol} (${investmentType}). Please review and approve.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Investment Submitted</title>
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
                    <p>User <b>${req.user.firstName} ${
      req.user.lastName
    }</b> has submitted an investment of <b>$${amount}</b> in <b>${symbol}</b> (${investmentType}) via ${paymentMethod}. Please review and approve.</p>
                    <p>Receipt Image:</p>
                    <img src="cid:receiptImage" style="max-width:100%;border-radius:8px;margin-top:10px;" />
                    <div style="text-align:center;margin-top:30px;">
                      <a href="https://innovationspacextrading.com/admin/payments" 
                         style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                        Review Investment
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
    attachments: [
      {
        filename: req.file.originalname,
        path: path.resolve(receiptImage),
        cid: "receiptImage",
      },
    ],
  };
  await sendEmail(adminEmailData);

  // Email user confirmation
  await sendEmail({
    to: req.user.email,
    subject: "Investment Submitted",
    text: `Hi ${req.user.firstName}, your investment of $${amount} in ${symbol} has been submitted and is pending approval.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Investment Submitted</title></head>
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
                    <p>Hi <b>${req.user.firstName}</b>,</p>
                    <p>Your investment of <b>$${amount}</b> in <b>${symbol}</b> (${investmentType}) has been submitted and is pending admin approval.</p>
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

  res.status(201).json({
    message: "Payment submitted successfully. Awaiting admin approval.",
  });
});

// Admin approves payment
export const approvePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("user");
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  if (payment.status !== "pending") {
    res.status(400);
    throw new Error("Payment already processed");
  }

  payment.status = "approved";
  payment.approvedAt = new Date();
  payment.completedAt = new Date(
    payment.approvedAt.getTime() + 6 * 60 * 60 * 1000
  );
  payment.returns = payment.amount * 10;
  await payment.save();

  // Email user approval
  await sendEmail({
    to: payment.user.email,
    subject: "Investment Approved",
    text: `Hi ${payment.user.firstName}, your investment of $${payment.amount} in ${payment.symbol} has been approved. The investment will mature in 6 hours.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Investment Approved</title></head>
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
                    <p>Hi <b>${payment.user.firstName}</b>,</p>
                    <p>Your investment of <b>$${payment.amount}</b> in <b>${
      payment.symbol
    }</b> has been approved and will mature in 6 hours.</p>
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

  res.json({ message: "Payment approved successfully", payment });
});

// Investment matured
export const completeInvestment = asyncHandler(async (req, res) => {
  const now = new Date();
  const payments = await Payment.find({
    status: "approved",
    completedAt: { $lte: now },
  }).populate("user");

  for (const payment of payments) {
    if (!payment.user) continue;

    payment.user.walletBalance += payment.returns;
    await payment.user.save();

    payment.status = "completed";
    await payment.save();

    // Notify user
    await sendEmail({
      to: payment.user.email,
      subject: "Investment Matured",
      text: `Congratulations ${payment.user.firstName}, your investment of $${payment.amount} in ${payment.symbol} has matured. Your wallet has been credited with $${payment.returns}.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Investment Matured</title></head>
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
                      <p>Hi <b>${payment.user.firstName}</b>,</p>
                      <p>Congratulations! Your investment of <b>$${
                        payment.amount
                      }</b> in <b>${payment.symbol}</b> has matured.</p>
                      <p>Your wallet has been credited with <b>$${
                        payment.returns
                      }</b>.</p>
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
  }

  res.json({ message: `${payments.length} investments completed.` });
});

// Get user payments
export const getUserPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(payments);
});

// Admin: get all pending payments
export const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "pending" })
    .populate("user")
    .sort({ createdAt: -1 });
  res.json(payments);
});
