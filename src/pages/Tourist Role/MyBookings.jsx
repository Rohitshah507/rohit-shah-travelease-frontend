import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  MapPin, Calendar, Clock, Star, CreditCard, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Plane, Eye, Ban,
  Package, ChevronRight, Filter, Search, Sparkles,
} from "lucide-react";
import { serverURL } from "../../App.jsx";
import { getToken } from "../Login.jsx";
import Navbar from "../../Components/Navbar.jsx";
import Footer from "../../Components/Footer.jsx";

// ── Status Config ─────────────────────────────────────────────────────────────
const bookingStatusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  pending: {
    label: "Pending",
    icon: AlertCircle,
    classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-red-500/15 text-red-400 border border-red-500/30",
    dot: "bg-red-400",
  },
};

const paymentStatusConfig = {
  success: {
    label: "Paid",
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  },
  completed: {
    label: "Paid",
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  },
  paid: {
    label: "Paid",
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  },
  pending: {
    label: "Unpaid",
    classes: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  },
  failed: {
    label: "Failed",
    classes: "bg-red-500/15 text-red-400 border border-red-500/25",
  },
  refunded: {
    label: "Refunded",
    classes: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  },
};

const getBookingStatus = (status = "") => {
  const key = status.toLowerCase();
  return bookingStatusConfig[key] || {
    label: status,
    icon: AlertCircle,
    classes: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
    dot: "bg-violet-400",
  };
};

const getPaymentStatus = (status = "") => {
  const key = status.toLowerCase();
  return paymentStatusConfig[key] || {
    label: status || "Unknown",
    classes: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });
};

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
const CancelModal = ({ booking, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/75 backdrop-blur-[10px] z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-[400px] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#0f0524] border border-violet-500/40 shadow-[0_0_80px_rgba(139,92,246,0.3)] animate-[fadeInUp_0.3s_ease]">
      <div className="p-7">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
            <Ban size={26} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-black text-white text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Cancel Booking?</h3>
            <p className="text-[#6b5a8e] text-sm">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-violet-500/8 border border-violet-500/20 rounded-[14px] px-4 py-3 mb-5">
          <p className="text-[0.7rem] font-bold text-violet-400 tracking-widest uppercase mb-1">Tour Package</p>
          <p className="text-white font-bold text-sm">{booking?.tourPackageId?.title || "This tour"}</p>
        </div>

        <p className="text-[#9e9ab5] text-sm leading-[1.7] mb-6">
          Are you sure you want to cancel this booking? Your reservation will be permanently removed and cannot be recovered.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[14px] font-bold text-sm text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-all cursor-pointer"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-[14px] font-bold text-sm text-white bg-gradient-to-r from-red-500 to-red-700 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed transition-all border-none cursor-pointer flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Cancelling...</>
              : <><XCircle size={15} /> Yes, Cancel</>
            }
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, index, onCancelClick, onPayClick }) => {
  const navigate = useNavigate();
  const pkg = booking.tourPackageId;
  const bStatus = getBookingStatus(booking.bookingStatus);
  const pStatus = getPaymentStatus(booking.paymentStatus);
  const StatusIcon = bStatus.icon;
  const isCancelled = booking.bookingStatus?.toLowerCase() === "cancelled";
  const isPending = booking.bookingStatus?.toLowerCase() === "pending";
  const isConfirmed = booking.bookingStatus?.toLowerCase() === "confirmed";
  const isPaid = ["success", "completed", "paid"].includes(booking.paymentStatus?.toLowerCase());

  return (
    <div
      className="rounded-[24px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_20px_60px_rgba(139,92,246,0.2)] transition-all duration-[400ms] group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-[220px] h-[180px] md:h-auto overflow-hidden shrink-0">
          <img
            src={pkg?.imageUrls?.[0] || "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600"}
            alt={pkg?.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a0a3e]/60 md:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/70 to-transparent md:hidden" />

          {/* Booking status ribbon */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.68rem] font-bold ${bStatus.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${bStatus.dot} ${!isCancelled ? "animate-pulse" : ""}`} />
            {bStatus.label}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3
                  className="text-xl font-black text-white leading-tight mb-1 group-hover:text-violet-300 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {pkg?.title || "Tour Package"}
                </h3>
                <div className="flex items-center gap-1.5 text-[#6b5a8e] text-xs">
                  <MapPin size={11} className="text-violet-500" />
                  <span>{pkg?.destination || "—"}</span>
                  {pkg?.duration && <><span className="text-violet-500/40">·</span><Clock size={11} className="text-violet-500" /><span>{pkg.duration}</span></>}
                </div>
              </div>
              {pkg?.price && (
                <div className="text-right shrink-0">
                  <div
                    className="text-[1.4rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Rs. {pkg.price}
                  </div>
                  <div className="text-[#6b5a8e] text-[0.7rem]">per person</div>
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Booking Date */}
              <div className="bg-violet-500/8 border border-violet-500/15 rounded-[12px] px-3 py-2.5">
                <p className="text-[0.6rem] font-bold text-violet-400 tracking-[0.15em] uppercase mb-1">Booked On</p>
                <p className="text-white text-xs font-semibold">{formatDate(booking.createdAt || booking.bookingDate)}</p>
              </div>

              {/* Travel Dates */}
              <div className="bg-violet-500/8 border border-violet-500/15 rounded-[12px] px-3 py-2.5">
                <p className="text-[0.6rem] font-bold text-violet-400 tracking-[0.15em] uppercase mb-1">Travel Date</p>
                <p className="text-white text-xs font-semibold">{formatDate(booking.startDate)}</p>
              </div>

              {/* Guests */}
              <div className="bg-violet-500/8 border border-violet-500/15 rounded-[12px] px-3 py-2.5">
                <p className="text-[0.6rem] font-bold text-violet-400 tracking-[0.15em] uppercase mb-1">Guests</p>
                <p className="text-white text-xs font-semibold">
                  {booking.numberOfAdults || 1} Adult{booking.numberOfAdults > 1 ? "s" : ""}
                  {booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} Child` : ""}
                </p>
              </div>

              {/* Payment */}
              <div className="bg-violet-500/8 border border-violet-500/15 rounded-[12px] px-3 py-2.5">
                <p className="text-[0.6rem] font-bold text-violet-400 tracking-[0.15em] uppercase mb-1">Payment</p>
                <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full ${pStatus.classes}`}>
                  {pStatus.label}
                </span>
              </div>
            </div>

            {/* Booking ID */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[0.6rem] font-bold text-[#6b5a8e] tracking-widest uppercase">Booking ID:</span>
              <span className="font-mono text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20 truncate max-w-[200px]">{booking._id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-violet-500/12">
            {/* View Details */}
            <button
              onClick={() => pkg?._id && navigate(`/booking/${pkg._id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all cursor-pointer"
            >
              <Eye size={13} /> View Details
            </button>

            {/* Pay Now — only if pending payment */}
            {!isPaid && !isCancelled && (
              <button
                onClick={() => onPayClick(booking)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_12px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer"
              >
                <CreditCard size={13} /> Pay Now
              </button>
            )}

            {/* Paid badge */}
            {isPaid && !isCancelled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                <CheckCircle size={13} /> Payment Complete
              </div>
            )}

            {/* Cancel — only if not cancelled */}
            {!isCancelled && (
              <button
                onClick={() => onCancelClick(booking)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer ml-auto"
              >
                <Ban size={13} /> Cancel
              </button>
            )}

            {/* Cancelled state */}
            {isCancelled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-red-400/60 bg-red-500/8 border border-red-500/20 ml-auto">
                <XCircle size={13} /> Booking Cancelled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = getToken();
      const response = await axios.get(`${serverURL}/api/booking/tourist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      const token = getToken();
      await axios.put(
        `${serverURL}/api/booking/tourist/cancel/${cancelTarget._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Booking cancelled successfully!");
      setCancelTarget(null);
      fetchBookings(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = async (booking) => {
    const loadingToast = toast.loading("Redirecting to Khalti...");
    try {
      setProcessingPayment(true);
      const token = getToken();
      const paymentResponse = await axios.post(
        `${serverURL}/api/payment/${booking._id}/khalti/initiate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const khaltiUrl =
        (typeof paymentResponse.data?.paymentUrl === "string" ? paymentResponse.data.paymentUrl : null) ||
        paymentResponse.data?.paymentUrl?.payment_url ||
        paymentResponse.data?.payment_url;

      if (!khaltiUrl) { toast.dismiss(loadingToast); throw new Error("Payment URL not returned."); }
      toast.dismiss(loadingToast);
      toast.success("Redirecting to Khalti...", { duration: 2000 });
      setTimeout(() => { window.location.href = khaltiUrl; }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Payment failed.");
      setProcessingPayment(false);
    }
  };

  // Filter bookings
  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.tourPackageId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tourPackageId?.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || b.bookingStatus?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus?.toLowerCase() === "confirmed").length,
    pending: bookings.filter(b => b.bookingStatus?.toLowerCase() === "pending").length,
    cancelled: bookings.filter(b => b.bookingStatus?.toLowerCase() === "cancelled").length,
  };

  const filterButtons = [
    { id: "all", label: "All Bookings", count: stats.total },
    { id: "confirmed", label: "Confirmed", count: stats.confirmed },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-8%] left-[18%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,transparent_70%)] blur-[70px]" />
        <div className="absolute top-[45%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.14)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: "#1a0a3e", color: "#e2d9f3", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(139,92,246,0.25)" },
        success: { iconTheme: { primary: "#10b981", secondary: "#1a0a3e" } },
        error: { style: { background: "#2d0a1e", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)" }, iconTheme: { primary: "#ef4444", secondary: "#2d0a1e" } },
      }} />

      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelling}
        />
      )}

      <div className="relative z-10">
        <Navbar />

        {/* ── HERO ── */}
        <div className="relative pt-28 pb-14 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle,rgba(139,92,246,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute right-[-60px] top-[15%] w-[400px] h-[400px] rounded-full border border-violet-500/10 pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-violet-500/10 border border-violet-500/20">
                  <Sparkles size={13} className="text-violet-400" />
                  <span className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400">My Travel Journal</span>
                </div>
                <h1
                  className="font-black text-white leading-tight mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.5rem,5vw,3.8rem)" }}
                >
                  My <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">Bookings</span>
                </h1>
                <p className="text-[#9e9ab5] text-base max-w-md leading-relaxed">
                  Track all your adventures — from upcoming treks to completed journeys.
                </p>
              </div>

              {/* Refresh + Explore buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchBookings(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-sm font-bold text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={() => navigate("/packages")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer"
                >
                  <Plane size={15} /> Explore Packages
                </button>
              </div>
            </div>

            {/* ── STATS ROW ── */}
            {!loading && bookings.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                {[
                  { label: "Total Bookings", value: stats.total, color: "from-violet-500 to-violet-700", glow: "rgba(139,92,246,0.3)" },
                  { label: "Confirmed", value: stats.confirmed, color: "from-emerald-500 to-emerald-700", glow: "rgba(16,185,129,0.3)" },
                  { label: "Pending", value: stats.pending, color: "from-amber-500 to-amber-600", glow: "rgba(245,158,11,0.3)" },
                  { label: "Cancelled", value: stats.cancelled, color: "from-red-500 to-red-700", glow: "rgba(239,68,68,0.3)" },
                ].map(({ label, value, color, glow }) => (
                  <div key={label} className="rounded-[18px] bg-violet-500/8 border border-violet-500/18 px-5 py-4 hover:bg-violet-500/14 transition-all">
                    <div className={`text-[2.2rem] font-black leading-none bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      {value}
                    </div>
                    <div className="text-[#6b5a8e] text-xs font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setStatusFilter(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    statusFilter === id
                      ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)] border-none"
                      : "bg-violet-500/8 text-violet-300 border border-violet-500/20 hover:bg-violet-500/18 hover:border-violet-500/45"
                  }`}
                >
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[0.6rem] font-black ${statusFilter === id ? "bg-white/20 text-white" : "bg-violet-500/20 text-violet-400"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2.5 bg-violet-500/8 border border-violet-500/25 rounded-[14px] px-4 py-2 focus-within:border-violet-500/60 transition-all w-full md:w-auto md:min-w-[260px]">
              <Search size={15} className="text-violet-500 shrink-0" />
              <input
                type="text"
                placeholder="Search by tour name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-violet-400/45"
              />
            </div>
          </div>
        </div>

        {/* ── BOOKINGS LIST ── */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
              <p className="text-[#6b5a8e] font-semibold">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            // Empty state
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Package size={40} className="text-violet-500/50" />
              </div>
              <h3 className="text-[1.8rem] font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>No Bookings Yet</h3>
              <p className="text-[#6b5a8e] text-base mb-8 max-w-sm mx-auto leading-relaxed">
                You haven't booked any tours yet. Start your adventure today!
              </p>
              <button
                onClick={() => navigate("/packages")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer"
              >
                <Plane size={16} /> Browse Tour Packages <ChevronRight size={16} />
              </button>
            </div>
          ) : filtered.length === 0 ? (
            // No search results
            <div className="text-center py-20">
              <Search size={48} className="text-violet-900 mx-auto mb-4 block" />
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-[#6b5a8e] mb-5">Try a different search or filter.</p>
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((booking, index) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  index={index}
                  onCancelClick={setCancelTarget}
                  onPayClick={handlePayment}
                />
              ))}

              {/* Footer count */}
              <div className="text-center pt-4">
                <p className="text-[#6b5a8e] text-sm">
                  Showing <span className="text-violet-400 font-bold">{filtered.length}</span> of <span className="text-violet-400 font-bold">{bookings.length}</span> bookings
                </p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyBookings;