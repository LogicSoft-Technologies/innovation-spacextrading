import React, { useEffect, useState } from "react";
import {
  adminGetUsersWithRequests,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  adminApprovePayment,
} from "../Services/adminAuthServices";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsersWithRequests();
      setUsers(res);
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
    await actionFn(id);
    await fetchUsers();
    setActionLoadingId(null);
  };

  const StatusBadge = ({ status }) => {
    let color = "bg-gray-200 text-gray-800";
    if (status === "approved") color = "bg-green-100 text-green-800";
    if (status === "rejected") color = "bg-red-100 text-red-800";
    if (status === "pending") color = "bg-yellow-100 text-yellow-800";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen bg-gray-50">
      {/* Users List */}
      <div className="md:w-1/3 w-full md:pr-4 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Users</h2>
        {loading ? (
          <p className="text-gray-400">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition ${
                selectedUser?._id === user._id
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <p className="font-medium text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          ))
        )}
      </div>

      {/* Requests Section */}
      <div className="md:w-2/3 w-full overflow-y-auto max-h-[80vh]">
        {selectedUser ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Requests for {selectedUser.firstName} {selectedUser.lastName}
            </h2>

            {/* Deposits */}
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h3 className="font-semibold text-gray-600 mb-3">Deposits</h3>
              {selectedUser.pendingDeposits?.length ? (
                selectedUser.pendingDeposits.map((dep) => (
                  <div
                    key={dep._id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b last:border-b-0 gap-2"
                  >
                    <div>
                      <p className="text-gray-700">${dep.amount}</p>
                      <StatusBadge status={dep.status} />
                    </div>
                    {dep.status === "pending" && (
                      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        <button
                          disabled={actionLoadingId === dep._id}
                          onClick={() =>
                            handleAction(dep._id, adminApproveDeposit)
                          }
                          className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-1 rounded-md flex items-center gap-2"
                        >
                          {actionLoadingId === dep._id ? (
                            "Loading..."
                          ) : (
                            <>
                              <FaCheckCircle /> Approve
                            </>
                          )}
                        </button>
                        <button
                          disabled={actionLoadingId === dep._id}
                          onClick={() =>
                            handleAction(dep._id, adminRejectDeposit)
                          }
                          className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-1 rounded-md flex items-center gap-2"
                        >
                          {actionLoadingId === dep._id ? (
                            "Loading..."
                          ) : (
                            <>
                              <FaTimesCircle /> Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No deposits</p>
              )}
            </div>

            {/* Withdrawals */}
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h3 className="font-semibold text-gray-600 mb-3">Withdrawals</h3>
              {selectedUser.pendingInvestments?.length ? (
                selectedUser.pendingInvestments.map((p) => {
                  const cycles = Math.floor((p.durationDays || 0) / 2);
                  const profit = Number(p.amount || 0) * 0.3 * cycles;
                  const finalReturn = Number(p.amount || 0) + profit;

                  return (
                    <div
                      key={p._id}
                      className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 border-b last:border-b-0 gap-4"
                    >
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.symbol} - $
                            {Number(p.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.investmentType} investment
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-800">
                              {p.durationValue} {p.durationUnit}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-green-700">Profit Rule</p>
                            <p className="font-semibold text-green-700">
                              30% / 2 days
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-blue-700">Expected Profit</p>
                            <p className="font-semibold text-blue-700">
                              ${profit.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#FFF6F2] rounded-lg p-3">
                            <p className="text-[#7C1B01]">Final Return</p>
                            <p className="font-semibold text-[#A72703]">
                              ${finalReturn.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={p.status} />
                      </div>

                      {p.status === "pending" && (
                        <button
                          disabled={actionLoadingId === p._id}
                          onClick={() =>
                            handleAction(p._id, adminApprovePayment)
                          }
                          className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-md flex items-center gap-2"
                        >
                          {actionLoadingId === p._id ? (
                            "Loading..."
                          ) : (
                            <>
                              <FaCheckCircle /> Approve
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">No payments</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Select a user to see requests</p>
        )}
      </div>
    </div>
  );
};

export default Users;
