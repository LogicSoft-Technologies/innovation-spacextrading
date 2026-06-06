import React, { useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Timer,
  Loader,
  Mail,
  Send,
  Paperclip,
  Users,
  PieChart,
} from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { adminGetDashboardData, adminGetUsers } from "../Services/adminAuthServices";
import api from "../config/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailData, setEmailData] = useState({
    userId: "",
    subject: "",
    text: "",
    file: null,
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const res = await adminGetDashboardData();
        setData(res);

        const usersRes = await adminGetUsers();
        setUsers(usersRes);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleEmailChange = (e) => {
    setEmailData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setEmailData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const sendEmail = async () => {
    if (!emailData.userId || !emailData.subject || !emailData.text) {
      setEmailError("Please fill in all required fields");
      return;
    }

    setSendingEmail(true);
    setEmailError("");
    setEmailSuccess("");

    try {
      const formData = new FormData();
      formData.append("userId", emailData.userId);
      formData.append("subject", emailData.subject);
      formData.append("text", emailData.text);
      if (emailData.file) formData.append("image", emailData.file);

      const token = localStorage.getItem("adminToken");
      await api.post("/send-email", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmailSuccess("Email sent successfully.");
      setEmailData({ userId: "", subject: "", text: "", file: null });
    } catch (err) {
      console.error(err);
      setEmailError(err.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] justify-center py-20">
        <Loader className="h-10 w-10 animate-spin text-[#A72703]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-lg font-medium text-red-500">
        {error}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Users",
      value: data?.totalUsers ?? 0,
      icon: Wallet,
      color: "#A72703",
      caption: "Registered accounts",
    },
    {
      title: "Pending Deposits",
      value: data?.pendingDeposits ?? 0,
      icon: ArrowDownCircle,
      color: "#1D4ED8",
      caption: "Awaiting approval",
    },
    {
      title: "Pending Withdrawals",
      value: data?.pendingWithdrawals ?? 0,
      icon: ArrowUpCircle,
      color: "#EAB308",
      caption: "Awaiting review",
    },
    {
      title: "Pending Investments",
      value: data?.pendingPayments ?? 0,
      icon: TrendingUp,
      color: "#16A34A",
      caption: "Investment requests",
    },
  ];

  const pieData = {
    labels: ["Deposits", "Withdrawals", "Investments"],
    datasets: [
      {
        data: [
          data?.pendingDeposits ?? 0,
          data?.pendingWithdrawals ?? 0,
          data?.pendingPayments ?? 0,
        ],
        backgroundColor: ["#1D4ED8", "#EAB308", "#16A34A"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const val = ctx.raw;
            return `${ctx.label}: ${val} (${
              total ? ((val / total) * 100).toFixed(1) : 0
            }%)`;
          },
        },
      },
    },
  };

  const lineChartData = {
    labels: data?.userGrowth?.map((u) => u.month) || [],
    datasets: [
      {
        label: "Total Users",
        data: data?.userGrowth?.map((u) => u.count) || [],
        borderColor: "#A72703",
        backgroundColor: "rgba(167,39,3,0.1)",
        tension: 0.35,
        pointRadius: 3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-4 md:p-6 font-[Inter]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin command center
              </p>
              <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                Dashboard Overview
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Monitor users, pending requests, platform activity, and direct communications.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <Timer className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Real-time metrics</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {metric.title}
                  </p>
                  <p
                    className="mt-2 text-2xl font-semibold"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{metric.caption}</p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: `${metric.color}15`,
                    color: metric.color,
                  }}
                >
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                  Pending Breakdown
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Deposits, withdrawals, and investments.
                </p>
              </div>
              <PieChart className="h-5 w-5 text-[#A72703]" />
            </div>
            <Pie data={pieData} options={pieOptions} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                  User Growth Trend
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Monthly platform registration growth.
                </p>
              </div>
              <Users className="h-5 w-5 text-[#A72703]" />
            </div>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Send Email to User
                </h3>
                <p className="text-sm text-slate-500">
                  Compose a direct platform message with optional attachment.
                </p>
              </div>
            </div>
          </div>

          {emailError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {emailError}
            </div>
          )}

          {emailSuccess && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {emailSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              name="userId"
              value={emailData.userId}
              onChange={handleEmailChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={emailData.subject}
              onChange={handleEmailChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
            />
          </div>

          <textarea
            name="text"
            placeholder="Compose your message..."
            value={emailData.text}
            onChange={handleEmailChange}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
            rows={5}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-[#A72703] hover:bg-[#FFF6F2]">
              <Paperclip className="h-4 w-4" />
              {emailData.file ? emailData.file.name : "Attach file"}
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              onClick={sendEmail}
              disabled={sendingEmail}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A72703] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#A72703]/20 hover:bg-[#7C1B01] disabled:bg-slate-300 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;