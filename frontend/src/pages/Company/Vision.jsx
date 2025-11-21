import React from "react";
import { Link } from "react-router-dom";
import { Globe2, Star, Target } from "lucide-react";

const Vision = () => {
  return (
    <section className="bg-[#F9FAFB] py-24 px-6 md:px-24 font-[Inter]" id="vision">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text">
          Our Vision for the Future
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
          SpaceX Innovation Trading aims to create a global investment ecosystem where innovation meets accessibility,
          empowering investors to participate in futuristic markets across SpaceX projects, Tesla stocks, and cryptocurrencies.
        </p>
      </div>

      {/* Vision Pillars */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <Globe2 className="w-12 h-12 text-[#A72703] mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Global Accessibility</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Bringing next-generation investment opportunities to investors worldwide without barriers.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <Star className="w-12 h-12 text-[#A72703] mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Data-Driven Excellence</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Leveraging AI, analytics, and transparency to help investors make confident, informed decisions.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <Target className="w-12 h-12 text-[#A72703] mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Purpose-Driven Mission</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Every initiative aligns with our mission to accelerate innovation and make investment accessible to all.
          </p>
        </div>
      </div>

      {/* Subtle CTA */}
      <div className="max-w-3xl mx-auto text-center mt-12">
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
          Want to learn more about how SpaceX Innovation Trading connects you to futuristic markets? Visit our{" "}
          <Link to="/company/about" className="text-[#A72703] font-semibold hover:underline">
            About page
          </Link>{" "}
          for more details.
        </p>
      </div>
    </section>
  );
};

export default Vision;
