import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import { AuthContext } from "./Context/AuthContext";
import PageWrapper from "./components/PageWrapper";
import ScrollToTopButton from "./components/ScrollToTopButton";

// Core Pages
import Home from "./pages/Home";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import ChangePassword from "./pages/changePassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";

// Dashboard Subpages
import Overview from "./pages/Dashboard/Dashboard";
import Finance from "./pages/Dashboard/Finance";
import Investments from "./pages/Dashboard/Investments";
import Markets from "./pages/Dashboard/Markets";
import Performance from "./pages/Dashboard/Performance";
import Settings from "./pages/Dashboard/Settings";

// Markets
import SpaceX from "./pages/Markets/SpaceX";
import Tesla from "./pages/Markets/Tesla";
import Crypto from "./pages/Markets/Crypto";

// Invest
import StartInvest from "./pages/Invest/StartInvest";
import MyInvestments from "./pages/Invest/MyInvestments";
import Withdraw from "./pages/Invest/Withdraw";

// Insights
import MarketTrends from "./pages/Insights/MarketTrends";
import Reports from "./pages/Insights/Reports";
import Education from "./pages/Insights/Education";

// Earn
import Affiliate from "./pages/Earn/Affiliate";
import Rewards from "./pages/Earn/Rewards";
import Bonuses from "./pages/Earn/Bonuses";

// Company
import About from "./pages/Company/About";
import Vision from "./pages/Company/Vision";
import Team from "./pages/Company/Team";
import Contact from "./pages/Company/Contact";

// ---------- Protected Route Wrapper ----------
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A72703] border-t-transparent" />
      </div>
    );
  if (!user) return <Navigate to="/sign-in" />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ---------- Public Routes ---------- */}
          <Route
            path="/"
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            }
          />
          <Route
            path="/sign-in"
            element={
              <PageWrapper>
                <SignInPage />
              </PageWrapper>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PageWrapper>
                <SignUpPage />
              </PageWrapper>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageWrapper>
                <ForgotPassword />
              </PageWrapper>
            }
          />
          <Route
            path="/change-password"
            element={
              <PageWrapper>
                <ChangePassword />
              </PageWrapper>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PageWrapper>
                <VerifyEmail />
              </PageWrapper>
            }
          />

          {/* ---------- Protected Dashboard ---------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="finance" element={<Finance />} />
            <Route path="investments" element={<Investments />} />
            <Route path="markets" element={<Markets />} />
            <Route path="performance" element={<Performance />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ---------- Markets ---------- */}
          <Route
            path="/markets/spacex"
            element={
              <PageWrapper>
                <SpaceX />
              </PageWrapper>
            }
          />
          <Route
            path="/markets/tesla"
            element={
              <PageWrapper>
                <Tesla />
              </PageWrapper>
            }
          />
          <Route
            path="/markets/crypto"
            element={
              <PageWrapper>
                <Crypto />
              </PageWrapper>
            }
          />

          {/* ---------- Invest ---------- */}
          <Route
            path="/invest/start"
            element={
              <PageWrapper>
                <StartInvest />
              </PageWrapper>
            }
          />
          <Route
            path="/invest/my-investments"
            element={
              <PageWrapper>
                <MyInvestments />
              </PageWrapper>
            }
          />
          <Route
            path="/invest/withdraw"
            element={
              <PageWrapper>
                <Withdraw />
              </PageWrapper>
            }
          />

          {/* ---------- Insights ---------- */}
          <Route
            path="/insights/trends"
            element={
              <PageWrapper>
                <MarketTrends />
              </PageWrapper>
            }
          />
          <Route
            path="/insights/reports"
            element={
              <PageWrapper>
                <Reports />
              </PageWrapper>
            }
          />
          <Route
            path="/insights/education"
            element={
              <PageWrapper>
                <Education />
              </PageWrapper>
            }
          />

          {/* ---------- Earn ---------- */}
          <Route
            path="/earn/affiliate"
            element={
              <PageWrapper>
                <Affiliate />
              </PageWrapper>
            }
          />
          <Route
            path="/earn/rewards"
            element={
              <PageWrapper>
                <Rewards />
              </PageWrapper>
            }
          />
          <Route
            path="/earn/bonuses"
            element={
              <PageWrapper>
                <Bonuses />
              </PageWrapper>
            }
          />

          {/* ---------- Company ---------- */}
          <Route
            path="/company/about"
            element={
              <PageWrapper>
                <About />
              </PageWrapper>
            }
          />
          <Route
            path="/company/vision"
            element={
              <PageWrapper>
                <Vision />
              </PageWrapper>
            }
          />
          <Route
            path="/company/team"
            element={
              <PageWrapper>
                <Team />
              </PageWrapper>
            }
          />
          <Route
            path="/company/contact"
            element={
              <PageWrapper>
                <Contact />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* ---------- Scroll To Top Button ---------- */}
      {!hideNavbar && <ScrollToTopButton />}
    </>
  );
};

const App = () => <AppContent />;

export default App;
