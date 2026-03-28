import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { MapPin, Users, Navigation, Clock, RefreshCw, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import io from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { serverURL } from "../../App";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const guideIcon = new L.Icon({
  iconUrl:    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl:  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    const coords = Object.values(locations);
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations]);
  return null;
}

const getInitials = (name) => {
  if (!name) return "G";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const GuideTracking = () => {
  const [selectedGuide, setSelectedGuide]   = useState(null);
  const [liveLocations, setLiveLocations]   = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    const adminId = localStorage.getItem("userId") || "ADMIN_ID";

    socketRef.current = io(serverURL, {
      query: { userId: adminId, role: "admin" },
    });

    socketRef.current.on("connect", () => {
      console.log("Admin socket connected:", socketRef.current.id);
    });

    socketRef.current.on("receiveLocation", (data) => {
      // Log everything so you can see exactly what the backend forwards
      console.log("📍 receiveLocation raw data:", data);

      setLiveLocations((prev) => {
        const existing = prev[data.userId] || {};
        return {
          ...prev,
          [data.userId]: {
            lat:      data.latitude,
            lng:      data.longitude,
            lastSeen: new Date(),
            // ✅ Correct fallback — always use existing keyed by data.userId
            username: data.username    || existing.username || null,
            email:    data.email       || existing.email    || null,
            phone:    data.phoneNumber || existing.phone    || null,
            location: data.location    || existing.location  || null,
          },
        };
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Admin socket disconnected");
    });

    return () => {
      socketRef.current?.off("receiveLocation");
      socketRef.current?.disconnect();
    };
  }, []);

  const liveCount = Object.keys(liveLocations).length;

  const handleClearGuide = (guideId) => {
    setLiveLocations((prev) => {
      const next = { ...prev };
      delete next[guideId];
      return next;
    });
    if (selectedGuide?._id === guideId) setSelectedGuide(null);
  };

  return (
    <>
      <style>{`
        .leaflet-map-wrapper .leaflet-pane,
        .leaflet-map-wrapper .leaflet-top,
        .leaflet-map-wrapper .leaflet-bottom,
        .leaflet-map-wrapper .leaflet-control {
          z-index: 1 !important;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Guide Tracking</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Track active guides in real-time</p>
          </div>
          <button
            onClick={() => {
              if (!socketRef.current?.connected) {
                socketRef.current?.connect();
                toast.success("Reconnecting...");
              } else {
                toast.success("Already connected — waiting for guide pings");
              }
            }}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: <Users size={22} className="text-green-600" />,     bg: "bg-green-100",  label: "Active Guides", pulse: liveCount > 0 },
            { icon: <Navigation size={22} className="text-blue-600" />, bg: "bg-blue-100",   label: "Broadcasting",  pulse: false },
            { icon: <MapPin size={22} className="text-purple-600" />,   bg: "bg-purple-100", label: "Live on Map",   pulse: liveCount > 0 },
          ].map(({ icon, bg, label, pulse }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-violet-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  {icon}
                </div>
                {pulse && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">{label}</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{liveCount}</p>
            </div>
          ))}
        </div>

        {/* Live Leaflet Map */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-violet-100 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">Live Map View</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {liveCount > 0
                  ? `${liveCount} guide${liveCount > 1 ? "s" : ""} broadcasting live`
                  : "Waiting for guides to start sharing…"}
              </p>
            </div>
            {liveCount > 0 && (
              <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            )}
          </div>

          <div
            className="leaflet-map-wrapper"
            style={{ height: "300px", width: "100%", position: "relative", zIndex: 0 }}
          >
            <div style={{ height: "100%", width: "100%" }}>
              <MapContainer center={[27.7172, 85.324]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds locations={liveLocations} />
                {Object.entries(liveLocations).map(([guideId, loc]) => (
                  <Marker key={guideId} position={[loc.lat, loc.lng]} icon={guideIcon}>
                    <Popup>
                      <div className="text-sm min-w-[160px]">
                        <p className="font-bold text-gray-900 mb-1">
                          {loc.username || `Guide #${guideId.slice(-6)}`}
                        </p>
                        {loc.email    && <p className="text-gray-500 text-xs mb-1">📧 {loc.email}</p>}
                        {loc.phone    && <p className="text-gray-500 text-xs mb-1">📞 {loc.phone}</p>}
                        {loc.location && <p className="text-gray-500 text-xs mb-1">📍 {loc.location}</p>}
                        <p className="text-gray-600 text-xs">{loc.lat.toFixed(6)}°N, {loc.lng.toFixed(6)}°E</p>
                        <p className="text-xs text-gray-400 mt-1">Updated: {loc.lastSeen?.toLocaleTimeString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Live Guides List */}
        {liveCount === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center border-2 border-violet-100">
            <Navigation size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">No Active Guides</h3>
            <p className="text-gray-500 text-sm">No guides are currently sharing their location</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-violet-600 to-purple-600">
              <h2 className="text-lg sm:text-xl font-black text-white">Live Guides</h2>
              <p className="text-violet-100 text-xs sm:text-sm">Click on a guide to view details</p>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.entries(liveLocations).map(([guideId, loc]) => (
                <div
                  key={guideId}
                  onClick={() => setSelectedGuide({ _id: guideId, ...loc })}
                  className="p-4 sm:p-6 hover:bg-violet-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg">
                          {getInitials(loc.username)}
                        </div>
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-gray-900 text-base sm:text-lg truncate">
                          {loc.username || `Guide #${guideId.slice(-6)}`}
                        </h3>
                        {loc.email && <p className="text-xs text-gray-400 truncate">📧 {loc.email}</p>}
                        {loc.phone && <p className="text-xs text-gray-400">📞 {loc.phone}</p>}
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-violet-500 flex-shrink-0" />
                          <span className="truncate">{loc.lat.toFixed(5)}°N, {loc.lng.toFixed(5)}°E</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Clock size={11} /> Last updated
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {loc.lastSeen?.toLocaleTimeString() ?? "N/A"}
                        </p>
                        {loc.location && <p className="text-xs text-violet-500 mt-0.5">📍 {loc.location}</p>}
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide Detail Modal */}
        {selectedGuide && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl overflow-hidden border-2 border-violet-200 max-h-[90vh] flex flex-col">

              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-black text-white">Guide Details</h3>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
                <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg flex-shrink-0">
                    {getInitials(selectedGuide.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-black text-gray-900 truncate">
                      {selectedGuide.username || "Unknown Guide"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live Now
                      </span>
                      {selectedGuide.location && (
                        <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold truncate max-w-[160px]">
                          📍 {selectedGuide.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">Guide ID</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 font-mono break-all">{selectedGuide._id}</p>
                  </div>

                  {selectedGuide.email && (
                    <div className="col-span-1 sm:col-span-2 bg-violet-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-violet-400 mb-1">📧 Email</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{selectedGuide.email}</p>
                    </div>
                  )}

                  {selectedGuide.phone && (
                    <div className="bg-violet-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-violet-400 mb-1">📞 Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedGuide.phone}</p>
                    </div>
                  )}

                  {selectedGuide.location && (
                    <div className="bg-violet-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-violet-400 mb-1">📍 Region</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedGuide.location}</p>
                    </div>
                  )}

                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">🛰 Live Coordinates</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">
                      {liveLocations[selectedGuide._id]
                        ? `${liveLocations[selectedGuide._id].lat.toFixed(6)}°N, ${liveLocations[selectedGuide._id].lng.toFixed(6)}°E`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">🕐 Last Ping</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {liveLocations[selectedGuide._id]?.lastSeen?.toLocaleTimeString() ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => handleClearGuide(selectedGuide._id)}
                  className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200 hover:bg-red-100 transition-all text-sm sm:text-base"
                >
                  Remove from List
                </button>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold hover:from-violet-700 hover:to-purple-700 transition-all text-sm sm:text-base"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default GuideTracking;