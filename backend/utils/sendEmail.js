import nodemailer from "nodemailer";
import "dotenv/config";

const MAIL_HOST = process.env.MAIL_HOST || "smtp.hostinger.com";
const MAIL_PORT = Number(process.env.MAIL_PORT || 465);
const MAIL_SECURE = String(process.env.MAIL_SECURE || "true") === "true";

const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL;
const MANAGEMENT_EMAIL_PASS = process.env.MANAGEMENT_EMAIL_PASS;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Innovation X Trading";

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!to) throw new Error("No recipients defined for sendEmail");

  if (!MANAGEMENT_EMAIL || !MANAGEMENT_EMAIL_PASS) {
    throw new Error("Mailer credentials are missing");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_SECURE,
      auth: {
        user: MANAGEMENT_EMAIL,
        pass: MANAGEMENT_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${MAIL_FROM_NAME}" <${MANAGEMENT_EMAIL}>`,
      replyTo: MANAGEMENT_EMAIL,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};