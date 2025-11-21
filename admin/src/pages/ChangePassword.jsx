import React, { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { adminChangePassword } from "../Services/adminAuthServices";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      await adminChangePassword(currentPassword, newPassword);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div 
        className="w-full max-w-md p-6 rounded-2xl shadow-2xl text-white"
        style={{ background: "linear-gradient(135deg, #A72703 0%, #7C1B01 100%)" }}
      >
        <h1 className="text-2xl font-bold text-center mb-2">Change Password</h1>
        {error && <p className="text-red-200 text-center text-sm mb-2">{error}</p>}
        {message && <p className="text-green-200 text-center text-sm mb-2">{message}</p>}

        <form onSubmit={handleChangePassword} className="space-y-3 text-black">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFEFE6] text-sm"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFEFE6] text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-[#A72703] font-semibold rounded-lg hover:bg-[#FFEFE6] hover:text-[#7C1B01] transition-all text-sm"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
