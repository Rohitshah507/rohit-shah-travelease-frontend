import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Wifi, WifiOff, UserCheck } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const Skeleton2 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

let socket = null;

export function Tracking({
  guideId,
  isTracking,
  trackingTime,
  fmtTime,
  onStart,
  onStop,
  userDetails,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.324 });
  const [locationError, setLocationError] = useState(null);
  const intervalRef = useRef(null);

  const emitLocation = (latitude, longitude) => {
    if (!socket) return;
    const payload = {
      latitude,
      longitude,
      username: userDetails?.username || null,
      email: userDetails?.email || null,
      phoneNumber: userDetails?.phoneNumber || null,
      location: userDetails?.location || null,
    };
    socket.emit("sendLocation", payload);
  };

  useEffect(() => {
    if (isTracking) {
      socket = io(serverURL, {
        query: { userId: guideId, role: "GUIDE" },
      });

      socket.on("connect", () => console.log("Socket connected:", socket.id));
      socket.on("disconnect", () => console.log("Socket disconnected"));

      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
          emitLocation(latitude, longitude);
        },
        (err) => setLocationError(err.message),
        { enableHighAccuracy: true },
      );

      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            setLocation({ lat: latitude, lng: longitude });
            setLocationError(null);
            emitLocation(latitude, longitude);
          },
          (err) => {
            console.error("Geolocation error:", err);
            setLocationError(err.message);
          },
          { enableHighAccuracy: true },
        );
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [isTracking, guideId, userDetails]);

  useEffect(() => {
    if (!guideId) {
      setLoading(false);
      return;
    }
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setLogsError(null);
        const token = getToken();
        const res = await axios.get(
          `${serverURL}/api/guide/${guideId}/tracking/logs`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setLogs(res.data.logs || []);
      } catch (err) {
        setLogsError(
          err.response?.status === 404
            ? "Tracking history not available yet."
            : "Failed to load tracking history.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [guideId]);

  return (
    <div className="space-y-4 sm:space-y-5 px-2 sm:px-0">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Status Card */}
        <div
          className={`rounded-2xl p-4 sm:p-6 ${isTracking ? "bg-green-500" : "bg-gray-800"} text-white shadow-sm`}
        >
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm opacity-80">Status</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {isTracking ? "LIVE" : "OFFLINE"}
              </p>
            </div>
            {isTracking ? (
              <Wifi size={28} className="opacity-80 sm:w-8 sm:h-8" />
            ) : (
              <WifiOff size={28} className="opacity-80 sm:w-8 sm:h-8" />
            )}
          </div>
          {isTracking && (
            <p className="text-xs sm:text-sm opacity-80">
              Broadcasting for:{" "}
              <span className="font-bold">{fmtTime(trackingTime)}</span>
            </p>
          )}
          {locationError && isTracking && (
            <p className="text-xs text-red-200 mt-1">⚠ {locationError}</p>
          )}
          <button
            onClick={() => (isTracking ? onStop() : onStart())}
            className={`mt-3 sm:mt-4 w-full py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
              isTracking
                ? "bg-white text-green-600 hover:bg-green-50"
                : "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
            }`}
          >
            {isTracking ? "⏹ Stop Sharing" : "▶ Start Sharing Location"}
          </button>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">
            Current Location
          </p>
          <p className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="text-yellow-500 shrink-0" size={16} />
            <span className="truncate">{userDetails?.location || "Nepal"}</span>
          </p>
          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {[
              ["Latitude", `${location.lat.toFixed(6)}° N`],
              ["Longitude", `${location.lng.toFixed(6)}° E`],
              ["Accuracy", "±5m"],
              ["Last Update", isTracking ? "Live" : "Not tracking"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-gray-600">
                <span>{k}</span>
                <span className="font-mono font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Visibility */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
          <p className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <UserCheck size={16} className="text-yellow-500" />
            Admin Visibility
          </p>
          <div className="space-y-2 sm:space-y-3">
            {[
              { name: "Super Admin", status: "Viewing", online: true },
              { name: "Regional Admin", status: "Last seen 2m", online: true },
              { name: "Backup Monitor", status: "Offline", online: false },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${a.online ? "bg-green-500" : "bg-gray-300"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {a.name}
                  </p>
                  <p className="text-xs text-gray-400">{a.status}</p>
                </div>
                {isTracking && a.online && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
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
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            Live Map View
          </h3>
          {isTracking && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 text-xs sm:text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden xs:inline">&nbsp;Broadcasting Live</span>
              <span className="xs:hidden">Live</span>
            </div>
          )}
        </div>
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-56 sm:h-72 md:h-80 flex items-center justify-center overflow-hidden">
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Navigation size={22} className="text-white sm:w-7 sm:h-7" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-30" />
              </div>
              <div className="mt-2 sm:mt-3 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg">
                <p className="font-bold text-gray-900 text-xs sm:text-sm">
                  {userDetails?.username || "Guide Live"}
                </p>
                <p className="text-xs text-gray-500">
                  {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E ·
                  Live
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 px-4">
              <MapPin size={40} className="mx-auto mb-2 sm:mb-3 opacity-30" />
              <p className="font-medium text-sm sm:text-base">
                Start tracking to show your location
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
          Tracking History
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton2 key={i} className="h-14 sm:h-16" />
            ))}
          </div>
        ) : logsError ? (
          <div className="text-center py-8 sm:py-10 text-gray-400">
            <Navigation size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs sm:text-sm">{logsError}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 sm:py-10 text-gray-400">
            <Navigation size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs sm:text-sm">No tracking history yet.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {logs.map((log, i) => (
              <div
                key={log._id ?? i}
                className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                  <Navigation size={16} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                    {log.route}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.date} · {log.start} – {log.end}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-700 shrink-0">
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
