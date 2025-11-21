import React, { useState, useEffect, useContext } from "react";
import {
  CheckCircle,
  DollarSign,
  Wallet,
  Banknote,
  Coins,
  Loader,
  Copy,
  X,
} from "lucide-react";
import api from "../../../config/api";
import { AuthContext } from "../../Context/AuthContext";

const getIcon = (name) => {
  if (!name) return DollarSign;
  const lower = name.toLowerCase();
  if (lower.includes("binance")) return Coins;
  if (lower.includes("paypal")) return Wallet;
  if (lower.includes("bank")) return Banknote;
  if (lower.includes("crypto")) return DollarSign;
  return DollarSign;
};

const Deposit = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [cryptoRate] = useState({ usdt: 1, btc: 65000 });
  const [convertedAmount, setConvertedAmount] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/payment-methods");
        setPaymentMethods(res.data || []);
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedMethod?.toLowerCase().includes("crypto") && amount) {
      const usdtValue = Number(amount) / cryptoRate.usdt;
      const btcValue = Number(amount) / cryptoRate.btc;
      setConvertedAmount({
        usdt: usdtValue.toFixed(2),
        btc: btcValue.toFixed(6),
      });
    } else {
      setConvertedAmount({});
    }
  }, [amount, selectedMethod, cryptoRate]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setToast("Copied!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod || !amount || !receipt || !confirmed) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("method", selectedMethod);
      formData.append("receipt", receipt);

      await api.post("/api/deposits", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (err) {
      setToast(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const methodDetails = paymentMethods.find((m) => m.name === selectedMethod)?.details;

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-[#A72703]"
      >
        <X className="w-6 h-6" />
      </button>

      {toast && (
        <div className="fixed top-6 right-6 bg-[#A72703] text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-3 text-[#A72703]">
        Deposit Funds
      </h2>
      <p className="text-gray-600 mb-6">
        Choose your preferred payment method.
      </p>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white shadow-sm rounded-2xl p-6 border border-gray-200"
        >
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div
              className="border border-gray-300 rounded-xl px-4 py-2 cursor-pointer"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <div className="flex items-center justify-between">
                {selectedMethod ? (
                  <div className="flex items-center gap-2">
                    {React.createElement(getIcon(selectedMethod), {
                      className: "w-5 h-5 text-[#A72703]",
                    })}
                    <span>{selectedMethod}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-- Choose Method --</span>
                )}
                <span className="text-gray-500">&#9662;</span>
              </div>

              <div
                className={`absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 transition-all duration-300 overflow-hidden ${
                  openDropdown
                    ? "max-h-60 opacity-100"
                    : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                {paymentMethods.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => {
                      setSelectedMethod(m.name);
                      setOpenDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    {React.createElement(getIcon(m.name), {
                      className: "w-5 h-5 text-[#A72703]",
                    })}
                    <span className="font-medium">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedMethod && methodDetails && (
            <>
              <div className="p-4 bg-[#FFEFE6] rounded-xl text-[#A72703] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {React.createElement(getIcon(selectedMethod), {
                    className: "w-6 h-6",
                  })}
                  <p className="text-sm font-medium">{methodDetails}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(methodDetails)}
                  className="p-2 bg-[#A72703] text-white rounded-lg hover:bg-[#7C1B01]"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                />
              </div>

              {selectedMethod.toLowerCase().includes("crypto") && amount && (
                <div className="bg-[#A72703]/10 border border-[#A72703]/30 p-3 rounded-lg text-sm text-[#A72703]">
                  💡 Send ≈{" "}
                  <span className="font-semibold">
                    {convertedAmount.usdt} USDT or {convertedAmount.btc} BTC
                  </span>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I confirm I’m sending from my verified account.
              </label>

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

              <button
                type="submit"
                disabled={!confirmed || !receipt || !amount || loading}
                className="w-full py-3 rounded-xl bg-[#A72703] text-white font-semibold hover:bg-[#7C1B01] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="animate-spin w-5 h-5" />}
                {loading ? "Processing..." : "Submit Deposit"}
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
          <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600 max-w-md">
            Your payment has been submitted successfully. Once verified, your
            account will be updated.
          </p>
        </div>
      )}
    </div>
  );
};

export default Deposit;
