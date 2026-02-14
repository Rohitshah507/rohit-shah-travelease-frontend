// ============================================================
//  src/pages/guide/History.jsx
// ============================================================
import { useState, useEffect } from "react";
import { Star, Download } from "lucide-react";
import axios from "axios";
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

export function History({ guideId }) {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          : [
              { label: "Total Tours Done", value: history.length, icon: "🗺️" },
              {
                label: "Total Earnings",
                value: `$${stats?.totalEarnings ?? 0}`,
                icon: "💰",
              },
              {
                label: "5-Star Reviews",
                value: history.filter((h) => h.rating === 5).length,
                icon: "⭐",
              },
              { label: "Avg Rating", value: stats?.avgRating ?? 0, icon: "📊" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
      </div>

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
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => (
              <div
                key={h._id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition"
              >
                <div
                  className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {h.tourist?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {h.tourist}
                  </p>
                  <p className="text-xs text-gray-500">
                    {h.tourTitle} · {h.date}
                  </p>
                  <p className="text-xs text-gray-400 italic mt-0.5">
                    "{h.review}"
                  </p>
                </div>
                <div className="flex gap-1">
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
                <span className="font-bold text-yellow-600">${h.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
