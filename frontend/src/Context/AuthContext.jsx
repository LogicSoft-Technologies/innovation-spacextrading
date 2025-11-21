// frontend/Context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import {
  userSignup,
  userLogin,
  userVerifyEmail,
  userUpdateProfile,
} from "../Services/authServices";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, read user and token from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("userToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Signup
  const signup = async (firstName, lastName, email, password) => {
    const res = await userSignup(firstName, lastName, email, password);

    localStorage.setItem("userToken", res.token);
    const tempUser = { email, verified: res.verified };
    setUser(tempUser);
    localStorage.setItem("user", JSON.stringify(tempUser));

    return res;
  };

  // Login
  const login = async (email, password) => {
    const res = await userLogin(email, password);
    if (!res.verified) return { unverified: true, email };

    localStorage.setItem("userToken", res.token);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user));

    return { success: true, token: res.token, user: res.user };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    setUser(null);
  };

  // Verify Email
  const verifyEmail = async (email, code) => {
    const res = await userVerifyEmail(email, code);
    localStorage.setItem("userToken", res.token);

    const updatedUser = { ...user, verified: true };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return res;
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const updatedUser = await userUpdateProfile(profileData);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signup,
        login,
        logout,
        verifyEmail,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
