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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Mail,
  Clock,
  FileText,
} from "lucide-react";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
      setUsers(res);
      if (!selectedUser && res?.length) setSelectedUser(res[0]);
    } catch (err) {
      console.error(err);
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
    const term = searchTerm.toLowerCase();

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

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-green-50 text-green-700 border-green-200",
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
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );

  const ActionButtons = ({ id, approveFn, rejectFn }) => (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={actionLoadingId === id}
        onClick={() => handleAction(id, approveFn)}
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-slate-300"
      >
        <FaCheckCircle />
        {actionLoadingId === id ? "Processing..." : "Approve"}
      </button>

      {rejectFn && (
        <button
          disabled={actionLoadingId === id}
          onClick={() => handleAction(id, rejectFn)}
          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <FaTimesCircle />
          Reject
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-4 md:p-6 font-[Inter]">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Admin request center
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
                Users & Pending Requests
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Review deposits, withdrawals, and investment approvals in one workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Deposits</p>
                <p className="text-lg font-semibold text-white">{selectedCounts.deposits}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Withdrawals</p>
                <p className="text-lg font-semibold text-white">{selectedCounts.withdrawals}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Investments</p>
                <p className="text-lg font-semibold text-green-400">{selectedCounts.investments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">Users</h2>
                  <p className="text-sm text-slate-500">{users.length} total accounts</p>
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
                  placeholder="Search users"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10"
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
                      className={`w-full text-left rounded-xl p-4 mb-2 transition border ${
                        isActive
                          ? "border-[#A72703]/30 bg-[#FFF6F2]"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
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
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Selected account
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-blue-50 px-4 py-3">
                        <p className="text-xs text-blue-700">Deposits</p>
                        <p className="font-semibold text-blue-800">{selectedCounts.deposits}</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 px-4 py-3">
                        <p className="text-xs text-amber-700">Withdrawals</p>
                        <p className="font-semibold text-amber-800">{selectedCounts.withdrawals}</p>
                      </div>
                      <div className="rounded-xl bg-green-50 px-4 py-3">
                        <p className="text-xs text-green-700">Investments</p>
                        <p className="font-semibold text-green-800">{selectedCounts.investments}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                      <ArrowDownCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">Deposits</h3>
                      <p className="text-xs text-slate-500">Pending deposit approvals</p>
                    </div>
                  </div>

                  {selectedUser.pendingDeposits?.length ? (
                    <div className="space-y-3">
                      {selectedUser.pendingDeposits.map((dep) => (
                        <div
                          key={dep._id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-950">
                              {formatCurrency(dep.amount)}
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                      <ArrowUpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">Withdrawals</h3>
                      <p className="text-xs text-slate-500">Pending withdrawal reviews</p>
                    </div>
                  </div>

                  {selectedUser.pendingWithdrawals?.length ? (
                    <div className="space-y-3">
                      {selectedUser.pendingWithdrawals.map((withdrawal) => (
                        <div
                          key={withdrawal._id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-950">
                              {formatCurrency(withdrawal.amount)}
                            </p>
                            <div className="mt-2">
                              <StatusBadge status={withdrawal.status} />
                            </div>
                          </div>

                          {withdrawal.status === "pending" && (
                            <ActionButtons
                              id={withdrawal._id}
                              approveFn={adminApproveWithdrawal}
                              rejectFn={adminRejectWithdrawal}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No pending withdrawals." />
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-green-50 p-2 text-green-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">Investments</h3>
                      <p className="text-xs text-slate-500">
                        Duration-based plans using 30% every 2 days
                      </p>
                    </div>
                  </div>

                  {selectedUser.pendingInvestments?.length ? (
                    <div className="space-y-4">
                      {selectedUser.pendingInvestments.map((p) => {
                        const cycles = Math.floor((p.durationDays || 0) / 2);
                        const profit = Number(p.amount || 0) * 0.3 * cycles;
                        const finalReturn = Number(p.amount || 0) + profit;

                        return (
                          <div
                            key={p._id}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div>
                                <p className="text-lg font-semibold text-slate-950">
                                  {p.symbol} - {formatCurrency(p.amount)}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                  {p.investmentType} investment
                                </p>

                                <div className="mt-3">
                                  <StatusBadge status={p.status} />
                                </div>
                              </div>

                              {p.status === "pending" && (
                                <button
                                  disabled={actionLoadingId === p._id}
                                  onClick={() => handleAction(p._id, adminApprovePayment)}
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-slate-300"
                                >
                                  <FaCheckCircle />
                                  {actionLoadingId === p._id
                                    ? "Processing..."
                                    : "Approve Investment"}
                                </button>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div className="rounded-xl bg-white border border-slate-100 p-3">
                                <p className="text-slate-500">Duration</p>
                                <p className="font-semibold text-slate-900">
                                  {p.durationValue && p.durationUnit
                                    ? `${p.durationValue} ${p.durationUnit}`
                                    : `${p.durationDays || 0} days`}
                                </p>
                              </div>

                              <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                                <p className="text-green-700">Profit Rule</p>
                                <p className="font-semibold text-green-700">
                                  30% / 2 days
                                </p>
                              </div>

                              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                                <p className="text-blue-700">Expected Profit</p>
                                <p className="font-semibold text-blue-700">
                                  {formatCurrency(profit)}
                                </p>
                              </div>

                              <div className="rounded-xl bg-[#FFF6F2] border border-[#A72703]/10 p-3">
                                <p className="text-[#7C1B01]">Final Return</p>
                                <p className="font-semibold text-[#A72703]">
                                  {formatCurrency(finalReturn)}
                                </p>
                              </div>
                            </div>

                            {p.receiptImage && (
                              <a
                                href={p.receiptImage}
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