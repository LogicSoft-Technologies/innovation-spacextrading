import React from "react";
import { motion } from "framer-motion";
import { Rocket, Wallet2, BarChart3, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Rocket className="w-10 h-10 text-[#A72703]" />,
      title: "Sign Up",
      text: "Create your account on the secure SpaceX Innovation Trading platform and gain access to advanced investing tools. It’s quick and easy — just provide basic information to start your journey.",
    },
    {
      icon: <Wallet2 className="w-10 h-10 text-[#A72703]" />,
      title: "Fund Your Account",
      text: "Deposit funds safely to start investing in SpaceX projects, Tesla stocks, and cryptocurrencies. Choose from multiple secure payment options with encrypted transactions.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-[#A72703]" />,
      title: "Monitor the Market",
      text: "Explore live market data for SpaceX projects, Tesla shares, and crypto assets. Use our real-time analytics tools to track performance and market trends.",
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-[#A72703]" />,
      title: "Grow Your Investments",
      text: "Manage your portfolio and watch your investments grow. Our insights, reports, and analytics help you make informed decisions for optimal returns.",
    },
  ];

  return (
    <section
      className="bg-white py-24 px-6 md:px-24 font-[Inter]"
      id="how-it-works"
    >
      {/* Section Header */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-4">
          How It Works
        </h2>
        <p className="text-black/70 text-lg sm:text-xl max-w-3xl mx-auto">
          Begin your SpaceX Innovation Trading journey in four simple steps —
          create your account, fund it securely, explore live markets, and grow
          your investments with smart insights.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-2 bg-white"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-[#ff6b3d]/10 to-[#A72703]/10 p-4 rounded-full">
                {step.icon}
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-black mb-3 text-center">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-center">
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
