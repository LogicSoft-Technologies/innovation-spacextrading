// utils/sendEmail.js
import nodemailer from "nodemailer";
import "dotenv/config";

const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL;
const MANAGEMENT_EMAIL_PASS = process.env.MANAGEMENT_EMAIL_PASS;

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!to) throw new Error("No recipients defined for sendEmail");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MANAGEMENT_EMAIL,
        pass: MANAGEMENT_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Innovation Spacex Trading" <${MANAGEMENT_EMAIL}>`,
      to,
      subject,
      text,
      html,
      attachments
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

