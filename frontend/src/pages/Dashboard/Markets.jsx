import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import Chart from "react-apexcharts";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CalendarDays,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react";
import {
  SiBitcoin,
  SiEthereum,
  SiSolana,
  SiDogecoin,
  SiBinance,
  SiCardano,
  SiRipple,
} from "react-icons/si";
import api from "../../../config/api";
import InvestmentModal from "../../components/InvestmentModal";
import { AuthContext } from "../../Context/AuthContext";

const Markets = () => {
  const { user } = useContext(AuthContext);
  const [activeMarket, setActiveMarket] = useState("spacex");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [series, setSeries] = useState([{ data: [] }]);
  const [options, setOptions] = useState({});
  const [lastPrice, setLastPrice] = useState(null);
  const [orderAmount, setOrderAmount] = useState("");
  const [durationValue, setDurationValue] = useState(8);
  const [durationUnit, setDurationUnit] = useState("days");
  const [orderBook, setOrderBook] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const cryptoList = [
    "bitcoin",
    "ethereum",
    "solana",
    "dogecoin",
    "binancecoin",
    "cardano",
    "ripple",
  ];

  const cryptoIcons = {
    bitcoin: <SiBitcoin className="text-[#F7931A]" size={26} />,
    ethereum: <SiEthereum className="text-[#627EEA]" size={26} />,
    solana: <SiSolana className="text-[#9945FF]" size={26} />,
    dogecoin: <SiDogecoin className="text-[#C2A878]" size={26} />,
    binancecoin: <SiBinance className="text-[#F3BA2F]" size={26} />,
    cardano: <SiCardano className="text-[#0033AD]" size={26} />,
    ripple: <SiRipple className="text-[#00AAE4]" size={26} />,
  };

  const selectedMarketLabel =
    activeMarket === "crypto"
      ? selectedCrypto || "crypto"
      : activeMarket;

  const getDurationDays = () => {
    const value = Number(durationValue || 0);
    const units = {
      days: 1,
      weeks: 7,
      months: 30,
      years: 365,
    };

    return value * units[durationUnit];
  };

  const investmentPreview = useMemo(() => {
    const amount = Number(orderAmount || 0);
    const durationDays = getDurationDays();
    const twoDayCycles = Math.floor(durationDays / 2);
    const profit = amount * 0.3 * twoDayCycles;
    const returns = amount + profit;

    return {
      durationDays,
      twoDayCycles,
      profit,
      returns,
    };
  }, [orderAmount, durationValue, durationUnit]);

  useEffect(() => {
    setOptions({
      chart: {
        type: "candlestick",
        background: "#0b1220",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: { speed: 250 },
        },
        toolbar: {
          show: true,
          tools: { download: true, zoom: true, pan: true, reset: true },
        },
        id: "market-candles",
      },
      title: {
        text:
          activeMarket === "crypto"
            ? selectedCrypto
              ? `${selectedCrypto.toUpperCase()} - SpaceX Innovation Broker`
              : "Select a coin below to view chart"
            : `${activeMarket.toUpperCase()} - SpaceX Innovation Broker`,
        align: "left",
        style: { color: "#E6EEF8", fontSize: "16px", fontWeight: 600 },
      },
      plotOptions: {
        candlestick: {
          colors: { upward: "#16a34a", downward: "#ef4444" },
          wick: { useFillColor: false },
        },
      },
      xaxis: {
        type: "datetime",
        labels: { style: { colors: "#B9C6D9" } },
        tooltip: { enabled: true },
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: { style: { colors: "#B9C6D9" } },
      },
      tooltip: {
        enabled: true,
        theme: "dark",
        x: { format: "dd MMM yyyy HH:mm:ss" },
      },
      grid: { borderColor: "#1f2937" },
      theme: { mode: "dark", palette: "palette1" },
    });
  }, [activeMarket, selectedCrypto]);

  const historyToApex = (history = []) =>
    history.map((c) => ({
      x: new Date(c.time).getTime(),
      y: [Number(c.open), Number(c.high), Number(c.low), Number(c.close)],
    }));

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      let history = [];

      if (activeMarket === "spacex") {
        const res = await api.get("/api/market/stock?symbol=SPCE");
        history = res?.data?.data?.history ?? [];
      } else if (activeMarket === "tesla") {
        const res = await api.get("/api/market/stock?symbol=TSLA");
        history = res?.data?.data?.history ?? [];
      } else if (activeMarket === "crypto") {
        if (!selectedCrypto) {
          setSeries([{ data: [] }]);
          setOrderBook([]);
          setLastPrice(null);
          return;
        }

        const res = await api.get(`/api/market/crypto?ids=${selectedCrypto}`);
        const apiData = res?.data?.data;
        history =
          apiData?.history?.[selectedCrypto] ??
          apiData?.history ??
          apiData?.prices?.[selectedCrypto]?.history ??
          [];
      }

      setSeries([
        {
          name: selectedMarketLabel.toUpperCase(),
          data: historyToApex(history),
        },
      ]);

      if (history.length > 0) {
        const last = history[history.length - 1];
        const lastClose = Number(last.close);

        setLastPrice(lastClose);
        setOrderBook([
          { price: lastClose, amount: 100, type: "buy" },
          { price: +(lastClose * 1.01).toFixed(4), amount: 50, type: "sell" },
        ]);
      } else {
        setLastPrice(null);
        setOrderBook([]);
      }
    } catch (err) {
      console.error("fetchMarketData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = (value) => {
    const minUnits = activeMarket === "crypto" ? 1.5 : 100;

    if (!value) {
      setError("");
      return false;
    }

    if (Number(value) < minUnits) {
      setError(`Minimum investment for ${activeMarket.toUpperCase()} is $${minUnits}`);
      return false;
    }

    setError("");
    return true;
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    fetchMarketData();
    intervalRef.current = setInterval(fetchMarketData, 3000);

    return () => clearInterval(intervalRef.current);
  }, [activeMarket, selectedCrypto]);

  const handleInvest = () => {
    const minUnits = activeMarket === "crypto" ? 1.5 : 100;

    if (activeMarket === "crypto" && !selectedCrypto) {
      alert("Select a cryptocurrency before investing.");
      return;
    }

    if (!lastPrice || !orderAmount) {
      alert("Enter an amount and ensure a market is selected.");
      return;
    }

    if (Number(orderAmount) < minUnits) {
      alert(`Minimum investment for ${activeMarket.toUpperCase()} is $${minUnits}`);
      return;
    }

    if (!durationValue || Number(durationValue) <= 0) {
      alert("Please select a valid investment duration.");
      return;
    }

    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setOrderAmount("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Trading desk
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold">
                Markets - SpaceX Innovation Broker
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                Analyze live instruments, select an investment duration, and preview projected returns before submitting payment.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <p className="text-xs text-slate-400">Last Price</p>
                <p className="text-lg font-semibold text-white">
                  {lastPrice ? `$${Number(lastPrice).toLocaleString()}` : "-"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <p className="text-xs text-slate-400">Market</p>
                <p className="text-lg font-semibold uppercase">
                  {selectedMarketLabel}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-400">Rule</p>
                <p className="text-lg font-semibold text-green-400">30% / 2 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {["spacex", "tesla", "crypto"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setActiveMarket(m);
                setSelectedCrypto("");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap border ${
                activeMarket === m
                  ? "bg-[#A72703] text-white border-[#A72703] shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-[#A72703]/40"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="rounded-xl overflow-hidden bg-[#0b1220]">
              <div className="h-[340px] sm:h-[460px] md:h-[560px] w-full">
                <Chart
                  options={options}
                  series={series}
                  type="candlestick"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                {loading
                  ? "Loading live data..."
                  : `Last update: ${new Date().toLocaleTimeString()}`}
              </span>
              <span>Refresh interval: 3 seconds</span>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                    Investment ticket
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    {activeMarket === "crypto"
                      ? selectedCrypto
                        ? selectedCrypto.toUpperCase()
                        : "Select crypto"
                      : activeMarket.toUpperCase()}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Investment Amount ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderAmount}
                    onChange={(e) => {
                      setOrderAmount(e.target.value);
                      validateAmount(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/15"
                    placeholder="Enter amount in USD"
                  />
                  {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Duration
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/15"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Period
                    </label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/15"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <BarChart3 className="w-4 h-4 text-[#A72703]" />
                    <p className="text-sm font-semibold">Return preview</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Total Days</p>
                      <p className="font-semibold text-slate-950">
                        {investmentPreview.durationDays || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Profit Cycles</p>
                      <p className="font-semibold text-slate-950">
                        {investmentPreview.twoDayCycles}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Expected Profit</p>
                      <p className="font-semibold text-green-700">
                        ${investmentPreview.profit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Final Return</p>
                      <p className="font-semibold text-[#A72703]">
                        ${investmentPreview.returns.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleInvest}
                  disabled={activeMarket === "crypto" && !selectedCrypto}
                  className={`w-full rounded-xl px-5 py-3 font-semibold text-sm transition ${
                    activeMarket === "crypto" && !selectedCrypto
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-[#A72703] text-white hover:bg-[#7C1B01] shadow-lg shadow-[#A72703]/20"
                  }`}
                >
                  Continue to Payment
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Cryptocurrencies
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cryptoList.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveMarket("crypto");
                      setSelectedCrypto(c);
                    }}
                    className={`min-w-[112px] flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                      selectedCrypto === c
                        ? "border-[#A72703] bg-[#FFF6F2]"
                        : "border-slate-200 bg-white hover:border-[#A72703]/40"
                    }`}
                  >
                    {cryptoIcons[c]}
                    <div className="text-sm font-semibold capitalize text-slate-800">
                      {c}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Order Book
              </h4>
              <div className="space-y-2">
                {orderBook.length === 0 && (
                  <div className="text-sm text-slate-500">No orders</div>
                )}

                {orderBook.map((o, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-3 rounded-xl text-sm ${
                      o.type === "buy" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        ${Number(o.price).toFixed(4)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {o.amount} units
                      </div>
                    </div>
                    {o.type === "buy" ? (
                      <ArrowDownCircle className="text-green-600" />
                    ) : (
                      <ArrowUpCircle className="text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showModal && (
        <InvestmentModal
          amount={orderAmount}
          market={selectedMarketLabel}
          lastPrice={lastPrice}
          durationValue={durationValue}
          durationUnit={durationUnit}
          durationDays={investmentPreview.durationDays}
          twoDayCycles={investmentPreview.twoDayCycles}
          profit={investmentPreview.profit}
          totalAmount={investmentPreview.returns}
          onClose={handleModalClose}
          userId={user?.id}
          email={user?.email}
          name={user?.firstName ? `${user.firstName} ${user.lastName}` : ""}
        />
      )}
    </div>
  );
};

export default Markets;