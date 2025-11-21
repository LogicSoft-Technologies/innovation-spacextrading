import React from "react";
import Team1 from "../../assets/elon.png";
import Team2 from "../../assets/team2.png";
import Team3 from "../../assets/team3.png";
import { Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const team = [
  {
    name: "Elon Musk",
    role: "Founder & CEO",
    img: Team1,
    link: "#",
  },
  {
    name: "Robyn Denholm",
    role: "Chief Investment Officer",
    img: Team2,
    link: "#",
  },
  {
    name: "Ashok Elluswamy",
    role: "Head of Technology",
    img: Team3,
    link: "#",
  },
];

const Team = () => {
  return (
    <section className="relative bg-white py-24 px-6 md:px-24 font-[Inter]" id="team">
      {/* Subtle background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#FFD6C5] to-[#A72703] opacity-15 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FFEFE6] to-[#A72703] opacity-15 animate-spin-slow pointer-events-none"></div>

      <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-4">
          Meet Our Leadership Team
        </h2>
        <p className="text-black/70 text-lg sm:text-xl max-w-3xl mx-auto">
          Our diverse team of visionaries, strategists, and engineers drives the
          mission to make global innovation accessible to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto relative z-10">
        {team.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-3xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all group bg-white"
          >
            <div className="relative">
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <a
                href={member.link}
                className="absolute bottom-4 right-4 bg-[#A72703] text-white rounded-full p-3 hover:bg-black shadow-md transition-all"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-black mb-1">{member.name}</h3>
              <p className="text-gray-600 text-lg">{member.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Team;
