import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  HiCheckCircle,
  HiXCircle,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
  { regex: /[@$!%*?&]/, label: "One special character (@$!%*?&)" },
];

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const allRequirementsMet = passwordRequirements.every((req) =>
    req.regex.test(formData.password)
  );
  const passwordsMatch =
    formData.password === formData.confirmPassword && formData.password !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName)
      return setError("Enter both first and last name.");

    if (!allRequirementsMet)
      return setError("Password does not meet security requirements.");
    if (!passwordsMatch) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      localStorage.setItem("verifyEmail", formData.email);
      navigate("/verify-email", { state: { email: formData.email } });
      toast.success("OTP sent to your email. Please verify to continue.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="text-[#A72703] font-medium hover:underline"
          >
            Log In
          </Link>
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-6 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-6 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
          </div>

          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-11 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-11 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-4 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-11 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A72703] bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-4 text-gray-500"
            >
              {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          <ul className="mb-4 text-xs space-y-1">
            {passwordRequirements.map((req, idx) => {
              const valid = req.regex.test(formData.password);
              return (
                <li
                  key={idx}
                  className={`flex items-center ${
                    valid ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {valid ? <HiCheckCircle className="mr-1" /> : <HiXCircle className="mr-1" />}{" "}
                  {req.label}
                </li>
              );
            })}
            <li
              className={`flex items-center ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordsMatch ? <HiCheckCircle className="mr-1" /> : <HiXCircle className="mr-1" />}{" "}
              Passwords match
            </li>
          </ul>

          <button
            type="submit"
            disabled={loading || !allRequirementsMet || !passwordsMatch}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-3xl hover:bg-[#901f02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
