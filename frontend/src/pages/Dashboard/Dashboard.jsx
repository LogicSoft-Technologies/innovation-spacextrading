// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Rocket,
  Coins,
  Car,
  Timer,
  Loader,
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
import { userGetDashboardData } from "../../Services/authServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const iconMap = { SpaceX: Rocket, Tesla: Car, Crypto: Coins };

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timersRef = useRef(null);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userGetDashboardData();
      const paymentsWithTime = (res.payments || []).map((p) =>
        p.status === "approved" && p.timeLeft == null
          ? { ...p, timeLeft: 6 * 60 * 60 }
          : p
      );
      setData({ ...res, payments: paymentsWithTime });
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);
  useEffect(() => {
    if (data?.payments?.length && !selectedInvestment) {
      setSelectedInvestment(data.payments[0]);
    }
  }, [data, selectedInvestment]);

  // Countdown for approved investments
  useEffect(() => {
    timersRef.current = setInterval(() => {
      setData((prev) => {
        if (!prev) return prev;
        let mustRefetch = false;
        const updatedPayments = (prev.payments || []).map((p) => {
          if (p.status === "approved" && typeof p.timeLeft === "number") {
            const newTime = Math.max(0, p.timeLeft - 1);
            if (newTime === 0 && p.timeLeft > 0) mustRefetch = true;
            return { ...p, timeLeft: newTime };
          }
          return p;
        });
        if (mustRefetch) fetchDashboard();
        return { ...prev, payments: updatedPayments };
      });
    }, 1000);
    return () => clearInterval(timersRef.current);
  }, []);

  const metrics = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Wallet Balance",
        value: `$${(data.walletBalance || 0).toLocaleString()}`,
        icon: Wallet,
        color: "#A72703",
      },
      {
        title: "Total Deposits",
        value: `$${(data.totalDeposits || 0).toLocaleString()}`,
        icon: ArrowDownCircle,
        color: "#1D4ED8",
      },
      {
        title: "Total Withdrawals",
        value: `$${(data.totalWithdrawals || 0).toLocaleString()}`,
        icon: ArrowUpCircle,
        color: "#EAB308",
      },
      {
        title: "Pending Investments",
        value: `${data.pendingInvestments || 0}`,
        icon: TrendingUp,
        color: "#16A34A",
      },
    ];
  }, [data]);

  const investmentsAgg = useMemo(() => {
    if (!data) return [];
    const map = {};
    (data.payments || []).forEach((p) => {
      if (!map[p.symbol]) map[p.symbol] = 0;
      map[p.symbol] += p.amount || 0;
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [data]);

  const lineChartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyTotals = Array(12).fill(0);
    (data.payments || []).forEach((p) => {
      const date = new Date(p.createdAt);
      if (!isNaN(date)) monthlyTotals[date.getMonth()] += p.amount || 0;
    });
    return {
      labels: monthNames,
      datasets: [
        {
          label: "Portfolio Snapshot",
          data: monthlyTotals,
          borderColor: "#A72703",
          backgroundColor: "rgba(167,39,3,0.1)",
          tension: 0.35,
          pointRadius: 3,
          fill: true,
        },
      ],
    };
  }, [data]);

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--:--";
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin w-10 h-10 text-gray-500" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center py-10 text-lg font-medium">
        {error}
      </div>
    );

  return (
    <div className="p-6 md:p-8 font-[Inter] space-y-10 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Portfolio Overview
          </h2>
          <p className="text-gray-500 text-sm">
            Track your investments, deposits, and withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Live updates</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="bg-white flex items-center gap-4 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${m.color}15`, color: m.color }}
            >
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                {m.title}
              </p>
              <p className="text-gray-800 font-semibold text-lg">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Portfolio Allocation Card */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-all hover:shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">
              Portfolio Allocation
            </h3>
            <span className="text-gray-400 text-xs font-medium">By Symbol</span>
          </div>

          {/* Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[200px] sm:w-[240px] md:w-[260px] mb-6 mt-4">
              <Pie
                data={{
                  labels: investmentsAgg.map((i) => i.name),
                  datasets: [
                    {
                      data: investmentsAgg.map((i) => i.value),
                      backgroundColor: [
                        "#A72703",
                        "#1D4ED8",
                        "#FACC15",
                        "#16A34A",
                        "#9333EA",
                        "#F97316",
                      ].slice(0, investmentsAgg.length),
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      hoverOffset: 14,
                    },
                  ],
                }}
                options={{
                  cutout: "45%",
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom",
                      labels: {
                        padding: 12,
                        boxWidth: 18,
                        font: { size: 12, weight: "500" },
                        generateLabels: (chart) =>
                          chart.data.labels.map((label, i) => {
                            const value = chart.data.datasets[0].data[i];
                            const total = chart.data.datasets[0].data.reduce(
                              (a, b) => a + b,
                              0
                            );
                            const percent = ((value / total) * 100).toFixed(1);
                            return {
                              text: `${label}: $${value.toLocaleString()} (${percent}%)`,
                              fillStyle:
                                chart.data.datasets[0].backgroundColor[i],
                              strokeStyle: "#ffffff",
                              lineWidth: 2,
                              hidden: false,
                              index: i,
                            };
                          }),
                      },
                    },
                    tooltip: {
                      padding: 8,
                      bodyFont: { size: 13, weight: "500" },
                      callbacks: {
                        label: (tooltipItem) => {
                          const value = tooltipItem.raw;
                          const total = tooltipItem.dataset.data.reduce(
                            (a, b) => a + b,
                            0
                          );
                          const percent = ((value / total) * 100).toFixed(1);
                          return `${
                            tooltipItem.label
                          }: $${value.toLocaleString()} (${percent}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Total Invested at Bottom */}
          <div className="mt-4 text-center bg-gray-50 rounded-xl py-3 border border-gray-100">
            <span className="text-gray-500 text-xs font-medium tracking-wide block">
              Total Invested
            </span>
            <span className="text-gray-900 font-bold text-lg sm:text-xl">
              ${data.totalInvested?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">
              Portfolio Trend
            </h3>
            <span className="text-gray-500 text-xs">Snapshot</span>
          </div>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (value) => `$${value.toLocaleString()}` },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Active Investments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">
          Your Investments
        </h3>
        {(data.payments || []).length === 0 ? (
          <p className="text-gray-500 text-sm">You have no investments yet.</p>
        ) : (
          <div className="grid gap-3">
            {data.payments.map((p) => {
              const Icon = iconMap[p.symbol] || Wallet;
              return (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">
                        {p.symbol}{" "}
                        <span className="text-xs text-gray-500 ml-2">
                          ({p.investmentType})
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: ${p.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        p.status === "completed"
                          ? "text-green-600"
                          : p.status === "pending"
                          ? "text-yellow-600"
                          : "text-gray-800"
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </p>
                    {p.status === "approved" &&
                      typeof p.timeLeft === "number" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Matures in:{" "}
                          <span className="font-mono">
                            {formatTime(p.timeLeft)}
                          </span>
                        </p>
                      )}
                    {p.status === "completed" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed on:{" "}
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleString()
                          : "--"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm tracking-wide uppercase">
          Recent Transactions
        </h3>

        <table className="w-full text-sm border-separate border-spacing-y-2 table-fixed">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wide">
              <th className="w-1/4 py-2 px-3 text-left">Type</th>
              <th className="w-1/4 py-2 px-3 text-right">Amount</th>
              <th className="w-1/4 py-2 px-3 text-right">Status</th>
              <th className="w-1/4 py-2 px-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...(data.deposits || []).map((d) => ({
                type: "Deposit",
                amount: d.amount,
                status: d.status,
                date: d.createdAt,
              })),
              ...(data.withdrawals || []).map((w) => ({
                type: "Withdrawal",
                amount: w.amount,
                status: w.status,
                date: w.createdAt,
              })),
              ...(data.payments || []).map((p) => ({
                type: "Investment",
                amount: p.amount,
                status: p.status,
                date: p.createdAt,
              })),
            ]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 15)
              .map((t, i) => (
                <tr
                  key={i}
                  className="transition-all hover:shadow-sm bg-gray-50 hover:bg-white rounded-xl"
                >
                  <td className="py-3 px-3 font-medium text-gray-700 text-left">
                    {t.type}
                  </td>
                  <td className="py-3 px-3 text-gray-800 font-semibold text-right">
                    ${(t.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        t.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : t.status === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-sm text-right">
                    {t.date ? new Date(t.date).toLocaleDateString() : "--"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
