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

const statusConfig = (s) => {
  const lower = (s || "").toLowerCase();
  return lower === "confirmed"
    ? {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500",
        label: "Confirmed",
      }
    : lower === "pending"
      ? {
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
          label: "Pending",
        }
      : lower === "cancelled"
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
};

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 animate-pulse"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-amber-100 rounded w-24" />
            <div className="h-2.5 bg-amber-50 rounded w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 bg-amber-50 rounded w-full" />
          <div className="h-2.5 bg-amber-50 rounded w-4/5" />
          <div className="h-2.5 bg-amber-50 rounded w-3/5" />
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
            tourist: b.userId?.username || "Unknown",
            email: b.userId?.email || "",
            phone: b.userId?.phoneNumber || "",
            tourTitle: b.tourPackageId?.title || "",
            location: b.tourPackageId?.destination || "",
            amount: b.tourPackageId?.price || 0,
            guests: (b.numberOfAdults || 0) + (b.numberOfChildren || 0),
            date: b.startDate || "",
            endDate: b.endDate || "",
            status: (b.bookingStatus || "").toLowerCase(),
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

  // ─────────────────────────────────────────────────────────────
  // ✅ FIXED handleStatus — uses correct server routes:
  //    Accept  → PUT /api/booking/confirm/:id
  //    Cancel  → PUT /api/booking/cancel/:id
  // ─────────────────────────────────────────────────────────────
  const handleStatus = async (id, action) => {
    try {
      setActionLoading(id);
      const token = localStorage.getItem("token");

      if (action === "confirmed") {
        await axios.put(
          `${serverURL}/api/booking/confirm/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "cancelled") {
        await axios.put(
          `${serverURL}/api/booking/cancel/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // Update local UI state immediately after success
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: action } : b)),
      );
      if (selectedBooking?._id === id)
        setSelectedBooking((prev) => ({ ...prev, status: action }));

      console.log(`Booking ${action} successfully!`);
    } catch (err) {
      console.error("Status update error:", err.response?.data || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const q = searchQ.toLowerCase();
      return (
        (b.tourist || "").toLowerCase().includes(q) ||
        (b.tourTitle || "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-5 p-1">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                filter === f
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-300/50"
                  : "bg-white text-amber-800 border border-amber-200 hover:border-amber-400"
              }`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-white/30 text-white px-1 py-0.5 rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
          />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search bookings..."
            className="pl-8 pr-4 py-2 rounded-xl border border-amber-200 text-xs bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all w-48"
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
            className="bg-white rounded-xl p-3 border border-amber-100 shadow-sm flex items-center gap-2.5"
          >
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}
            >
              {stat.count}
            </div>
            <div>
              <p className="text-[10px] text-amber-500 font-semibold">
                {stat.label}
              </p>
              <p className="text-xs font-black text-amber-900">Bookings</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
            <CalendarDays size={28} className="text-amber-300" />
          </div>
          <p className="font-bold text-amber-600 text-base">
            No bookings found
          </p>
          <p className="text-amber-400 text-xs mt-1">
            Try changing your filter or search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b, i) => {
            const sc = statusConfig(b.status);
            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-amber-100/80 shadow-md shadow-amber-100/50 hover:shadow-lg hover:shadow-amber-200/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400" />

                <div className="p-4 space-y-3.5">
                  {/* Tourist Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-base shadow-sm flex-shrink-0`}
                      >
                        {b.tourist?.[0]?.toUpperCase() ?? "T"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-amber-900 text-sm leading-tight truncate">
                          {b.tourist}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] mt-0.5">
                          <Mail size={9} className="flex-shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {b.email || "—"}
                          </span>
                        </div>
                        {b.phone && (
                          <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                            <Phone size={9} className="flex-shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ${sc.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      <span className={`text-[10px] font-bold ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-amber-100 to-transparent" />

                  {/* Tour Package */}
                  <div className="bg-amber-50/80 rounded-xl px-3 py-2 border border-amber-100">
                    <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">
                      Tour
                    </p>
                    <p className="font-black text-amber-900 text-xs leading-tight truncate">
                      {b.tourTitle || "—"}
                    </p>
                  </div>

                  {/* 2x2 Details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-amber-50/50 rounded-xl px-3 py-2 border border-amber-100">
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">
                        Location
                      </p>
                      <div className="flex items-center gap-1">
                        <MapPin
                          size={10}
                          className="text-orange-400 flex-shrink-0"
                        />
                        <p className="font-semibold text-amber-800 text-[11px] truncate">
                          {b.location || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl px-3 py-2 border border-amber-100">
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">
                        Guests
                      </p>
                      <div className="flex items-center gap-1">
                        <Users
                          size={10}
                          className="text-orange-400 flex-shrink-0"
                        />
                        <p className="font-semibold text-amber-800 text-[11px]">
                          {b.guests ?? "—"} persons
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl px-3 py-2 border border-amber-100">
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">
                        Start Date
                      </p>
                      <div className="flex items-center gap-1">
                        <CalendarDays
                          size={10}
                          className="text-orange-400 flex-shrink-0"
                        />
                        <p className="font-semibold text-amber-800 text-[11px] truncate">
                          {b.date
                            ? new Date(b.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl px-3 py-2 border border-amber-100">
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">
                        End Date
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock
                          size={10}
                          className="text-orange-400 flex-shrink-0"
                        />
                        <p className="font-semibold text-amber-800 text-[11px]">
                          {b.endDate
                            ? new Date(b.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <DollarSign size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] text-amber-400 font-semibold leading-none">
                          Amount
                        </p>
                        <p className="font-black text-amber-900 text-sm leading-tight">
                          ${b.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {b.status === "pending" && (
                        <>
                          {/* PUT /api/booking/confirm/:id */}
                          <button
                            onClick={() => handleStatus(b._id, "confirmed")}
                            disabled={actionLoading === b._id}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 disabled:opacity-50 active:scale-95"
                          >
                            {actionLoading === b._id ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={11} />
                            )}
                            Accept
                          </button>
                          {/* PUT /api/booking/cancel/:id */}
                          <button
                            onClick={() => handleStatus(b._id, "cancelled")}
                            disabled={actionLoading === b._id}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 disabled:opacity-50 active:scale-95"
                          >
                            {actionLoading === b._id ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle size={11} />
                            )}
                            Decline
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 active:scale-95"
                      >
                        <Eye size={11} /> View
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
              {/* Tourist Block */}
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
                  label: "Start Date",
                  value: selectedBooking.date
                    ? new Date(selectedBooking.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—",
                  icon: <CalendarDays size={14} className="text-amber-500" />,
                },
                {
                  label: "End Date",
                  value: selectedBooking.endDate
                    ? new Date(selectedBooking.endDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—",
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

            <div className="px-6 py-4 bg-amber-50/80 border-t border-amber-100 flex gap-3">
              {selectedBooking.status === "pending" && (
                <>
                  {/* PUT /api/booking/confirm/:id */}
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "confirmed")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all duration-300 active:scale-95 shadow-md shadow-green-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedBooking._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "✓"
                    )}
                    Accept
                  </button>
                  {/* PUT /api/booking/cancel/:id */}
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "cancelled")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all duration-300 active:scale-95 shadow-md shadow-red-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedBooking._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "✗"
                    )}
                    Decline
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
