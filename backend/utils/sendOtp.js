import crypto from "crypto";

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const otpExpiresIn = () => {
  // expires in 15 minutes
  return Date.now() + 15 * 60 * 1000;
};
