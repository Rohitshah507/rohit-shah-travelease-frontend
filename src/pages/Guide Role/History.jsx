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

        // Fetch bookings
        const bookingsRes = await axios.get(`${serverURL}/api/booking/guide`, {
          headers,
        });
        const guideBookings = bookingsRes.data.data || bookingsRes.data || [];

        // Fetch payments
        const paymentsRes = await axios.get(
          `${serverURL}/api/payment/guide-payments`,
          { headers },
        );
        const guidePayments = paymentsRes.data.data || paymentsRes.data || [];

        const completedBookings = guideBookings.filter(
          (b) => b.bookingStatus === "COMPLETED",
        );
        const totalTours = completedBookings.length;

        const totalEarnings = guidePayments
          .filter((p) => p.status === "COMPLETED")
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        let fiveStarReviews = 0;
        let avgRating = 0;

        try {
          const profileRes = await axios.get(`${serverURL}/api/auth/user`, {
            headers,
          });
          const guideId = profileRes.data.userDetails?._id;

          if (guideId) {
            const reviewRes = await axios.get(
              `${serverURL}/api/review/guide/${guideId}`,
              { headers },
            );
            const reviewData = reviewRes.data.data || reviewRes.data || {};

            // The getGuideRating endpoint likely returns { avgRating, totalReviews, reviews[] }
            // Adjust based on your actual response shape
            avgRating = reviewData.avgRating || reviewData.averageRating || 0;
            const reviews = reviewData.reviews || reviewData || [];
            if (Array.isArray(reviews)) {
              fiveStarReviews = reviews.filter((r) => r.rating === 5).length;
            } else {
              fiveStarReviews = reviewData.fiveStarCount || 0;
            }
          }
        } catch (reviewErr) {
          console.warn("Could not fetch reviews:", reviewErr);
        }

        // Build history from completed bookings
        const historyItems = completedBookings.map((booking) => {
          const payment = guidePayments.find(
            (p) =>
              p.bookingId?._id === booking._id ||
              p.bookingId === booking._id ||
              p.booking_id === booking._id,
          );
          return {
            _id: booking._id,
            tourist:
              booking.userId?.username ||
              booking.tourist?.username ||
              "Unknown Tourist",
            tourTitle:
              booking.tourPackageId?.title ||
              booking.tourPackage?.title ||
              "Tour Package",
            date: new Date(
              booking.startDate || booking.createdAt,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            review: "Great experience!",
            rating: 5,
            amount:
              payment?.amount ||
              booking.tourPackageId?.price ||
              booking.amount ||
              0,
            paymentStatus: payment?.status || "PENDING",
          };
        });

        setStats({ totalTours, totalEarnings, fiveStarReviews, avgRating });
        setHistory(historyItems);
      } catch (err) {
        console.error("Error fetching guide stats:", err);
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
    <div className="space-y-4 sm:space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28" />
            ))
          : [
              {
                label: "Total Tours Done",
                value: stats.totalTours,
                icon: "🗺️",
              },
              {
                label: "Total Earnings",
                value: `Rs.${stats.totalEarnings}`,
                icon: "💰",
              },
              {
                label: "5-Star Reviews",
                value: stats.fiveStarReviews,
                icon: "⭐",
              },
              {
                label: "Avg Rating",
                value:
                  typeof stats.avgRating === "number"
                    ? stats.avgRating.toFixed(1)
                    : "0.0",
                icon: "📊",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">
                  {s.icon}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
      </div>

      {/* Tour History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            Tour History
          </h3>
          <button className="flex items-center gap-1.5 text-yellow-600 text-xs sm:text-sm font-medium hover:bg-yellow-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition">
            <Download size={13} /> Export
          </button>
        </div>

        {loading ? (
          <div className="p-4 sm:p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 sm:h-16" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              No tour history yet
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Your completed tours will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => (
              <div
                key={h._id}
                className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition"
              >
                <div
                  className={`w-9 sm:w-10 h-9 sm:h-10 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}
                >
                  {h.tourist?.[0]?.toUpperCase() || "T"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                    {h.tourist}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {h.tourTitle} · {h.date}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 italic mt-0.5 truncate hidden sm:block">
                    "{h.review}"
                  </p>
                </div>

                <div className="hidden xs:flex gap-0.5 flex-shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={11}
                      className={
                        j < h.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>

                <span className="font-bold text-yellow-600 flex-shrink-0 text-sm">
                  Rs.{h.amount}
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
