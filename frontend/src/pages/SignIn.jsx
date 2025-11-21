import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.unverified) {
        toast.info("Please verify your email first.");
        navigate("/verify-email", { state: { email: formData.email } });
        return;
      }
      if (res.success && res.token && res.user) {
        localStorage.setItem("userToken", res.token);
        setUser({ ...res.user, token: res.token });
        toast.success("Login successful!");
        navigate("/");
        return;
      }
      setError(res.message || "Login failed");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-[#FFEFE6] via-white to-[#FFEFE6] rounded-3xl shadow-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold text-center text-[#A72703] mb-2">
          Login
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Don’t have an account?{" "}
          <Link
            to="/sign-up"
            className="text-[#A72703] font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <HiOutlineMail className="absolute left-5 top-4 text-gray-400" />
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
            <HiOutlineLockClosed className="absolute left-5 top-4 text-gray-400" />
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

          <div className="flex justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-[#A72703] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#A72703] text-white font-semibold rounded-3xl hover:bg-[#901f02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
