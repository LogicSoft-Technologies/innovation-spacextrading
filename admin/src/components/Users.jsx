import React, { useEffect, useMemo, useState } from "react";
import {
  adminGetUsersWithRequests,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  adminApprovePayment,
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
  CheckCircle2,
} from "lucide-react";

const WITHDRAWAL_THRESHOLD = 500000;

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleString();
};

const getWithdrawalEligibility = (withdrawal) => {
  const thresholdRequired =
    Number(withdrawal?.thresholdRequired) || WITHDRAWAL_THRESHOLD;
  const totalInvestedAtRequest = Number(withdrawal?.totalInvestedAtRequest) || 0;
  const walletBalanceAtRequest = Number(withdrawal?.walletBalanceAtRequest) || 0;
  const remainingRequired = Math.max(
    thresholdRequired - totalInvestedAtRequest,
    0
  );

  return {
    thresholdRequired,
    totalInvestedAtRequest,
    walletBalanceAtRequest,
    remainingRequired,
    isEligible: totalInvestedAtRequest >= thresholdRequired,
  };
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsersWithRequests();
      const nextUsers = Array.isArray(res) ? res : [];

      setUsers(nextUsers);

      if (nextUsers.length) {
        setSelectedUser((current) => {
          if (!current?._id) return nextUsers[0];
          return nextUsers.find((user) => user._id === current._id) || nextUsers[0];
        });
      } else {
        setSelectedUser(null);
      }
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
    investments: selectedUser?.pendingInvestments?.length || 0,
  };

  const allPendingCount =
    selectedCounts.deposits + selectedCounts.withdrawals + selectedCounts.investments;

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
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

  const ActionButtons = ({ id, approveFn, rejectFn, approveDisabled, disabledText }) => (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={actionLoadingId === id || approveDisabled}
        onClick={() => handleAction(id, approveFn)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        <FaCheckCircle />
        {actionLoadingId === id
          ? "Processing..."
          : approveDisabled
          ? disabledText || "Not Eligible"
          : "Approve"}
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
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Admin Operations
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                Users & Pending Requests
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Review deposits, withdrawal eligibility, and duration-based
                investment approvals from one controlled workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Deposits</p>
                <p className="text-lg font-semibold text-white">
                  {selectedCounts.deposits}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Withdrawals</p>
                <p className="text-lg font-semibold text-white">
                  {selectedCounts.withdrawals}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Investments</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {selectedCounts.investments}
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
                  <h2 className="font-semibold text-slate-950">User Accounts</h2>
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A72703] focus:bg-white focus:ring-2 focus:ring-[#A72703]/10"
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
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                          {pendingTotal}
                        </span>
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
                  Select a user to review requests.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Pending</p>
                        <p className="font-semibold text-slate-900">
                          {allPendingCount}
                        </p>
                      </div>
                      <div className="rounded-xl bg-blue-50 px-4 py-3">
                        <p className="text-xs text-blue-700">Deposits</p>
                        <p className="font-semibold text-blue-800">
                          {selectedCounts.deposits}
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 px-4 py-3">
                        <p className="text-xs text-amber-700">Withdrawals</p>
                        <p className="font-semibold text-amber-800">
                          {selectedCounts.withdrawals}
                        </p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 px-4 py-3">
                        <p className="text-xs text-emerald-700">Investments</p>
                        <p className="font-semibold text-emerald-800">
                          {selectedCounts.investments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                      <ArrowDownCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">Deposits</h3>
                      <p className="text-xs text-slate-500">
                        Pending deposit approvals
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingDeposits?.length ? (
                    <div className="space-y-3">
                      {selectedUser.pendingDeposits.map((dep) => (
                        <div
                          key={dep._id}
                          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-950">
                              {formatCurrency(dep.amount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Submitted: {formatDate(dep.createdAt)}
                            </p>
                            <div className="mt-2">
                              <StatusBadge status={dep.status} />
                            </div>
                          </div>

                          {dep.status === "pending" && (
                            <ActionButtons
                              id={dep._id}
                              approveFn={adminApproveDeposit}
                              rejectFn={adminRejectDeposit}
                            />
                          )}
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
                        User must have invested at least {formatCurrency(WITHDRAWAL_THRESHOLD)}
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingWithdrawals?.length ? (
                    <div className="space-y-4">
                      {selectedUser.pendingWithdrawals.map((withdrawal) => {
                        const eligibility = getWithdrawalEligibility(withdrawal);
                        const paymentInfo = withdrawal.paymentInfo || {};

                        return (
                          <div
                            key={withdrawal._id}
                            className={`rounded-2xl border p-4 ${
                              eligibility.isEligible
                                ? "border-emerald-100 bg-emerald-50/40"
                                : "border-amber-100 bg-amber-50/50"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-lg font-semibold text-slate-950">
                                    {formatCurrency(withdrawal.amount)}
                                  </p>
                                  <StatusBadge status={withdrawal.status} />
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                  Method:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {withdrawal.method || "--"}
                                  </span>
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Requested: {formatDate(withdrawal.createdAt)}
                                </p>
                              </div>

                              {withdrawal.status === "pending" && (
                                <ActionButtons
                                  id={withdrawal._id}
                                  approveFn={adminApproveWithdrawal}
                                  rejectFn={adminRejectWithdrawal}
                                  approveDisabled={!eligibility.isEligible}
                                  disabledText="Not Eligible"
                                />
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                              <div className="rounded-xl border border-white bg-white p-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Wallet className="h-4 w-4" />
                                  Wallet at Request
                                </div>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {formatCurrency(eligibility.walletBalanceAtRequest)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-white bg-white p-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <TrendingUp className="h-4 w-4" />
                                  Total Invested
                                </div>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {formatCurrency(eligibility.totalInvestedAtRequest)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-white bg-white p-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <ShieldAlert className="h-4 w-4" />
                                  Required
                                </div>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {formatCurrency(eligibility.thresholdRequired)}
                                </p>
                              </div>

                              <div
                                className={`rounded-xl border p-3 ${
                                  eligibility.isEligible
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-amber-200 bg-amber-50"
                                }`}
                              >
                                <div
                                  className={`flex items-center gap-2 text-xs ${
                                    eligibility.isEligible
                                      ? "text-emerald-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {eligibility.isEligible ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <ShieldAlert className="h-4 w-4" />
                                  )}
                                  Eligibility
                                </div>
                                <p
                                  className={`mt-1 font-semibold ${
                                    eligibility.isEligible
                                      ? "text-emerald-700"
                                      : "text-amber-800"
                                  }`}
                                >
                                  {eligibility.isEligible
                                    ? "Eligible"
                                    : `${formatCurrency(
                                        eligibility.remainingRequired
                                      )} remaining`}
                                </p>
                              </div>
                            </div>

                            {Object.keys(paymentInfo).length > 0 && (
                              <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Payment Details
                                </p>
                                <div className="grid gap-2 text-sm md:grid-cols-2">
                                  {Object.entries(paymentInfo).map(([key, value]) => (
                                    <div key={key} className="rounded-lg bg-slate-50 p-2">
                                      <p className="text-xs capitalize text-slate-500">
                                        {key.replace(/([A-Z])/g, " $1")}
                                      </p>
                                      <p className="break-words font-medium text-slate-800">
                                        {String(value || "--")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState text="No pending withdrawals." />
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        Investments
                      </h3>
                      <p className="text-xs text-slate-500">
                        Duration-based plans using 30% every 2 days
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingInvestments?.length ? (
                    <div className="space-y-4">
                      {selectedUser.pendingInvestments.map((payment) => {
                        const cycles = Math.floor(Number(payment.durationDays || 0) / 2);
                        const profit = Number(payment.amount || 0) * 0.3 * cycles;
                        const finalReturn = Number(payment.amount || 0) + profit;

                        return (
                          <div
                            key={payment._id}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="text-lg font-semibold text-slate-950">
                                  {payment.symbol} - {formatCurrency(payment.amount)}
                                </p>
                                <p className="text-xs capitalize text-slate-500">
                                  {payment.investmentType} investment
                                </p>

                                <div className="mt-3">
                                  <StatusBadge status={payment.status} />
                                </div>
                              </div>

                              {payment.status === "pending" && (
                                <button
                                  disabled={actionLoadingId === payment._id}
                                  onClick={() =>
                                    handleAction(payment._id, adminApprovePayment)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  <FaCheckCircle />
                                  {actionLoadingId === payment._id
                                    ? "Processing..."
                                    : "Approve Investment"}
                                </button>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                              <div className="rounded-xl border border-slate-100 bg-white p-3">
                                <p className="text-slate-500">Duration</p>
                                <p className="font-semibold text-slate-900">
                                  {payment.durationValue && payment.durationUnit
                                    ? `${payment.durationValue} ${payment.durationUnit}`
                                    : `${payment.durationDays || 0} days`}
                                </p>
                              </div>

                              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                                <p className="text-emerald-700">Profit Rule</p>
                                <p className="font-semibold text-emerald-700">
                                  30% / 2 days
                                </p>
                              </div>

                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                <p className="text-blue-700">Expected Profit</p>
                                <p className="font-semibold text-blue-700">
                                  {formatCurrency(profit)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-[#A72703]/10 bg-[#FFF6F2] p-3">
                                <p className="text-[#7C1B01]">Final Return</p>
                                <p className="font-semibold text-[#A72703]">
                                  {formatCurrency(finalReturn)}
                                </p>
                              </div>
                            </div>

                            {payment.receiptImage && (
                              <a
                                href={payment.receiptImage}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A72703] hover:text-[#7C1B01]"
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
                    <EmptyState text="No pending investments." />
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Users;