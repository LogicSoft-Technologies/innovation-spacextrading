// pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, User, Menu } from "lucide-react";
import { adminGetProfile } from "../Services/adminAuthServices";

const AdminDashboard = ({ setRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [openProfileCard, setOpenProfileCard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileCardRef = useRef(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await adminGetProfile();
        setAdmin(res.admin);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    };
    fetchAdmin();

    const handleClickOutside = (e) => {
      if (profileCardRef.current && !profileCardRef.current.contains(e.target)) {
        setOpenProfileCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setRole(null);
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen font-[Inter]">
      {/* Mobile Hamburger Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-black to-[#A72703] text-white flex flex-col justify-between z-40 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          {/* Admin Info */}
          <div
            className="flex items-center gap-3 px-6 py-6 border-b border-gray-700 cursor-pointer relative"
            onClick={() => setOpenProfileCard(!openProfileCard)}
          >
            {admin?.profilePhoto ? (
              <img
                src={admin.profilePhoto}
                alt="Admin"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <User className="w-12 h-12 text-white opacity-80" />
            )}
            <div>
              <p className="text-sm text-gray-300">Welcome,</p>
              <p className="font-semibold text-lg">
                {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
              </p>
            </div>

            {openProfileCard && (
              <div
                ref={profileCardRef}
                className="absolute top-20 left-6 w-64 bg-white rounded-xl text-gray-600 shadow-lg p-4 z-50"
              >
                <p className="font-semibold text-center">Admin Profile</p>
                <p className="mt-2 text-sm">{admin?.email}</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="mt-10 space-y-4 px-4">
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
                    isActive ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="p-4 border-t border-gray-700 flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-6 bg-gray-50 ml-0 md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
