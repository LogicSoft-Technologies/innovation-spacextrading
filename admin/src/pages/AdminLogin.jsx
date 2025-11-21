import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { adminLoginService } from "../Services/adminAuthServices";

const AdminLogin = ({ setRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await adminLoginService(email, password);
      localStorage.setItem("adminToken", data.token);
      setRole(data.admin.role);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold text-[#A72703] mb-2">
          Admin Login
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Login to access your administrator account.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
              required
              autoComplete="current-password"
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
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p
            className="mt-4 text-gray-500 text-sm cursor-pointer hover:underline"
            onClick={() => navigate("/forget-password")}
          >
            Forgot your password?
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
