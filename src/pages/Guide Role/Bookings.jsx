import { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const avatarColors = [
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-yellow-600",
  "bg-amber-600",
];
const statusColor = (s) =>
  s === "confirmed"
    ? "bg-green-100 text-green-700"
    : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : s === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export default function Bookings({ guideId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch bookings ─────────────────────────────────────────
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${serverURL}/api/guide/${guideId}/bookings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Bookings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [guideId]);

  // ── Accept / Decline ───────────────────────────────────────
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
    .filter(
      (b) =>
        b.tourist?.toLowerCase().includes(searchQ.toLowerCase()) ||
        b.tourTitle?.toLowerCase().includes(searchQ.toLowerCase()),
    );

  return (
    <div className="space-y-5">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition
                ${filter === f ? "bg-yellow-500 text-gray-900 shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search bookings..."
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-yellow-500 w-56"
          />
        </div>
      </div>

      {/* ── Booking Cards ── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((b, i) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className={`w-12 h-12 ${avatarColors[i % avatarColors.length]} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {b.tourist?.[0] ?? "T"}
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Tourist</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {b.tourist}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Users size={11} />
                      {b.guests} guests
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tour</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {b.tourTitle}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} />
                      {b.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {b.date}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} />
                      {b.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="font-bold text-yellow-600 text-lg">
                      ${b.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatus(b._id, "confirmed")}
                        disabled={actionLoading === b._id}
                        className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Accept
                      </button>
                      <button
                        onClick={() => handleStatus(b._id, "cancelled")}
                        disabled={actionLoading === b._id}
                        className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <XCircle size={13} /> Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-100 transition"
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bookings found</p>
            </div>
          )}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center font-bold text-gray-900">
                  {selectedBooking.tourist?.[0] ?? "T"}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedBooking.tourist}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={12} />
                    {selectedBooking.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone size={12} />
                    {selectedBooking.phone}
                  </p>
                </div>
              </div>
              {[
                { label: "Tour", value: selectedBooking.tourTitle },
                { label: "Location", value: selectedBooking.location },
                {
                  label: "Date & Time",
                  value: `${selectedBooking.date} at ${selectedBooking.time}`,
                },
                {
                  label: "Guests",
                  value: `${selectedBooking.guests} person(s)`,
                },
                { label: "Amount", value: `$${selectedBooking.amount}` },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-gray-50"
                >
                  <span className="text-sm text-gray-500">{f.label}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {f.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(selectedBooking.status)}`}
                >
                  {selectedBooking.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "confirmed")
                    }
                    className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-400 transition"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "cancelled")
                    }
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-400 transition"
                  >
                    ✗ Decline
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-100 transition"
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
