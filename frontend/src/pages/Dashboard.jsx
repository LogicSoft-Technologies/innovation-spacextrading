// frontend/Pages/Dashboard.jsx
import React, { useState, useRef, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Banknote,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Bell,
  ChevronRight,
  User,
  Menu,
  X,
} from "lucide-react";

import Deposit from "./Finance/Deposit";
import Withdrawal from "./Finance/Withdrawal";
import History from "./Finance/History";
import Notifications from "./Finance/Notifications";

import api from "../../config/api";
import { AuthContext } from "../Context/AuthContext";

const Dashboard = () => {
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeFinance, setActiveFinance] = useState(null);
  const [openProfileCard, setOpenProfileCard] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Please select a file!");
    setUploading(true);

    const formData = new FormData();
    formData.append("profilePhoto", selectedFile);

    try {
      const res = await api.post("/api/user/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser((prev) => ({ ...prev, profilePhoto: res.data.profilePhoto }));
      setSelectedFile(null);
      setOpenProfileCard(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const backendURL = import.meta.env.VITE_LOCAL_API || "";
  const profilePhotoUrl = user?.profilePhoto
    ? `${backendURL}${user.profilePhoto}`
    : null;

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Markets", icon: TrendingUp, path: "/dashboard/markets" },
    { name: "Investments", icon: Wallet, path: "/dashboard/investments" },
    { name: "Finance", icon: Banknote, submenu: true },
    { name: "Performance", icon: BarChart3, path: "/dashboard/performance" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  const financeSubmenu = [
    {
      name: "Deposit",
      icon: ArrowDownCircle,
      component: <Deposit onClose={() => setActiveFinance(null)} />,
    },
    { name: "Withdrawal", icon: ArrowUpCircle, component: <Withdrawal /> },
    { name: "History", icon: Clock, component: <History /> },
    { name: "Notifications", icon: Bell, component: <Notifications /> },
  ];

  return (
    <div className="flex bg-gray-50 font-[Inter] relative">

      {/* Mobile Sidebar Toggle (SHIFTED RIGHT) */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 bg-white rounded-full p-2 shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-[#A72703]" />
        ) : (
          <Menu className="w-6 h-6 text-[#A72703]" />
        )}
      </button>

      {/* Sidebar (Reduced Width on Small/Medium) */}
      <aside
        className={`
          fixed top-0 left-0 h-full 
          w-48 sm:w-56 lg:w-64 
          bg-gradient-to-b from-black to-[#A72703] 
          text-white flex flex-col justify-between z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div>
          {/* User Info */}
          <div
            className="flex items-center gap-3 px-6 py-6 border-b border-gray-700 cursor-pointer relative"
            onClick={() => setOpenProfileCard(!openProfileCard)}
          >
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <User className="w-12 h-12 text-white opacity-80" />
            )}

            <div>
              <p className="text-sm text-gray-300">Welcome back,</p>
              <p className="font-semibold text-lg">
                {user ? `${user.firstName} ${user.lastName}` : "Trader"}
              </p>
            </div>

            {openProfileCard && (
              <div className="absolute top-20 left-4 w-56 bg-white rounded-xl text-gray-600 shadow-lg p-4 z-50 lg:left-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="font-semibold text-center">Update Profile Photo</p>

                  <button
                    onClick={() => document.getElementById("profilePhotoInput").click()}
                    className="bg-gradient-to-r from-[#A72703] to-orange-500 text-white px-5 py-2 rounded-full text-sm w-full"
                  >
                    {uploading ? "Uploading..." : "Choose Image"}
                  </button>

                  <input
                    id="profilePhotoInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile && (
                    <button
                      onClick={handleUploadPhoto}
                      className="w-full bg-[#A72703] text-white py-1.5 px-4 rounded text-sm"
                      disabled={uploading}
                    >
                      {uploading ? "Saving..." : "Save Photo"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <nav className="mt-6 space-y-2 px-4">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              if (item.submenu) {
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === index ? null : index)
                      }
                      className={`flex items-center justify-between w-full gap-3 py-3 px-4 rounded-xl transition-all ${
                        openDropdown === index ? "bg-white/20" : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium text-white lg:text-gray-200">
                          {item.name}
                        </span>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === index ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={`lg:absolute lg:left-full lg:top-0 lg:ml-3 lg:bg-white/95 lg:border lg:border-white/10
                        lg:rounded-xl lg:p-4 lg:shadow-lg lg:w-60
                        transition-all overflow-hidden 
                        ${
                          openDropdown === index
                            ? "max-h-[300px] opacity-100 py-2 lg:opacity-100"
                            : "max-h-0 opacity-0 py-0 lg:invisible"
                        }`}
                    >
                      {financeSubmenu.map((sub, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setOpenDropdown(null);
                            setActiveFinance(sub.name.toLowerCase());
                            setSidebarOpen(false);
                          }}
                          className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm 
                          text-white lg:text-black hover:bg-[#FFEFE6]"
                        >
                          <sub.icon className="w-4 h-4 text-[#A72703]" />
                          <span>{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
                    isActive ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium text-white lg:text-gray-200">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div
          onClick={() => navigate("/")}
          className="p-4 border-t border-gray-700 flex items-center gap-3 hover:bg-white/10 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Return to Home</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 h-screen overflow-y-auto bg-gray-50 
          ml-0 lg:ml-64 transition-all`}
      >
        <Outlet />
      </main>

      {/* FINANCE DRAWERS */}
      {activeFinance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full sm:w-[420px] h-full bg-white shadow-2xl border-l border-gray-200 animate-slideInRight overflow-y-auto">
            {activeFinance === "deposit" && (
              <Deposit onClose={() => setActiveFinance(null)} />
            )}
            {activeFinance === "withdrawal" && (
              <Withdrawal onClose={() => setActiveFinance(null)} />
            )}
            {activeFinance === "history" && (
              <History onClose={() => setActiveFinance(null)} />
            )}
            {activeFinance === "notifications" && (
              <Notifications onClose={() => setActiveFinance(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
