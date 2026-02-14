import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Wifi, WifiOff, UserCheck } from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const Skeleton2 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function Tracking({
  guideId,
  isTracking,
  trackingTime,
  fmtTime,
  onStart,
  onStop,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.324 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${serverURL}/api/guide/${guideId}/tracking/logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [guideId]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div
          className={`rounded-2xl p-6 ${isTracking ? "bg-green-500" : "bg-gray-800"} text-white shadow-sm`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-80">Status</p>
              <p className="text-3xl font-bold">
                {isTracking ? "LIVE" : "OFFLINE"}
              </p>
            </div>
            {isTracking ? (
              <Wifi size={32} className="opacity-80" />
            ) : (
              <WifiOff size={32} className="opacity-80" />
            )}
          </div>
          {isTracking && (
            <p className="text-sm opacity-80">
              Broadcasting for:{" "}
              <span className="font-bold">{fmtTime(trackingTime)}</span>
            </p>
          )}
          <button
            onClick={() => (isTracking ? onStop() : onStart())}
            className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition ${isTracking ? "bg-white text-green-600 hover:bg-green-50" : "bg-yellow-500 text-gray-900 hover:bg-yellow-400"}`}
          >
            {isTracking ? "⏹ Stop Sharing" : "▶ Start Sharing Location"}
          </button>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Current Location</p>
          <p className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-yellow-500" size={18} />
            Kathmandu, Nepal
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {[
              ["Latitude", `${location.lat}° N`],
              ["Longitude", `${location.lng}° E`],
              ["Accuracy", "±5m"],
              ["Last Update", "Just now"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-gray-600">
                <span>{k}</span>
                <span className="font-mono font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Visibility */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-yellow-500" />
            Admin Visibility
          </p>
          <div className="space-y-3">
            {[
              { name: "Super Admin", status: "Viewing", online: true },
              { name: "Regional Admin", status: "Last seen 2m", online: true },
              { name: "Backup Monitor", status: "Offline", online: false },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${a.online ? "bg-green-500" : "bg-gray-300"}`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.status}</p>
                </div>
                {isTracking && a.online && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Receiving
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Live Map View</h3>
          {isTracking && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              &nbsp;Broadcasting Live
            </div>
          )}
        </div>
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-80 flex items-center justify-center overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 400 300"
          >
            {[...Array(8)].map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="#94a3b8"
                strokeWidth="1"
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 45}
                y1="0"
                x2={i * 45}
                y2="300"
                stroke="#94a3b8"
                strokeWidth="1"
              />
            ))}
            <line
              x1="0"
              y1="150"
              x2="400"
              y2="150"
              stroke="#94a3b8"
              strokeWidth="3"
            />
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="300"
              stroke="#94a3b8"
              strokeWidth="3"
            />
          </svg>
          {isTracking ? (
            <div className="relative z-10 text-center">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Navigation size={28} className="text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-30" />
              </div>
              <div className="mt-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                <p className="font-bold text-gray-900 text-sm">Guide Live</p>
                <p className="text-xs text-gray-500">
                  {location.lat}°N, {location.lng}°E · Live
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <MapPin size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                Start tracking to show your location
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Tracking History</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton2 key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div
                key={log._id ?? i}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Navigation size={18} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {log.route}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.date} · {log.start} – {log.end}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {log.duration}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
