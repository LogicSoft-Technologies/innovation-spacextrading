// src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import { X, Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { userGetDashboardData } from "../../Services/authServices";

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications from dashboard data
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userGetDashboardData();
      const allNotifications = [
        ...(res.deposits || []).filter(d => d.status === "completed" || d.status === "approved").map(d => ({
          id: d._id,
          type: "Deposit",
          message: `Your deposit of $${d.amount?.toLocaleString()} has been ${d.status}.`,
          time: d.createdAt,
          status: d.status
        })),
        ...(res.withdrawals || []).filter(w => w.status === "completed" || w.status === "approved").map(w => ({
          id: w._id,
          type: "Withdrawal",
          message: `Your withdrawal of $${w.amount?.toLocaleString()} has been ${w.status}.`,
          time: w.createdAt,
          status: w.status
        })),
        ...(res.payments || []).filter(p => p.status === "completed" || p.status === "approved").map(p => ({
          id: p._id,
          type: "Investment",
          message: `Your investment in ${p.symbol} of $${p.amount?.toLocaleString()} has been ${p.status}.`,
          time: p.createdAt,
          status: p.status
        }))
      ]
      .sort((a, b) => new Date(b.time) - new Date(a.time));

      setNotifications(allNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.response?.data?.message || err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "Deposit":
        return <CheckCircle className="text-green-500 w-6 h-6" />;
      case "Withdrawal":
        return <AlertTriangle className="text-yellow-500 w-6 h-6" />;
      case "Investment":
        return <Info className="text-[#A72703] w-6 h-6" />;
      default:
        return <Bell className="text-gray-500 w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Bell className="animate-spin w-10 h-10 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10 text-lg font-medium">{error}</div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto relative animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-[#A72703] transition"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-[#A72703]" />
        <h2 className="text-2xl font-semibold text-[#A72703]">Notifications</h2>
      </div>
      <p className="text-gray-600 mb-6">Stay updated with your account activities.</p>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:bg-gray-50 transition animate-fadeIn"
            >
              {getIcon(n.type)}
              <div>
                <p className="text-sm font-medium">{n.message}</p>
                <span className="text-xs text-gray-400">
                  {n.type} • {n.time ? new Date(n.time).toLocaleString() : "--"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
