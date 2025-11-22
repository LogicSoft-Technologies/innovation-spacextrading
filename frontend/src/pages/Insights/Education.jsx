import React from "react";
import { motion } from "framer-motion";
import { BookOpen, PieChart, Users, Globe } from "lucide-react";

const courses = [
  {
    title: "Investing in SpaceX",
    description: "Learn the fundamentals of investing in private space projects.",
    icon: BookOpen,
    duration: "3 hrs",
  },
  {
    title: "Tesla Stock Analysis",
    description: "Master technical and fundamental analysis for Tesla stocks.",
    icon: PieChart,
    duration: "4 hrs",
  },
  {
    title: "Cryptocurrency Basics",
    description: "Understand Bitcoin, Ethereum, and top altcoins for smart investing.",
    icon: Globe,
    duration: "5 hrs",
  },
  {
    title: "Investor Psychology",
    description: "Develop the mindset to make rational, profitable investment decisions.",
    icon: Users,
    duration: "2.5 hrs",
  },
];

const Education = () => {
  return (
    <section className="bg-white font-[Inter] py-28 px-6 lg:px-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-black mb-8 font-[Poppins] text-center bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text"
      >
        Education
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-black/70 text-center max-w-2xl mx-auto mb-16 leading-relaxed"
      >
        Learn how to invest like a pro. Our curated courses and tutorials help you understand markets, strategies, and risk management.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {courses.map((course, index) => {
          const Icon = course.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-[#FFF5F2] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-[#A72703]" />
                <h3 className="text-xl font-semibold text-black">{course.title}</h3>
              </div>
              <p className="text-black/70 mb-6">{course.description}</p>
              <p className="text-[#A72703] font-semibold">Duration: {course.duration}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Education;
