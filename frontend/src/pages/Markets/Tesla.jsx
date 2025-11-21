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

import TeslaModelS from "../../assets/tesla-model-s.jpg";
import TeslaCybertruck from "../../assets/tesla-cybertruck.jpg";
import TeslaRoadster from "../../assets/tesla-roadster.jpg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const teslaInvestments = [
  {
    title: "Tesla Model S Plaid",
    year: "2023",
    marketCap: "$90B+",
    revenue: "+30% YoY",
    autonomous: "Full Self-Driving",
    energy: "Solar & Storage",
    description:
      "The Model S Plaid redefines speed and luxury in EVs. Boasting unprecedented performance and technology integration, it's a key driver for Tesla's market leadership.",
    image: TeslaModelS,
    stockData: [250, 270, 260, 280, 300, 320, 310],
  },
  {
    title: "Tesla Cybertruck",
    year: "2024",
    marketCap: "$50B+",
    revenue: "+25% YoY",
    autonomous: "Enhanced Autopilot",
    energy: "Battery Innovation",
    description:
      "Tesla Cybertruck is pushing the boundaries of electric utility vehicles with a bold design and revolutionary engineering, capturing attention in both consumer and commercial markets.",
    image: TeslaCybertruck,
    stockData: [400, 420, 430, 410, 440, 460, 450],
  },
  {
    title: "Tesla Roadster",
    year: "2025",
    marketCap: "$25B+",
    revenue: "+20% YoY",
    autonomous: "Autopilot Ready",
    energy: "High-Efficiency Battery",
    description:
      "The upcoming Roadster combines supercar performance with electric efficiency. It represents Tesla's continued commitment to high-performance EV innovation.",
    image: TeslaRoadster,
    stockData: [600, 620, 610, 630, 650, 670, 660],
  },
];

const Tesla = () => {
  const [showAlert, setShowAlert] = useState(false);

  const handleInvestClick = () => {
    // Clerk removed — always redirect
    window.location.href = "/dashboard";
  };

  return (
    <section className="bg-white font-[Inter] relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-24 px-6 md:px-24 text-center flex flex-col items-center justify-center">
        <motion.div
          className="absolute -top-32 -left-32 w-72 h-72 bg-[#A72703]/20 rounded-full blur-3xl animate-pulse-slow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/10 rounded-full blur-3xl animate-pulse-slow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold mb-4 font-[Poppins] bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text leading-snug z-10"
        >
          Tesla <span className="text-black/80 font-medium">Stocks & Innovations</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-black/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed z-10"
        >
          Explore Tesla’s latest models, groundbreaking innovations, and investment opportunities. Stay informed and make confident decisions in the world of electric vehicles.
        </motion.p>

        <motion.button
          onClick={handleInvestClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="inline-block px-6 py-2 md:px-8 md:py-3 bg-black text-white font-semibold rounded-lg hover:bg-[#A72703] transition-all shadow-md z-10"
        >
          Invest in Tesla Stocks
        </motion.button>
      </div>

      {/* Tesla Models Section */}
      <div className="max-w-6xl mx-auto py-24 px-6 md:px-24 space-y-24">
        {teslaInvestments.map((item, index) => {
          const chartData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [
              {
                label: "Stock Price ($)",
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
              y: { beginAtZero: false, ticks: { color: "#000" }, grid: { color: "#E5E7EB" } },
              x: { ticks: { color: "#000" }, grid: { color: "#E5E7EB" } },
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
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2 font-[Poppins]">
                  {item.title} ({item.year})
                </h3>
                <p className="text-[#A72703] font-semibold mb-4">Market Cap: {item.marketCap}</p>
                <p className="text-black/70 leading-relaxed mb-6">{item.description}</p>

                <div className="mb-6">
                  <Line data={chartData} options={chartOptions} height={200} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#FFF5F2] p-4 rounded-xl shadow-sm text-center">
                    <p className="text-gray-700 text-sm">Revenue Growth</p>
                    <p className="text-[#A72703] font-bold">{item.revenue}</p>
                  </div>
                  <div className="bg-[#FFF5F2] p-4 rounded-xl shadow-sm text-center">
                    <p className="text-gray-700 text-sm">Autonomous Tech</p>
                    <p className="text-[#A72703] font-bold">{item.autonomous}</p>
                  </div>
                  <div className="bg-[#FFF5F2] p-4 rounded-xl shadow-sm text-center">
                    <p className="text-gray-700 text-sm">Energy Innovation</p>
                    <p className="text-[#A72703] font-bold">{item.energy}</p>
                  </div>
                  <div className="bg-[#FFF5F2] p-4 rounded-xl shadow-sm text-center">
                    <p className="text-gray-700 text-sm">Market Cap</p>
                    <p className="text-[#A72703] font-bold">{item.marketCap}</p>
                  </div>
                </div>

                <button
                  onClick={handleInvestClick}
                  className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-[#A72703] transition-all shadow-md hover:shadow-lg"
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

export default Tesla;
