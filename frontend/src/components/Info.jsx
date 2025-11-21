import React from "react";
import globalIcon from '../assets/global-icon.svg';
import paymentIcon from '../assets/payment-icon.svg';
import transferIcon from '../assets/transfer-icon.svg';
import universalIcon from '../assets/universal-icon.svg';

const Info = () => {
  const infoItems = [
    {
      title: "Universal Access",
      description:
        "Log in seamlessly from any device using our web-based SpaceX Innovation Trading platform, ensuring you can manage your investments in SpaceX projects, Tesla stocks, and cryptocurrencies on the go.",
      icon: universalIcon,
    },
    {
      title: "Payment Methods",
      description:
        "Choose from a wide range of payment options including Credit/Debit Cards, Bank Transfers, and E-wallets like PayPal for convenient investing in SpaceX Innovation opportunities.",
      icon: paymentIcon,
    },
    {
      title: "Global Reach",
      description:
        "Our platform is accessible to investors across North America, Europe (including the UK, Germany, France, and Italy), and Asia, providing truly global investing opportunities in futuristic markets.",
      icon: globalIcon,
    },
    {
      title: "Transparent Costs",
      description:
        "Register for free and start investing with a minimum deposit of just $250. SpaceX Innovation Trading ensures fully transparent costs with no hidden fees.",
      icon: transferIcon,
    },
  ];

  return (
    <section className="bg-white py-24 px-6 md:px-24 font-[Inter]">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-4">
          Important Information
        </h2>
        <p className="text-black/70 text-lg sm:text-xl">
          Maximize your investment potential with our state-of-the-art SpaceX Innovation Trading platform. Experience seamless transactions, a variety of deposit options, and global market access from any device, anywhere in the world. Start your advanced investing journey today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {infoItems.map((item, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              <img src={item.icon} alt={item.title} className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-black to-[#A72703] text-transparent bg-clip-text mb-2">
                {item.title}
              </h3>
              <p className="text-black/70 text-sm sm:text-base">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Info;
