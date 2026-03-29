import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, Download } from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const Skeleton4 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function Earnings() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    thisMonthEarnings: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    monthlyChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const paymentsRes = await axios.get(
          `${serverURL}/api/payment/guide-payments`,
          { headers },
        );
        const guidePayments = paymentsRes.data.data || paymentsRes.data || [];

        const completedPayments = guidePayments.filter(
          (p) => p.status === "COMPLETED",
        );
        const totalEarnings = completedPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthPayments = completedPayments.filter((p) => {
          const paymentDate = new Date(p.createdAt || p.payment_date);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });
        const thisMonthEarnings = thisMonthPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        const lastMonthPayments = completedPayments.filter((p) => {
          const paymentDate = new Date(p.createdAt || p.payment_date);
          return (
            paymentDate.getMonth() === lastMonth.getMonth() &&
            paymentDate.getFullYear() === lastMonth.getFullYear()
          );
        });
        const lastMonthEarnings = lastMonthPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );
        const monthlyChange =
          lastMonthEarnings > 0
            ? Math.round(
                ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) *
                  100,
              )
            : 0;

        const pendingPayments = guidePayments.filter(
          (p) => p.status === "PENDING",
        );
        const pendingPayout = pendingPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );

        const historyItems = completedPayments
          .map((payment) => {
            const booking = payment.bookingId;
            return {
              _id: payment._id,
              tourist:
                booking?.userId?.username ||
                payment.tourist?.username ||
                "Unknown Tourist",
              tourTitle:
                booking?.tourPackageId?.title ||
                payment.tourPackage?.title ||
                "Tour Package",
              date: new Date(
                payment.createdAt || payment.payment_date,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              amount: payment.amount || 0,
              status: payment.status,
            };
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setStats({
          thisMonthEarnings,
          totalEarnings,
          pendingPayout,
          monthlyChange,
        });
        setHistory(historyItems);
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setStats({
          thisMonthEarnings: 0,
          totalEarnings: 0,
          pendingPayout: 0,
          monthlyChange: 0,
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Earnings Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {loading
          ? [...Array(3)].map((_, i) => (
              <Skeleton4 key={i} className="h-28 sm:h-32" />
            ))
          : [
              {
                label: "This Month",
                value: `$${stats.thisMonthEarnings}`,
                icon: TrendingUp,
                change:
                  stats.monthlyChange >= 0
                    ? `+${stats.monthlyChange}%`
                    : `${stats.monthlyChange}%`,
                color: "from-yellow-500 to-amber-500",
              },
              {
                label: "Total Earnings",
                value: `$${stats.totalEarnings}`,
                icon: DollarSign,
                change: "All time",
                color: "from-gray-700 to-gray-900",
              },
              {
                label: "Pending Payout",
                value: `$${stats.pendingPayout}`,
                icon: Clock,
                change: "Processing",
                color: "from-orange-500 to-amber-600",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 sm:p-6 text-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <s.icon size={22} className="opacity-80 mb-2 sm:mb-3" />
                <p className="text-2xl sm:text-3xl font-black">{s.value}</p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">
                  {s.label} · {s.change}
                </p>
              </div>
            ))}
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            Payment History
          </h3>
        </div>

        {loading ? (
          <div className="p-4 sm:p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton4 key={i} className="h-14 sm:h-16" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">💰</div>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              No payment history yet
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Your completed payments will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h) => (
              <div
                key={h._id}
                className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition"
              >
                <div className="w-9 sm:w-10 h-9 sm:h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                    {h.tourTitle}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {h.username} · {h.date}
                  </p>
                </div>
                <span className="hidden sm:inline text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium flex-shrink-0">
                  Paid
                </span>
                <span className="font-bold text-gray-900 text-sm flex-shrink-0">
                  +${h.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Earnings;
