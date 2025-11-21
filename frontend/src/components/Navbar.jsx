import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Globe,
  TrendingUp,
  BarChart3,
  Coins,
  Users,
  Info,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import logo from "../assets/logo.png";
import { AuthContext } from "../Context/AuthContext";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileCard, setActiveMobileCard] = useState(null);
  const [openProfileCard, setOpenProfileCard] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();

  const backendURL = import.meta.env.VITE_LOCAL_API || "";
  const profilePhotoUrl = user?.profilePhoto
    ? `${backendURL}${user.profilePhoto}`
    : null;

  const navItems = [
    {
      name: "Markets",
      links: [
        { name: "SpaceX", icon: TrendingUp, desc: "Invest in SpaceX projects", path: "/markets/spacex" },
        { name: "Tesla Stocks", icon: BarChart3, desc: "Trade and invest in Tesla shares", path: "/markets/tesla" },
        { name: "Crypto Market", icon: Coins, desc: "Access top cryptocurrencies", path: "/markets/crypto" },
      ],
    },
    {
      name: "Invest",
      links: [
        { name: "Start Investing", icon: TrendingUp, desc: "Create a new investment plan", path: "/dashboard/markets" },
        { name: "My Investments", icon: BarChart3, desc: "Track your investment portfolio", path: "/dashboard/investments" },
        { name: "Performance", icon: Info, desc: "Analyze returns and metrics", path: "/dashboard/performance" },
        { name: "Withdraw", icon: Coins, desc: "Manage withdrawals or payouts", path: "/dashboard/finance/withdrawal" },
      ],
    },
    {
      name: "Insights",
      links: [
        { name: "Market Trends", icon: TrendingUp, desc: "Explore trending markets", path: "/insights/trends" },
        { name: "Reports", icon: BarChart3, desc: "Detailed investment insights", path: "/insights/reports" },
        { name: "Education", icon: Info, desc: "Learn to invest smartly", path: "/insights/education" },
      ],
    },
    {
      name: "Earn",
      links: [
        { name: "Affiliate Program", icon: Users, desc: "Invite friends & earn", path: "/earn/affiliate" },
        { name: "Rewards", icon: Coins, desc: "Claim your bonuses", path: "/earn/rewards" },
        { name: "Bonuses", icon: BarChart3, desc: "Exclusive limited-time offers", path: "/earn/bonuses" },
      ],
    },
    {
      name: "Company",
      links: [
        { name: "About", icon: Info, desc: "Learn more about us", path: "/company/about" },
        { name: "Vision", icon: TrendingUp, desc: "Our future goals", path: "/company/vision" },
        { name: "Team", icon: Users, desc: "Meet the team", path: "/company/team" },
        { name: "Contact", icon: Globe, desc: "Get support or inquiries", path: "/company/contact" },
      ],
    },
  ];

  const handleMobileCardToggle = (index) => {
    setActiveMobileCard((prev) => (prev === index ? null : index));
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate("/sign-in");
  };

  return (
    <nav className="flex items-center justify-between px-6 lg:px-24 py-3 border-b border-black/10 bg-white relative z-50 backdrop-blur-md">
      {/* Logo & Desktop Links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center font-bold text-2xl text-black gap-2">
          <img src={logo} alt="Space-X logo" className="w-34 h-12 rounded-xl" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-black/80">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="relative text-sm"
              onMouseEnter={() => { clearTimeout(window.dropdownTimeout); setOpenMenu(index); }}
              onMouseLeave={() => { window.dropdownTimeout = setTimeout(() => setOpenMenu(null), 200); }}
            >
              <button className="hover:text-[#A72703] transition-colors">{item.name}</button>

              <div
                className={`absolute top-full left-0 mt-8 w-[480px] bg-white/95 backdrop-blur-md border border-black/10 rounded-xl p-5 grid grid-cols-2 transition-all duration-200 ${
                  openMenu === index ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onMouseEnter={() => { clearTimeout(window.dropdownTimeout); setOpenMenu(index); }}
                onMouseLeave={() => { window.dropdownTimeout = setTimeout(() => setOpenMenu(null), 200); }}
              >
                {item.links.map((link, i) => (
                  <Link
                    key={i}
                    to={link.path}
                    className="flex items-center gap-3 text-[15px] text-black/90 hover:bg-[#FFEFE6] p-3 rounded-xl transition"
                  >
                    <div className="p-3 bg-[#A72703]/10 text-[#A72703] rounded-xl flex items-center justify-center">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-tight text-black">{link.name}</span>
                      <p className="text-xs text-black/50 leading-tight">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5 font-medium font-[Inter] relative">
        <button className="flex items-center gap-1 text-black/60 hover:text-[#A72703] transition-colors mr-3" title="Change language">
          <Globe className="w-5 h-5" />
        </button>

        {/* Static login/signup links */}
        <div className="hidden lg:flex items-center gap-3">
          {!isLoggedIn && (
            <>
              <Link
                to="/sign-in"
                className="px-4 py-2 bg-[#FFEFE6] text-[#A72703] rounded-xl hover:bg-[#FDD9C7] text-sm transition"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="px-3 py-2 bg-[#A72703] text-white rounded-xl hover:bg-[#7C1B01] text-sm transition"
              >
                Sign up
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-[#FFEFE6] text-[#A72703] rounded-xl hover:bg-[#FDD9C7] text-sm transition"
              >
                Dashboard
              </Link>

              {/* ----------- User Profile Icon ----------- */}
              <div className="relative">
                <button
                  onClick={() => setOpenProfileCard(!openProfileCard)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#A72703] flex items-center justify-center"
                >
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-[#A72703]" />
                  )}
                </button>

                {openProfileCard && (
                  <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl text-gray-700 z-50">
                  <Link
                      to="/change-password"
                      className="block px-4 py-2 hover:bg-[#FFEFE6] rounded-t-xl"
                      onClick={() => setOpenProfileCard(false)}
                    >
                      Change Password
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 hover:bg-[#FFEFE6]"
                      onClick={() => setOpenProfileCard(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-700 hover:bg-[#FFEFE6] rounded-b-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-[#A72703]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-black/10 flex flex-col p-5 lg:hidden z-30 animate-slideDown">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="mb-2 border border-black/10 rounded-xl bg-white/95 overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-[#A72703] font-semibold text-left"
                onClick={() => handleMobileCardToggle(index)}
              >
                {item.name}
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${activeMobileCard === index ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`grid grid-cols-2 gap-3 px-4 transition-all duration-300 ${
                  activeMobileCard === index ? "max-h-[300px] py-3 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                {item.links.map((link, i) => (
                  <Link
                    key={i}
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-black/70 hover:text-[#A72703] hover:bg-[#FFEFE6] p-2 rounded-lg transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    <link.icon className="w-4 h-4 text-[#A72703]" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile login/signup/dashboard */}
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2 mt-3">
              <Link to="/sign-in" className="px-4 py-2 bg-[#FFEFE6] text-[#A72703] rounded-lg text-center">
                Log in
              </Link>
              <Link to="/sign-up" className="px-4 py-2 bg-[#A72703] text-white rounded-lg text-center">
                Sign up
              </Link>
            </div>
          ) : (
            <>
              <Link to="/dashboard" className="px-4 py-2 bg-[#FFEFE6] text-[#A72703] rounded-lg text-center mt-3">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#FFEFE6] text-[#A72703] rounded-lg text-center mt-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
