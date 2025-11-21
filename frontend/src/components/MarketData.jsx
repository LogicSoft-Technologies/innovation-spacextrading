import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
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
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import api from "../../config/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const MarketData = () => {
  const [stocks, setStocks] = useState({ TSLA: { c: 0 }, SPACE: { c: 0 } });
  const [stockHistory, setStockHistory] = useState({ TSLA: [], SPACE: [] });
  const [stockTrend, setStockTrend] = useState({
    TSLA: "neutral",
    SPACE: "neutral",
  });
  const [stockDelta, setStockDelta] = useState({ TSLA: 0, SPACE: 0 });
  const [highlight, setHighlight] = useState({});
  const cryptoList = [
    "bitcoin",
    "ethereum",
    "solana",
    "dogecoin",
    "binancecoin",
    "cardano",
    "ripple",
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
  const [crypto, setCrypto] = useState({});
  const [history, setHistory] = useState({});
  const [cryptoTrend, setCryptoTrend] = useState({});
  const [cryptoDelta, setCryptoDelta] = useState({});
  const [cryptoChange24h, setCryptoChange24h] = useState({});

  const cryptoIcons = {
    bitcoin: <SiBitcoin className="text-[#F7931A]" size={32} />,
    ethereum: <SiEthereum className="text-[#627EEA]" size={32} />,
    solana: <SiSolana className="text-[#9945FF]" size={32} />,
    dogecoin: <SiDogecoin className="text-[#C2A878]" size={32} />,
    binancecoin: <SiBinance className="text-[#F3BA2F]" size={32} />,
    cardano: <SiCardano className="text-[#0033AD]" size={32} />,
    ripple: <SiRipple className="text-[#00AAE4]" size={32} />,
  };

  const trendIcon = (trend) => {
    if (trend === "up") return <FaArrowUp className="text-green-500 ml-2" />;
    if (trend === "down") return <FaArrowDown className="text-red-500 ml-2" />;
    return null;
  };

  // Fetch Stock Prices
  const fetchStocks = async () => {
    try {
      const [teslaRes, spacexRes] = await Promise.all([
        api.get("/api/market/stock?symbol=TSLA"),
        api.get("/api/market/stock?symbol=SPCE"),
      ]);

      const newTSLA = teslaRes.data.data.c;
      const newSPACE = spacexRes.data.data.c;

      // Only update if value changed
      setStockDelta((prev) => ({
        TSLA:
          prev.TSLA !== newTSLA
            ? (newTSLA - (stockHistory.TSLA.at(-1) || 0)).toFixed(2)
            : prev.TSLA,
        SPACE:
          prev.SPACE !== newSPACE
            ? (newSPACE - (stockHistory.SPACE.at(-1) || 0)).toFixed(2)
            : prev.SPACE,
      }));

      setStockTrend((prev) => ({
        TSLA:
          stockHistory.TSLA.length > 0 && newTSLA > stockHistory.TSLA.at(-1)
            ? "up"
            : "neutral",
        SPACE:
          stockHistory.SPACE.length > 0 && newSPACE > stockHistory.SPACE.at(-1)
            ? "up"
            : "neutral",
      }));

      setStockHistory({
        TSLA: teslaRes.data.data.history.map((h) => h.close),
        SPACE: spacexRes.data.data.history.map((h) => h.close),
      });

      setStocks({ TSLA: teslaRes.data.data, SPACE: spacexRes.data.data });
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("Rate limit hit for stocks. Data may be cached.");
      } else {
        console.error("Error fetching stock data:", err.message);
      }
    }
  };

  const fetchCrypto = async () => {
    try {
      const ids = cryptoList.join(",");
      const { data: response } = await api.get(`/api/market/crypto?ids=${ids}`);
      const apiData = response.data.prices;

      const newCryptoData = {};
      const newHistory = { ...history };
      const newHighlight = { ...highlight };
      const newTrend = { ...cryptoTrend };
      const newDelta = { ...cryptoDelta };
      const newChange24h = { ...cryptoChange24h };

      cryptoList.forEach((id) => {
        const price = apiData[id]?.usd || 0;
        const prevPrice = crypto[id] || price;
        const change24h = apiData[id]?.usd_24h_change || 0;

        newCryptoData[id] = price;
        newDelta[id] = (price - prevPrice).toFixed(2);
        newChange24h[id] = change24h.toFixed(2);

        if (crypto[id] && crypto[id] !== price) {
          newTrend[id] = price > crypto[id] ? "up" : "down";
          newHighlight[id] = true;
          setTimeout(
            () => setHighlight((prev) => ({ ...prev, [id]: false })),
            800
          );
        }

        newHistory[id] = [...(newHistory[id] || []), price].slice(-20);
      });

      setCrypto(newCryptoData);
      setHistory(newHistory);
      setHighlight(newHighlight);
      setCryptoTrend(newTrend);
      setCryptoDelta(newDelta);
      setCryptoChange24h(newChange24h);
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("Rate limit hit for crypto. Data may be cached.");
      } else {
        console.error("Error fetching crypto prices:", err.message);
      }
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchCrypto();
    const interval = setInterval(() => {
      fetchStocks();
      fetchCrypto();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = (dataArr = [], color, trend) => ({
    labels: dataArr.map((_, i) => i),
    datasets: [
      {
        data: dataArr,
        borderColor:
          trend === "up" ? "#00FF7F" : trend === "down" ? "#FF4500" : color,
        backgroundColor:
          trend === "up"
            ? "#00FF7F20"
            : trend === "down"
            ? "#FF450020"
            : color + "20",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: true,
      },
    ],
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 bg-white text-[var(--text-primary)] font-[Inter]"
      id="market"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text font-[Poppins]">
            Market Data Overview
          </h2>
          <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-[#A72703] via-black to-[#A72703] animate-pulse mb-10" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with live stock and crypto insights powered by
            real-time APIs and analytics.
          </p>
        </div>

        {/* STOCK SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {/* Tesla */}
          <div
            className={`border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-500 bg-white backdrop-blur-sm flex justify-between items-center relative overflow-hidden ${
              highlight.TSLA ? "ring-2 ring-[#A72703]/40" : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SiTesla className="text-[#A72703]" size={22} />
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  Tesla (TSLA) {trendIcon(stockTrend.TSLA)}
                </h3>
              </div>

              <div className="flex flex-col">
                <p
                  className={`text-2xl font-bold transition-all duration-500 ${
                    stockTrend.TSLA === "up"
                      ? "text-green-600"
                      : stockTrend.TSLA === "down"
                      ? "text-red-500"
                      : "text-[#A72703]"
                  }`}
                >
                  ${stocks.TSLA.c?.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    stockDelta.TSLA > 0
                      ? "text-green-600"
                      : stockDelta.TSLA < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {stockDelta.TSLA > 0 ? "+" : ""}
                  {stockDelta.TSLA}% (24h)
                </p>
              </div>
            </div>

            <div
              className={`h-16 w-32 rounded-lg ${
                stockTrend.TSLA === "up"
                  ? "bg-green-50 animate-pulse"
                  : stockTrend.TSLA === "down"
                  ? "bg-red-50 animate-pulse"
                  : ""
              } p-1`}
            >
              <Line
                data={chartData(stockHistory.TSLA, "#A72703", stockTrend.TSLA)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } },
                  animation: { duration: 600, easing: "easeInOutCubic" },
                }}
              />
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A72703] to-transparent animate-shimmer" />
          </div>

          {/* SpaceX */}
          <div
            className={`border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-500 bg-white backdrop-blur-sm flex justify-between items-center relative overflow-hidden ${
              highlight.SPACE ? "ring-2 ring-[#A72703]/40" : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SiSpacex className="text-black" size={22} />
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  SpaceX Valuation (SPCE) {trendIcon(stockTrend.SPACE)}
                </h3>
              </div>

              <div className="flex flex-col">
                <p
                  className={`text-2xl font-bold transition-all duration-500 ${
                    stockTrend.SPACE === "up"
                      ? "text-green-600"
                      : stockTrend.SPACE === "down"
                      ? "text-red-500"
                      : "text-[#A72703]"
                  }`}
                >
                  ${stocks.SPACE.c?.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    stockDelta.SPACE > 0
                      ? "text-green-600"
                      : stockDelta.SPACE < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {stockDelta.SPACE > 0 ? "+" : ""}
                  {stockDelta.SPACE}% (24h)
                </p>
              </div>
            </div>

            <div
              className={`h-16 w-32 rounded-lg ${
                stockTrend.SPACE === "up"
                  ? "bg-green-50 animate-pulse"
                  : stockTrend.SPACE === "down"
                  ? "bg-red-50 animate-pulse"
                  : ""
              } p-1`}
            >
              <Line
                data={chartData(
                  stockHistory.SPACE,
                  "#090707",
                  stockTrend.SPACE
                )}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } },
                  animation: { duration: 600, easing: "easeInOutCubic" },
                }}
              />
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A72703] to-transparent animate-shimmer" />
          </div>
        </motion.div>

        {/* CRYPTO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">
            Real-Time <span className="text-[#A72703]">Crypto Prices</span>
          </h3>

          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-5">
            {Object.keys(crypto).map((key, idx) => (
              <div
                key={key}
                className={`border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md bg-white transition-all duration-500 flex flex-col gap-3 relative overflow-hidden ${
                  highlight[key] ? "ring-2 ring-[#A72703]/40" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {cryptoIcons[key]}
                    <h4 className="text-base font-semibold capitalize text-gray-800 flex items-center">
                      {key} {cryptoTrend[key] && trendIcon(cryptoTrend[key])}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <p
                      className={`text-base font-bold transition-all duration-500 ${
                        cryptoTrend[key] === "up"
                          ? "text-green-600"
                          : cryptoTrend[key] === "down"
                          ? "text-red-500"
                          : "text-[#A72703]"
                      }`}
                    >
                      ${crypto[key]?.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs font-medium transition-all duration-500 ${
                        cryptoChange24h[key] > 0
                          ? "text-green-600"
                          : cryptoChange24h[key] < 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {cryptoChange24h[key] > 0 ? "+" : ""}
                      {cryptoChange24h[key]}% (24h)
                    </p>
                  </div>
                </div>

                <div className="h-20 mt-1">
                  <Line
                    data={chartData(
                      history[key],
                      cryptoColors[idx],
                      cryptoTrend[key]
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } },
                      animation: { duration: 600, easing: "easeInOutCubic" },
                    }}
                  />
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A72703] to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-sm text-gray-500 mt-12">
          Data powered by live APIs — refreshed every 30 seconds for accuracy.
        </p>
      </div>
    </motion.section>
  );
};

export default MarketData;
