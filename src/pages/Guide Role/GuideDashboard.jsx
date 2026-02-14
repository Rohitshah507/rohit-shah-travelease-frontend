import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Star,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Map,
  Navigation,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

// ── Page Imports ─────────────────────────────────────────────
import Dashboard from "./Dashboard";
import Bookings from "./Bookings";
import Tours from "./Tours";
import { History as HistoryPage } from "./History";
import { Tracking } from "./Tracking";
import { Reviews } from "./Reviews";
import { Earnings } from "./Earnings";
import { Profile } from "./Profile";

// 🔁 Replace with real ID from auth context / localStorage
const GUIDE_ID = localStorage.getItem("guideId") || "guide_001";

export default function GuideDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // ── Tracking state (shared across Dashboard + Tracking page) ──
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => setTrackingTime((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTrackingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking]);

  const fmtTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // ── Start tracking ────────────────────────────────────────
  const handleStartTracking = async () => {
    try {
      const token = localStorage.getItem("token");
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await axios.post(
            `${serverURL}/api/guide/tracking/start`,
            { guideId: GUIDE_ID, lat, lng },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setSessionId(res.data.sessionId);
          setIsTracking(true);
          // Push location every 10s
          intervalRef.current = setInterval(async () => {
            navigator.geolocation?.getCurrentPosition((p) => {
              axios.patch(
                `${serverURL}/api/guide/tracking/update`,
                {
                  sessionId: res.data.sessionId,
                  lat: p.coords.latitude,
                  lng: p.coords.longitude,
                },
                { headers: { Authorization: `Bearer ${token}` } },
              );
            });
          }, 10000);
        },
        () => setIsTracking(true),
      ); // fallback if geolocation denied
    } catch (err) {
      console.error("Start tracking error:", err);
    }
  };

  // ── Stop tracking ─────────────────────────────────────────
  const handleStopTracking = async () => {
    try {
      clearInterval(intervalRef.current);
      if (sessionId) {
        const token = localStorage.getItem("token");
        await axios.post(
          `${serverURL}/api/guide/tracking/stop`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (err) {
      console.error("Stop tracking error:", err);
    } finally {
      setIsTracking(false);
      setSessionId(null);
    }
  };

  // ── Fetch guide profile for sidebar ──────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${serverURL}/api/guide/${GUIDE_ID}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setProfile(res.data.guide || res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${serverURL}/api/guide/${GUIDE_ID}/bookings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const bookings = res.data.bookings || [];
        setPendingCount(bookings.filter((b) => b.status === "pending").length);
      } catch (err) {
        console.error("Pending count error:", err);
      }
    };

    fetchProfile();
    fetchPending();
  }, []);

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ?? "G";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "bookings",
      label: "Bookings",
      icon: CalendarDays,
      badge: pendingCount,
    },
    { id: "tours", label: "My Tours", icon: Map },
    { id: "history", label: "History", icon: History },
    { id: "tracking", label: "Live Tracking", icon: Navigation },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  // ── Page title ────────────────────────────────────────────
  const pageTitle =
    activePage === "dashboard"
      ? `Welcome back, ${profile?.name?.split(" ")[0] ?? "Guide"} 👋`
      : navItems.find((n) => n.id === activePage)?.label;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 flex flex-col transition-all duration-300 flex-shrink-0 z-20`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg">
                G
              </div>
              <span className="text-white font-bold text-lg">GuideHub</span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg mx-auto">
              G
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Guide Info */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                {initials}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  {profile?.name ?? "Loading..."}
                </p>
                <p className="text-yellow-500 text-xs">
                  {profile?.role ?? "Tour Guide"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                ${
                  activePage === id
                    ? "bg-yellow-500 text-gray-900 font-semibold shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
              {badge > 0 && (
                <span
                  className={`${sidebarOpen ? "ml-auto" : "absolute top-1 right-1"} text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold
                  ${activePage === id ? "bg-gray-900 text-yellow-400" : "bg-yellow-500 text-gray-900"}`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-900"
              >
                <Menu size={22} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-xs text-gray-400">
                Saturday, February 14, 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live tracking badge */}
            {isTracking && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 text-xs font-medium">
                  Live · {fmtTime(trackingTime)}
                </span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
              >
                <Bell size={18} className="text-gray-600" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between">
                    <span className="font-bold text-gray-900">
                      Notifications
                    </span>
                    <span className="text-xs text-yellow-600 font-medium">
                      {pendingCount} pending
                    </span>
                  </div>
                  <div
                    className="px-4 py-3 hover:bg-yellow-50/50 cursor-pointer"
                    onClick={() => {
                      setActivePage("bookings");
                      setNotifOpen(false);
                    }}
                  >
                    <p className="text-sm text-gray-800">
                      📅 You have <strong>{pendingCount}</strong> pending
                      booking{pendingCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Click to review
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-xs cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activePage === "dashboard" && (
            <Dashboard
              guideId={GUIDE_ID}
              isTracking={isTracking}
              trackingTime={trackingTime}
              fmtTime={fmtTime}
              onToggleTracking={() =>
                isTracking ? handleStopTracking() : handleStartTracking()
              }
              setActivePage={setActivePage}
            />
          )}
          {activePage === "bookings" && <Bookings guideId={GUIDE_ID} />}
          {activePage === "tours" && <Tours guideId={GUIDE_ID} />}
          {activePage === "history" && <HistoryPage guideId={GUIDE_ID} />}
          {activePage === "tracking" && (
            <Tracking
              guideId={GUIDE_ID}
              isTracking={isTracking}
              trackingTime={trackingTime}
              fmtTime={fmtTime}
              onStart={handleStartTracking}
              onStop={handleStopTracking}
            />
          )}
          {activePage === "reviews" && <Reviews guideId={GUIDE_ID} />}
          {activePage === "earnings" && <Earnings guideId={GUIDE_ID} />}
          {activePage === "profile" && <Profile guideId={GUIDE_ID} />}
        </main>
      </div>
    </div>
  );
}
