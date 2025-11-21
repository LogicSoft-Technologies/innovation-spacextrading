import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Loader,
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

const iconMap = { SpaceX: TrendingUp, Tesla: Activity, Crypto: Shield };

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
      const paymentsWithTime = (res.payments || []).map((p) =>
        p.status === "approved" && p.timeLeft == null
          ? { ...p, timeLeft: 6 * 60 * 60 }
          : p
      );
      setData({ ...res, payments: paymentsWithTime });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        if (mustRefetch) fetchData();
        return { ...prev, payments: updatedPayments };
      });
    }, 1000);
    return () => clearInterval(timersRef.current);
  }, []);

  const metrics = useMemo(() => {
    if (!data) return [];
    const totalInvested = data.payments?.reduce((a, p) => a + (p.amount || 0), 0) || 0;
    const totalProfit = data.payments?.reduce((a, p) => {
      if (p.status === "completed") return a + ((p.amount * (p.roi || 0)) / 100);
      return a;
    }, 0) || 0;

    return [
      {
        title: "Total Profit",
        value: `$${totalProfit.toLocaleString()}`,
        change: totalProfit >= 0 ? "+14.2%" : "-2.1%", // optional: can compute real change
        icon: TrendingUp,
        color: "#16A34A",
      },
      {
        title: "Average Monthly Growth",
        value: `${((totalProfit / totalInvested) * 100).toFixed(1) || 0}%`,
        change: "+2.1%",
        icon: Activity,
        color: "#1D4ED8",
      },
      {
        title: "Risk Index",
        value: "Low (12%)",
        change: "-3%",
        icon: Shield,
        color: "#A72703",
      },
    ];
  }, [data]);

  const growthData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyTotals = Array(12).fill(0);
    (data.payments || []).forEach(p => {
      const date = new Date(p.createdAt);
      if (!isNaN(date)) monthlyTotals[date.getMonth()] += p.amount || 0;
    });
    return {
      labels: months,
      datasets: [{
        label: "Portfolio Value",
        data: monthlyTotals,
        borderColor: "#A72703",
        backgroundColor: "rgba(167, 39, 3, 0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }]
    };
  }, [data]);

  const performanceData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    const agg = {};
    (data.payments || []).forEach(p => {
      if (!agg[p.symbol]) agg[p.symbol] = 0;
      agg[p.symbol] += p.roi || 0;
    });
    return {
      labels: Object.keys(agg),
      datasets: [
        {
          label: "Return (%)",
          data: Object.values(agg),
          backgroundColor: ["#A72703", "#1D4ED8", "#16A34A"],
          borderRadius: 6,
        }
      ]
    };
  }, [data]);

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: "#eee" } }, x: { grid: { display: false } } },
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#eee" } }, x: { grid: { display: false } } },
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin w-10 h-10 text-gray-500" /></div>;
  if (error) return <div className="text-red-500 text-center py-10 text-lg font-medium">{error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 font-[Inter]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Performance Overview</h1>
        <p className="text-gray-600">
          Analyze your portfolio profitability, sector growth, and overall risk balance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <div>
              <p className="text-gray-500 text-sm">{m.title}</p>
              <h2 className="text-lg font-semibold text-gray-800">{m.value}</h2>
              <p className={`text-sm mt-1 ${m.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {m.change}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
              <m.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
            Portfolio Value Over Time
          </h3>
          <Line data={growthData} options={lineOptions} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
            Performance by Sector
          </h3>
          <Bar data={performanceData} options={barOptions} />
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Insights</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your portfolio is showing consistent growth across all sectors. The highest returns come
          from <span className="text-[#A72703] font-medium">SpaceX Private Shares</span> and
          <span className="text-[#16A34A] font-medium"> Crypto assets</span>, both contributing over
          60% of total profits. Current volatility remains low, and your risk management strategy
          continues to perform well.
        </p>
      </div>
    </div>
  );
};

export default Performance;
