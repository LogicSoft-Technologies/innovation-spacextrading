import React, { useEffect, useMemo, useState } from "react";
import {
  adminGetUsersWithRequests,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  adminApprovePayment,
  adminDeleteUser,
} from "../Services/adminAuthServices";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  Search,
  Users as UsersIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Mail,
  FileText,
  ShieldAlert,
  Wallet,
  Clock,
  Trash2,
  X,
} from "lucide-react";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatTime = (seconds) => {
  if (seconds == null) return "--";
  if (seconds <= 0) return "Matured";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${secs}s`;
};

const getInvestmentComputedValues = (investment) => {
  const amount = Number(investment.amount || 0);
  const durationDays = Number(investment.durationDays || 0);

  if (durationDays > 0) {
    const twoDayCycles = Math.floor(durationDays / 2);
    const profit = amount * 0.3 * twoDayCycles;
    const returns = amount + profit;

    return { twoDayCycles, profit, returns };
  }

  const returns = Number(investment.returns || 0);
  const profit = Number(investment.profit || Math.max(returns - amount, 0));

  return {
    twoDayCycles: Number(investment.twoDayCycles || 0),
    profit,
    returns,
  };
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await adminGetUsersWithRequests();
      const nextUsers = Array.isArray(res) ? res : [];

      setUsers(nextUsers);

      setSelectedUser((current) => {
        if (!nextUsers.length) return null;
        if (!current?._id) return nextUsers[0];
        return nextUsers.find((user) => user._id === current._id) || nextUsers[0];
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = {};

      users.forEach((user) => {
        (user.investments || []).forEach((investment) => {
          if (investment.status === "approved" && investment.completedAt) {
            next[investment._id] = Math.max(
              0,
              Math.floor(
                (new Date(investment.completedAt).getTime() - Date.now()) / 1000
              )
            );
          }
        });
      });

      setCountdowns(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [users]);

  const handleAction = async (id, actionFn) => {
    setActionLoadingId(id);

    try {
      await actionFn(id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?._id) return;

    setActionLoadingId(selectedUser._id);

    try {
      await adminDeleteUser(selectedUser._id);
      setDeleteModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return users;

    return users.filter((user) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = String(user.email || "").toLowerCase();

      return name.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  const selectedCounts = {
    deposits: selectedUser?.pendingDeposits?.length || 0,
    withdrawals: selectedUser?.pendingWithdrawals?.length || 0,
    pendingInvestments: selectedUser?.pendingInvestments?.length || 0,
    activeInvestments: selectedUser?.activeInvestments?.length || 0,
    completedInvestments: selectedUser?.completedInvestments?.length || 0,
  };

  const investmentTotals = useMemo(() => {
    const investments = selectedUser?.investments || [];

    return investments.reduce(
      (acc, investment) => {
        const computed = getInvestmentComputedValues(investment);

        acc.totalInvested += Number(investment.amount || 0);
        acc.totalReturns += Number(computed.returns || 0);
        acc.totalProfit += Number(computed.profit || 0);

        return acc;
      },
      { totalInvested: 0, totalReturns: 0, totalProfit: 0 }
    );
  }, [selectedUser]);

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
          styles[status] || "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {String(status || "unknown").toUpperCase()}
      </span>
    );
  };

  const EmptyState = ({ text }) => (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">
      {text}
    </div>
  );

  const ActionButtons = ({ id, approveFn, rejectFn }) => (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={actionLoadingId === id}
        onClick={() => handleAction(id, approveFn)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <FaCheckCircle />
        {actionLoadingId === id ? "Processing..." : "Approve"}
      </button>

      {rejectFn && (
        <button
          disabled={actionLoadingId === id}
          onClick={() => handleAction(id, rejectFn)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <FaTimesCircle />
          Reject
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 md:p-6 font-[Inter]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Admin Operations
              </p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                Users, Requests & Investments
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Review user records, approve requests, monitor active investments, and manage accounts.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Users</p>
                <p className="text-lg font-semibold">{users.length}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Active</p>
                <p className="text-lg font-semibold text-blue-400">
                  {selectedCounts.activeInvestments}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-lg font-semibold text-amber-400">
                  {selectedCounts.deposits +
                    selectedCounts.withdrawals +
                    selectedCounts.pendingInvestments}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">Platform Users</h2>
                  <p className="text-sm text-slate-500">
                    {users.length} total accounts
                  </p>
                </div>
                <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
                  <UsersIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#A72703] focus:bg-white focus:ring-2 focus:ring-[#A72703]/10"
                />
              </div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-3">
              {loading ? (
                <p className="p-4 text-sm text-slate-500">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No users found.</p>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = selectedUser?._id === user._id;
                  const activeInvestments = user.activeInvestments?.length || 0;
                  const pendingTotal =
                    (user.pendingDeposits?.length || 0) +
                    (user.pendingWithdrawals?.length || 0) +
                    (user.pendingInvestments?.length || 0);

                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                        isActive
                          ? "border-[#A72703]/30 bg-[#FFF6F2] shadow-sm"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {user.email}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {activeInvestments > 0 && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {activeInvestments}
                            </span>
                          )}
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                            {pendingTotal}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <main className="space-y-5">
            {!selectedUser ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  Select a user to review account details.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Selected Account
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedUser.email}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Wallet: {formatCurrency(selectedUser.walletBalance)}
                      </p>
                    </div>

                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <div className="rounded-xl bg-blue-50 px-4 py-3">
                      <p className="text-xs text-blue-700">Active</p>
                      <p className="font-semibold text-blue-800">
                        {selectedCounts.activeInvestments}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-4 py-3">
                      <p className="text-xs text-emerald-700">Completed</p>
                      <p className="font-semibold text-emerald-800">
                        {selectedCounts.completedInvestments}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-4 py-3">
                      <p className="text-xs text-amber-700">Pending Invest.</p>
                      <p className="font-semibold text-amber-800">
                        {selectedCounts.pendingInvestments}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Invested</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(investmentTotals.totalInvested)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FFF6F2] px-4 py-3">
                      <p className="text-xs text-[#7C1B01]">Expected Return</p>
                      <p className="font-semibold text-[#A72703]">
                        {formatCurrency(investmentTotals.totalReturns)}
                      </p>
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        Ongoing Investments
                      </h3>
                      <p className="text-xs text-slate-500">
                        Active user investments with live maturity countdown.
                      </p>
                    </div>
                  </div>

                  {selectedUser.activeInvestments?.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {selectedUser.activeInvestments.map((investment) => {
                        const computed = getInvestmentComputedValues(investment);

                        return (
                          <div
                            key={investment._id}
                            className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-950">
                                  {investment.symbol}
                                </p>
                                <p className="text-xs capitalize text-slate-500">
                                  {investment.investmentType}
                                </p>
                              </div>
                              <StatusBadge status={investment.status} />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Amount</p>
                                <p className="font-semibold text-slate-900">
                                  {formatCurrency(investment.amount)}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Countdown</p>
                                <p className="font-semibold text-blue-700">
                                  {formatTime(
                                    countdowns[investment._id] ??
                                      investment.timeLeft
                                  )}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Profit</p>
                                <p className="font-semibold text-emerald-700">
                                  {formatCurrency(computed.profit)}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Final Return</p>
                                <p className="font-semibold text-[#A72703]">
                                  {formatCurrency(computed.returns)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                              Matures:{" "}
                              {investment.completedAt
                                ? new Date(investment.completedAt).toLocaleString()
                                : "--"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState text="No ongoing investments for this user." />
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        All Investments
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pending, active, and completed investment records.
                      </p>
                    </div>
                  </div>

                  {selectedUser.investments?.length ? (
                    <div className="space-y-3">
                      {selectedUser.investments.map((investment) => {
                        const computed = getInvestmentComputedValues(investment);

                        return (
                          <div
                            key={investment._id}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="font-semibold text-slate-950">
                                  {investment.symbol} -{" "}
                                  {formatCurrency(investment.amount)}
                                </p>
                                <p className="text-xs capitalize text-slate-500">
                                  {investment.investmentType} investment
                                </p>
                                <div className="mt-2">
                                  <StatusBadge status={investment.status} />
                                </div>
                              </div>

                              {investment.status === "pending" && (
                                <button
                                  disabled={actionLoadingId === investment._id}
                                  onClick={() =>
                                    handleAction(
                                      investment._id,
                                      adminApprovePayment
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
                                >
                                  <FaCheckCircle />
                                  {actionLoadingId === investment._id
                                    ? "Processing..."
                                    : "Approve Investment"}
                                </button>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-slate-500">Duration</p>
                                <p className="font-semibold text-slate-900">
                                  {investment.durationValue &&
                                  investment.durationUnit
                                    ? `${investment.durationValue} ${investment.durationUnit}`
                                    : `${investment.durationDays || 0} days`}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-slate-500">Rule</p>
                                <p className="font-semibold text-emerald-700">
                                  30% / 2 days
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-slate-500">Profit</p>
                                <p className="font-semibold text-blue-700">
                                  {formatCurrency(computed.profit)}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-slate-500">Final Return</p>
                                <p className="font-semibold text-[#A72703]">
                                  {formatCurrency(computed.returns)}
                                </p>
                              </div>
                            </div>

                            {investment.receiptImage && (
                              <a
                                href={investment.receiptImage}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A72703]"
                              >
                                <FileText className="h-4 w-4" />
                                View receipt
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState text="No investments found for this user." />
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                      <ArrowDownCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">Deposits</h3>
                      <p className="text-xs text-slate-500">
                        Pending deposit approvals.
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingDeposits?.length ? (
                    <div className="space-y-3">
                      {selectedUser.pendingDeposits.map((deposit) => (
                        <div
                          key={deposit._id}
                          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-950">
                              {formatCurrency(deposit.amount)}
                            </p>
                            <StatusBadge status={deposit.status} />
                          </div>

                          <ActionButtons
                            id={deposit._id}
                            approveFn={adminApproveDeposit}
                            rejectFn={adminRejectDeposit}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No pending deposits." />
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                      <ArrowUpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        Withdrawals
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pending withdrawal reviews.
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingWithdrawals?.length ? (
                    <div className="space-y-3">
                      {selectedUser.pendingWithdrawals.map((withdrawal) => (
                        <div
                          key={withdrawal._id}
                          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-950">
                              {formatCurrency(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {withdrawal.method}
                            </p>
                            <StatusBadge status={withdrawal.status} />
                          </div>

                          <ActionButtons
                            id={withdrawal._id}
                            approveFn={adminApproveWithdrawal}
                            rejectFn={adminRejectWithdrawal}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No pending withdrawals." />
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex gap-3">
                <div className="rounded-xl bg-red-50 p-3 text-red-700">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Delete user?
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    This permanently deletes the user and all related deposits,
                    withdrawals, and investments.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoadingId === selectedUser._id}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-300"
                >
                  {actionLoadingId === selectedUser._id
                    ? "Deleting..."
                    : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;