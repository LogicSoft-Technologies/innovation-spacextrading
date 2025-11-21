import React, { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Password reset link sent to your email!");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Enter your email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
