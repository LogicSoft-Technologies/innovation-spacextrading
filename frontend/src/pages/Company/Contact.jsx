import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <section className="relative bg-white py-24 px-6 md:px-24 font-[Inter] overflow-hidden" id="contact">
      {/* Subtle floating gradient shapes */}
      <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#FFD6C5] to-[#A72703] opacity-20 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FFEFE6] to-[#A72703] opacity-15 animate-spin-slow pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-4">
          Contact Us
        </h2>
        <p className="text-black/70 text-lg sm:text-xl max-w-3xl mx-auto">
          We’re here to help you 24/7. Whether you have questions about your
          investments, need technical support, or just want to learn more about
          SpaceX Innovation Trading our team is ready to assist you anytime.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center space-y-6"
        >
          {[
            {
              icon: <Mail className="text-white w-6 h-6" />,
              title: "Email Support",
              info: <>Reach us anytime at <a href="mailto:support@innovationxtrading.net" className="text-[#A72703] font-medium hover:underline">support@innovationxtrading.net</a></>
            },
            {
              icon: <Phone className="text-white w-6 h-6" />,
              title: "Phone Contact",
              info: <>Call us directly at <span className="text-[#A72703] font-medium">+1 (800) 555-INNO</span></>
            },
            {
              icon: <MapPin className="text-white w-6 h-6" />,
              title: "Headquarters",
              info: <>10 Innovation Drive, Palo Alto, CA, United States</>
            }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-black to-[#A72703] flex items-center justify-center shadow-md">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-1">{item.title}</h3>
                <p className="text-gray-700">{item.info}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-[#F9FAFB] border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500"
        >
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A72703] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A72703] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                placeholder="Type your message here..."
                rows="5"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A72703] transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-black to-[#A72703] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
