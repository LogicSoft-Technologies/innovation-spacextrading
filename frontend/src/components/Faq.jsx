import React from "react";

const faqs = [
  {
    question: "How can I start investing with SpaceX Innovation Trading?",
    answer:
      "To begin, create your account on the SpaceX Innovation Trading platform, verify your details, and make your first deposit. Once set up, you’ll gain access to cutting-edge trading tools, analytics, and real-time SpaceX investment data.",
  },
  {
    question:
      "What are the risks involved in trading SpaceX projects and other assets?",
    answer:
      "Like any investment, trading SpaceX projects or digital assets carries market-related risks such as price volatility, project performance, and global economic shifts. We encourage users to diversify portfolios and stay informed using our analytics tools.",
  },
  {
    question: "How has SpaceX’s private share value performed historically?",
    answer:
      "SpaceX’s valuation has seen remarkable growth over the years, driven by continuous innovation in space technology, satellite deployment, and reusable rockets. However, investors should note that private market performance can vary over time.",
  },
  {
    question:
      "How does SpaceX Innovation Trading compare to other investment platforms?",
    answer:
      "Unlike conventional brokers, our platform focuses on innovation-driven assets — from SpaceX shares to renewable energy ventures and crypto funds. We combine technology, transparency, and global access for a smarter investment experience.",
  },
  {
    question: "What factors influence the value of SpaceX investments?",
    answer:
      "Several factors — including rocket launches, satellite expansions, private funding rounds, and global technology trends — can affect the value of SpaceX-related investments. Our live market data helps investors stay updated.",
  },
  {
    question:
      "Is investing through SpaceX Innovation Trading a good long-term strategy?",
    answer:
      "Many investors consider innovation-based assets, like SpaceX and Tesla projects, valuable long-term opportunities. With consistent growth in aerospace and renewable energy sectors, the long-term potential remains strong — provided you invest wisely and diversify.",
  },
  {
    question: "How can I stay updated on SpaceX and market performance?",
    answer:
      "You can access live SpaceX project data, Tesla asset prices, and crypto analytics directly on our dashboard. Additionally, subscribe to our newsletters and notifications for real-time updates and expert insights.",
  },
  {
    question:
      "What are the benefits of investing through SpaceX Innovation Trading?",
    answer:
      "Our platform gives you access to exclusive innovation-driven investments, real-time analytics, secure transactions, and global reach — all under one unified dashboard. You’re not just investing; you’re part of the innovation revolution.",
  },
  {
    question:
      "How does leadership at SpaceX and Tesla influence investment trends?",
    answer:
      "Visionary leadership, particularly under Elon Musk, continues to drive investor confidence. His innovation-first mindset has shaped SpaceX’s growth trajectory and inspires confidence across related technology markets.",
  },
  {
    question: "What innovation had the greatest impact on SpaceX’s growth?",
    answer:
      "The development of reusable rocket technology has been a defining moment for SpaceX. It drastically reduced launch costs and redefined the aerospace industry — a core reason behind SpaceX’s impressive rise in valuation.",
  },
];

const FAQ = () => {
  return (
    <section className="bg-white py-24 px-6 md:px-24 font-[Inter]" id="faq">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-black/70 text-lg sm:text-xl max-w-3xl mx-auto">
          Have questions? We’ve got answers. Explore everything you need to know
          about investing in SpaceX projects, Tesla assets, and crypto
          opportunities through SpaceX Innovation Trading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="p-8 border border-[var(--border-light)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-500"
          >
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-3">
              {faq.question}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-black/70">
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-[#A72703] font-medium hover:underline"
          >
            Contact our 24/7 support team
          </a>{" "}
          for assistance.
        </p>
      </div>
    </section>
  );
};

export default FAQ;
