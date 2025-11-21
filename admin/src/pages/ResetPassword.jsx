import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminResetPassword } from "../Services/adminAuthServices";
import { HiEye, HiEyeOff } from "react-icons/hi";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Reset Password | Admin";
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");

    try {
      await adminResetPassword(token, password);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form onSubmit={handleReset} className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-[#A72703] mb-4">Reset Password</h1>
        {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
        {message && <p className="text-green-600 mb-2 text-center">{message}</p>}

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A72703]"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#A72703] text-white rounded-xl hover:bg-[#901f02] transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
