// VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import api from "../../config/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get token from query or email from state
  const token = searchParams.get("token");
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(token ? "Verifying email..." : "");
  const [loading, setLoading] = useState(false);

  // Auto-verify if token exists in URL
  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        await api.post("/api/user/auth/verify-email", { token });
        setMessage("Email verified successfully! Redirecting to sign-in...");
        setTimeout(() => navigate("/sign-in"), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };
    if (token) verify();
  }, [token, navigate]);

  // Manual verification if user enters OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !code) return setMessage("Enter email and verification code.");

    try {
      setLoading(true);
      await api.post("/api/user/auth/verify-email", { email, code });
      setMessage("Email verified successfully! Redirecting to sign-in...");
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-extrabold text-[#A72703] mb-4">Email Verification</h2>
        <p className="mb-4">{message}</p>

        {!token && (
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <input
              type="text"
              placeholder="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
