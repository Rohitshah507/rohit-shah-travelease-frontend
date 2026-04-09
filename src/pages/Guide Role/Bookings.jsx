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
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import { getToken } from "../Login";
import { FaRupeeSign } from "react-icons/fa";

const avatarColors = [
  "from-violet-400 to-purple-500",
  "from-purple-400 to-indigo-500",
  "from-indigo-400 to-violet-500",
  "from-fuchsia-400 to-purple-500",
  "from-violet-500 to-fuchsia-500",
];

const statusConfig = (s) => {
  const lower = (s || "").toLowerCase();
  return lower === "confirmed"
    ? {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        label: "Confirmed",
      }
    : lower === "pending"
      ? {
          bg: "bg-violet-100",
          text: "text-violet-700",
          dot: "bg-violet-500",
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
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-3.5 shadow-sm border border-violet-100 animate-pulse"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-violet-100 rounded w-20" />
            <div className="h-2 bg-violet-50 rounded w-28" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-violet-50 rounded w-full" />
          <div className="h-2 bg-violet-50 rounded w-4/5" />
          <div className="h-2 bg-violet-50 rounded w-3/5" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Edit Modal ── */
function EditModal({ booking, onClose, onSave }) {
  const [form, setForm] = useState({
    startDate: booking.date ? booking.date.slice(0, 10) : "",
    endDate: booking.endDate ? booking.endDate.slice(0, 10) : "",
    guests: booking.guests ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      await axios.put(
        `${serverURL}/api/user/${booking._id}`,
        {
          startDate: form.startDate,
          endDate: form.endDate,
          numberOfAdults: form.guests,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSave({
        ...booking,
        date: form.startDate,
        endDate: form.endDate,
        guests: Number(form.guests),
      });
      onClose();
    } catch (err) {
      console.error("Edit error:", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-violet-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-violet-900/20 w-full max-w-sm overflow-hidden border border-violet-100">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-sm sm:text-base">
              Edit Booking
            </h3>
            <p className="text-violet-200 text-[11px]">{booking.tourist}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all active:scale-95"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-3.5">
          {[
            { label: "Start Date", key: "startDate" },
            { label: "End Date", key: "endDate" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block mb-1">
                {label}
              </label>
              <input
                type="date"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm text-violet-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block mb-1">
              Guests
            </label>
            <input
              type="number"
              min={1}
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm text-violet-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3.5 bg-violet-50/60 border-t border-violet-100 flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:from-violet-700 hover:to-purple-700 transition-all active:scale-95 shadow-md shadow-violet-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-violet-200 text-violet-700 font-bold rounded-xl text-sm hover:bg-violet-100 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ booking, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = getToken();
      await axios.delete(`${serverURL}/api/user/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onConfirm(booking._id);
      onClose();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-violet-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-violet-900/20 w-full max-w-xs overflow-hidden border border-violet-100">
        <div className="px-4 sm:px-5 pt-6 pb-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <h3 className="font-black text-violet-900 text-base mb-1">
            Delete Booking?
          </h3>
          <p className="text-violet-500 text-xs leading-relaxed">
            This will permanently remove the booking for{" "}
            <span className="font-bold text-violet-700">{booking.tourist}</span>
            . This action cannot be undone.
          </p>
        </div>
        <div className="px-4 sm:px-5 py-4 flex gap-2.5">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-md shadow-red-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-violet-200 text-violet-700 font-bold rounded-xl text-sm hover:bg-violet-100 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const guideId = userData?.userDetails?._id;

  useEffect(() => {
    if (!guideId) return;
    const fetchBookings = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/booking/guide`, {
          params: { guideId },
          headers: { Authorization: `Bearer ${token}` },
        });
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
    fetchBookings();
  }, [guideId]);

  const handleStatus = async (id, action) => {
    try {
      setActionLoading(id);
      const token = getToken();
      if (action === "confirmed") {
        await axios.put(
          `${serverURL}/api/booking/confirm/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "cancelled") {
        await axios.put(
          `${serverURL}/api/booking/guide/cancel/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: action } : b)),
      );
      if (selectedBooking?._id === id)
        setSelectedBooking((prev) => ({ ...prev, status: action }));
    } catch (err) {
      console.error("Status update error:", err.response?.data || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = (updated) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b)),
    );
    if (selectedBooking?._id === updated._id) setSelectedBooking(updated);
  };

  const handleDeleteConfirm = (id) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
    if (selectedBooking?._id === id) setSelectedBooking(null);
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
    <div className="space-y-4 p-1">
      {/* ── Top Bar ── */}
      <div className="flex flex-col gap-3">
        {/* Filter buttons — scroll horizontally on tiny screens */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all duration-300 ${
                filter === f
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-300/50"
                  : "bg-white text-violet-700 border border-violet-200 hover:border-violet-400"
              }`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-white/30 text-white px-1 py-0.5 rounded-full text-[9px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search — full width on mobile */}
        <div className="relative w-full sm:w-auto sm:self-end">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"
          />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search bookings..."
            className="pl-8 pr-4 py-1.5 rounded-lg border border-violet-200 text-[11px] bg-white text-violet-900 placeholder-violet-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all w-full sm:w-44"
          />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {[
          {
            label: "Total",
            count: bookings.length,
            color: "from-violet-500 to-purple-500",
          },
          {
            label: "Confirmed",
            count: bookings.filter((b) => b.status === "confirmed").length,
            color: "from-emerald-400 to-teal-500",
          },
          {
            label: "Pending",
            count: pendingCount,
            color: "from-violet-600 to-fuchsia-600",
          },
          {
            label: "Cancelled",
            count: bookings.filter((b) => b.status === "cancelled").length,
            color: "from-red-400 to-rose-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-2.5 border border-violet-100 shadow-sm flex items-center gap-2"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}
            >
              {stat.count}
            </div>
            <div>
              <p className="text-[9px] text-violet-400 font-semibold">
                {stat.label}
              </p>
              <p className="text-[11px] font-black text-violet-900">Bookings</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
            <CalendarDays size={24} className="text-violet-300" />
          </div>
          <p className="font-bold text-violet-600 text-sm">No bookings found</p>
          <p className="text-violet-400 text-xs mt-1">
            Try changing your filter or search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filtered.map((b, i) => {
            const sc = statusConfig(b.status);
            return (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-violet-100/80 shadow-sm shadow-violet-100/60 hover:shadow-md hover:shadow-violet-200/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="h-0.5 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />

                <div className="p-3 sm:p-3.5 space-y-2.5">
                  {/* Tourist Header */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}
                      >
                        {b.tourist?.[0]?.toUpperCase() ?? "T"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-violet-900 text-[12px] leading-tight truncate">
                          {b.tourist}
                        </p>
                        <div className="flex items-center gap-1 text-violet-400 text-[9px] mt-0.5">
                          <Mail size={8} className="flex-shrink-0" />
                          <span className="truncate max-w-[100px]">
                            {b.email || "—"}
                          </span>
                        </div>
                        {b.phone && (
                          <div className="flex items-center gap-1 text-violet-400 text-[9px]">
                            <Phone size={8} className="flex-shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0 ${sc.bg}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                      <span className={`text-[9px] font-bold ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-violet-100 to-transparent" />

                  {/* Tour Package */}
                  <div className="bg-violet-50/80 rounded-lg px-2.5 py-1.5 border border-violet-100">
                    <p className="text-[8px] text-violet-400 font-bold uppercase tracking-widest mb-0.5">
                      Tour
                    </p>
                    <p className="font-black text-violet-900 text-[11px] leading-tight truncate">
                      {b.tourTitle || "—"}
                    </p>
                  </div>

                  {/* 2x2 Details */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        label: "Location",
                        value: b.location || "—",
                        icon: (
                          <MapPin
                            size={9}
                            className="text-violet-400 flex-shrink-0"
                          />
                        ),
                      },
                      {
                        label: "Guests",
                        value: `${b.guests ?? "—"} pax`,
                        icon: (
                          <Users
                            size={9}
                            className="text-violet-400 flex-shrink-0"
                          />
                        ),
                      },
                      {
                        label: "Start",
                        value: b.date
                          ? new Date(b.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })
                          : "—",
                        icon: (
                          <CalendarDays
                            size={9}
                            className="text-violet-400 flex-shrink-0"
                          />
                        ),
                      },
                      {
                        label: "End",
                        value: b.endDate
                          ? new Date(b.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })
                          : "—",
                        icon: (
                          <Clock
                            size={9}
                            className="text-violet-400 flex-shrink-0"
                          />
                        ),
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-violet-50/40 rounded-lg px-2 py-1.5 border border-violet-100"
                      >
                        <p className="text-[8px] text-violet-400 font-bold uppercase tracking-widest mb-0.5">
                          {item.label}
                        </p>
                        <div className="flex items-center gap-1">
                          {item.icon}
                          <p className="font-semibold text-violet-800 text-[10px] truncate">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <FaRupeeSign size={11} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[8px] text-violet-400 font-semibold leading-none">
                          Amount
                        </p>
                        <p className="font-black text-violet-900 text-[13px] leading-tight">
                          Rs.{b.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(b._id, "confirmed")}
                            disabled={actionLoading === b._id}
                            title="Accept"
                            className="w-7 h-7 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-bold transition-all disabled:opacity-50 active:scale-95"
                          >
                            {actionLoading === b._id ? (
                              <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                          </button>
                          <button
                            onClick={() => handleStatus(b._id, "cancelled")}
                            disabled={actionLoading === b._id}
                            title="Decline"
                            className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 active:scale-95"
                          >
                            {actionLoading === b._id ? (
                              <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle size={13} />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedBooking(b)}
                        title="View"
                        className="w-7 h-7 flex items-center justify-center bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all active:scale-95"
                      >
                        <Eye size={13} />
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
        <div className="fixed inset-0 bg-violet-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-violet-900/30 w-full max-w-md overflow-hidden border border-violet-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-4 sm:px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-black text-white text-sm sm:text-base">
                  Booking Details
                </h3>
                <p className="text-violet-200 text-[11px] font-medium">
                  Full booking information
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all active:scale-95"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            <div className="px-4 sm:px-5 py-4 space-y-3 sm:space-y-3.5 overflow-y-auto">
              {/* Tourist Block */}
              <div className="flex items-center gap-3 sm:gap-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-md flex-shrink-0">
                  {selectedBooking.tourist?.[0]?.toUpperCase() ?? "T"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-violet-900 text-sm truncate">
                    {selectedBooking.tourist}
                  </p>
                  <div className="flex items-center gap-1 text-violet-500 text-xs mt-0.5">
                    <Mail size={11} />
                    <span className="truncate">
                      {selectedBooking.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-violet-500 text-xs mt-0.5">
                    <Phone size={11} />
                    <span>{selectedBooking.phone || "—"}</span>
                  </div>
                </div>
                <div
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold flex-shrink-0 ${statusConfig(selectedBooking.status).bg} ${statusConfig(selectedBooking.status).text}`}
                >
                  {statusConfig(selectedBooking.status).label}
                </div>
              </div>

              {/* Detail Rows */}
              {[
                {
                  label: "Tour Package",
                  value: selectedBooking.tourTitle,
                  icon: <CalendarDays size={13} className="text-violet-500" />,
                },
                {
                  label: "Location",
                  value: selectedBooking.location,
                  icon: <MapPin size={13} className="text-violet-500" />,
                },
                {
                  label: "Start Date",
                  value: selectedBooking.date
                    ? new Date(selectedBooking.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—",
                  icon: <CalendarDays size={13} className="text-violet-500" />,
                },
                {
                  label: "End Date",
                  value: selectedBooking.endDate
                    ? new Date(selectedBooking.endDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—",
                  icon: <Clock size={13} className="text-violet-500" />,
                },
                {
                  label: "Guests",
                  value: `${selectedBooking.guests} person(s)`,
                  icon: <Users size={13} className="text-violet-500" />,
                },
                {
                  label: "Amount",
                  value: `$${selectedBooking.amount}`,
                  icon: <DollarSign size={13} className="text-violet-500" />,
                  bold: true,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-violet-50"
                >
                  <div className="flex items-center gap-2 text-xs text-violet-500">
                    {row.icon}
                    <span className="font-semibold">{row.label}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${row.bold ? "text-violet-600 text-sm" : "text-violet-900"}`}
                  >
                    {row.value || "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-4 sm:px-5 py-3.5 bg-violet-50/80 border-t border-violet-100 flex flex-wrap gap-2 sm:gap-2.5 flex-shrink-0">
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "confirmed")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 min-w-[80px] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedBooking._id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "✓"
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleStatus(selectedBooking._id, "cancelled")
                    }
                    disabled={actionLoading === selectedBooking._id}
                    className="flex-1 min-w-[80px] py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-red-300/40 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedBooking._id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "✗"
                    )}
                    Decline
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setEditingBooking(selectedBooking);
                }}
                className="flex-1 min-w-[80px] py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 min-w-[80px] py-2.5 border-2 border-violet-200 text-violet-700 font-bold rounded-xl text-xs hover:bg-violet-100 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingBooking && (
        <EditModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ── Delete Modal ── */}
      {deletingBooking && (
        <DeleteModal
          booking={deletingBooking}
          onClose={() => setDeletingBooking(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
