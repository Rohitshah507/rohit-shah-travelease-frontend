import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, Download } from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const Skeleton4 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function Earnings({ guideId }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [hRes, sRes] = await Promise.all([
          axios.get(`${serverURL}/api/guide/${guideId}/bookings/history`, {
            headers,
          }),
          axios.get(`${serverURL}/api/guide/${guideId}/stats`, { headers }),
        ]);
        setHistory(hRes.data.history || []);
        setStats(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [guideId]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading
          ? [...Array(3)].map((_, i) => <Skeleton4 key={i} className="h-32" />)
          : [
              {
                label: "This Month",
                value: `$${stats?.thisMonthEarnings ?? 0}`,
                icon: TrendingUp,
                change: "+18%",
                color: "from-yellow-500 to-amber-500",
              },
              {
                label: "Total Earnings",
                value: `$${stats?.totalEarnings ?? 0}`,
                icon: DollarSign,
                change: "All time",
                color: "from-gray-700 to-gray-900",
              },
              {
                label: "Pending Payout",
                value: `$${stats?.pendingPayout ?? 0}`,
                icon: Clock,
                change: "2 days",
                color: "from-orange-500 to-amber-600",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 text-white shadow-sm`}
              >
                <s.icon size={24} className="opacity-80 mb-3" />
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">
                  {s.label} · {s.change}
                </p>
              </div>
            ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Payment History</h3>
          <button className="text-yellow-600 text-sm font-medium flex items-center gap-1 hover:bg-yellow-50 px-3 py-1.5 rounded-lg transition">
            <Download size={14} />
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton4 key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => (
              <div
                key={h._id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {h.tourTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {h.tourist} · {h.date}
                  </p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                  Paid
                </span>
                <span className="font-bold text-gray-900">+${h.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
