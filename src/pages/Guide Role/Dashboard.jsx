import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  DollarSign,
  Star,
  ChevronRight,
  Navigation,
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

export default function Dashboard({
  guideId,
  isTracking,
  trackingTime,
  fmtTime,
  onToggleTracking,
  setActivePage,
}) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, bookingsRes, toursRes, historyRes] = await Promise.all(
          [
            axios.get(`${serverURL}/api/guide/${guideId}/stats`, { headers }),
            axios.get(`${serverURL}/api/guide/${guideId}/bookings`, {
              headers,
            }),
            axios.get(`${serverURL}/api/guide/${guideId}/tours`, { headers }),
            axios.get(`${serverURL}/api/guide/${guideId}/bookings/history`, {
              headers,
            }),
          ],
        );

        setStats(statsRes.data);
        setBookings(bookingsRes.data.bookings || []);
        setTours(toursRes.data.tours || []);
        setHistory(historyRes.data.history || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [guideId]);

  return (
    <div className="space-y-6">
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          : [
              {
                label: "Total Bookings",
                value: stats?.totalBookings ?? 0,
                icon: CalendarDays,
                color: "bg-yellow-500",
                change: "+12%",
              },
              {
                label: "Confirmed",
                value: stats?.confirmed ?? 0,
                icon: CheckCircle,
                color: "bg-green-500",
                change: "+5%",
              },
              {
                label: "Total Earnings",
                value: `$${stats?.totalEarnings ?? 0}`,
                icon: DollarSign,
                color: "bg-amber-500",
                change: "+18%",
              },
              {
                label: "Avg Rating",
                value: stats?.avgRating ?? 0,
                icon: Star,
                color: "bg-orange-500",
                change: "+0.2",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {s.value}
                    </p>
                    <span className="text-xs text-green-600 font-medium">
                      {s.change} this month
                    </span>
                  </div>
                  <div
                    className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center`}
                  >
                    <s.icon size={20} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Upcoming Bookings ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-gray-900 text-lg">
              Upcoming Bookings
            </h3>
            <button
              onClick={() => setActivePage("bookings")}
              className="text-yellow-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings
                .filter((b) => b.status !== "cancelled")
                .slice(0, 4)
                .map((b, i) => (
                  <div
                    key={b._id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div
                      className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {b.tourist?.[0] ?? "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {b.tourist}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {b.tourTitle} · {b.date}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor(b.status)}`}
                    >
                      {b.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${b.amount}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">
          {/* Tracking Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-5 text-gray-900 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold text-sm">Tracking Status</p>
              <Navigation size={20} />
            </div>
            <p className="text-2xl font-bold mb-1">
              {isTracking ? "Online" : "Offline"}
            </p>
            <p className="text-xs opacity-80">
              {isTracking
                ? `Broadcasting for ${fmtTime(trackingTime)}`
                : "Click to start sharing location"}
            </p>
            <button
              onClick={onToggleTracking}
              className={`mt-3 w-full py-2 rounded-xl text-sm font-bold transition ${isTracking ? "bg-gray-900 text-yellow-400" : "bg-white/30 text-gray-900 hover:bg-white/50"}`}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </button>
          </div>

          {/* Tour Performance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="font-bold text-gray-900 mb-4">Tour Performance</p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              tours
                .filter((t) => t.status === "active")
                .slice(0, 3)
                .map((t) => (
                  <div key={t._id} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 truncate">{t.title}</span>
                      <span className="font-semibold text-gray-900">
                        {t.booked}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{
                          width: `${Math.min((t.booked ?? 0) * 5, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Reviews ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Recent Reviews</h3>
          <button
            onClick={() => setActivePage("reviews")}
            className="text-yellow-600 text-sm font-medium hover:underline"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.slice(0, 3).map((h, i) => (
              <div
                key={h._id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={
                        j < h.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic mb-3">
                  "{h.review}"
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 ${avatarColors[i]} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {h.tourist?.[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      {h.tourist}
                    </p>
                    <p className="text-xs text-gray-400">{h.tourTitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
