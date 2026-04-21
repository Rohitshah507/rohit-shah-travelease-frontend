import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

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
  CheckCircle,
  XCircle,
  CreditCard,
  Package,
  RefreshCw,
} from "lucide-react";

import axios from "axios";
import { serverURL } from "../../App";

import Dashboard from "./Dashboard";
import Bookings from "./Bookings";
import Tours from "./Tours";
import { History as HistoryPage } from "./History";
import { Tracking } from "./Tracking";
import { Reviews } from "./Reviews";
import { Earnings } from "./Earnings";
import { Profile } from "./Profile";
import { getToken } from "../Login";

// ── Notification helpers ──────────────────────────────────────────────────────
const getNotifStyle = (type = "", message = "") => {
  const t = type.toUpperCase();
  const m = message.toLowerCase();
  if (t === "PAYMENT" || m.includes("payment") || m.includes("paid"))
    return {
      Icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    };
  if (t === "BOOKING" || m.includes("confirm"))
    return {
      Icon: CheckCircle,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      dot: "bg-violet-500",
    };
  if (m.includes("cancel"))
    return {
      Icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
    };
  return {
    Icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const showGuideToast = (notif) => {
  const style = getNotifStyle(notif.type, notif.message);
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl cursor-pointer border transition-all duration-300 ${style.bg} ${style.border} ${t.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-3 scale-95"}`}
        style={{ minWidth: 260, maxWidth: 340 }}
      >
        <div
          className={`w-9 h-9 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center shrink-0 mt-0.5`}
        >
          <style.Icon size={17} className={style.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${style.color}`}>
            {notif.type === "PAYMENT"
              ? "Payment Update 💰"
              : "Booking Update 🧳"}
          </p>
          <p className="text-gray-600 text-xs mt-0.5 leading-snug">
            {notif.message}
          </p>
        </div>
        <X
          size={13}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-1"
        />
      </div>
    ),
    { duration: 5000 },
  );
};

const socketEventToNotif = (event, payload) => {
  const map = {
    bookingConfirmed: {
      type: "BOOKING",
      message: payload.message || "🎉 A booking has been confirmed!",
    },
    bookingCancelled: {
      type: "BOOKING",
      message: payload.message || "❌ A booking was cancelled.",
    },
    newBooking: {
      type: "BOOKING",
      message: payload.message || "📢 New booking received!",
    },
    paymentSuccess: {
      type: "PAYMENT",
      message: payload.message || "💰 Payment successful!",
    },
    guideApproved: {
      type: "USER",
      message: payload.message || "🎉 Your guide account has been approved!",
    },
  };
  return (
    map[event] || {
      type: "BOOKING",
      message: payload.message || "New notification",
    }
  );
};

const POLL_MS = 10000;

const useGuideNotifications = (userId, role) => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);

  const knownIds = useRef(null);
  const mounted = useRef(true);
  const timerRef = useRef(null);

  const doFetch = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${serverURL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mounted.current) return;

      const raw = (res.data.data || res.data || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
      setNotifs(raw);
      setConnected(true);
      setUnread(raw.filter((n) => !n.isRead).length);

      if (knownIds.current === null) {
        knownIds.current = new Set(raw.map((n) => n._id));
      } else {
        const newOnes = raw.filter((n) => !knownIds.current.has(n._id));
        newOnes.forEach((n) => {
          showGuideToast(n);
          knownIds.current.add(n._id);
        });
      }
    } catch {
      if (mounted.current) setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || !role) return;
    const socket = socketIO(serverURL, {
      query: { userId, role },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    const EVENTS = [
      "bookingConfirmed",
      "bookingCancelled",
      "newBooking",
      "paymentSuccess",
      "guideApproved",
    ];
    EVENTS.forEach((event) => {
      socket.on(event, (payload) => {
        if (!mounted.current) return;
        const pseudoNotif = {
          _id: `socket-${Date.now()}-${Math.random()}`,
          ...socketEventToNotif(event, payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        showGuideToast(pseudoNotif);
        setNotifs((prev) => [pseudoNotif, ...prev]);
        setUnread((prev) => prev + 1);
        if (knownIds.current) knownIds.current.add(pseudoNotif._id);
        setTimeout(() => {
          if (mounted.current) doFetch();
        }, 1500);
      });
    });
    return () => socket.disconnect();
  }, [userId, role, doFetch]);

  useEffect(() => {
    mounted.current = true;
    doFetch();
    timerRef.current = setInterval(doFetch, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timerRef.current);
    };
  }, [doFetch]);

  const markAllRead = useCallback(async () => {
    const unreadNotifs = notifs.filter((n) => !n.isRead);
    if (unreadNotifs.length === 0) return;
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    const token = getToken();
    if (!token) return;
    const dbUnread = unreadNotifs.filter(
      (n) => !String(n._id).startsWith("socket-"),
    );
    await Promise.allSettled(
      dbUnread.map((n) =>
        axios.patch(
          `${serverURL}/api/notifications/${n._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ),
    );
  }, [notifs]);

  const refreshNow = useCallback(() => doFetch(), [doFetch]);
  return { notifs, unread, connected, markAllRead, refreshNow };
};

// ── Notification Panel ────────────────────────────────────────────────────────
const GuideNotifPanel = ({
  notifs,
  connected,
  onClose,
  onRefresh,
  onMarkRead,
}) => (
  <div className="absolute right-0 top-12 w-[300px] sm:w-[340px] rounded-2xl overflow-hidden z-50 bg-white border border-violet-100 shadow-2xl shadow-violet-200/60">
    <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-violet-50 bg-violet-50/50">
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-violet-600" />
        <span className="font-black text-violet-900 text-sm">
          Notifications
        </span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-emerald-200">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
          />
          <span
            className={`text-[9px] font-bold ${connected ? "text-emerald-600" : "text-gray-400"}`}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {notifs.some((n) => !n.isRead) && (
          <button
            onClick={onMarkRead}
            className="text-[10px] text-violet-500 hover:text-violet-700 font-semibold px-2 py-0.5 rounded-lg hover:bg-violet-50 transition-all border-none bg-transparent cursor-pointer"
          >
            Mark all read
          </button>
        )}
        <button
          onClick={onRefresh}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all border-none bg-transparent cursor-pointer"
        >
          <RefreshCw size={12} />
        </button>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all border-none bg-transparent cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
    </div>

    <div
      className="max-h-[380px] overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#ddd6fe transparent" }}
    >
      {notifs.length === 0 ? (
        <div className="text-center py-8 sm:py-10 px-6">
          <div className="w-12 h-12 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3">
            <Bell size={20} className="text-violet-300" />
          </div>
          <p className="text-violet-400 text-sm font-semibold">
            No notifications yet
          </p>
          <p className="text-violet-300 text-xs mt-1">
            Booking updates appear here
          </p>
        </div>
      ) : (
        <div className="p-2 flex flex-col gap-1">
          {notifs.map((n) => {
            const style = getNotifStyle(n.type, n.message);
            const isUnread = !n.isRead;
            return (
              <div
                key={n._id}
                className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${style.bg} ${style.border} ${isUnread ? "shadow-sm" : "opacity-75"}`}
              >
                {isUnread && (
                  <span
                    className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${style.dot} animate-pulse`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-xl border ${style.border} ${style.bg} flex items-center justify-center shrink-0`}
                >
                  <style.Icon size={15} className={style.color} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`font-bold text-xs ${style.color}`}>
                    {n.type === "PAYMENT"
                      ? "Payment Update 💰"
                      : "Booking Update 🧳"}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-gray-400 text-[10px] mt-1 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

// ── Main GuideDashboard ───────────────────────────────────────────────────────
export default function GuideDashboard() {
  const { userData } = useSelector((state) => state.user);
  const GUIDE_ID = userData?.userDetails?._id;
  const role = userData?.userDetails?.role?.[0];

  const navigate = useNavigate();
  const location = useLocation();

  // Derive activePage from the URL
  const activePage =
    location.pathname.replace("/guide", "").replace("/", "") || "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const notifPanelRef = useRef(null);
  const { notifs, unread, connected, markAllRead, refreshNow } =
    useGuideNotifications(GUIDE_ID, role);

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const timerRef = useRef(null);

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

  const handleStartTracking = () => setIsTracking(true);
  const handleStopTracking = () => setIsTracking(false);

  useEffect(() => {
    if (!GUIDE_ID) return;
    const fetchPending = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/booking/guide`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings = res.data.bookings || res.data.data || res.data || [];
        setPendingCount(
          Array.isArray(bookings)
            ? bookings.filter(
                (b) => b.bookingStatus?.toLowerCase() === "pending",
              ).length
            : 0,
        );
      } catch (err) {
        console.error("Pending count error:", err);
      }
    };
    fetchPending();
  }, [GUIDE_ID]);

  const initials =
    userData?.userDetails?.username
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

  const pageTitle =
    activePage === "dashboard"
      ? `Welcome back, ${userData?.userDetails?.username?.split(" ")[0] ?? "Guide"} 👋`
      : navItems.find((n) => n.id === activePage)?.label;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleNavClick = (id) => {
    navigate(id === "dashboard" ? "/guide" : `/guide/${id}`);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-violet-50 font-sans overflow-hidden">
      <Toaster position="top-right" containerStyle={{ top: 72 }} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-[72px]"}
          fixed lg:relative top-0 left-0 h-full flex flex-col flex-shrink-0 z-20
          transition-all duration-300 ease-in-out
        `}
        style={{
          background:
            "linear-gradient(160deg, #4c1d95 0%, #5b21b6 35%, #6d28d9 65%, #7c3aed 100%)",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-10 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-3xl" />
          <div className="absolute top-4 right-0 w-32 h-32 bg-violet-300/10 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/30 flex-shrink-0">
              <span className="text-violet-700 font-black text-lg">G</span>
            </div>
            <div className="overflow-hidden">
              <span className="text-white font-black text-lg tracking-tight leading-none block">
                GuideHub
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={9} className="text-violet-300" />
                <span className="text-violet-300 text-[9px] font-semibold tracking-widest uppercase">
                  Pro Dashboard
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all active:scale-95"
          >
            <X size={14} className="text-white/80" />
          </button>
        </div>

        {/* Guide Info */}
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

        <p className="px-5 text-[9px] font-black text-violet-300/60 uppercase tracking-[0.15em] mb-1.5">
          Navigation
        </p>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? "bg-white text-violet-700 shadow-lg shadow-violet-900/25 font-bold"
                    : "text-violet-200 hover:bg-white/10 hover:text-white font-medium"
                }`}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-violet-600" : "text-violet-300 group-hover:text-white"}`}
                />
                <span className="text-[13px] flex-1 text-left">{label}</span>
                {isActive && (
                  <ChevronRight size={13} className="text-violet-400 ml-auto" />
                )}
                {badge > 0 && (
                  <span
                    className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ml-auto ${isActive ? "bg-violet-600 text-white" : "bg-fuchsia-400 text-white"}`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-violet-300 hover:bg-red-400/20 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="text-[13px] font-medium">Logout</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-fuchsia-500/15 rounded-full blur-3xl" />
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-violet-100 px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm shadow-violet-100/50">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 transition-all active:scale-95"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-black text-violet-900 leading-tight truncate">
                {pageTitle}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-violet-400 font-medium hidden sm:block">
                {today}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {isTracking && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-700 text-xs font-bold">
                  Live · {fmtTime(trackingTime)}
                </span>
              </div>
            )}
            {isTracking && (
              <div className="flex sm:hidden items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-700 text-[10px] font-bold">
                  Live
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => {
                  setNotifOpen((v) => {
                    if (!v) markAllRead();
                    return !v;
                  });
                }}
                className="relative w-9 h-9 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <Bell size={17} className="text-violet-600" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[0.5rem] font-black rounded-full flex items-center justify-center px-0.5 shadow animate-bounce">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <GuideNotifPanel
                  notifs={notifs}
                  connected={connected}
                  onClose={() => setNotifOpen(false)}
                  onRefresh={refreshNow}
                  onMarkRead={markAllRead}
                />
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-400 to-violet-600 rounded-xl flex items-center justify-center font-black text-white text-xs cursor-pointer shadow-md shadow-violet-300/40 hover:scale-105 transition-transform">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content with nested Routes */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-violet-50/60">
          <Routes>
            <Route
              index
              element={
                <Dashboard
                  guideId={GUIDE_ID}
                  isTracking={isTracking}
                  trackingTime={trackingTime}
                  fmtTime={fmtTime}
                  onToggleTracking={() =>
                    isTracking ? handleStopTracking() : handleStartTracking()
                  }
                  setActivePage={(id) =>
                    navigate(id === "dashboard" ? "/guide" : `/guide/${id}`)
                  }
                  userDetails={userData?.userDetails}
                />
              }
            />
            <Route path="bookings" element={<Bookings guideId={GUIDE_ID} />} />
            <Route path="tours" element={<Tours guideId={GUIDE_ID} />} />
            <Route
              path="history"
              element={<HistoryPage guideId={GUIDE_ID} />}
            />
            <Route
              path="tracking"
              element={
                <Tracking
                  guideId={GUIDE_ID}
                  isTracking={isTracking}
                  trackingTime={trackingTime}
                  fmtTime={fmtTime}
                  onStart={handleStartTracking}
                  onStop={handleStopTracking}
                  userDetails={userData?.userDetails}
                />
              }
            />
            <Route path="reviews" element={<Reviews guideId={GUIDE_ID} />} />
            <Route path="earnings" element={<Earnings guideId={GUIDE_ID} />} />
            <Route path="profile" element={<Profile guideId={GUIDE_ID} />} />
            <Route path="*" element={<Navigate to="/guide" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
