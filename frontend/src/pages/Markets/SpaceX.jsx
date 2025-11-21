import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import StarshipImg from "../../assets/starship.jpg";
import StarlinkImg from "../../assets/starlink.jpg";
import RaptorEngineImg from "../../assets/rapto-engine.jpg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const spaceXInvestments = [
  {
    title: "Starship",
    year: "2025",
    marketCap: "$120B+",
    revenue: "+40% YoY",
    description:
      "Starship is the next-generation fully reusable spacecraft designed for interplanetary travel, including Mars missions. Investing in Starship technologies positions you at the forefront of space exploration.",
    image: StarshipImg,
    stockData: [100, 120, 130, 125, 140, 160, 150],
  },
  {
    title: "Starlink",
    year: "2024",
    marketCap: "$60B+",
    revenue: "+35% YoY",
    description:
      "Starlink provides global high-speed internet through a constellation of satellites. Its expansion potential makes it a promising growth investment for future connectivity.",
    image: StarlinkImg,
    stockData: [50, 60, 65, 63, 70, 75, 73],
  },
  {
    title: "Raptor Engine",
    year: "2023",
    marketCap: "$30B+",
    revenue: "+25% YoY",
    description:
      "Raptor engines are powering SpaceX’s Starship and future heavy-lift rockets. Investing in this cutting-edge propulsion technology supports scalable space missions.",
    image: RaptorEngineImg,
    stockData: [20, 25, 27, 26, 28, 30, 29],
  },
];

const SpaceX = () => {
  const [showAlert, setShowAlert] = useState(false);

  const handleInvestClick = () => {
    // Clerk removed — always redirect
    window.location.href = "/dashboard";
  };

  return (
    <section className="bg-black font-[Inter] relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-28 px-6 md:px-24 text-center flex flex-col items-center justify-center">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/90 to-black/0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute -top-32 -left-32 w-72 h-72 bg-[#A72703]/20 rounded-full blur-3xl animate-pulse-slow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold mb-4 font-[Poppins] bg-gradient-to-r from-white to-[#A72703] text-transparent bg-clip-text leading-snug z-10"
        >
          SpaceX <span className="text-white/80 font-medium">Stocks & Projects</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed z-10"
        >
          Explore SpaceX’s cutting-edge projects — Starship, Starlink, and advanced propulsion systems. Invest in the private space revolution with confidence.
        </motion.p>

        <motion.button
          onClick={handleInvestClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="inline-block px-6 py-2 md:px-8 md:py-3 bg-[#A72703] text-white font-semibold rounded-lg hover:bg-black transition-all shadow-md z-10"
        >
          Invest in SpaceX
        </motion.button>
      </div>

      {/* SpaceX Projects Section */}
      <div className="max-w-6xl mx-auto py-24 px-6 md:px-24 space-y-24">
        {spaceXInvestments.map((item, index) => {
          const chartData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [
              {
                label: "Private Share Value ($M)",
                data: item.stockData,
                borderColor: "#A72703",
                backgroundColor: "rgba(167, 39, 3, 0.2)",
                tension: 0.4,
              },
            ],
          };

          const chartOptions = {
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { mode: "index" } },
            scales: {
              y: { beginAtZero: false, ticks: { color: "#fff" }, grid: { color: "#374151" } },
              x: { ticks: { color: "#fff" }, grid: { color: "#374151" } },
            },
          };

          return (
            <motion.div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="lg:w-1/2">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="rounded-2xl w-full h-[400px] object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>

              <div className="lg:w-1/2">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-[Poppins]">
                  {item.title} ({item.year})
                </h3>
                <p className="text-[#A72703] font-semibold mb-4">Market Cap: {item.marketCap}</p>
                <p className="text-white/70 leading-relaxed mb-6">{item.description}</p>

                <div className="mb-6">
                  <Line data={chartData} options={chartOptions} height={200} />
                </div>

                <button
                  onClick={handleInvestClick}
                  className="px-6 py-3 bg-[#A72703] text-white rounded-xl text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg"
                >
                  Invest Now
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SpaceX;
