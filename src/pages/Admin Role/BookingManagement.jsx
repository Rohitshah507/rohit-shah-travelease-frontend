import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const BookingManagement = () => {
  const [allBookings, setAllBookings] = useState([]); // full cache
  const [bookings, setBookings] = useState([]); // filtered for current tab
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | Pending | Confirmed | Cancelled

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setBookings(allBookings);
    } else {
      setBookings(
        allBookings.filter(
          (b) => b.bookingStatus?.toLowerCase() === filter.toLowerCase(),
        ),
      );
    }
  }, [filter, allBookings]);

  // ─── GET /api/booking/admin ───────────────────────────────────────────────
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(`${serverURL}/api/booking/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data || [];
      setAllBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("❌ Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Status badge ─────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    const map = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Confirmed",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    const cfg = map[s] || map.pending;
    const Icon = cfg.icon;
    return (
      <span
        className={`${cfg.bg} ${cfg.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={14} />
        {cfg.label}
      </span>
    );
  };

  // ─── Tab counts from full cache ───────────────────────────────────────────
  const tabCounts = {
    all: allBookings.length,
    pending: allBookings.filter(
      (b) => b.bookingStatus?.toLowerCase() === "pending",
    ).length,
    confirmed: allBookings.filter(
      (b) => b.bookingStatus?.toLowerCase() === "confirmed",
    ).length,
    cancelled: allBookings.filter(
      (b) => b.bookingStatus?.toLowerCase() === "cancelled",
    ).length,
  };

  const tabs = ["all", "pending", "confirmed", "cancelled"];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600 mt-1">View and manage all bookings</p>
        </div>
        <button
          onClick={fetchAllBookings}
          className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-violet-100">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
            <FileText size={20} className="text-violet-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{tabCounts.all}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Total Bookings
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-violet-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {tabCounts.pending}
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-violet-100">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {tabCounts.confirmed}
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Confirmed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-violet-100">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
            <XCircle size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {tabCounts.cancelled}
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Cancelled</p>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2 border-2 border-violet-100">
        {tabs.map((status) => (
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
            {tabCounts[status] > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === status
                    ? "bg-white text-violet-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tabCounts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Loading bookings...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Package
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <FileText
                        size={48}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500 font-semibold">
                        No bookings found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        No {filter === "all" ? "" : filter} bookings yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-violet-50 transition-colors"
                    >
                      {/* Booking ID */}
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                        {booking._id.slice(-8).toUpperCase()}
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.userId?.username || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.userId?.email || ""}
                          </p>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-semibold max-w-[160px] truncate">
                          {booking.tourPackageId?.title || "N/A"}
                        </p>
                      </td>

                      {/* Start Date */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {booking.startDate
                          ? new Date(booking.startDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        Rs.{" "}
                        {(booking.tourPackageId?.price || 0).toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          <Eye size={14} />
                          View
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

      {/* ── Booking Detail Modal ────────────────────────────────────────────── */}
      {showModal && selectedBooking && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedBooking(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-violet-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    Booking Details
                  </h3>
                  <p className="text-violet-100 text-sm mt-1">
                    Booking #{selectedBooking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                {getStatusBadge(selectedBooking.bookingStatus)}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Tourist Info */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={14} />
                  Tourist Information
                </p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.userId?.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-all">
                      {selectedBooking.userId?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.userId?.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Adults / Children
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.numberOfAdults || 1} Adults
                      {selectedBooking.numberOfChildren > 0
                        ? `, ${selectedBooking.numberOfChildren} Children`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package size={14} />
                  Package Information
                </p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Package Title
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.tourPackageId?.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Price
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      Rs.{" "}
                      {(
                        selectedBooking.tourPackageId?.price || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Guide
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.tourPackageId?.guideId?.username ||
                        selectedBooking.tourPackageId?.guideName ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Dates */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  Trip Dates
                </p>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-2xl p-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Start Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.startDate
                        ? new Date(
                            selectedBooking.startDate,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      End Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.endDate
                        ? new Date(selectedBooking.endDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Booked On
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.createdAt
                        ? new Date(
                            selectedBooking.createdAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
