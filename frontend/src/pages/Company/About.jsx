import React from "react";
import { motion } from "framer-motion";
import { Rocket, TrendingUp, ShieldCheck } from "lucide-react";

const About = () => {
  return (
    <section className="relative bg-white font-[Inter] overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#FFEFE6_0%,transparent_40%),radial-gradient(circle_at_75%_80%,#A72703_0%,transparent_50%)] opacity-15 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-12 px-6 lg:px-24 text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black font-[Poppins]"
        >
          About{" "}
          <span className="bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text">
            SpaceX Innovation Trading
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-black/70 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          We’re redefining how people invest in the future. From SpaceX and Tesla to
          next-generation cryptocurrencies, we provide an ecosystem that connects you
          to innovation, data, and growth opportunities.
        </motion.p>
      </div>

      {/* Core Values */}
      <div className="max-w-6xl mx-auto px-6 lg:px-20 py-10 space-y-16 relative z-10">
        {[
          {
            icon: <Rocket className="w-8 h-8 text-white" />,
            title: "Innovation First",
            text: "We pioneer the future of investment. Our platform integrates SpaceX projects, Tesla shares, and cryptocurrencies, providing tools and insights to help investors make bold, informed decisions.",
          },
          {
            icon: <TrendingUp className="w-8 h-8 text-white" />,
            title: "Sustainable Growth",
            text: "We focus on long-term, consistent growth. Our analytics, reports, and live market insights empower you to track performance and optimize investments with confidence.",
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-white" />,
            title: "Trust & Security",
            text: "Security and transparency are core to our platform. Enjoy verified investment channels, safe transactions, and 24/7 investor support — giving you peace of mind while investing in the future.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`flex flex-col lg:flex-row items-center gap-6 ${
              i % 2 !== 0 ? "lg:flex-row-reverse" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-black to-[#A72703] flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-300">
              {item.icon}
            </div>
            <div className="lg:w-2/3 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl font-extrabold font-[Poppins] bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-2">
                {item.title}
              </h2>
              <p className="text-black/70 text-sm sm:text-base leading-relaxed">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-center py-16 px-6 lg:px-24 bg-gradient-to-r from-[#FFF5F2] to-white border-t border-[#FFD6C5]/60"
      >
        <h3 className="text-xl sm:text-3xl font-extrabold mb-4 font-[Poppins] bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text">
          Join the Future of Investment
        </h3>
        <p className="text-black/70 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
          Start your journey with SpaceX Innovation Trading today. Access exclusive
          markets, manage your investments, and grow confidently in a futuristic platform.
        </p>
        <a
          href="/sign-up"
          className="inline-block px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-[#A72703] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          Get Started
        </a>
      </motion.div>
    </section>
  );
};

export default About;
