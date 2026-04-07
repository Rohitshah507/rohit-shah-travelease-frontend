import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const PaymentHistory = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setPayments(allPayments);
    } else {
      setPayments(
        allPayments.filter(
          (p) => (p.status || "pending").toLowerCase() === filter,
        ),
      );
    }
  }, [filter, allPayments]);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(`${serverURL}/api/payment/all-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data || [];
      setAllPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("❌ Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      setConfirming(true);
      const token = getToken();
      await axios.post(
        `${serverURL}/api/payment/${paymentId}/khalti/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("✅ Payment confirmed! Status updated to Completed.");
      setShowModal(false);
      setSelectedPayment(null);
      fetchAllPayments();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "❌ Failed to confirm payment. Try again.",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleExportReport = () => {
    if (payments.length === 0) {
      toast.error("❌ No payments to export in the current view.");
      return;
    }
    try {
      const rows = payments.map((p, idx) => ({
        "#": idx + 1,
        "Transaction ID": p.transaction_uuid || p.pidx || p._id || "N/A",
        User: p.userId?.username || p.user?.username || "N/A",
        Email: p.userId?.email || p.user?.email || "N/A",
        Method: p.method || p.paymentMethod || "KHALTI",
        "Amount ($)": p.amount || 0,
        Status: (p.status || "PENDING").toUpperCase(),
        "Booking ID":
          p.bookingId?._id?.toString() || p.bookingId?.toString() || "N/A",
        Date: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A",
      }));

      const completedTotal = payments
        .filter((p) => p.status?.toLowerCase() === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const summaryRows = [
        {},
        { "#": "SUMMARY", "Transaction ID": "" },
        { "#": "Total Transactions", "Transaction ID": payments.length },
        {
          "#": "Completed",
          "Transaction ID": payments.filter(
            (p) => p.status?.toLowerCase() === "completed",
          ).length,
        },
        {
          "#": "Pending",
          "Transaction ID": payments.filter(
            (p) => (p.status || "pending").toLowerCase() === "pending",
          ).length,
        },
        {
          "#": "Failed",
          "Transaction ID": payments.filter(
            (p) => p.status?.toLowerCase() === "failed",
          ).length,
        },
        {
          "#": "Total Revenue ($)",
          "Transaction ID": completedTotal.toLocaleString(),
        },
      ];

      const ws = XLSX.utils.json_to_sheet([...rows, ...summaryRows]);
      ws["!cols"] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 20 },
        { wch: 30 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 30 },
        { wch: 20 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
      const dateStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `PaymentReport_${filter}_${dateStr}.xlsx`);
      toast.success(`📊 Report exported!`);
    } catch (err) {
      toast.error("❌ Failed to export report.");
    }
  };

  const totalRevenue = allPayments
    .filter((p) => p.status?.toLowerCase() === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = allPayments.filter(
    (p) => (p.status || "pending").toLowerCase() === "pending",
  ).length;
  const failedCount = allPayments.filter(
    (p) => p.status?.toLowerCase() === "failed",
  ).length;

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    const map = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Completed",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Failed",
      },
    };
    const cfg = map[s] || map.pending;
    const Icon = cfg.icon;
    return (
      <span
        className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={13} />
        {cfg.label}
      </span>
    );
  };

  const tabCounts = {
    all: allPayments.length,
    completed: allPayments.filter(
      (p) => p.status?.toLowerCase() === "completed",
    ).length,
    pending: pendingCount,
    failed: failedCount,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            View and confirm all payment transactions
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={fetchAllPayments}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleExportReport}
            className="flex-1 sm:flex-none px-3 sm:px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
              Completed
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
            Total Revenue
          </p>
          <p className="text-xl sm:text-3xl font-black text-gray-900">
            {totalRevenue.toLocaleString()}$
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 sm:px-3 py-1 rounded-full">
              Awaiting
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
            Pending Payments
          </p>
          <p className="text-xl sm:text-3xl font-black text-gray-900">
            {pendingCount}
          </p>
          {pendingCount > 0 && (
            <p className="text-xs text-yellow-600 font-semibold mt-2">
              ⚠️ {pendingCount} need confirmation
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 sm:px-3 py-1 rounded-full">
              Failed
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
            Failed Transactions
          </p>
          <p className="text-xl sm:text-3xl font-black text-gray-900">
            {failedCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-1.5 sm:p-2 flex gap-1 sm:gap-2 border-2 border-violet-100 overflow-x-auto">
        {["all", "completed", "pending", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 min-w-[65px] py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              filter === status
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {tabCounts[status] > 0 && (
              <span
                className={`ml-1 sm:ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === status ? "bg-white text-violet-600" : "bg-gray-200 text-gray-600"}`}
              >
                {tabCounts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-sm">
              Loading payments...
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Transaction ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    User
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold hidden md:table-cell">
                    Method
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 sm:py-16 text-center">
                      <CreditCard
                        size={40}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500 font-semibold text-sm">
                        No payments found
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        No {filter === "all" ? "" : filter} transactions yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-violet-50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-mono font-semibold text-gray-900">
                        {payment.transaction_uuid?.slice(0, 12) ||
                          payment.pidx?.slice(0, 12) ||
                          payment._id.slice(-10).toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {payment.userId?.username ||
                              payment.user?.username ||
                              "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            {payment.userId?.email || payment.user?.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                          {payment.method || payment.paymentMethod || "KHALTI"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-900">
                        {(payment.amount || 0).toLocaleString()}$
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedPayment(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-violet-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Payment Details
              </h3>
              <p className="text-violet-100 text-xs sm:text-sm mt-1">
                Review and confirm this Khalti payment
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    Transaction ID
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all">
                    {selectedPayment.transaction_uuid ||
                      selectedPayment.pidx ||
                      selectedPayment._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Amount</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900">
                    {(selectedPayment.amount || 0).toLocaleString()}$
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">User</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPayment.userId?.username ||
                      selectedPayment.user?.username ||
                      "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPayment.userId?.email ||
                      selectedPayment.user?.email ||
                      ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Method</p>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold inline-block">
                    {selectedPayment.method ||
                      selectedPayment.paymentMethod ||
                      "KHALTI"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPayment.createdAt
                      ? new Date(selectedPayment.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {(selectedPayment.bookingId || selectedPayment.booking) && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    Booking ID
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-gray-900">
                    {(
                      selectedPayment.bookingId?._id ||
                      selectedPayment.bookingId ||
                      selectedPayment.booking
                    )
                      ?.toString()
                      .slice(-10)
                      .toUpperCase()}
                  </p>
                </div>
              )}

              {(selectedPayment.status || "pending").toLowerCase() ===
                "pending" && (
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertTriangle
                    size={18}
                    className="text-yellow-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold text-yellow-800">
                      Awaiting Admin Confirmation
                    </p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Confirm only after verifying the payment in your Khalti
                      merchant dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                }}
                disabled={confirming}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all disabled:opacity-50 text-sm"
              >
                Close
              </button>

              {(selectedPayment.status || "pending").toLowerCase() ===
                "pending" && (
                <button
                  onClick={() => handleConfirmPayment(selectedPayment._id)}
                  disabled={confirming}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {confirming ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirm Payment
                    </>
                  )}
                </button>
              )}

              {selectedPayment.status?.toLowerCase() === "completed" && (
                <div className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={17} />
                  Already Confirmed
                </div>
              )}

              {selectedPayment.status?.toLowerCase() === "failed" && (
                <div className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center gap-2">
                  <XCircle size={17} />
                  Payment Failed
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
