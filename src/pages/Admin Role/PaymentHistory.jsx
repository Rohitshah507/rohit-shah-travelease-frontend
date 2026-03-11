import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CreditCard, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { serverURL } from "../../App";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, pending, failed

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${serverURL}/api/admin/payments?status=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      failed: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const badge = badges[status?.toLowerCase()] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const totalRevenue = payments
    .filter(p => p.status?.toLowerCase() === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">View all payment transactions</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center gap-2">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              Completed
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-gray-900">${totalRevenue}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Pending Payments</p>
          <p className="text-3xl font-black text-gray-900">
            {payments.filter(p => p.status?.toLowerCase() === "pending").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
              Failed
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Failed Transactions</p>
          <p className="text-3xl font-black text-gray-900">
            {payments.filter(p => p.status?.toLowerCase() === "failed").length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2 border-2 border-violet-100">
        {["all", "completed", "pending", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
              filter === status
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <CreditCard size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No payments found</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-violet-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                        {payment.transaction_uuid?.slice(0, 12) || payment._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {payment.userId?.username || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                          {payment.method || "KHALTI"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ${payment.amount || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status || "Pending")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;