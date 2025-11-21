import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendVerificationCode, verifyAdminCode } from "../Services/adminAuthServices";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resending code
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendEmail = async () => {
    if (!email) return setError("Please enter your email.");
    setLoading(true); setError(""); setMessage("");
    try {
      await sendVerificationCode(email);
      setMessage("Verification email sent! Check your inbox.");
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return setError("Enter verification code.");
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await verifyAdminCode(email, code);
      localStorage.setItem("adminToken", res.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold text-[#A72703] mb-2">Verify Your Email</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and the code sent to verify your account.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            disabled={resendTimer > 0}
            autoComplete="email"
          />

          <button
            onClick={handleSendEmail}
            disabled={loading || resendTimer > 0}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : email ? "Send Verification Code" : "Enter Email"}
          </button>

          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
          />

          <button
            onClick={handleVerifyCode}
            disabled={loading}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
