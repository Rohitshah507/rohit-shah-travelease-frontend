import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  DollarSign,
  Star,
  ChevronRight,
  Navigation,
  Clock,
  XCircle,
  TrendingUp,
  MapPin,
  Users,
  Package,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import { getToken } from "../Login.jsx";

const avatarColors = [
  "from-violet-400 to-purple-500",
  "from-fuchsia-400 to-violet-500",
  "from-purple-400 to-indigo-500",
  "from-indigo-400 to-violet-500",
  "from-violet-500 to-fuchsia-600",
];

const statusCfg = (s) => {
  const l = (s || "").toLowerCase();
  return l === "confirmed"
    ? {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        label: "Confirmed",
      }
    : l === "pending"
      ? {
          bg: "bg-violet-100",
          text: "text-violet-700",
          dot: "bg-violet-500",
          label: "Pending",
        }
      : l === "cancelled"
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

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-violet-100 rounded-2xl ${className}`} />
);

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  change,
  changeUp = true,
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-violet-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group">
      <div
        className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${gradient}`}
      />
      <div className="flex justify-between items-start relative">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-violet-400 text-xs font-semibold truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-violet-900 mt-1 leading-none">
            {value}
          </p>
          <span
            className={`text-[11px] font-bold mt-1 flex items-center gap-0.5 ${changeUp ? "text-emerald-600" : "text-red-500"}`}
          >
            <TrendingUp size={10} /> {change}
          </span>
        </div>
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  guideId,
  isTracking,
  trackingTime,
  fmtTime,
  onToggleTracking,
  setActivePage,
}) {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guideId) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const bookingsRes = await axios.get(`${serverURL}/api/booking/guide`, {
          params: { guideId },
          headers,
        });
        const toursRes = await axios.get(`${serverURL}/api/user/package`, {
          headers,
        });

        const rawBookings =
          bookingsRes.data.data || bookingsRes.data.bookings || [];
        const normalised = rawBookings.map((b) => ({
          _id: b._id,
          tourist: b.userId?.username || "Unknown",
          tourTitle: b.tourPackageId?.title || "—",
          location: b.tourPackageId?.destination || "",
          amount: b.tourPackageId?.price || 0,
          guests: (b.numberOfAdults || 0) + (b.numberOfChildren || 0),
          date: b.startDate || "",
          endDate: b.endDate || "",
          status: (b.bookingStatus || "").toLowerCase(),
        }));

        setBookings(normalised);
        setTours(toursRes.data.getPackages || []);
      } catch (err) {
        console.error(
          "Dashboard fetch error:",
          err.response?.data || err.message,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [guideId]);

  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const earnings = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && b.date && new Date(b.date) >= today,
  );

  const statCards = [
    {
      label: "Total Bookings",
      value: total,
      icon: CalendarDays,
      gradient: "from-violet-500 to-purple-600",
      change: `${pending} pending`,
      changeUp: pending === 0,
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: CheckCircle,
      gradient: "from-emerald-400 to-teal-500",
      change: `${cancelled} cancelled`,
      changeUp: cancelled === 0,
    },
    {
      label: "Upcoming Tours",
      value: upcoming.length,
      icon: Clock,
      gradient: "from-fuchsia-500 to-violet-600",
      change: "scheduled ahead",
      changeUp: true,
    },
    {
      label: "Total Earnings",
      value: `Rs.${earnings.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-amber-400 to-orange-500",
      change: "from confirmed",
      changeUp: true,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ══ Stat Cards ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28" />
            ))
          : statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* ══ Upcoming Bookings ══ */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-violet-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-violet-900 text-sm sm:text-base">
                Upcoming Bookings
              </h3>
              <p className="text-[11px] text-violet-400 mt-0.5">
                {upcoming.length} confirmed tours ahead
              </p>
            </div>
            <button
              onClick={() => setActivePage("bookings")}
              className="flex items-center gap-1 text-violet-600 text-xs font-bold hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
                <CalendarDays size={20} className="text-violet-300" />
              </div>
              <p className="text-sm font-bold text-violet-500">
                No upcoming bookings
              </p>
              <p className="text-xs text-violet-400 mt-0.5">
                Confirmed tours will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((b, i) => {
                const sc = statusCfg(b.status);
                return (
                  <div
                    key={b._id}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-violet-50/60 transition-colors group"
                  >
                    <div
                      className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}
                    >
                      {b.tourist?.[0]?.toUpperCase() ?? "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-violet-900 text-xs sm:text-sm truncate">
                        {b.tourist}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-violet-400 mt-0.5 flex-wrap">
                        <span className="truncate max-w-[100px] sm:max-w-none">
                          {b.tourTitle}
                        </span>
                        {b.location && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <MapPin
                              size={9}
                              className="flex-shrink-0 hidden sm:block"
                            />
                            <span className="truncate hidden sm:block">
                              {b.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] sm:text-[11px] text-violet-500 font-semibold">
                        {b.date
                          ? new Date(b.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Users size={9} className="text-violet-400" />
                        <span className="text-[9px] sm:text-[10px] text-violet-400">
                          {b.guests}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full ${sc.bg} flex-shrink-0`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      <span className={`text-[9px] font-bold ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-violet-900 flex-shrink-0">
                      ${b.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ Right Column ══ */}
        <div className="space-y-4">
          {/* Tracking Card */}
          <div
            className="rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)",
            }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-fuchsia-400/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">
                    Tracking Status
                  </p>
                  <p className="text-white font-black text-lg sm:text-xl mt-0.5">
                    {isTracking ? "🟢 Online" : "⚪ Offline"}
                  </p>
                </div>
                <Navigation size={20} className="text-violet-300" />
              </div>
              {isTracking && (
                <div className="bg-white/15 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                  <p className="text-white text-xs font-bold">
                    Broadcasting · {fmtTime(trackingTime)}
                  </p>
                </div>
              )}
              {!isTracking && (
                <p className="text-violet-300 text-xs mb-3">
                  Share your live location with tourists
                </p>
              )}
              <button
                onClick={onToggleTracking}
                className={`w-full py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 ${
                  isTracking
                    ? "bg-red-400/30 hover:bg-red-400/50 text-white border border-red-300/30"
                    : "bg-white text-violet-700 hover:bg-violet-50 shadow-lg shadow-violet-900/30"
                }`}
              >
                {isTracking ? "⏹ Stop Tracking" : "▶ Start Tracking"}
              </button>
            </div>
          </div>

          {/* Booking Breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-100">
            <p className="font-black text-violet-900 text-sm mb-3">
              Booking Breakdown
            </p>
            {loading ? (
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  {
                    label: "Confirmed",
                    count: confirmed,
                    barColor: "bg-emerald-500",
                  },
                  {
                    label: "Pending",
                    count: pending,
                    barColor: "bg-violet-500",
                  },
                  {
                    label: "Cancelled",
                    count: cancelled,
                    barColor: "bg-red-400",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-violet-500">
                        {item.label}
                      </span>
                      <span className="text-[11px] font-black text-violet-900">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-violet-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                        style={{
                          width:
                            total > 0
                              ? `${Math.round((item.count / total) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-violet-400 text-right pt-1">
                  {total} total bookings
                </p>
              </div>
            )}
          </div>

          {/* Tour Packages Mini */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-100">
            <div className="flex justify-between items-center mb-3">
              <p className="font-black text-violet-900 text-sm">My Packages</p>
              <button
                onClick={() => setActivePage("tours")}
                className="text-[10px] text-violet-600 font-bold bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg transition-all"
              >
                Manage →
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-4">
                <Package size={20} className="text-violet-300 mx-auto mb-1" />
                <p className="text-xs text-violet-400">No packages yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tours.slice(0, 3).map((t, i) => (
                  <div
                    key={t._id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-violet-50/50 hover:bg-violet-50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
                    >
                      {t.title?.[0]?.toUpperCase() ?? "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-violet-900 truncate">
                        {t.title}
                      </p>
                      <p className="text-[10px] text-violet-400 truncate flex items-center gap-1">
                        <MapPin size={8} />
                        {t.destination}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] font-black text-violet-700">
                        Rs.{t.price}
                      </p>
                      <div
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${t.status === "ACTIVE" || t.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {t.status === "ACTIVE" || t.status === "Active"
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Pending Bookings ══ */}
      {!loading && pending > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-violet-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-violet-900 text-sm sm:text-base">
                Pending Requests
              </h3>
              <p className="text-[11px] text-violet-400 mt-0.5">
                {pending} booking{pending !== 1 ? "s" : ""} awaiting your action
              </p>
            </div>
            <button
              onClick={() => setActivePage("bookings")}
              className="flex items-center gap-1 text-violet-600 text-xs font-bold hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            >
              Manage All <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {bookings
              .filter((b) => b.status === "pending")
              .slice(0, 6)
              .map((b, i) => (
                <div
                  key={b._id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-violet-100 bg-violet-50/40 hover:bg-violet-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}
                  >
                    {b.tourist?.[0]?.toUpperCase() ?? "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-violet-900 text-[12px] truncate">
                      {b.tourist}
                    </p>
                    <p className="text-[10px] text-violet-400 truncate">
                      {b.tourTitle}
                    </p>
                    <p className="text-[10px] text-violet-500 font-semibold">
                      {b.date
                        ? new Date(b.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-violet-800 text-sm">
                      ${b.amount}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span className="text-[9px] text-violet-500 font-bold">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══ Empty State ══ */}
      {!loading && total === 0 && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-violet-100 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
            <CalendarDays size={28} className="text-violet-300" />
          </div>
          <p className="font-black text-violet-600 text-base sm:text-lg">
            No bookings yet
          </p>
          <p className="text-violet-400 text-sm mt-1">
            Your bookings from tourists will appear here
          </p>
        </div>
      )}
    </div>
  );
}
