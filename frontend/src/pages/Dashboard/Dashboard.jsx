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
  CalendarDays,
  CircleDollarSign,
  Target,
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

const iconMap = {
  SPACEX: Rocket,
  TESLA: Car,
  TSLA: Car,
  CRYPTO: Coins,
  BITCOIN: Coins,
  ETHEREUM: Coins,
  SOLANA: Coins,
  DOGECOIN: Coins,
  BINANCECOIN: Coins,
  CARDANO: Coins,
  RIPPLE: Coins,
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timersRef = useRef(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await userGetDashboardData();
      setData(res);
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

  const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getInvestmentComputedValues = (payment) => {
    const amount = Number(payment.amount || 0);
    const durationDays = Number(payment.durationDays || 0);
    const cycles = Math.floor(durationDays / 2);

    const profit =
      durationDays > 0 ? amount * 0.3 * cycles : Number(payment.profit || 0);

    const finalReturn =
      durationDays > 0 ? amount + profit : Number(payment.returns || 0);

    return {
      profit,
      finalReturn,
      cycles,
    };
  };

  const formatTime = (seconds) => {
    if (seconds == null) return "--";
    if (seconds <= 0) return "Completed";

    const d = Math.floor(seconds / 86400);
    const h = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");

    return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  const metrics = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Wallet Balance",
        value: formatCurrency(data.walletBalance),
        icon: Wallet,
        color: "#A72703",
      },
      {
        title: "Total Deposits",
        value: formatCurrency(data.totalDeposits),
        icon: ArrowDownCircle,
        color: "#1D4ED8",
      },
      {
        title: "Total Withdrawals",
        value: formatCurrency(data.totalWithdrawals),
        icon: ArrowUpCircle,
        color: "#EAB308",
      },
      {
        title: "Active Investments",
        value: `${data.activeInvestments || 0}`,
        icon: TrendingUp,
        color: "#16A34A",
      },
    ];
  }, [data]);

  const computedPortfolio = useMemo(() => {
    const payments = data?.payments || [];

    return payments.reduce(
      (acc, payment) => {
        const computed = getInvestmentComputedValues(payment);

        acc.totalInvested += Number(payment.amount || 0);
        acc.totalProfit += computed.profit;
        acc.totalProjectedReturns += computed.finalReturn;

        if (payment.status === "completed") {
          acc.completedReturns += computed.finalReturn;
        }

        return acc;
      },
      {
        totalInvested: 0,
        totalProfit: 0,
        totalProjectedReturns: 0,
        completedReturns: 0,
      }
    );
  }, [data]);

  const investmentStats = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Total Invested",
        value: formatCurrency(computedPortfolio.totalInvested),
        icon: CircleDollarSign,
      },
      {
        label: "Projected Returns",
        value: formatCurrency(computedPortfolio.totalProjectedReturns),
        icon: Target,
      },
      {
        label: "Pending",
        value: data.pendingInvestments || 0,
        icon: Timer,
      },
      {
        label: "Completed",
        value: data.completedInvestments || 0,
        icon: CalendarDays,
      },
    ];
  }, [data, computedPortfolio]);

  const investmentsAgg = useMemo(() => {
    if (!data) return [];

    const map = {};

    (data.payments || []).forEach((p) => {
      const key = p.symbol || "Unknown";
      if (!map[key]) map[key] = 0;
      map[key] += p.amount || 0;
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

    const monthlyInvested = Array(12).fill(0);
    const monthlyProfit = Array(12).fill(0);

    (data.payments || []).forEach((p) => {
      const date = new Date(p.createdAt);
      if (!isNaN(date)) {
        const computed = getInvestmentComputedValues(p);
        monthlyInvested[date.getMonth()] += p.amount || 0;
        monthlyProfit[date.getMonth()] += computed.profit;
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: "Invested",
          data: monthlyInvested,
          borderColor: "#A72703",
          backgroundColor: "rgba(167,39,3,0.08)",
          tension: 0.35,
          pointRadius: 3,
          fill: true,
        },
        {
          label: "Projected Profit",
          data: monthlyProfit,
          borderColor: "#16A34A",
          backgroundColor: "rgba(22,163,74,0.08)",
          tension: 0.35,
          pointRadius: 3,
          fill: true,
        },
      ],
    };
  }, [data]);

  const getStatusStyle = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "approved") return "bg-blue-100 text-blue-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin w-10 h-10 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10 text-lg font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 font-[Inter] space-y-8 bg-[#f6f7f9] min-h-screen">
      <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
              Portfolio command center
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold">
              Portfolio Overview
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Monitor wallet activity, investment maturity, projected profit,
              and completed returns.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <Timer className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">30% every 2 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="bg-white flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-slate-200"
          >
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${m.color}15`, color: m.color }}
            >
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">
                {m.title}
              </p>
              <p className="text-slate-900 font-semibold text-lg">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {investmentStats.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {item.value}
              </p>
            </div>
            <item.icon className="w-6 h-6 text-[#A72703]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
              Portfolio Allocation
            </h3>
            <span className="text-slate-400 text-xs">By Symbol</span>
          </div>

          <div className="flex justify-center">
            <div className="w-[230px] sm:w-[270px]">
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
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 14, padding: 12 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
              Investment Trend
            </h3>
            <span className="text-slate-500 text-xs">Invested vs profit</span>
          </div>

          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: true, position: "bottom" } },
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-semibold text-slate-900">Your Investments</h3>
            <p className="text-sm text-slate-500">
              Duration, projected profit, maturity status, and wallet return.
            </p>
          </div>
        </div>

        {(data.payments || []).length === 0 ? (
          <p className="text-slate-500 text-sm">You have no investments yet.</p>
        ) : (
          <div className="grid gap-3">
            {data.payments.map((p) => {
              const symbolKey = String(p.symbol || "").toUpperCase();
              const Icon = iconMap[symbolKey] || Wallet;
              const computed = getInvestmentComputedValues(p);

              return (
                <div
                  key={p._id}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-slate-800 font-semibold">
                        {p.symbol}
                        <span className="text-xs text-slate-500 ml-2">
                          {p.investmentType}
                        </span>
                      </p>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Principal</p>
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(p.amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Profit</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(computed.profit)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Final Return</p>
                          <p className="font-semibold text-[#A72703]">
                            {formatCurrency(computed.finalReturn)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Duration</p>
                          <p className="font-semibold text-slate-900">
                            {p.durationValue && p.durationUnit
                              ? `${p.durationValue} ${p.durationUnit}`
                              : p.durationDays
                              ? `${p.durationDays} days`
                              : "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Rule</p>
                          <p className="font-semibold text-slate-900">
                            30% / 2 days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:text-right flex lg:block items-center justify-between gap-3">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        p.status
                      )}`}
                    >
                      {p.status?.toUpperCase()}
                    </span>

                    {p.status === "approved" &&
                      typeof p.timeLeft === "number" && (
                        <p className="text-xs text-slate-500 mt-2">
                          Matures in{" "}
                          <span className="font-mono font-semibold text-slate-900">
                            {formatTime(p.timeLeft)}
                          </span>
                        </p>
                      )}

                    {p.status === "completed" && (
                      <p className="text-xs text-slate-500 mt-2">
                        Completed{" "}
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleDateString()
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">
          Recent Transactions
        </h3>

        <table className="w-full text-sm border-separate border-spacing-y-2 min-w-[720px]">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Type</th>
              <th className="py-2 px-3 text-right">Amount</th>
              <th className="py-2 px-3 text-right">Status</th>
              <th className="py-2 px-3 text-right">Date</th>
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
                <tr key={i} className="bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-700 text-left rounded-l-xl">
                    {t.type}
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-semibold text-right">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                        t.status
                      )}`}
                    >
                      {t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-sm text-right rounded-r-xl">
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