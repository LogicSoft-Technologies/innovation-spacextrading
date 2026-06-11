// controllers/adminController.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/user.js";
import Payment from "../models/payment.js";
import Deposit from "../models/Deposit.js";
import Withdrawal from "../models/Withdrawal.js";
import asyncHandler from "express-async-handler";
import path from "path";
import {
  getDurationInDays,
  calculateInvestmentReturns,
} from "../utils/investmentCalculator.js";

/* ---------------- TOKEN GENERATOR ---------------- */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const WITHDRAWAL_INVESTMENT_THRESHOLD = 500000;

const getAdminWithdrawalSnapshot = async (userId) => {
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
    .filter((payment) => ["approved", "completed"].includes(payment.status))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const completedInvestmentReturns = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => {
      const amount = Number(payment.amount || 0);
      const durationDays = Number(payment.durationDays || 0);

      if (durationDays > 0) {
        return sum + calculateInvestmentReturns(amount, durationDays).returns;
      }

      return sum + Number(payment.returns || 0);
    }, 0);

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

/* ---------------- CREATE FIRST ADMIN ---------------- */
export const createFirstAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const { firstName, lastName, email, password } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate verification code once
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false
    });

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${verificationCode}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:#000000; text-align:center; padding:28px;">
                    <h1 style="color:#ffffff; margin:0; font-size:26px;">Innovation SpaceX Trading</h1>
                  </td>
                </tr>
                <tr>
                  <td style="background:#A72703; text-align:center; padding:20px 30px;">
                    <h2 style="color:#ffffff; margin:0; font-size:22px;">Email Verification Required</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
                    <p>Hello <b>${firstName}</b>,</p>
                    <p>Welcome to <b>Innovation SpaceX Trading</b>! To activate your admin account, please use the verification code below:</p>
                    <div style="background:#FFEFE6; padding:22px; border-radius:10px; margin:25px 0; text-align:center;">
                      <p style="font-size:28px; color:#A72703; letter-spacing:4px; font-weight:bold; margin:0;">${verificationCode}</p>
                    </div>
                    <p>Enter this code on the verification page to complete your admin registration.</p>
                    <div style="text-align:center; margin-top:30px;">
                      <a href="https://innovationspacextrading.com/admin/verify" 
                         style="background:#A72703; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-size:16px; display:inline-block;">
                        Verify Email
                      </a>
                    </div>
                    <p style="color:#666; font-size:14px; margin-top:30px;">
                      If you didn’t create this admin account, please contact support immediately.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#000000; text-align:center; padding:18px;">
                    <p style="color:#ffffff; font-size:13px; margin:0;">© ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`
    });

    res.status(201).json({
      message: "Admin created. Please check your email for verification code.",
      admin: { email: admin.email, isVerified: admin.isVerified },
      verified: admin.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- SEND VERIFICATION CODE (RESEND) ---------------- */
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Generate a new code only for resend
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    admin.verificationCode = verificationCode;
    await admin.save();

    await sendEmail({
      to: email,
      subject: "Resend Verification Code",
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Hello <b>${admin.firstName || "Admin"}</b>,</p>
             <p>Your new verification code is:</p>
             <div style="background:#FFEFE6; padding:22px; border-radius:10px; text-align:center;">
               <p style="font-size:28px; color:#A72703; font-weight:bold; margin:0;">${verificationCode}</p>
             </div>
             <p>Enter this code on the verification page to verify your account.</p>`
    });

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- VERIFY EMAIL ---------------- */
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.verificationCode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    admin.isVerified = true;
    admin.verificationCode = undefined;
    await admin.save();

    const token = generateToken(admin._id);
    res.json({ message: "Email successfully verified", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- ADMIN LOGIN ---------------- */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    if (!admin.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(admin._id);
    res.json({
      token,
      admin: {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- FORGOT PASSWORD ---------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Click this link to reset your password: ${resetLink}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background:#000000; text-align:center; padding:28px;">
                    <h1 style="color:#ffffff; margin:0; font-size:26px;">Innovation SpaceX Trading</h1>
                  </td>
                </tr>

                <!-- Banner -->
                <tr>
                  <td style="background:#A72703; text-align:center; padding:20px 30px;">
                    <h2 style="color:#ffffff; margin:0; font-size:22px;">Password Reset Requested</h2>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
                    <p>Hello <b>${admin.firstName || "Admin"}</b>,</p>
                    <p>We received a request to reset your password. Click the button below to reset it. This link will expire in 15 minutes.</p>

                    <div style="text-align:center; margin:30px 0;">
                      <a href="${resetLink}" 
                         style="background:#A72703; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-size:16px; display:inline-block;">
                        Reset Password
                      </a>
                    </div>

                    <p>If you did not request a password reset, please ignore this email or contact support immediately.</p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#000000; text-align:center; padding:18px;">
                    <p style="color:#ffffff; font-size:13px; margin:0;">
                      © ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    });

    res.json({ message: "Password reset link sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- RESET PASSWORD ---------------- */
export const resetPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    const { password } = req.body;
    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- CHANGE PASSWORD (ADMIN) ---------------- */
export const changePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET ADMIN PROFILE ---------------- */
export const getProfile = async (req, res) => {
  try {
    res.json({ admin: req.admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with their pending transactions
export const getAllUsersWithRequests = async (req, res) => {
  try {
    const users = await User.find().select("-password -verificationCode");

    const usersWithRequests = await Promise.all(
      users.map(async (user) => {
        const investments = await Payment.find({ user: user._id }).sort({
          createdAt: -1,
        });

        const deposits = await Deposit.find({ user: user._id }).sort({
          createdAt: -1,
        });

        const withdrawals = await Withdrawal.find({ user: user._id }).sort({
          createdAt: -1,
        });

        const investmentsWithMeta = investments.map((investment) => {
          const durationDays = Number(investment.durationDays || 0);
          const amount = Number(investment.amount || 0);

          let profit = Number(investment.profit || 0);
          let returns = Number(investment.returns || 0);
          let twoDayCycles = Number(investment.twoDayCycles || 0);

          if (durationDays > 0) {
            const computed = calculateInvestmentReturns(amount, durationDays);
            profit = computed.profit;
            returns = computed.returns;
            twoDayCycles = computed.twoDayCycles;
          }

          let timeLeft = null;

          if (investment.status === "approved" && investment.completedAt) {
            timeLeft = Math.max(
              0,
              Math.floor(
                (new Date(investment.completedAt).getTime() - Date.now()) / 1000
              )
            );
          }

          return {
            ...investment.toObject(),
            profit,
            returns,
            twoDayCycles,
            timeLeft,
          };
        });

        return {
          ...user.toObject(),
          investments: investmentsWithMeta,
          deposits,
          withdrawals,
          pendingInvestments: investmentsWithMeta.filter(
            (item) => item.status === "pending"
          ),
          activeInvestments: investmentsWithMeta.filter(
            (item) => item.status === "approved"
          ),
          completedInvestments: investmentsWithMeta.filter(
            (item) => item.status === "completed"
          ),
          pendingDeposits: deposits.filter((item) => item.status === "pending"),
          pendingWithdrawals: withdrawals.filter(
            (item) => item.status === "pending"
          ),
        };
      })
    );

    res.json(usersWithRequests);
  } catch (error) {
    console.error("getAllUsersWithRequests error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const adminDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await Promise.all([
    Payment.deleteMany({ user: userId }),
    Deposit.deleteMany({ user: userId }),
    Withdrawal.deleteMany({ user: userId }),
  ]);

  await User.findByIdAndDelete(userId);

  res.json({
    message: "User and all related records deleted successfully",
    deletedUserId: userId,
  });
});

// Approve a user deposit
export const adminApproveDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;
  const deposit = await Deposit.findById(depositId).populate("user");
  if (!deposit) return res.status(404).json({ message: "Deposit not found" });
  if (deposit.status !== "pending")
    return res.status(400).json({ message: "Already processed" });

  deposit.status = "approved";
  await deposit.save();

  // Credit user wallet
  deposit.user.walletBalance += deposit.amount;
  await deposit.user.save();

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:#000000; padding:28px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:26px;">
          Innovation SpaceX Trading
        </h1>
      </div>

      <!-- Banner -->
      <div style="background:#A72703; padding:20px 30px; text-align:center;">
        <h2 style="color:white; margin:0; font-size:22px; font-weight:600;">Deposit Approved</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <p style="font-size:16px; color:#333;">Hello <b>${
          deposit.user.firstName
        }</b>,</p>

        <p style="font-size:16px; color:#333; line-height:1.6;">
          Your deposit request has been 
          <span style="color:#A72703; font-weight:bold;">successfully approved</span>.
        </p>

        <div style="background:#FFEFE6; padding:20px; border-radius:10px; margin:25px 0;">
          <p style="font-size:16px; margin:0; color:#7C1B01; line-height:1.6;">
            <strong>Amount:</strong> $${deposit.amount}<br/>
            <strong>Status:</strong> Approved<br/>
            <strong>Wallet Updated:</strong> Yes
          </p>
        </div>

        <p style="font-size:16px; color:#333; line-height:1.6;">
          You can now continue trading, investing, or managing your funds within your dashboard.
        </p>

        <div style="text-align:center; margin-top:30px;">
          <a href="https://innovationspacextrading.com/dashboard" 
            style="background:#A72703; color:white; padding:12px 24px; text-decoration:none; 
                   border-radius:8px; font-size:16px; display:inline-block;">
            Go to Dashboard
          </a>
        </div>

        <p style="font-size:14px; color:#666; margin-top:30px;">
          If you did not authorize this transaction, contact our support team immediately.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#000000; padding:18px; text-align:center;">
        <p style="color:#ffffff; font-size:13px; margin:0;">
          © ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;

  await sendEmail({
    to: deposit.user.email,
    subject: "Your Deposit Has Been Approved ✔",
    text: `Hi ${deposit.user.firstName}, your deposit of $${deposit.amount} has been approved.`,
    html,
  });

  res.json({ message: "Deposit approved", deposit });
});

// ---------------- DEPOSIT REJECTED ----------------
export const adminRejectDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;
  const deposit = await Deposit.findById(depositId).populate("user");
  if (!deposit) return res.status(404).json({ message: "Deposit not found" });

  deposit.status = "rejected";
  await deposit.save();

  await sendEmail({
    to: deposit.user.email,
    subject: "Deposit Rejected",
    text: `Hi ${deposit.user.firstName}, your deposit of $${deposit.amount} has been rejected.`,
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
                  <p>If you believe this is an error or have questions, please contact our support team immediately.</p>
                  <p style="margin-top:30px;">Thank you for using <b>Innovation SpaceX Trading</b>.</p>
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
    </html>`
  });

  res.json({ message: "Deposit rejected", deposit });
});

// ---------------- WITHDRAWAL APPROVED ----------------
export const adminApproveWithdrawal = asyncHandler(async (req, res) => {
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

  const snapshot = await getAdminWithdrawalSnapshot(user._id);

  if (snapshot.totalInvested < WITHDRAWAL_INVESTMENT_THRESHOLD) {
    return res.status(403).json({
      message:
        "This user has not invested up to $500,000 and is not eligible for withdrawal approval.",
      rule: "MINIMUM_TOTAL_INVESTED_REQUIRED",
      threshold: WITHDRAWAL_INVESTMENT_THRESHOLD,
      totalInvested: snapshot.totalInvested,
      remainingRequired:
        WITHDRAWAL_INVESTMENT_THRESHOLD - snapshot.totalInvested,
    });
  }

  if (withdrawal.amount > snapshot.walletBalance) {
    return res.status(400).json({
      message: "User has insufficient wallet balance",
      walletBalance: snapshot.walletBalance,
    });
  }

  withdrawal.status = "approved";
  await withdrawal.save();

  const updatedSnapshot = await getAdminWithdrawalSnapshot(user._id);
  user.walletBalance = updatedSnapshot.walletBalance;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Withdrawal Approved",
    text: `Hi ${user.firstName}, your withdrawal of $${withdrawal.amount} has been approved.`,
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
                      Method: <strong>${withdrawal.method}</strong><br/>
                      Total Invested Verified: <strong>$${Number(snapshot.totalInvested).toLocaleString()}</strong>
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
    </html>`,
  });

  res.json({ message: "Withdrawal approved", withdrawal });
});

// ---------------- WITHDRAWAL REJECTED ----------------
export const adminRejectWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params;
  const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");
  if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

  withdrawal.status = "rejected";
  await withdrawal.save();

  await sendEmail({
    to: withdrawal.user.email,
    subject: "Withdrawal Rejected",
    text: `Hi ${withdrawal.user.firstName}, your withdrawal of $${withdrawal.amount} has been rejected.`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Withdrawal Rejected</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.1);">
            <tr><td style="background:#000000;text-align:center;padding:28px;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;">Innovation SpaceX Trading</h1>
            </td></tr>
            <tr><td style="padding:30px;color:#333;font-size:16px;line-height:1.6;">
              <p>Hi <b>${withdrawal.user.firstName}</b>,</p>
              <p>Your withdrawal request of <b>$${withdrawal.amount}</b> has been <span style="color:#A72703;font-weight:bold;">rejected</span>.</p>
              <p>If you have any questions, please contact our support team.</p>
            </td></tr>
            <tr><td style="background:#000000;text-align:center;padding:18px;">
              <p style="color:#ffffff;font-size:13px;margin:0;">© ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`
  });

  res.json({ message: "Withdrawal rejected", withdrawal });
});

// ---------------- INVESTMENT APPROVED ----------------
export const adminApprovePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId).populate("user");

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.status !== "pending") {
    return res.status(400).json({ message: "Already processed" });
  }

  let durationDays = Number(payment.durationDays || 0);

  if ((!durationDays || durationDays <= 0) && payment.durationValue && payment.durationUnit) {
    durationDays = getDurationInDays(payment.durationValue, payment.durationUnit);
    payment.durationDays = durationDays;
  }

  if (!durationDays || durationDays <= 0) {
    return res.status(400).json({
      message: "Investment duration is missing or invalid",
    });
  }

  const { profit, returns, twoDayCycles } = calculateInvestmentReturns(
    payment.amount,
    durationDays
  );

  const approvedAt = new Date();
  const completedAt = new Date(
    approvedAt.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  payment.status = "approved";
  payment.approvedAt = approvedAt;
  payment.completedAt = completedAt;
  payment.durationDays = durationDays;
  payment.twoDayCycles = twoDayCycles;
  payment.profit = profit;
  payment.returns = returns;

  await payment.save();

  const dashboardUrl = `${
    process.env.FRONTEND_URL || "https://innovationspacextrading.com"
  }/dashboard`;

  await sendEmail({
    to: payment.user.email,
    subject: "Your Investment Has Been Approved",
    text: `Hi ${payment.user.firstName}, your investment of $${payment.amount} in ${payment.symbol} has been approved. It will mature after ${durationDays} days. Profit rule: 30% every 2 days. Final return: $${returns}.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Investment Approved</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:36px 12px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                <tr>
                  <td style="background:#0f172a;padding:28px 32px;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                      Investment Approved
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
                      Your investment in <strong>${payment.symbol}</strong> has been approved. Your selected duration is now active and your maturity countdown has started.
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
                            <p style="margin:0;color:#15803d;font-size:12px;text-transform:uppercase;font-weight:700;">Expected Profit</p>
                            <p style="margin:8px 0 0;color:#15803d;font-size:22px;font-weight:800;">$${Number(profit || 0).toLocaleString()}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="width:50%;padding:10px;">
                          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;">
                            <p style="margin:0;color:#9a3412;font-size:12px;text-transform:uppercase;font-weight:700;">Final Return</p>
                            <p style="margin:8px 0 0;color:#A72703;font-size:22px;font-weight:800;">$${Number(returns || 0).toLocaleString()}</p>
                          </div>
                        </td>
                        <td style="width:50%;padding:10px;">
                          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;">
                            <p style="margin:0;color:#1d4ed8;font-size:12px;text-transform:uppercase;font-weight:700;">Duration</p>
                            <p style="margin:8px 0 0;color:#1e293b;font-size:22px;font-weight:800;">
                              ${
                                payment.durationValue && payment.durationUnit
                                  ? `${payment.durationValue} ${payment.durationUnit}`
                                  : `${durationDays} days`
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin:0 0 24px;">
                      <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:700;">Investment Terms</p>
                      <p style="margin:0;color:#475569;font-size:14px;line-height:1.8;">
                        Profit rule: <strong>30% every 2 days</strong><br/>
                        Profit cycles: <strong>${twoDayCycles}</strong><br/>
                        Total duration: <strong>${durationDays} days</strong><br/>
                        Maturity date: <strong>${completedAt.toLocaleString()}</strong>
                      </p>
                    </div>

                    <div style="text-align:center;margin:28px 0;">
                      <a href="${dashboardUrl}"
                        style="display:inline-block;background:#A72703;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:15px;font-weight:700;">
                        View Dashboard
                      </a>
                    </div>

                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                      Once your investment matures, your wallet will be credited with the final return shown above.
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

  res.json({
    message: "Investment approved",
    payment,
  });
});

/* ---------------- GET DASHBOARD DATA ---------------- */
export const getDashboardData = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const pendingDeposits = await Deposit.countDocuments({ status: "pending" });
  const pendingWithdrawals = await Withdrawal.countDocuments({
    status: "pending",
  });
  const pendingPayments = await Payment.countDocuments({ status: "pending" });

  res.json({
    totalUsers,
    pendingDeposits,
    pendingWithdrawals,
    pendingPayments,
  });
});

export const adminSendEmail = asyncHandler(async (req, res) => {
  const { userId, subject, text } = req.body;
  const file = req.file;

  if (!userId || !subject || !text) {
    return res
      .status(400)
      .json({ message: "Please provide user, subject and message" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const emailData = {
    to: user.email,
    subject,
    text,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:#000000; text-align:center; padding:28px;">
                    <h1 style="color:#ffffff; margin:0; font-size:26px;">Innovation SpaceX Trading</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
                    <p>Hi <b>${user.firstName}</b>,</p>
                    <p>${text}</p>
                    <div style="text-align:center; margin-top:30px;">
                      <a href="https://innovationspacextrading.com/dashboard" 
                         style="background:#A72703; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-size:16px; display:inline-block;">
                        Go to Dashboard
                      </a>
                    </div>
                    <p style="color:#666; font-size:14px; margin-top:30px;">
                      If you didn’t expect this email, please contact support immediately.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#000000; text-align:center; padding:18px;">
                    <p style="color:#ffffff; font-size:13px; margin:0;">© ${new Date().getFullYear()} Innovation SpaceX Trading. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  if (file) {
    emailData.attachments = [
      {
        filename: file.originalname,
        path: path.resolve(file.path),
      },
    ];
  }

  await sendEmail(emailData);
  res.json({ message: `Email sent to ${user.email}` });
});