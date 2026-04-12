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
  const [allBookings, setAllBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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
        className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={12} />
        {cfg.label}
      </span>
    );
  };

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            View and manage all bookings
          </p>
        </div>
        <button
          onClick={fetchAllBookings}
          className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all w-full sm:w-auto"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: FileText,
            bg: "bg-violet-100",
            color: "text-violet-600",
            count: tabCounts.all,
            label: "Total Bookings",
          },
          {
            icon: Clock,
            bg: "bg-yellow-100",
            color: "text-yellow-600",
            count: tabCounts.pending,
            label: "Pending",
          },
          {
            icon: CheckCircle,
            bg: "bg-green-100",
            color: "text-green-600",
            count: tabCounts.confirmed,
            label: "Confirmed",
          },
          {
            icon: XCircle,
            bg: "bg-red-100",
            color: "text-red-600",
            count: tabCounts.cancelled,
            label: "Cancelled",
          },
        ].map(({ icon: Icon, bg, color, count, label }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-violet-100"
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}
            >
              <Icon size={18} className={color} />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">
              {count}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-1.5 sm:p-2 flex gap-1 sm:gap-2 border-2 border-violet-100 overflow-x-auto">
        {tabs.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 min-w-[70px] py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
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
              Loading bookings...
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Booking ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    User
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold hidden md:table-cell">
                    Package
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold hidden sm:table-cell">
                    Start Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold hidden lg:table-cell">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 sm:py-16 text-center">
                      <FileText
                        size={40}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500 font-semibold text-sm">
                        No bookings found
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono font-semibold text-gray-900">
                        {booking._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {booking.userId?.username || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            {booking.userId?.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <p className="text-xs sm:text-sm text-gray-700 font-semibold max-w-[140px] truncate">
                          {booking.tourPackageId?.title || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-900 hidden lg:table-cell">
                        $ {(booking.tourPackageId?.price || 0).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all"
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

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedBooking(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-violet-200">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Booking Details
                  </h3>
                  <p className="text-violet-100 text-xs sm:text-sm mt-1">
                    Booking #{selectedBooking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                {getStatusBadge(selectedBooking.bookingStatus)}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
              {/* Tourist Info */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                  <Users size={13} />
                  Tourist Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                  {[
                    {
                      label: "Name",
                      value: selectedBooking.userId?.username || "N/A",
                    },
                    {
                      label: "Email",
                      value: selectedBooking.userId?.email || "N/A",
                    },
                    {
                      label: "Phone",
                      value: selectedBooking.userId?.phoneNumber || "N/A",
                    },
                    {
                      label: "Adults / Children",
                      value: `${selectedBooking.numberOfAdults || 1} Adults${selectedBooking.numberOfChildren > 0 ? `, ${selectedBooking.numberOfChildren} Children` : ""}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-bold text-gray-500 mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 break-all">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Info */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                  <Package size={13} />
                  Package Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                  <div className="col-span-1 sm:col-span-2">
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
                    <p className="text-lg sm:text-xl font-black text-gray-900">
                      ${" "}
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
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                  <Calendar size={13} />
                  Trip Dates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                  {[
                    { label: "Start Date", value: selectedBooking.startDate },
                    { label: "End Date", value: selectedBooking.endDate },
                    { label: "Booked On", value: selectedBooking.createdAt },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-bold text-gray-500 mb-1">
                        {label}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        {value
                          ? new Date(value).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all text-sm"
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
