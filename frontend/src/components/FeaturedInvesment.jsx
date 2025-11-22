import { motion } from "framer-motion";
import spacexImg from "../assets/spacex-image.png";
import teslaImg from "../assets/tesla-image.jpg";
import cryptoImg from "../assets/crypto-growth.png";
import { Link } from "react-router-dom";

const investments = [
  {
    title: "SpaceX Private Share Funds",
    description:
      "Gain exclusive access to SpaceX private share opportunities — invest in the future of interplanetary innovation. These funds focus on aerospace growth, research, and technology advancements.",
    image: spacexImg,
    path: "/markets/spacex",
  },
  {
    title: "Tesla Stock Bundles",
    description:
      "Diversify your portfolio with high-performing Tesla stock bundles. Designed for investors who believe in clean energy, self-driving technology, and sustainable innovation.",
    image: teslaImg,
    path: "/markets/tesla",
  },
  {
    title: "Crypto Growth Portfolios",
    description:
      "Explore our expertly curated cryptocurrency growth portfolios. Balanced for risk and reward, these portfolios include top-performing digital assets and emerging blockchain projects.",
    image: cryptoImg,
    path: "/markets/crypto",
  },
];

const FeaturedInvestments = () => {
  return (
    <section className="relative bg-white pt-40 pb-24 px-6 lg:px-24 font-[Inter]">
      <div className="text-center mb-20 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-black font-[Poppins]">
          Featured Investment Opportunities
        </h2>
        <p className="text-black/70 mt-4 max-w-2xl mx-auto leading-relaxed">
          Explore our carefully selected range of investment categories designed
          for futuristic investors — from aerospace to blockchain.
        </p>
      </div>

      <div className="space-y-24 relative z-10">
        {investments.map((item, index) => (
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
            {/* Image */}
            <div className="lg:w-1/2">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="rounded-2xl w-full h-[400px] object-cover hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>

            {/* Text */}
            <div className="lg:w-1/2">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 font-[Poppins]">
                {item.title}
              </h3>
              <p className="text-black/70 leading-relaxed mb-8">
                {item.description}
              </p>

              <Link
                to={item.path}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-[#222] transition-all shadow-md hover:shadow-lg inline-block"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedInvestments;
