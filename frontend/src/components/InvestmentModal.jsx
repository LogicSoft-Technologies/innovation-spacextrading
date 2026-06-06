import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle,
  Copy,
  Loader,
  Receipt,
  ShieldCheck,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  getAdminPaymentMethods,
  userCreateInvestment,
} from "../Services/authServices";

const cryptoMarkets = [
  "bitcoin",
  "ethereum",
  "solana",
  "dogecoin",
  "binancecoin",
  "cardano",
  "ripple",
];

const InvestmentModal = ({
  onClose,
  amount,
  market,
  lastPrice,
  durationValue,
  durationUnit,
  durationDays,
  profit,
  totalAmount,
  twoDayCycles,
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await getAdminPaymentMethods();
        setPaymentMethods(methods);
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      }
    };

    loadPaymentMethods();
  }, []);

  const investmentType = cryptoMarkets.includes(market?.toLowerCase())
    ? "crypto"
    : "stock";

  const methodDetails = paymentMethods.find(
    (m) => m.name === selectedMethod
  )?.details;

  const unitsPurchased = useMemo(() => {
    if (!lastPrice || !amount) return null;
    return Number(amount) / Number(lastPrice);
  }, [amount, lastPrice]);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setToast("Copied to clipboard");
    setTimeout(() => setToast(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !selectedMethod || !receipt || !confirmed) {
      setError("Please select a payment method, upload receipt, and confirm payment.");
      return;
    }

    if (!durationValue || !durationUnit) {
      setError("Investment duration is missing. Please close and select a duration.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("investmentType", investmentType);
      formData.append("symbol", market?.toUpperCase() || "");
      formData.append("amount", amount);
      formData.append("paymentMethod", selectedMethod);
      formData.append("receiptImage", receipt);
      formData.append("durationValue", durationValue);
      formData.append("durationUnit", durationUnit);

      await userCreateInvestment(formData);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit investment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-[#A72703]"
        >
          <X className="w-5 h-5" />
        </button>

        {toast && (
          <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            {toast}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                Investment order
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {market?.toUpperCase()} allocation
              </h2>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Principal</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    ${Number(amount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Expected Profit</p>
                  <p className="mt-1 text-lg font-semibold text-green-700">
                    ${Number(profit || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-[#A72703]/20 bg-[#FFF6F2] p-4">
                  <p className="text-xs text-[#7C1B01]">Final Return</p>
                  <p className="mt-1 text-lg font-semibold text-[#A72703]">
                    ${Number(totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex gap-3">
                    <CalendarDays className="w-5 h-5 text-[#A72703]" />
                    <div>
                      <p className="text-slate-500">Duration</p>
                      <p className="font-semibold text-slate-900">
                        {durationValue} {durationUnit}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-green-700" />
                    <div>
                      <p className="text-slate-500">Profit Rule</p>
                      <p className="font-semibold text-slate-900">
                        30% every 2 days
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    <div>
                      <p className="text-slate-500">Cycles</p>
                      <p className="font-semibold text-slate-900">
                        {twoDayCycles || 0} cycles over {durationDays || 0} days
                      </p>
                    </div>
                  </div>
                </div>

                {unitsPurchased && (
                  <p className="mt-4 text-xs text-slate-500">
                    Estimated units: {unitsPurchased.toFixed(6)}{" "}
                    {market?.toUpperCase()}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/15"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((m) => (
                    <option key={m._id || m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMethod && methodDetails && (
                <div className="rounded-xl border border-[#A72703]/20 bg-[#FFF6F2] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#7C1B01] font-semibold">
                        Payment details
                      </p>
                      <p className="mt-2 text-sm text-slate-800 break-all">
                        {methodDetails}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(methodDetails)}
                      className="rounded-lg bg-[#A72703] p-2 text-white hover:bg-[#7C1B01]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Payment Receipt
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-[#A72703] hover:bg-[#FFF6F2]">
                  <Receipt className="w-7 h-7 text-slate-500" />
                  <span className="mt-2 text-sm font-medium text-slate-700">
                    {receipt ? receipt.name : "Choose receipt image or PDF"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceipt(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I confirm that I have made this payment and understand this
                  investment matures after the selected duration.
                </span>
              </label>

              <button
                type="submit"
                disabled={!confirmed || !receipt || !selectedMethod || loading}
                className="w-full rounded-xl bg-[#A72703] px-5 py-3 font-semibold text-white shadow-lg shadow-[#A72703]/20 hover:bg-[#7C1B01] disabled:bg-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading && <Loader className="animate-spin w-5 h-5" />}
                {loading ? "Submitting investment..." : "Submit Investment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-2xl font-semibold text-slate-950">
              Investment submitted
            </h3>
            <p className="mt-2 max-w-md text-slate-600">
              Your investment is pending admin approval. Once approved, the
              selected duration countdown will begin.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-[#A72703] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7C1B01]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentModal;