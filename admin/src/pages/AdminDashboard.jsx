// pages/AdminDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
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
    <div className="flex h-screen bg-[#f6f7f9] font-[Inter]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col justify-between border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="border-b border-white/10 p-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A72703]">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Innovation SpaceX</p>
                <p className="text-xs text-slate-400">Admin Console</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenProfileCard(!openProfileCard)}
              className="relative flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
            >
              {admin?.profilePhoto ? (
                <img
                  src={admin.profilePhoto}
                  alt="Admin"
                  className="h-12 w-12 rounded-xl border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="truncate text-sm font-semibold">
                  {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
                </p>
              </div>

              {openProfileCard && (
                <div
                  ref={profileCardRef}
                  className="absolute left-4 top-20 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-xl"
                >
                  <p className="font-semibold text-slate-950">Admin Profile</p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {admin?.email}
                  </p>
                </div>
              )}
            </button>
          </div>

          <nav className="space-y-2 p-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#A72703] text-white shadow-lg shadow-[#A72703]/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="h-screen flex-1 overflow-y-auto bg-[#f6f7f9] p-4 pt-16 transition-all md:ml-72 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;