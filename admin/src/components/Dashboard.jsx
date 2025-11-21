import React, { useEffect, useState } from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, Timer, Loader } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";
import { adminGetDashboardData, adminGetUsers } from "../Services/adminAuthServices";
import api from "../config/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailData, setEmailData] = useState({ userId: "", subject: "", text: "", file: null });
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

  const handleEmailChange = (e) => setEmailData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setEmailData((prev) => ({ ...prev, file: e.target.files[0] }));

  const sendEmail = async () => {
    if (!emailData.userId || !emailData.subject || !emailData.text) return setEmailError("Please fill in all required fields");
    setSendingEmail(true); setEmailError(""); setEmailSuccess("");
    try {
      const formData = new FormData();
      formData.append("userId", emailData.userId);
      formData.append("subject", emailData.subject);
      formData.append("text", emailData.text);
      if (emailData.file) formData.append("image", emailData.file);

      const token = localStorage.getItem("adminToken");
      const res = await api.post("/send-email", formData, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        setEmailSuccess("Email sent successfully!");
        setEmailData({ userId: "", subject: "", text: "", file: null });
      } else setEmailError(res.data.message || "Failed to send email");
    } catch (err) {
      console.error(err);
      setEmailError(err.response?.data?.message || "Failed to send email");
    } finally { setSendingEmail(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin w-10 h-10 text-gray-500" /></div>;
  if (error) return <div className="text-red-500 text-center py-10 text-lg font-medium">{error}</div>;

  const metrics = [
    { title: "Total Users", value: data?.totalUsers ?? 0, icon: Wallet, color: "#A72703" },
    { title: "Pending Deposits", value: data?.pendingDeposits ?? 0, icon: ArrowDownCircle, color: "#1D4ED8" },
    { title: "Pending Withdrawals", value: data?.pendingWithdrawals ?? 0, icon: ArrowUpCircle, color: "#EAB308" },
    { title: "Pending Investments", value: data?.pendingPayments ?? 0, icon: TrendingUp, color: "#16A34A" },
  ];

  const pieData = {
    labels: ["Deposits", "Withdrawals", "Investments"],
    datasets: [{ data: [data?.pendingDeposits ?? 0, data?.pendingWithdrawals ?? 0, data?.pendingPayments ?? 0], backgroundColor: ["#1D4ED8", "#EAB308", "#16A34A"], borderWidth: 1 }],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: { callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a,b)=>a+b,0); const val = ctx.raw; return `${ctx.label}: ${val} (${total ? ((val/total)*100).toFixed(1) : 0}%)`; } } }
    },
  };

  const lineChartData = { labels: data?.userGrowth?.map((u)=>u.month)||[], datasets:[{ label:"Total Users", data:data?.userGrowth?.map((u)=>u.count)||[], borderColor:"#A72703", backgroundColor:"rgba(167,39,3,0.1)", tension:0.35, pointRadius:3, fill:true }]};
  const lineOptions = { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, grid:{color:"#f2f2f2"}}, x:{grid:{color:"#fafafa"}}}};

  return (
    <div className="p-4 md:p-8 font-[Inter] space-y-10 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Overview of users, deposits, withdrawals, and investments.</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Real-time metrics</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m,i)=>(
          <div key={i} className="bg-white flex items-center gap-4 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="p-3 rounded-xl" style={{backgroundColor:`${m.color}15`, color:m.color}}><m.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{m.title}</p>
              <p className="text-gray-800 font-semibold text-lg">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-semibold text-gray-800 text-sm mb-8">Pending Requests Breakdown</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">User Growth Trend</h3>
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* Email Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 space-y-5 transition-all duration-300">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Send Email to User</h3>
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        {emailSuccess && <p className="text-green-500 text-sm">{emailSuccess}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select name="userId" value={emailData.userId} onChange={handleEmailChange} className="border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition">
            <option value="">Select User</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
          </select>
          <input type="text" name="subject" placeholder="Subject" value={emailData.subject} onChange={handleEmailChange} className="border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition" />
        </div>

        <textarea name="text" placeholder="Compose your message..." value={emailData.text} onChange={handleEmailChange} className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-2 transition" rows={5} />
        <input type="file" onChange={handleFileChange} className="border border-gray-200 rounded-2xl p-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full" />
        <button onClick={sendEmail} disabled={sendingEmail} className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition w-full sm:w-auto">
          {sendingEmail ? "Sending..." : "Send Email"}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
