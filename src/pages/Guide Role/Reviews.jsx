import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const avatarColors3 = [
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-yellow-600",
  "bg-amber-600",
];
const Skeleton3 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function Reviews({ guideId }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${serverURL}/api/guide/${guideId}/reviews`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
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
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-gray-900 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-black">{avgRating}</p>
            <div className="flex gap-1 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.floor(avgRating) ? "fill-gray-900" : "opacity-40"
                  }
                />
              ))}
            </div>
            <p className="text-sm opacity-80">{reviews.length} total reviews</p>
          </div>
          <div className="space-y-2 w-48">
            {[5, 4, 3, 2, 1].map((r) => {
              const cnt = reviews.filter((h) => h.rating === r).length;
              return (
                <div key={r} className="flex items-center gap-2">
                  <span className="text-xs w-2">{r}</span>
                  <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{
                        width: `${reviews.length ? (cnt / reviews.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs w-3">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton3 key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((h, i) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 ${avatarColors3[i % avatarColors3.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {h.tourist?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{h.tourist}</p>
                  <p className="text-xs text-gray-500">
                    {h.tourTitle} · {h.date}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={
                        j < h.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl">
                "{h.review}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
