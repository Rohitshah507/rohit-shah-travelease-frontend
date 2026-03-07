import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

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
  ChevronRight,
  Sparkles,
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
import { getToken } from "../Login.jsx";

export default function GuideDashboard() {
  const { userData } = useSelector((state) => state.user);
  const GUIDE_ID = userData?.userDetails?._id;

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // ── Tracking state ────────────────────────────────────────
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

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

  const handleStartTracking = async () => {
    try {
      const token = getToken();
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
          intervalRef.current = setInterval(async () => {
            navigator.geolocation?.getCurrentPosition((p) => {
              axios.patch(
                `${serverURL}/api/guide/tracking/update`,
                { sessionId: res.data.sessionId, lat: p.coords.latitude, lng: p.coords.longitude },
                { headers: { Authorization: `Bearer ${token}` } },
              );
            });
          }, 10000);
        },
        () => setIsTracking(true),
      );
    } catch (err) {
      console.error("Start tracking error:", err);
    }
  };

  const handleStopTracking = async () => {
    try {
      clearInterval(intervalRef.current);
      if (sessionId) {
        const token = getToken();
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

  useEffect(() => {
    if (!GUIDE_ID) return;
    const fetchProfile = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/guide/${GUIDE_ID}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.guide || res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    const fetchPending = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/guide/${GUIDE_ID}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings = res.data.bookings || [];
        setPendingCount(bookings.filter((b) => b.status === "pending").length);
      } catch (err) {
        console.error("Pending count error:", err);
      }
    };
    fetchProfile();
    fetchPending();
  }, [GUIDE_ID]);

  const initials =
    userData?.userDetails?.username?.split(" ").map((n) => n[0]).join("") ?? "G";

  const navItems = [
    { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
    { id: "bookings",  label: "Bookings",     icon: CalendarDays, badge: pendingCount },
    { id: "tours",     label: "My Tours",     icon: Map },
    { id: "history",   label: "History",      icon: History },
    { id: "tracking",  label: "Live Tracking",icon: Navigation },
    { id: "reviews",   label: "Reviews",      icon: Star },
    { id: "earnings",  label: "Earnings",     icon: DollarSign },
    { id: "profile",   label: "Profile",      icon: Settings },
  ];

  const pageTitle =
    activePage === "dashboard"
      ? `Welcome back, ${userData?.userDetails?.username?.split(" ")[0] ?? "Guide"} 👋`
      : navItems.find((n) => n.id === activePage)?.label;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex h-screen bg-violet-50 font-sans overflow-hidden">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-[72px]"}
          relative flex flex-col flex-shrink-0 z-20
          transition-all duration-300 ease-in-out
        `}
        style={{
          background: "linear-gradient(160deg, #4c1d95 0%, #5b21b6 35%, #6d28d9 65%, #7c3aed 100%)",
        }}
      >
        {/* Decorative top glow blob */}
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none overflow-hidden rounded-none">
          <div className="absolute -top-16 -left-10 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-3xl" />
          <div className="absolute top-4 right-0 w-32 h-32 bg-violet-300/10 rounded-full blur-2xl" />
        </div>

        {/* ── Logo ── */}
        <div className={`relative flex items-center ${sidebarOpen ? "justify-between px-5" : "justify-center px-0"} py-5 border-b border-white/10`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/30">
                  <span className="text-violet-700 font-black text-lg">G</span>
                </div>
                <div>
                  <span className="text-white font-black text-lg tracking-tight leading-none">GuideHub</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles size={9} className="text-violet-300" />
                    <span className="text-violet-300 text-[9px] font-semibold tracking-widest uppercase">Pro Dashboard</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all active:scale-95"
              >
                <X size={14} className="text-white/80" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-violet-700 font-black text-lg">G</span>
            </button>
          )}
        </div>

        {/* ── Guide Info Card ── */}
        {sidebarOpen && (
          <div className="relative mx-3 my-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-violet-900/30 flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-sm leading-tight truncate">
                  {userData?.userDetails?.username ?? "Loading..."}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-violet-200 text-[10px] font-semibold truncate">
                    {userData?.userDetails?.role ?? "Tour Guide"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Nav Label ── */}
        {sidebarOpen && (
          <p className="px-5 text-[9px] font-black text-violet-300/60 uppercase tracking-[0.15em] mb-1.5">
            Navigation
          </p>
        )}

        {/* ── Nav Links ── */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                  ${isActive
                    ? "bg-white text-violet-700 shadow-lg shadow-violet-900/25 font-bold"
                    : "text-violet-200 hover:bg-white/10 hover:text-white font-medium"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-violet-600" : "text-violet-300 group-hover:text-white"}`}
                />
                {sidebarOpen && (
                  <span className="text-[13px] flex-1 text-left">{label}</span>
                )}
                {sidebarOpen && isActive && (
                  <ChevronRight size={13} className="text-violet-400 ml-auto" />
                )}
                {/* Badge */}
                {badge > 0 && (
                  <span
                    className={`
                      text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black
                      ${sidebarOpen ? "ml-auto" : "absolute top-1.5 right-1.5"}
                      ${isActive ? "bg-violet-600 text-white" : "bg-fuchsia-400 text-white"}
                    `}
                  >
                    {badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-violet-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-lg z-50">
                    {label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <div className="px-3 pb-4 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-violet-300 hover:bg-red-400/20 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-[13px] font-medium">Logout</span>}
            {!sidebarOpen && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-violet-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-lg z-50">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Bottom decorative glow */}
        <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-fuchsia-500/15 rounded-full blur-3xl" />
        </div>
      </aside>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className="bg-white border-b border-violet-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm shadow-violet-100/50">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 transition-all active:scale-95"
              >
                <Menu size={18} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-black text-violet-900 leading-tight">{pageTitle}</h1>
              <p className="text-[11px] text-violet-400 font-medium">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live tracking badge */}
            {isTracking && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-700 text-xs font-bold">Live · {fmtTime(trackingTime)}</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <Bell size={17} className="text-violet-600" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fuchsia-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl shadow-violet-200/60 border border-violet-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-violet-50 flex justify-between items-center bg-violet-50/50">
                    <span className="font-black text-violet-900 text-sm">Notifications</span>
                    <span className="text-[10px] text-fuchsia-600 font-bold bg-fuchsia-50 px-2 py-0.5 rounded-full border border-fuchsia-200">
                      {pendingCount} pending
                    </span>
                  </div>
                  <div
                    className="px-4 py-3.5 hover:bg-violet-50 cursor-pointer transition-colors"
                    onClick={() => { setActivePage("bookings"); setNotifOpen(false); }}
                  >
                    <p className="text-sm text-violet-800 font-medium">
                      📅 You have <strong className="text-violet-900">{pendingCount}</strong> pending booking{pendingCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-violet-400 mt-0.5">Click to review →</p>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-400 to-violet-600 rounded-xl flex items-center justify-center font-black text-white text-xs cursor-pointer shadow-md shadow-violet-300/40 hover:scale-105 transition-transform">
              {initials}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-violet-50/60">
          {activePage === "dashboard" && (
            <Dashboard
              guideId={GUIDE_ID}
              isTracking={isTracking}
              trackingTime={trackingTime}
              fmtTime={fmtTime}
              onToggleTracking={() => isTracking ? handleStopTracking() : handleStartTracking()}
              setActivePage={setActivePage}
            />
          )}
          {activePage === "bookings"  && <Bookings guideId={GUIDE_ID} />}
          {activePage === "tours"     && <Tours guideId={GUIDE_ID} />}
          {activePage === "history"   && <HistoryPage guideId={GUIDE_ID} />}
          {activePage === "tracking"  && (
            <Tracking
              guideId={GUIDE_ID}
              isTracking={isTracking}
              trackingTime={trackingTime}
              fmtTime={fmtTime}
              onStart={handleStartTracking}
              onStop={handleStopTracking}
            />
          )}
          {activePage === "reviews"   && <Reviews guideId={GUIDE_ID} />}
          {activePage === "earnings"  && <Earnings guideId={GUIDE_ID} />}
          {activePage === "profile"   && <Profile guideId={GUIDE_ID} />}
        </main>
      </div>
    </div>
  );
}