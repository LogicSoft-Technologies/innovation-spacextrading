import React from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

const reports = [
  {
    title: "SpaceX Q3 Performance",
    description: "Detailed breakdown of SpaceX investments, stock performance, and forecasts.",
  },
  {
    title: "Tesla Annual Review 2025",
    description: "Comprehensive Tesla market analysis, revenue growth, and innovation insights.",
  },
  {
    title: "Crypto Market Overview",
    description: "Bitcoin, Ethereum, and altcoins latest trends and expert analysis.",
  },
];

const Reports = () => {
  return (
    <section className="bg-white font-[Inter] py-28 px-6 lg:px-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-black mb-8 font-[Poppins] text-center bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text"
      >
        Reports
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-black/70 text-center max-w-2xl mx-auto mb-16 leading-relaxed"
      >
        Download and explore our detailed reports on SpaceX, Tesla, and cryptocurrency markets. Make informed investment decisions with Innovation SpaceX Trading insights.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {reports.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-[#FFF5F2] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-[#A72703]" />
                <h3 className="text-xl font-semibold text-black">{report.title}</h3>
              </div>
              <p className="text-black/70">{report.description}</p>
            </div>
            <button className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-[#A72703] text-white font-medium rounded-xl hover:bg-black transition-all shadow-md">
              Download Report <Download className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Reports;
