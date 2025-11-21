// Markets.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import Chart from "react-apexcharts";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
  const [orderBook, setOrderBook] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");

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
              ? `${selectedCrypto.toUpperCase()} · SpaceX Innovation Broker`
              : "Select a coin below to view chart"
            : `${activeMarket.toUpperCase()} · SpaceX Innovation Broker`,
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
      // NOTE: keeping your chart config unchanged except for responsive-friendly wrapper below
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
          setLoading(false);
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
        { name: `${activeMarket.toUpperCase()}`, data: historyToApex(history) },
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
      setError(
        `Minimum units for ${activeMarket.toUpperCase()} is ${minUnits}`
      );
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
    if (activeMarket === "crypto" && !selectedCrypto) return;
    if (!lastPrice || !orderAmount) {
      alert("Enter an amount and ensure a market is selected.");
      return;
    }
    if (Number(orderAmount) < minUnits) {
      alert(`Minimum units for ${activeMarket.toUpperCase()} is ${minUnits}`);
      return;
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setOrderAmount("");
    setTotalAmount(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              Markets — SpaceX Innovation Broker
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base truncate">
              Live candlesticks for SpaceX, Tesla and leading crypto. Click a
              crypto to enable investing.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-gray-400">Last Price</div>
              <div className="text-lg sm:text-xl font-semibold text-[#A72703]">
                {lastPrice ? `$${Number(lastPrice).toLocaleString()}` : "—"}
              </div>
            </div>
            <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400">Market</div>
              <div className="font-medium">{activeMarket.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {["spacex", "tesla", "crypto"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setActiveMarket(m);
                setSelectedCrypto("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeMarket === m
                  ? "bg-[#A72703] text-white shadow-md"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Chart + side panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart Card */}
          <div className="flex-1 bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-700 overflow-hidden">
            {/* Responsive wrapper keeps chart from overflowing and gives stable height */}
            <div className="w-full rounded-md overflow-hidden bg-[#0b1220]">
              <div className="h-[320px] sm:h-[420px] md:h-[520px] w-full">
                <Chart
                  options={options}
                  series={series}
                  type="candlestick"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              {loading
                ? "Loading live data..."
                : `Last update: ${new Date().toLocaleTimeString()}`}
            </div>
          </div>

          {/* Invest Panel */}
          <aside className="w-full lg:w-96 flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Invest</h3>
              <div className="text-sm text-gray-400 mb-3">
                {activeMarket === "crypto"
                  ? selectedCrypto
                    ? `Invest in ${selectedCrypto.toUpperCase()}`
                    : "Select a crypto below to enable investing"
                  : `Invest in ${activeMarket.toUpperCase()}`}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-300 block mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                    placeholder="Enter amount in USD"
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="font-medium text-lg">
                    {lastPrice ? `$${Number(lastPrice).toFixed(4)}` : "—"}
                  </div>
                  {orderAmount && (
                    <div className="text-sm text-gray-400 mt-1 truncate">
                      Expected returns: ${(Number(orderAmount) * 10).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleInvest}
                    disabled={activeMarket === "crypto" && !selectedCrypto}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeMarket === "crypto" && !selectedCrypto
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-[#A72703] text-white hover:scale-[1.02] transition-transform"
                    }`}
                  >
                    Invest
                  </button>
                </div>
              </div>

              {/* Order Book */}
              <div>
                <h4 className="text-sm text-gray-300 mb-2">Order Book</h4>
                <div className="space-y-2">
                  {orderBook.length === 0 && (
                    <div className="text-xs text-gray-400">No orders</div>
                  )}
                  {orderBook.map((o, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-2 rounded-md text-sm ${
                        o.type === "buy" ? "bg-green-900/30" : "bg-red-900/20"
                      }`}
                    >
                      <div>
                        <div className="font-medium">
                          ${Number(o.price).toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {o.amount} units
                        </div>
                      </div>
                      <div className="text-2xl">
                        {o.type === "buy" ? (
                          <ArrowDownCircle className="text-green-400" />
                        ) : (
                          <ArrowUpCircle className="text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crypto Selector */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h4 className="text-md font-semibold mb-3">Cryptocurrencies</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cryptoList.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveMarket("crypto");
                      setSelectedCrypto(c);
                    }}
                    className={`min-w-[90px] sm:min-w-[110px] flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border ${
                      selectedCrypto === c
                        ? "border-[#A72703] bg-gray-700"
                        : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {cryptoIcons[c]}
                    <div className="text-sm font-medium capitalize">{c}</div>
                    <div className="text-xs text-gray-400">Click to view</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Help info */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-sm text-gray-400">
              Market data refreshes every 3 seconds. Use these live charts to
              analyze trends, discover opportunities, and build your investment
              strategy as real-time trading integration goes live
            </div>
          </aside>
        </div>
      </div>

      {/* Investment Modal */}
      {showModal && (
        <InvestmentModal
          amount={orderAmount}
          totalAmount={totalAmount}
          market={activeMarket === "crypto" ? selectedCrypto : activeMarket}
          onClose={handleModalClose}
          userId={user?.id || "123"}
          email={user?.email || "user@example.com"}
          name={
            user?.firstName ? `${user.firstName} ${user.lastName}` : "John Doe"
          }
        />
      )}
    </div>
  );
};

export default Markets;
