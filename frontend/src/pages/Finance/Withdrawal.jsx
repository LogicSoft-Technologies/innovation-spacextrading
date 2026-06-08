import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  X,
  Loader,
  CheckCircle,
  Info,
  ShieldAlert,
  Wallet,
  Landmark,
  BadgeDollarSign,
  ArrowRight,
} from "lucide-react";
import api from "../../../config/api";
import { AuthContext } from "../../Context/AuthContext";

const WITHDRAWAL_THRESHOLD = 500000;

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Withdrawal = ({ onClose }) => {
  const { user } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({});
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");
  const [restriction, setRestriction] = useState(null);

  const methodInfo = {
    "Bank Transfer":
      "Processing time: 1-3 business days. Please provide full account details.",
    PayPal: "Processing time: Instant to 24 hours.",
    CashApp: "Processing time: Instant to 24 hours.",
    Wallet: "Processing time depends on network congestion.",
  };

  const methodFields = {
    "Bank Transfer": [
      {
        key: "name",
        label: "Account Holder Name",
        type: "text",
        placeholder: "Full Name",
      },
      {
        key: "iban",
        label: "IBAN / Account Number",
        type: "text",
        placeholder: "IBAN / Account Number",
      },
      {
        key: "bank",
        label: "Bank Name",
        type: "text",
        placeholder: "Bank Name",
      },
      {
        key: "swift",
        label: "SWIFT/BIC Code",
        type: "text",
        placeholder: "SWIFT/BIC",
      },
    ],
    PayPal: [
      {
        key: "email",
        label: "PayPal Email",
        type: "email",
        placeholder: "Enter PayPal email",
      },
    ],
    CashApp: [
      {
        key: "cashAppId",
        label: "CashApp ID",
        type: "text",
        placeholder: "Enter CashApp ID",
      },
    ],
    Wallet: [
      {
        key: "wallet",
        label: "Wallet Address",
        type: "text",
        placeholder: "Enter Wallet Address",
      },
    ],
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingDashboard(true);

      try {
        const res = await api.get("/api/user/dashboard");
        setDashboardData(res.data);
      } catch (err) {
        console.error("Failed to load withdrawal summary:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  const walletBalance = Number(dashboardData?.walletBalance || 0);
  const selectedFields = methodFields[method] || [];

  const formIsValid = useMemo(() => {
    if (!amount || Number(amount) <= 0 || !method) return false;

    return selectedFields.every((field) => {
      const value = paymentInfo[field.key];
      return value && String(value).trim().length > 0;
    });
  }, [amount, method, paymentInfo, selectedFields]);

  const handlePaymentChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formIsValid) {
      setToast("Please complete all withdrawal details.");
      return;
    }

    setRestriction(null);
    setToast("");
    setLoading(true);

    try {
      await api.post("/api/withdrawals", {
        amount: Number(amount),
        method,
        paymentInfo,
      });

      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;

      if (data?.rule === "MINIMUM_TOTAL_INVESTED_REQUIRED") {
        setRestriction({
          threshold: data.threshold || WITHDRAWAL_THRESHOLD,
          totalInvested: data.totalInvested || 0,
          remainingRequired:
            data.remainingRequired ||
            Math.max(WITHDRAWAL_THRESHOLD - Number(data.totalInvested || 0), 0),
          message:
            data.message ||
            "Withdrawal is unavailable until you have invested at least $500,000.",
        });
      } else {
        setToast(data?.message || "Withdrawal failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeRestriction = () => {
    setRestriction(null);
  };

  return (
    <div className="relative mx-auto max-w-4xl p-4 md:p-6 font-[Inter]">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-[#A72703]"
      >
        <X className="h-5 w-5" />
      </button>

      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-[#A72703] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {restriction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Withdrawal eligibility
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Minimum investment threshold not met
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-6 text-slate-600">
                {restriction.message}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total Invested</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatCurrency(restriction.totalInvested)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#A72703]/20 bg-[#FFF6F2] p-4">
                  <p className="text-xs text-[#7C1B01]">Required Threshold</p>
                  <p className="mt-1 text-lg font-semibold text-[#A72703]">
                    {formatCurrency(restriction.threshold)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Remaining investment required
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-800">
                  {formatCurrency(restriction.remainingRequired)}
                </p>
              </div>

              <button
                onClick={closeRestriction}
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Withdrawal desk
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Withdraw Funds</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Enter your preferred payout details and place your withdrawal request .
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-400">Wallet Balance</p>
            <p className="text-lg font-semibold text-green-400">
              {loadingDashboard ? "Loading..." : formatCurrency(walletBalance)}
            </p>
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Withdrawal Method
              </label>
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  setPaymentInfo({});
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
              >
                <option value="">Choose Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="CashApp">CashApp</option>
                <option value="Wallet">Wallet</option>
              </select>

              {method && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{methodInfo[method]}</span>
                </div>
              )}
            </div>

            {selectedFields.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedFields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={paymentInfo[field.key] || ""}
                      onChange={(e) =>
                        handlePaymentChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Withdrawal Amount (USD)
              </label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
              />
            </div>

            <button
              type="submit"
              disabled={!formIsValid || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A72703] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#A72703]/20 hover:bg-[#7C1B01] disabled:bg-slate-400 disabled:shadow-none"
            >
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              {loading ? "Submitting..." : "Place Withdrawal"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Account Summary
                  </p>
                  <p className="text-xs text-slate-500">
                    Current wallet information
                  </p>
                </div>
              </div>

              {loadingDashboard ? (
                <p className="text-sm text-slate-500">Loading summary...</p>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatCurrency(walletBalance)}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <BadgeDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Payout Details
                  </p>
                  <p className="text-xs text-slate-500">
                    Provide accurate information for smooth processing.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Secure Processing
                  </p>
                  <p className="text-xs text-slate-500">
                    Requests are reviewed by admin before payout.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <CheckCircle className="mb-4 h-16 w-16 text-green-600" />
          <h3 className="text-xl font-semibold text-slate-950">
            Request Submitted
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Your withdrawal request has been submitted and is pending admin
            review.
          </p>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;