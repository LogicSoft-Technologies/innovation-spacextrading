// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle, TrendingUp, Loader } from "lucide-react";
import { userGetDashboardData } from "../../Services/authServices"; // same service used in Dashboard

const History = ({ onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch transaction history
  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userGetDashboardData();
      const allTransactions = [
        ...(res.deposits || []).map(d => ({ type: "Deposit", amount: d.amount, status: d.status, date: d.createdAt })),
        ...(res.withdrawals || []).map(w => ({ type: "Withdrawal", amount: w.amount, status: w.status, date: w.createdAt })),
        ...(res.payments || []).map(p => ({ type: "Investment", amount: p.amount, status: p.status, date: p.createdAt }))
      ]
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // sort newest first

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(err.response?.data?.message || err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "Deposit":
        return <ArrowDownCircle className="text-green-500 w-6 h-6" />;
      case "Withdrawal":
        return <ArrowUpCircle className="text-red-500 w-6 h-6" />;
      default:
        return <TrendingUp className="text-[#A72703] w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin w-10 h-10 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10 text-lg font-medium">{error}</div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto relative animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-[#A72703] transition"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-semibold mb-3 text-[#A72703]">Transaction History</h2>
      <p className="text-gray-600 mb-6">
        Track your deposits, withdrawals, and investments.
      </p>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions available.</p>
        ) : (
          transactions.map((t, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                {getIcon(t.type)}
                <div>
                  <p className="font-medium text-gray-800">{t.type}</p>
                  <p className="text-gray-500 text-sm">{t.date ? new Date(t.date).toLocaleDateString() : "--"}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="font-semibold text-gray-800">${(t.amount || 0).toLocaleString()}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    t.status === "completed" || t.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : t.status === "approved"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
