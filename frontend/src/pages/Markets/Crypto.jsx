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
import { motion, AnimatePresence } from "framer-motion";
import {
  SiBitcoin,
  SiEthereum,
  SiSolana,
  SiDogecoin,
  SiBinance,
  SiCardano,
  SiRipple,
} from "react-icons/si";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import api from "../../../config/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const Crypto = () => {
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
  const cryptoIcons = {
    bitcoin: <SiBitcoin className="text-[#F7931A]" size={32} />,
    ethereum: <SiEthereum className="text-[#627EEA]" size={32} />,
    solana: <SiSolana className="text-[#9945FF]" size={32} />,
    dogecoin: <SiDogecoin className="text-[#C2A878]" size={32} />,
    binancecoin: <SiBinance className="text-[#F3BA2F]" size={32} />,
    cardano: <SiCardano className="text-[#0033AD]" size={32} />,
    ripple: <SiRipple className="text-[#00AAE4]" size={32} />,
  };

  const [crypto, setCrypto] = useState({});
  const [history, setHistory] = useState({});
  const [cryptoTrend, setCryptoTrend] = useState({});
  const [cryptoDelta, setCryptoDelta] = useState({});
  const [cryptoChange24h, setCryptoChange24h] = useState({});
  const [highlight, setHighlight] = useState({});
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    topGainer: { name: "", change: 0 },
    topLoser: { name: "", change: 0 },
  });

  const trendIcon = (trend) => {
    if (trend === "up") return <FaArrowUp className="text-green-500 ml-1" />;
    if (trend === "down") return <FaArrowDown className="text-red-500 ml-1" />;
    return null;
  };

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
        pointRadius: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
    animation: { duration: 600, easing: "easeInOutCubic" },
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

      let totalCap = 0;
      let topGainer = { name: "", change: -Infinity };
      let topLoser = { name: "", change: Infinity };

      cryptoList.forEach((id) => {
        const price = apiData[id]?.usd || 0;
        const prevPrice = crypto[id] || price;
        const change24h = apiData[id]?.usd_24h_change || 0;
        const marketCap = apiData[id]?.usd_market_cap || 0;

        // Update only if price changes
        if (prevPrice !== price) {
          newDelta[id] = (price - prevPrice).toFixed(2);
          newTrend[id] = price > prevPrice ? "up" : "down";
          newHighlight[id] = true;
          setTimeout(
            () => setHighlight((prev) => ({ ...prev, [id]: false })),
            1000
          );
        }

        newCryptoData[id] = price;
        newChange24h[id] = change24h.toFixed(2);
        newHistory[id] = [...(newHistory[id] || []), price].slice(-20);

        totalCap += marketCap;
        if (change24h > topGainer.change)
          topGainer = { name: id, change: change24h };
        if (change24h < topLoser.change)
          topLoser = { name: id, change: change24h };
      });

      setCrypto(newCryptoData);
      setHistory(newHistory);
      setHighlight(newHighlight);
      setCryptoTrend(newTrend);
      setCryptoDelta(newDelta);
      setCryptoChange24h(newChange24h);
      setMarketStats({ totalMarketCap: totalCap, topGainer, topLoser });
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("Rate limit hit. Data may be cached.");
      } else {
        console.error("Error fetching crypto:", err.message);
      }
    }
  };

  useEffect(() => {
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section className="py-20 bg-gray-50 font-[Inter]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text font-[Poppins]">
            Real-Time Crypto Market
          </h2>
          <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-[#A72703] via-black to-[#A72703] animate-pulse mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Track leading cryptocurrencies, market caps, live price movements,
            and 24h changes.
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <h4 className="text-sm text-gray-500">Total Market Cap</h4>
            <p className="text-2xl font-bold text-[#A72703]">
              ${marketStats.totalMarketCap.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <h4 className="text-sm text-gray-500">Top Gainer (24h)</h4>
            <p className="text-lg font-bold text-green-600 capitalize">
              {marketStats.topGainer.name} (+
              {marketStats.topGainer.change?.toFixed(2)}%)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <h4 className="text-sm text-gray-500">Top Loser (24h)</h4>
            <p className="text-lg font-bold text-red-500 capitalize">
              {marketStats.topLoser.name} (
              {marketStats.topLoser.change?.toFixed(2)}%)
            </p>
          </motion.div>
        </div>

        {/* Crypto Cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {cryptoList.map((key, idx) => (
            <motion.div
              key={key}
              layout
              whileHover={{ scale: 1.05 }}
              className={`flex-shrink-0 w-64 sm:w-72 md:w-64 border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl bg-white transition-all duration-500 relative overflow-hidden snap-start ${
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
                  <AnimatePresence>
                    <motion.p
                      key={crypto[key]}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`text-lg font-bold ${
                        cryptoTrend[key] === "up"
                          ? "text-green-600"
                          : cryptoTrend[key] === "down"
                          ? "text-red-500"
                          : "text-[#A72703]"
                      }`}
                    >
                      ${crypto[key]?.toLocaleString()}
                    </motion.p>
                  </AnimatePresence>
                  <p
                    className={`text-xs font-medium ${
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

              <div className="h-28 mt-1 rounded-lg p-1">
                <Line
                  data={chartData(
                    history[key],
                    cryptoColors[idx],
                    cryptoTrend[key]
                  )}
                  options={chartOptions}
                />
              </div>

              <motion.button
                onClick={() => (window.location.href = "/dashboard")}
                whileHover={{ scale: 1.03 }}
                className="mt-4 w-full px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-[#A72703] transition-all shadow-lg"
              >
                Invest
              </motion.button>

              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A72703] to-transparent animate-shimmer" />
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          Data powered by live APIs — refreshed every 30 seconds.
        </p>
      </div>
    </motion.section>
  );
};

export default Crypto;
