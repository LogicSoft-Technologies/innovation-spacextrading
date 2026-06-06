import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiTesla,
  SiSpacex,
  SiBitcoin,
  SiEthereum,
  SiSolana,
  SiDogecoin,
  SiBinance,
  SiCardano,
  SiRipple,
} from "react-icons/si";
import {
  X,
  Timer,
  TrendingUp,
  Wallet,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { userGetDashboardData } from "../../Services/authServices";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

const cryptoList = [
  "BITCOIN",
  "ETHEREUM",
  "SOLANA",
  "DOGECOIN",
  "BINANCECOIN",
  "CARDANO",
  "RIPPLE",
];

const cryptoColors = [
  "#F7931A",
  "#627EEA",
  "#9945FF",
  "#C2A878",
  "#F3BA2F",
  "#0033AD",
  "#00AAE4",
];

const cryptoIcons = {
  BITCOIN: SiBitcoin,
  ETHEREUM: SiEthereum,
  SOLANA: SiSolana,
  DOGECOIN: SiDogecoin,
  BINANCECOIN: SiBinance,
  CARDANO: SiCardano,
  RIPPLE: SiRipple,
};

const getAssetMeta = (symbol = "", index = 0) => {
  const cleanSymbol = symbol.toUpperCase();

  if (cleanSymbol === "TESLA") {
    return { Icon: SiTesla, color: "#1D4ED8" };
  }

  if (cleanSymbol === "SPACEX") {
    return { Icon: SiSpacex, color: "#A72703" };
  }

  const cryptoKey = cryptoList.includes(cleanSymbol)
    ? cleanSymbol
    : cryptoList[index % cryptoList.length];

  return {
    Icon: cryptoIcons[cryptoKey] || Wallet,
    color: cryptoColors[index % cryptoColors.length],
  };
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatTime = (ms) => {
  if (!ms || ms <= 0) return "Completed";

  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);

  return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
};

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getInvestmentComputedValues = (payment) => {
  const amount = Number(payment.amount || 0);
  const durationDays = Number(payment.durationDays || 0);
  const cycles = Math.floor(durationDays / 2);

  const profit =
    durationDays > 0 ? amount * 0.3 * cycles : Number(payment.profit || 0);

  const finalReturn =
    durationDays > 0 ? amount + profit : Number(payment.returns || 0);

  return { profit, finalReturn, cycles };
};

const fetchInvestments = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await userGetDashboardData();

    const investmentsData = (data.payments || []).map((payment) => {
      const base = Number(payment.amount || 0);
      const computed = getInvestmentComputedValues(payment);

      return {
        ...payment,
        profit: computed.profit,
        returns: computed.finalReturn,
        twoDayCycles: payment.twoDayCycles || computed.cycles,
        chartData: [
          base,
          base + computed.profit * 0.15,
          base + computed.profit * 0.3,
          base + computed.profit * 0.5,
          base + computed.profit * 0.7,
          base + computed.profit * 0.88,
          computed.finalReturn,
        ],
      };
    });

    setInvestments(investmentsData);
  } catch (err) {
    console.error("Error fetching investments:", err);
    setError(
      err.response?.data?.message ||
        err.message ||
        "Failed to load investments"
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};

      investments.forEach((inv) => {
        if (inv.status === "approved" && inv.completedAt) {
          const endTime = new Date(inv.completedAt).getTime();
          updated[inv._id] = formatTime(endTime - Date.now());
        }
      });

      setCountdowns(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [investments]);

  const statsData = useMemo(() => {
    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.amount || 0),
      0
    );

    const totalProfit = investments.reduce(
      (sum, inv) => sum + Number(inv.profit || 0),
      0
    );

    const activeInvestments = investments.filter(
      (inv) => inv.status === "approved"
    ).length;

    const completedInvestments = investments.filter(
      (inv) => inv.status === "completed"
    ).length;

    const growthRate =
      totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : 0;

    return [
      {
        title: "Total Invested",
        value: formatCurrency(totalInvested),
        icon: Wallet,
        color: "#A72703",
      },
      {
        title: "Projected Profit",
        value: formatCurrency(totalProfit),
        icon: TrendingUp,
        color: "#16A34A",
      },
      {
        title: "Active Investments",
        value: activeInvestments,
        icon: Timer,
        color: "#1D4ED8",
      },
      {
        title: "Growth Rate",
        value: `${growthRate}%`,
        icon: BadgeDollarSign,
        color: "#EAB308",
      },
      {
        title: "Completed",
        value: completedInvestments,
        icon: CheckCircle,
        color: "#059669",
      },
    ];
  }, [investments]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
    animation: { duration: 600, easing: "easeInOutCubic" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-slate-200 border-t-[#A72703] animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading investments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchInvestments}
            className="mt-4 rounded-xl bg-[#A72703] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C1B01]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-7">
        <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Portfolio management
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold">
                My Investments
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                Track active allocations, maturity countdowns, expected profit,
                and final investment returns.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {statsData.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    {stat.title}
                  </p>
                  <p
                    className="mt-2 text-xl font-semibold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{
                    color: stat.color,
                    backgroundColor: `${stat.color}15`,
                  }}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {investments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <CircleDollarSign className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No investments yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your submitted investments will appear here after creation.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {investments.map((inv, index) => {
              const { Icon, color } = getAssetMeta(inv.symbol, index);
              const roi =
                Number(inv.amount || 0) > 0
                  ? (Number(inv.profit || 0) / Number(inv.amount || 0)) * 100
                  : 0;

              return (
                <motion.button
                  type="button"
                  key={inv._id || index}
                  onClick={() => setSelected(inv)}
                  whileHover={{ y: -3 }}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="rounded-xl p-3"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-950 truncate">
                          {inv.symbol}
                        </h3>
                        <p className="text-xs text-slate-500 capitalize">
                          {inv.investmentType || "investment"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusStyle[inv.status] ||
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Invested</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-xs text-green-700">Profit</p>
                      <p className="mt-1 font-semibold text-green-700">
                        {formatCurrency(inv.profit)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-24">
                    <Line
                      data={{
                        labels: Array(inv.chartData.length).fill(""),
                        datasets: [
                          {
                            data: inv.chartData,
                            borderColor: color,
                            backgroundColor: `${color}20`,
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Final Return</p>
                      <p className="font-semibold text-[#A72703]">
                        {formatCurrency(inv.returns)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">ROI</p>
                      <p className="font-semibold text-green-700">
                        {roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {inv.status === "approved" && (
                    <div className="mt-4 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {countdowns[inv._id] || "Calculating..."}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200"
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-[#A72703]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                  Investment details
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  {selected.symbol}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="h-44 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <Line
                    data={{
                      labels: Array(selected.chartData.length).fill(""),
                      datasets: [
                        {
                          data: selected.chartData,
                          borderColor: "#A72703",
                          backgroundColor: "rgba(167, 39, 3, 0.12)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-slate-500">Invested Amount</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatCurrency(selected.amount)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-green-700">Expected Profit</p>
                    <p className="mt-1 font-semibold text-green-700">
                      {formatCurrency(selected.profit)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#A72703]/20 bg-[#FFF6F2] p-4">
                    <p className="text-[#7C1B01]">Final Return</p>
                    <p className="mt-1 font-semibold text-[#A72703]">
                      {formatCurrency(selected.returns)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-slate-500">Status</p>
                    <p className="mt-1 font-semibold capitalize text-slate-950">
                      {selected.status}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-slate-500">Duration</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {selected.durationValue && selected.durationUnit
                        ? `${selected.durationValue} ${selected.durationUnit}`
                        : `${selected.durationDays || 0} days`}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-slate-500">Profit Rule</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      20% every 2 days
                    </p>
                  </div>
                </div>

                {selected.status === "approved" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
                    <Timer className="w-5 h-5 text-blue-700 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800">
                        Maturity countdown
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        {countdowns[selected._id] || "Calculating..."}
                      </p>
                    </div>
                  </div>
                )}

                {selected.completedAt && (
                  <div className="rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <CalendarDays className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        Completion Date
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(selected.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;