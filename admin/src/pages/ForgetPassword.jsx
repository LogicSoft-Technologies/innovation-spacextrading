import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminForgotPassword } from "../Services/adminAuthServices";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Forgot Password | Admin"; }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      await adminForgotPassword(email);
      setMessage("Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">Forgot Password</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Enter your email to receive a reset link.</p>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4 text-sm">{message}</p>}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            required
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p
          className="mt-4 text-center text-gray-500 text-sm cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Remember your password? Login
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
