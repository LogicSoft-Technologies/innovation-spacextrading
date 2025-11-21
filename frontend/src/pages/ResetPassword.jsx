import React, { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineLockClosed } from "react-icons/hi";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("Please enter a new password");
    setLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      toast.success("Password reset successfully!");
      navigate("/sign-in");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">Reset Password</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Enter a strong new password for your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
