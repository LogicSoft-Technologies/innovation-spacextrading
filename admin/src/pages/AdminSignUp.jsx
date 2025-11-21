import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { adminSignup } from "../Services/adminAuthServices";

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
  { regex: /[!@#$%^&*]/, label: "One special character (!@#$%^&*)" },
];

const AdminSignup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allRequirementsMet = passwordRequirements.every(req => req.regex.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!allRequirementsMet || !passwordsMatch) return;

    setLoading(true);
    setError("");

    try {
      const res = await adminSignup(firstName, lastName, email, password);
      localStorage.setItem("adminToken", res.token);
      res.verified ? navigate("/admin") : navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">Admin Sign Up</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Create your administrator account securely.
        </p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Stack first and last name */}
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            required
            autoComplete="given-name"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            required
            autoComplete="family-name"
          />

          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
              required
              autoComplete="email"
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

          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-3 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showConfirm ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>

          <ul className="mb-4 text-xs space-y-1">
            {passwordRequirements.map((req, idx) => {
              const valid = req.regex.test(password);
              return (
                <li key={idx} className={`flex items-center ${valid ? "text-green-600" : "text-gray-400"}`}>
                  {valid ? <HiCheckCircle className="mr-1" /> : <HiXCircle className="mr-1" />} {req.label}
                </li>
              );
            })}
            <li className={`flex items-center ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
              {passwordsMatch ? <HiCheckCircle className="mr-1" /> : <HiXCircle className="mr-1" />} Passwords match
            </li>
          </ul>

          <button
            type="submit"
            disabled={loading || !allRequirementsMet || !passwordsMatch}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
