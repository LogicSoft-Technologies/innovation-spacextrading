import React from "react";
import { Link } from "react-router-dom";
import spacexLogo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-[#FFF3EE] py-14 border-t border-[#A72703]/20 font-[Inter]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-10 md:gap-24 justify-between">
        {/* LEFT SIDE - COMPANY & SUPPORT */}
        <div className="flex flex-col md:flex-row gap-16">
          {/* COMPANY */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg bg-gradient-to-r from-black to-[#A72703] bg-clip-text text-transparent">
              COMPANY
            </h4>
            <Link
              to="/company/about"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              About Us
            </Link>
            <Link
              to="/company/contact"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              Contact
            </Link>
            <Link
              to="/sign-up"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              Sign Up
            </Link>
            <Link
              to="/sign-in"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              Login
            </Link>
          </div>

          {/* SUPPORT */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg bg-gradient-to-r from-black to-[#A72703] bg-clip-text text-transparent">
              SUPPORT
            </h4>
            <Link
              to="/privacy-policy"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-use"
              className="block text-black/70 hover:text-[#A72703] transition-colors duration-300"
            >
              Terms of Use
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE - Disclaimer */}
        <div className="text-black/60 text-sm md:flex-1 space-y-6 leading-relaxed">
          <p>
            <span className="text-black font-semibold">
              SpaceX Innovation Trading
            </span>{" "}
            offers futuristic investment opportunities in SpaceX projects, Tesla stocks,
            and cryptocurrencies. Trading involves potential gains and losses. Approximately
            70% of investors may encounter financial challenges.
          </p>
          <p>
            Some names and entities on our platform are used for marketing purposes and may
            not represent real entities. Testimonials and media content may feature actors
            for promotional purposes only.
          </p>
          <p>
            Review the Terms & Conditions and Disclaimers of any trading platforms you use.
            Understand local tax obligations for capital gains.
          </p>
          <p>
            By submitting your details, you consent to the use of your information according
            to our Privacy Policy and Terms & Conditions. Investors can choose their approach
            via automated trading, brokers, or independent trading.
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="max-w-7xl mx-auto px-6 mt-14 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-[#A72703]/10 pt-6">
        <div className="flex items-center gap-3">
          <img
            src={spacexLogo}
            alt="SpaceX Logo"
            className="w-32 object-contain border-4 border-[#A72703]/10 rounded-xl shadow-sm"
          />
        </div>
        <p className="text-black/60 font-medium text-sm">
          © 2025 SpaceX Innovation Trading — All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
