import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  X,
  DollarSign,
  User,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const avatarColors = [
  "from-yellow-400 to-amber-500",
  "from-amber-400 to-orange-500",
  "from-orange-400 to-yellow-500",
  "from-yellow-500 to-amber-600",
  "from-amber-500 to-orange-600",
];

const statusConfig = (s) =>
  s === "confirmed"
    ? {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500",
        label: "Confirmed",
      }
    : s === "pending"
      ? {
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
          label: "Pending",
        }
      : s === "cancelled"
        ? {
            bg: "bg-red-100",
            text: "text-red-600",
            dot: "bg-red-500",
            label: "Cancelled",
          }
        : {
            bg: "bg-gray-100",
            text: "text-gray-600",
            dot: "bg-gray-400",
            label: s,
          };

const Skeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl p-6 shadow-md border border-amber-100 animate-pulse"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-amber-100 rounded-lg w-32" />
            <div className="h-3 bg-amber-50 rounded-lg w-48" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-amber-50 rounded-lg" />
          <div className="h-3 bg-amber-50 rounded-lg w-4/5" />
          <div className="h-3 bg-amber-50 rounded-lg w-3/5" />
        </div>
      </div>
    ))}
  </div>
);

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const guideId = userData?.userDetails?._id;

  console.log("GUIDE ID:", guideId);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverURL}/api/booking/guide`, {
          params: { guideId },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("BOOKING RESPONSE:", response.data);

        setBookings(
          response.data.data.map((b) => ({
            _id: b._id,
            tourist: b.userId.username,
            email: b.userId?.email,
            phone: b.userId?.phone,
            tourTitle: b.tourPackageId?.title,
            location: b.tourPackageId?.destination,
            amount: b.tourPackageId?.price,
            guests: b.numberOfAdults + b.numberOfChildren,
            date: b.startDate,
            time: b.time,
            status: b.status,
          })),
        );
      } catch (error) {
        console.error("BOOKING ERROR:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (guideId) fetchBookings();
  }, [guideId]);

  const handleStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${serverURL}/api/guide/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
      if (selectedBooking?._id === id)
        setSelectedBooking((prev) => ({ ...prev, status }));
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const tourist = (b.tourist || "").toLowerCase();
      const tourTitle = (b.tourTitle || "").toLowerCase();
      const q = searchQ.toLowerCase();
      return tourist.includes(q) || tourTitle.includes(q);
    });

  return (
    <div className="space-y-6 p-1">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                filter === f
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-300/50"
                  : "bg-white text-amber-800 border-2 border-amber-200 hover:border-amber-400 hover:text-amber-700"
              }`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-2 bg-white/30 text-white px-1.5 py-0.5 rounded-full text-xs font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
          />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search bookings..."
            className="pl-9 pr-4 py-2.5 rounded-xl border-2 border-amber-200 text-sm bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all w-56"
          />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            count: bookings.length,
            color: "from-amber-400 to-yellow-400",
          },
          {
            label: "Confirmed",
            count: bookings.filter((b) => b.status === "confirmed").length,
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Pending",
            count: pendingCount,
            color: "from-amber-500 to-orange-500",
          },
          {
            label: "Cancelled",
            count: bookings.filter((b) => b.status === "cancelled").length,
            color: "from-red-400 to-rose-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm shadow-amber-100/50 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white font-black text-lg shadow-sm`}
            >
              {stat.count}
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">
                {stat.label}
              </p>
              <p className="text-sm font-black text-amber-900">Bookings</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Booking Cards Grid ── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center">
            <CalendarDays size={36} className="text-amber-300" />
          </div>
          <p className="font-bold text-amber-700 text-lg">No bookings found</p>
          <p className="text-amber-500 text-sm mt-1">
            Try changing your filter or search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((b, i) => {
            const sc = statusConfig(b.status);
            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-amber-100/80 shadow-lg shadow-amber-200/40 hover:shadow-xl hover:shadow-amber-300/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Card Top Strip */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />

                <div className="p-6 space-y-5">
                  {/* ── Tourist Header ── */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-13 h-13 w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-xl shadow-md`}
                      >
                        {b.tourist?.[0]?.toUpperCase() ?? "T"}
                      </div>
                      <div>
                        <p className="font-black text-amber-900 text-base leading-tight">
                          {b.tourist}
                        </p>
                        <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                          <Mail size={11} />
                          <span>{b.email || "—"}</span>
                        </div>
                        {b.phone && (
                          <div className="flex items-center gap-1 text-amber-600 text-xs">
                            <Phone size={11} />
                            <span>{b.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg} border border-current/10`}
                    >
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className={`text-xs font-bold ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                  {/* ── Tour Details Grid ── */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Tour Title */}
                    <div className="col-span-2 bg-amber-50/70 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1">
                        Tour Package
                      </p>
                      <p className="font-black text-amber-900 text-sm leading-tight">
                        {b.tourTitle || "—"}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1.5">
                        Location
                      </p>
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          size={14}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <p className="font-bold text-amber-900 text-sm">
                          {b.location || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1.5">
                        Guests
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Users
                          size={14}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <p className="font-bold text-amber-900 text-sm">
                          {b.guests ?? "—"} person(s)
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1.5">
                        Date
                      </p>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays
                          size={14}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <p className="font-bold text-amber-900 text-sm">
                          {b.date || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1.5">
                        Time
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Clock
                          size={14}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <p className="font-bold text-amber-900 text-sm">
                          {b.time || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Amount + Actions ── */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <DollarSign size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-500 font-semibold">
                          Amount
                        </p>
                        <p className="font-black text-amber-900 text-lg leading-tight">
                          ${b.amount}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(b._id, "confirmed")}
                            disabled={actionLoading === b._id}
                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50 shadow-sm shadow-green-300/50 active:scale-95"
                          >
                            <CheckCircle size={13} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatus(b._id, "cancelled")}
                            disabled={actionLoading === b._id}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50 shadow-sm shadow-red-300/50 active:scale-95"
                          >
                            <XCircle size={13} />
                            Decline
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/30 w-full max-w-md overflow-hidden border border-amber-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-lg">
                  Booking Details
                </h3>
                <p className="text-amber-100 text-xs font-medium">
                  Full booking information
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Tourist Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-white text-2xl shadow-md">
                  {selectedBooking.tourist?.[0]?.toUpperCase() ?? "T"}
                </div>
                <div className="flex-1">
                  <p className="font-black text-amber-900 text-base">
                    {selectedBooking.tourist}
                  </p>
                  <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                    <Mail size={12} />
                    <span>{selectedBooking.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                    <Phone size={12} />
                    <span>{selectedBooking.phone || "—"}</span>
                  </div>
                </div>
                {/* Status */}
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig(selectedBooking.status).bg} ${statusConfig(selectedBooking.status).text}`}
                >
                  {statusConfig(selectedBooking.status).label}
                </div>
              </div>

              {/* Detail Rows */}
              {[
                {
                  label: "Tour Package",
                  value: selectedBooking.tourTitle,
                  icon: <CalendarDays size={14} className="text-amber-500" />,
                },
                {
                  label: "Location",
                  value: selectedBooking.location,
                  icon: <MapPin size={14} className="text-amber-500" />,
                },
                {
                  label: "Date",
                  value: selectedBooking.date,
                  icon: <CalendarDays size={14} className="text-amber-500" />,
                },
                {
                  label: "Time",
                  value: selectedBooking.time,
                  icon: <Clock size={14} className="text-amber-500" />,
                },
                {
                  label: "Guests",
                  value: `${selectedBooking.guests} person(s)`,
                  icon: <Users size={14} className="text-amber-500" />,
                },
                {
                  label: "Amount",
                  value: `$${selectedBooking.amount}`,
                  icon: <DollarSign size={14} className="text-amber-500" />,
                  bold: true,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2.5 border-b border-amber-50"
                >
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    {row.icon}
                    <span className="font-semibold">{row.label}</span>
                  </div>
                  <span
                    className={`text-sm font-bold ${row.bold ? "text-amber-600 text-base" : "text-amber-900"}`}
                  >
                    {row.value || "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-amber-50/80 border-t border-amber-100 flex gap-3">
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "confirmed")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all duration-300 active:scale-95 shadow-md shadow-green-300/40 disabled:opacity-50"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "cancelled")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all duration-300 active:scale-95 shadow-md shadow-red-300/40 disabled:opacity-50"
                  >
                    ✗ Decline
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-3 border-2 border-amber-300 text-amber-700 font-bold rounded-xl text-sm hover:bg-amber-100 transition-all duration-300 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
