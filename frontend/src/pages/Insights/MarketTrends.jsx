import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  TrendingUp,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

import ChartJS from "chart.js/auto";
import spacexIcon from "../../assets/spacex-icon.png";
import teslaIcon from "../../assets/tesla-icon.png";
import cryptoIcon from "../../assets/crypto-icon.png";

const trendsData = [
  {
    name: "SpaceX Stocks",
    icon: spacexIcon,
    trend: "+12.5%",
    description: "Strong upward growth in SpaceX private shares.",
    chartData: [100, 120, 130, 145, 160, 180, 200],
  },
  {
    name: "Tesla Stocks",
    icon: teslaIcon,
    trend: "+8.7%",
    description: "Tesla continues to dominate the EV market with rising valuations.",
    chartData: [250, 270, 265, 280, 300, 310, 330],
  },
  {
    name: "Crypto Market",
    icon: cryptoIcon,
    trend: "+15.2%",
    description: "Bitcoin and altcoins showing a bullish trend.",
    chartData: [50, 60, 70, 80, 85, 95, 110],
  },
];

const MarketTrends = () => {
  return (
    <section className="bg-white font-[Inter] relative overflow-hidden py-28 px-6 lg:px-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-black mb-8 font-[Poppins] text-center bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text"
      >
        Market Trends
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-black/70 text-center max-w-2xl mx-auto mb-16 leading-relaxed"
      >
        Explore the latest market movements across SpaceX, Tesla, and Crypto. Stay ahead of the trends and invest smartly with Innovation SpaceX Trading.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {trendsData.map((item, index) => {
          const chartConfig = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [
              {
                label: item.name,
                data: item.chartData,
                borderColor: "#A72703",
                backgroundColor: "rgba(167,39,3,0.2)",
                tension: 0.4,
              },
            ],
          };

          const chartOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { color: "#000" }, grid: { color: "#E5E7EB" } },
              x: { ticks: { color: "#000" }, grid: { color: "#E5E7EB" } },
            },
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-[#FFF5F2] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <img src={item.icon} alt={item.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-black">{item.name}</h3>
                  <p className="text-[#A72703] font-bold flex items-center gap-1">
                    {item.trend} <TrendingUp className="w-4 h-4" />
                  </p>
                </div>
              </div>

              <p className="text-black/70 mb-4">{item.description}</p>

              <div className="bg-white p-3 rounded-xl shadow-inner">
                <Line data={chartConfig} options={chartOptions} height={150} />
              </div>

              <button className="mt-4 w-full px-4 py-2 bg-[#A72703] text-white font-medium rounded-xl hover:bg-black transition-all shadow-md">
                View Details <ArrowUpRight className="inline w-4 h-4 ml-1" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default MarketTrends;
