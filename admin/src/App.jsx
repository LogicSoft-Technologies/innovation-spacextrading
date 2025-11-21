import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { adminGetProfile, checkAdminExists } from "./Services/adminAuthServices";

// Pages
import AdminSignup from "./pages/AdminSignUp";
import AdminLogin from "./pages/AdminLogin";
import ForgetPassword from "./pages/ForgetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

// Admin Dashboard Pages
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Settings from "./components/Settings";

const App = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(null);

  useEffect(() => {
    const fetchAdminExistence = async () => {
      try {
        const exists = await checkAdminExists();
        setAdminExists(exists);
      } catch (err) {
        console.error("Error checking admin existence:", err);
      }
    };
    fetchAdminExistence();
  }, []);

  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setRole(null);
        setLoading(false);
        return;
      }
      try {
        const res = await adminGetProfile();
        setRole(res.admin.role);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        localStorage.removeItem("adminToken");
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (adminExists !== null) fetchAdmin();
  }, [adminExists]);

  if (loading || adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={adminExists ? <Navigate to="/login" /> : <AdminSignup />}
      />
      <Route
        path="/signup"
        element={adminExists ? <Navigate to="/login" /> : <AdminSignup />}
      />
      <Route
        path="/login"
        element={
          role === "admin" ? <Navigate to="/admin/dashboard" replace/> : <AdminLogin setRole={setRole} />
        }
      />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin protected routes */}
      <Route
        path="/admin"
        element={role === "admin" ? <AdminDashboard setRole={setRole} /> : <Navigate to="/login" replace/>}
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} /> 
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} /> 
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
