import React, { useState, useEffect } from "react";
import { X, CheckCircle, Copy, Loader } from "lucide-react";
import api from "../../config/api";

const InvestmentModal = ({ onClose, amount, market, lastPrice }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/payment-methods");
        setPaymentMethods(res.data?.paymentMethods || res.data || []);
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      }
    };
    load();
  }, []);

  const unitsPurchased =
    lastPrice && amount ? (Number(amount) / Number(lastPrice)).toFixed(6) : "—";

  useEffect(() => {
    if (selectedMethod?.toLowerCase().includes("crypto") && lastPrice) {
      setCryptoAmount((Number(amount) / Number(lastPrice)).toFixed(6));
    } else {
      setCryptoAmount(0);
    }
  }, [selectedMethod, amount, lastPrice]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to clipboard!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedMethod || !receipt || !confirmed) {
      setError("Please fill all required fields and confirm payment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const investmentType = ["btc", "eth", "crypto"].includes(
        market?.toLowerCase()
      )
        ? "crypto"
        : "stock";

      const formData = new FormData();
      formData.append("investmentType", investmentType);
      formData.append("symbol", market?.toUpperCase() || "");
      formData.append("amount", amount);
      formData.append("paymentMethod", selectedMethod);
      formData.append("receiptImage", receipt);

      const res = await api.post("/api/payments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      if (res.status === 201) setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit investment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const methodDetails = paymentMethods.find((m) => m.name === selectedMethod)?.details;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-[#A72703]"
        >
          <X className="w-6 h-6" />
        </button>

        {toast && (
          <div className="fixed top-6 right-6 bg-[#A72703] text-white px-4 py-2 rounded-lg shadow-lg animate-fadeInOut z-50">
            {toast}
          </div>
        )}

        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold mb-3 text-[#A72703]">
              Invest in {market?.toUpperCase()}
            </h2>

            <p className="text-gray-600 mb-1">
              Amount: ${Number(amount || 0).toFixed(2)}
            </p>
            <p className="text-gray-600 mb-4">
              Units Purchased: {unitsPurchased} {market?.toUpperCase()}
            </p>

            {cryptoAmount > 0 && (
              <p className="text-gray-600 mb-4">
                {cryptoAmount} {market?.toUpperCase()} to pay
              </p>
            )}

            {error && (
              <div className="mb-4 text-red-600 font-medium bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-4 text-gray-700 py-2"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="">-- Select Method --</option>
                  {paymentMethods.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMethod && methodDetails && (
                <div className="p-4 bg-[#FFEFE6] rounded-xl text-[#A72703] flex items-center justify-between gap-3">
                  <span>
                    {cryptoAmount > 0
                      ? `${cryptoAmount} ${market?.toUpperCase()} to pay (Wallet: ${methodDetails})`
                      : methodDetails}
                  </span>
                  <button
                    onClick={() => handleCopy(methodDetails)}
                    className="p-2 bg-[#A72703] text-white rounded-lg hover:bg-[#7C1B01]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Receipt
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceipt(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I confirm I have made this payment
              </label>

              <button
                onClick={handleSubmit}
                disabled={!confirmed || !receipt || !selectedMethod || loading}
                className="w-full py-3 rounded-xl bg-[#A72703] text-white font-semibold hover:bg-[#7C1B01] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="animate-spin w-5 h-5" />}
                {loading ? "Processing..." : "I Have Paid"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
            <h3 className="text-xl font-semibold text-[#A72703] mb-2">
              Congratulations!
            </h3>
            <p className="text-gray-600 max-w-md">
              Your investment has been submitted successfully. We'll notify you
              once it's approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentModal;
