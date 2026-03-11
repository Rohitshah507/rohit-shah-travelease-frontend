import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { serverURL } from "../App";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${serverURL}/api/admin/bookings?status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      confirmed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };

    const badge = badges[status?.toLowerCase()] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          Booking Management
        </h1>
        <p className="text-gray-600 mt-1">View and manage all bookings</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2 border-2 border-violet-100">
        {["all", "pending", "confirmed", "cancelled"].map((status) => (
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
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
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText
                        size={48}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500 font-medium">
                        No bookings found
                      </p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-violet-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                        {booking._id.slice(-8)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {booking.userId?.username || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {booking.tourPackageId?.title || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ${booking.tourPackageId?.price || 0}
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

export default BookingManagement;