// ============================================================
//  src/pages/guide/History.jsx
// ============================================================
import { useState, useEffect } from "react";
import { Star, Download } from "lucide-react";
import axios from "axios";
import { getToken } from "../Login";
import { serverURL } from "../../App";

const avatarColors = [
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-yellow-600",
  "bg-amber-600",
];

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function History() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTours: 0,
    totalEarnings: 0,
    fiveStarReviews: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuideStats = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Fetch guide's bookings from EXISTING endpoint
        const bookingsRes = await axios.get(`${serverURL}/api/booking/guide`, {
          headers,
        });
        const guideBookings = bookingsRes.data.data || bookingsRes.data || [];
        console.log("Guide Bookings:", guideBookings);

        // ✅ Fetch guide's payments from EXISTING endpoint
        const paymentsRes = await axios.get(
          `${serverURL}/api/payment/guide-payments`,
          { headers }
        );
        const guidePayments = paymentsRes.data.data || paymentsRes.data || [];
        console.log("Guide Payments:", guidePayments);

        // Calculate stats - only count CONFIRMED bookings
        const confirmedBookings = guideBookings.filter(
          (b) => b.bookingStatus === "Confirmed"
        );
        const totalTours = confirmedBookings.length;

        // Calculate total earnings - only COMPLETED payments
        const totalEarnings = guidePayments
          .filter((p) => p.status === "COMPLETED")
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        // TODO: Replace with actual review data when endpoint is available
        const fiveStarReviews = 0;
        const avgRating = 0;

        // Create history items by merging bookings with their payments
        const historyItems = confirmedBookings.map((booking) => {
          // Find matching payment for this booking
          const payment = guidePayments.find(
            (p) => 
              p.bookingId?._id === booking._id || 
              p.bookingId === booking._id ||
              p.booking_id === booking._id
          );

          return {
            _id: booking._id,
            tourist: booking.userId?.username || booking.tourist?.username || "Unknown Tourist",
            tourTitle: booking.tourPackageId?.title || booking.tourPackage?.title || "Tour Package",
            date: new Date(booking.startDate || booking.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            review: "Great experience!", // TODO: Replace with actual review from review endpoint
            rating: 5, // TODO: Replace with actual rating from review endpoint
            amount: payment?.amount || booking.tourPackageId?.price || booking.amount || 0,
            paymentStatus: payment?.status || "PENDING",
          };
        });

        setStats({
          totalTours,
          totalEarnings,
          fiveStarReviews,
          avgRating,
        });
        setHistory(historyItems);
      } catch (err) {
        console.error("Error fetching guide stats:", err);
        // Show empty state on error
        setStats({
          totalTours: 0,
          totalEarnings: 0,
          fiveStarReviews: 0,
          avgRating: 0,
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideStats();
  }, []);

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          : [
              {
                label: "Total Tours Done",
                value: stats.totalTours,
                icon: "🗺️",
              },
              {
                label: "Total Earnings",
                value: `$${stats.totalEarnings}`,
                icon: "💰",
              },
              {
                label: "5-Star Reviews",
                value: stats.fiveStarReviews,
                icon: "⭐",
              },
              {
                label: "Avg Rating",
                value: stats.avgRating.toFixed(1),
                icon: "📊",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
      </div>

      {/* Tour History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Tour History</h3>
          <button className="flex items-center gap-2 text-yellow-600 text-sm font-medium hover:bg-yellow-50 px-3 py-1.5 rounded-lg transition">
            <Download size={14} /> Export
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">No tour history yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your completed tours will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => (
              <div
                key={h._id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition"
              >
                {/* Tourist Avatar */}
                <div
                  className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {h.tourist?.[0]?.toUpperCase() || "T"}
                </div>

                {/* Tour Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {h.tourist}
                  </p>
                  <p className="text-xs text-gray-500">
                    {h.tourTitle} · {h.date}
                  </p>
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate">
                    "{h.review}"
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={13}
                      className={
                        j < h.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>

                {/* Amount */}
                <span className="font-bold text-yellow-600 flex-shrink-0">
                  ${h.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;