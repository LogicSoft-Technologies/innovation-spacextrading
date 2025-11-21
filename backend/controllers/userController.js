// user controller 
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import fs from "fs"
import path from "path";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -------------------- USER AUTH -------------------- //

// Signup
export const userSignup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const verificationCode = crypto.randomInt(100000, 999999).toString();

  const user = await User.create({ firstName, lastName, email, password, verificationCode });

  // Send verification email with HTML design
  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    text: `Your verification code is ${verificationCode}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
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
                    <p>Hi <b>${firstName}</b>,</p>
                    <p>Welcome! Please use the verification code below to verify your email address:</p>
                    <h2 style="text-align:center;background:#FFEFE6;color:#A72703;padding:12px 0;border-radius:6px;">${verificationCode}</h2>
                    <p style="color:#666;font-size:14px;margin-top:20px;">
                      If you did not request this, please ignore this email.
                    </p>
                    <div style="text-align:center;margin-top:20px;">
                      <a href="${process.env.FRONTEND_URL}" 
                         style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                        Go to Website
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

  const token = generateToken(user._id);
  res.status(201).json({ token, verified: false, email });
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verified) return res.status(400).json({ message: "User already verified" });
  if (user.verificationCode !== code) return res.status(400).json({ message: "Invalid code" });

  user.verified = true;
  user.verificationCode = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.json({ token, message: "Email verified successfully" });
};

// Resend Verification Code
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verified) return res.status(400).json({ message: "User already verified" });

  const code = crypto.randomInt(100000, 999999).toString();
  user.verificationCode = code;
  await user.save();

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    text: `Your verification code is ${code}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Email</title></head>
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
                    <p>Your new verification code is:</p>
                    <h2 style="text-align:center;background:#FFEFE6;color:#A72703;padding:12px 0;border-radius:6px;">${code}</h2>
                    <p style="color:#666;font-size:14px;margin-top:20px;">If you did not request this, please ignore this email.</p>
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

  res.json({ message: "Verification code resent" });
};

// Login
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Invalid credentials" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user._id);
  res.json({ token, verified: user.verified, user });
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Password Reset",
    text: `Reset your password: ${resetUrl}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Password Reset</title></head>
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
                    <p>You requested a password reset. Click the button below to reset your password:</p>
                    <div style="text-align:center;margin-top:30px;">
                      <a href="${resetUrl}" 
                         style="background:#A72703;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
                        Reset Password
                      </a>
                    </div>
                    <p style="color:#666;font-size:14px;margin-top:20px;">If you did not request this, please ignore this email.</p>
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

  res.json({ message: "Password reset email sent" });
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);
  res.json({ token: jwtToken, message: "Password reset successfully" });
};

// Change Password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
};

// Get Profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -verificationCode");
  res.json({ user });
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update allowed fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;

    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      walletBalance: user.walletBalance,
      verified: user.verified,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(req.file.originalname);
    const newFilename = `profile-${req.user._id}-${Date.now()}${ext}`;
    const targetPath = path.join("uploads", newFilename);

    fs.renameSync(req.file.path, targetPath);

    const user = await User.findById(req.user._id);
    user.profilePhoto = `/uploads/${newFilename}`;
    await user.save();

    res.json({ message: "Profile photo updated", profilePhoto: user.profilePhoto });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

