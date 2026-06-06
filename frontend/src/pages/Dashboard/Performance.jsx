import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Activity,
  Shield,
  Loader,
  Target,
  Wallet,
  Timer,
  BarChart3,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { userGetDashboardData } from "../../Services/authServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getComputedInvestment = (payment) => {
  const amount = Number(payment.amount || 0);
  const durationDays = Number(payment.durationDays || 0);
  const cycles = Math.floor(durationDays / 2);

  const profit =
    durationDays > 0 ? amount * 0.3 * cycles : Number(payment.profit || 0);

  const finalReturn =
    durationDays > 0 ? amount + profit : Number(payment.returns || 0);

  return { amount, profit, finalReturn, cycles };
};

const Performance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timersRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await userGetDashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

        if (mustRefetch) fetchData();

        return { ...prev, payments: updatedPayments };
      });
    }, 1000);

    return () => clearInterval(timersRef.current);
  }, []);

  const portfolio = useMemo(() => {
    const payments = data?.payments || [];

    return payments.reduce(
      (acc, payment) => {
        const computed = getComputedInvestment(payment);

        acc.totalInvested += computed.amount;
        acc.totalProfit += computed.profit;
        acc.totalReturn += computed.finalReturn;

        if (payment.status === "approved") acc.active += 1;
        if (payment.status === "completed") acc.completed += 1;

        return acc;
      },
      {
        totalInvested: 0,
        totalProfit: 0,
        totalReturn: 0,
        active: 0,
        completed: 0,
      }
    );
  }, [data]);

  const growthRate =
    portfolio.totalInvested > 0
      ? ((portfolio.totalProfit / portfolio.totalInvested) * 100).toFixed(1)
      : "0.0";

  const metrics = [
    {
      title: "Projected Profit",
      value: formatCurrency(portfolio.totalProfit),
      caption: "30% every 2 days",
      icon: TrendingUp,
      color: "#16A34A",
    },
    {
      title: "Projected Return",
      value: formatCurrency(portfolio.totalReturn),
      caption: "Principal plus profit",
      icon: Target,
      color: "#A72703",
    },
    {
      title: "Growth Rate",
      value: `${growthRate}%`,
      caption: "Based on active portfolio",
      icon: Activity,
      color: "#1D4ED8",
    },
    {
      title: "Active Plans",
      value: portfolio.active,
      caption: `${portfolio.completed} completed`,
      icon: Timer,
      color: "#EAB308",
    },
  ];

  const growthData = useMemo(() => {
    const months = [
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

    (data?.payments || []).forEach((payment) => {
      const date = new Date(payment.createdAt);
      if (!isNaN(date)) {
        const computed = getComputedInvestment(payment);
        monthlyInvested[date.getMonth()] += computed.amount;
        monthlyProfit[date.getMonth()] += computed.profit;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Invested",
          data: monthlyInvested,
          borderColor: "#A72703",
          backgroundColor: "rgba(167,39,3,0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
        {
          label: "Projected Profit",
          data: monthlyProfit,
          borderColor: "#16A34A",
          backgroundColor: "rgba(22,163,74,0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [data]);

  const performanceData = useMemo(() => {
    const agg = {};

    (data?.payments || []).forEach((payment) => {
      const symbol = payment.symbol || "Unknown";
      const computed = getComputedInvestment(payment);

      if (!agg[symbol]) agg[symbol] = 0;
      agg[symbol] += computed.profit;
    });

    return {
      labels: Object.keys(agg),
      datasets: [
        {
          label: "Projected Profit",
          data: Object.values(agg),
          backgroundColor: ["#A72703", "#1D4ED8", "#16A34A", "#EAB308"],
          borderRadius: 8,
        },
      ],
    };
  }, [data]);

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `$${value.toLocaleString()}` },
        grid: { color: "#e5e7eb" },
      },
      x: { grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `$${value.toLocaleString()}` },
        grid: { color: "#e5e7eb" },
      },
      x: { grid: { display: false } },
    },
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
    <div className="min-h-screen bg-[#f6f7f9] p-5 md:p-8 space-y-8 font-[Inter]">
      <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
              Performance intelligence
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
              Portfolio Performance
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Review projected profit, asset performance, active maturity plans,
              and total portfolio return using the current 30% every 2 days rule.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-400">Return Rule</p>
            <p className="text-lg font-semibold text-green-400">
              30% every 2 days
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  {metric.title}
                </p>
                <p
                  className="mt-2 text-xl font-semibold"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{metric.caption}</p>
              </div>

              <div
                className="rounded-xl p-3"
                style={{
                  color: metric.color,
                  backgroundColor: `${metric.color}15`,
                }}
              >
                <metric.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                Growth Trend
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Invested capital compared with projected profit.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#A72703]" />
          </div>
          <Line data={growthData} options={lineOptions} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                Asset Profit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Profit distribution by symbol.
              </p>
            </div>
            <Wallet className="w-5 h-5 text-[#A72703]" />
          </div>
          <Bar data={performanceData} options={barOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Portfolio Insight
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your portfolio performance is calculated from each investment
              duration using the current return model. Final returns include the
              original principal plus projected profit, so older stored 10x
              values will not affect this view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;