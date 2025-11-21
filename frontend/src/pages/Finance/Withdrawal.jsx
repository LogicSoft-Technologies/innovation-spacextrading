import React, { useState, useContext } from "react";
import { X, Loader, CheckCircle, Info } from "lucide-react";
import api from "../../../config/api";
import { AuthContext } from "../../Context/AuthContext";

const Withdrawal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");

  const methodInfo = {
    "Bank Transfer": "Processing time: 1-3 business days. Please provide full account details.",
    PayPal: "Processing time: Instant to 24 hours.",
    CashApp: "Processing time: Instant to 24 hours.",
    Wallet: "Processing time: Depends on network congestion.",
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !method || Object.values(paymentInfo).some((v) => !v)) return;

    setLoading(true);
    try {
      await api.post("/api/withdrawals", { amount, method, paymentInfo });
      setSubmitted(true);
    } catch (err) {
      setToast(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto relative animate-fadeIn">
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-[#A72703] transition">
        <X className="w-6 h-6" />
      </button>

      {toast && (
        <div className="fixed top-6 right-6 bg-[#A72703] text-white px-4 py-2 rounded-lg shadow-lg animate-fadeInOut z-50">
          {toast}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-3 text-[#A72703]">Withdraw Funds</h2>
      <p className="text-gray-600 mb-6">
        Withdraw your available balance securely to your preferred method.
      </p>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white shadow-sm rounded-2xl p-6 border border-gray-200"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Withdrawal Method
            </label>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPaymentInfo({});
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
            >
              <option value="">-- Choose Method --</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="CashApp">CashApp</option>
              <option value="Wallet">Wallet</option>
            </select>

            {method && (
              <div className="flex items-center text-sm text-gray-500 mt-2 gap-1">
                <Info className="w-4 h-4" />
                <span>{methodInfo[method]}</span>
              </div>
            )}
          </div>

          {/* Dynamic Payment Info Fields */}
          {method === "Bank Transfer" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentInfo.name || ""}
                  onChange={(e) => handlePaymentChange("name", e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN / Account Number</label>
                <input
                  type="text"
                  value={paymentInfo.iban || ""}
                  onChange={(e) => handlePaymentChange("iban", e.target.value)}
                  placeholder="IBAN / Account Number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={paymentInfo.bank || ""}
                  onChange={(e) => handlePaymentChange("bank", e.target.value)}
                  placeholder="Bank Name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT/BIC Code</label>
                <input
                  type="text"
                  value={paymentInfo.swift || ""}
                  onChange={(e) => handlePaymentChange("swift", e.target.value)}
                  placeholder="SWIFT/BIC"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
                />
              </div>
            </div>
          )}

          {method === "PayPal" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
              <input
                type="email"
                value={paymentInfo.email || ""}
                onChange={(e) => handlePaymentChange("email", e.target.value)}
                placeholder="Enter PayPal email"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
              />
            </div>
          )}

          {method === "CashApp" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CashApp ID</label>
              <input
                type="text"
                value={paymentInfo.cashAppId || ""}
                onChange={(e) => handlePaymentChange("cashAppId", e.target.value)}
                placeholder="Enter CashApp ID"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
              />
            </div>
          )}

          {method === "Wallet" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input
                type="text"
                value={paymentInfo.wallet || ""}
                onChange={(e) => handlePaymentChange("wallet", e.target.value)}
                placeholder="Enter Wallet Address"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
              />
            </div>
          )}

          {/* Withdrawal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Withdrawal Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#A72703] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || !method || Object.values(paymentInfo).some((v) => !v) || loading}
            className="w-full py-3 rounded-xl bg-[#A72703] text-white font-semibold hover:bg-[#7C1B01] disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader className="animate-spin w-5 h-5" />}
            {loading ? "Processing..." : "Request Withdrawal"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
          <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Request Submitted!</h3>
          <p className="text-gray-600 max-w-md">
            Your withdrawal request has been sent. Funds will arrive within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;
