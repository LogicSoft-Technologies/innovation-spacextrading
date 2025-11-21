import { motion } from "framer-motion";
import { useState, useContext } from "react";
import { AlertCircle } from "lucide-react";
import { AuthContext } from "../Context/AuthContext";

import heroImg from "../assets/spaceX.png";
import spacexIcon from "../assets/spacex-icon.png";
import teslaIcon from "../assets/tesla-icon.png";
import cryptoIcon from "../assets/crypto-icon.png";

const Hero = () => {
  const { user } = useContext(AuthContext);         // ✅ get authenticated user
  const isAuthenticated = !!user;                   // ✅ convert to boolean
  const [showAlert, setShowAlert] = useState(false);

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2500);
      return;
    }
    callback();
  };

  const handleDashboardClick = () => {
    requireAuth(() => {
      window.location.href = "/dashboard";
    });
  };

  const handleMarketClick = () => {
    requireAuth(() => {
      window.location.href = "/dashboard/markets";
    });
  };

  return (
    <section className="relative bg-white pt-28 pb-56 overflow-visible font-[Inter]">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#FFEFE6_0%,transparent_40%),radial-gradient(circle_at_75%_80%,#A72703_0%,transparent_40%)] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6 lg:px-24">
        
        {/* LEFT TEXT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold text-black leading-tight tracking-tight font-[Poppins]">
            Power Your Future with{" "}
            <span className="bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text font-[Poppins]">
              SpaceX Innovation Trading
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-black/70 max-w-md mx-auto lg:mx-0 leading-relaxed font-[Inter]">
            Take control of your investments in a futuristic ecosystem built
            for visionaries — from{" "}
            <span className="font-medium text-[#A72703]">SpaceX</span> projects
            to <span className="font-medium text-[#A72703]">Tesla</span> stocks
            and <span className="font-medium text-[#A72703]">Crypto</span>{" "}
            innovations. Experience trading that’s beyond the ordinary.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            
            {/* Start Investing */}
            <button
              onClick={handleDashboardClick}
              className="px-6 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-all shadow-md hover:shadow-lg"
            >
              Start Investing
            </button>

            {/* Explore Markets */}
            <button
              onClick={handleMarketClick}
              className="px-6 py-3 rounded-lg border border-black text-black text-sm font-medium hover:bg-[#FFEFE6] transition-all shadow-sm"
            >
              Explore Markets
            </button>
          </div>

          {/* LOGIN REQUIRED ALERT */}
          {showAlert && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg z-20">
              <AlertCircle className="w-5 h-5" />
              Please sign up or log in to access the dashboard.
            </div>
          )}
        </motion.div>

        {/* RIGHT IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-2xl">
            <div className="absolute -inset-3 bg-gradient-to-r from-black/20 to-[#A72703]/20 blur-2xl opacity-30 rounded-3xl pointer-events-none"></div>
            <img
              src={heroImg}
              alt="Trading platform preview"
              className="relative rounded-3xl shadow-xl border border-[#FFEFE6]/50 w-full object-contain"
            />
          </div>
        </motion.div>
      </div>

      {/* STATS CARD */}
      <div className="absolute left-1/2 bottom-0 translate-y-1/2 transform -translate-x-1/2 w-[92%] sm:w-[90%] md:w-[80%] lg:w-[73%] bg-white rounded-2xl px-6 sm:px-10 shadow-lg py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 z-20 border border-[#FFEFE6]/50 backdrop-blur-md">
        {[
          { icon: spacexIcon, value: "5+", label: "Years of innovative SpaceX trading" },
          { icon: teslaIcon, value: "$120M+", label: "Total investments in Tesla & crypto" },
          { icon: cryptoIcon, value: "45,000+", label: "Active investors on the platform" }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-black/20 bg-gradient-to-br from-white to-[#FFEFE6] flex items-center justify-center shadow-md hover:shadow-lg transition-all">
              <img src={item.icon} alt={item.label} className="w-8 h-8 sm:w-14 sm:h-14 object-contain rounded-full" />
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black font-[Poppins]"
            >
              {item.value}
            </motion.h3>
            <p className="text-xs sm:text-sm md:text-base text-black/50 max-w-[230px] font-[Inter]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
