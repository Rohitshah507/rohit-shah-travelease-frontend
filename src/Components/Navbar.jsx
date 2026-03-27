import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { io as socketIO } from "socket.io-client";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle,
  XCircle,
  CreditCard,
  Compass,
  RefreshCw,
  Package,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { serverURL } from "../App";
import { getToken } from "../pages/Login";

// ─────────────────────────────────────────────────────────────────────────────
// Notification type config
// ─────────────────────────────────────────────────────────────────────────────
const getNotifStyle = (type = "", message = "") => {
  const t = type.toUpperCase();
  const m = message.toLowerCase();

  if (t === "PAYMENT" || m.includes("payment") || m.includes("paid")) {
    return {
      Icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15 border-emerald-500/30",
      ring: "ring-emerald-500/25",
      toastBorder: "rgba(16,185,129,0.45)",
      toastGlow: "rgba(16,185,129,0.15)",
      dot: "bg-emerald-400",
    };
  }
  if (t === "BOOKING" || m.includes("confirm")) {
    return {
      Icon: CheckCircle,
      color: "text-violet-400",
      bg: "bg-violet-500/15 border-violet-500/30",
      ring: "ring-violet-500/25",
      toastBorder: "rgba(139,92,246,0.45)",
      toastGlow: "rgba(139,92,246,0.15)",
      dot: "bg-violet-400",
    };
  }
  if (m.includes("cancel")) {
    return {
      Icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/15 border-red-500/30",
      ring: "ring-red-500/25",
      toastBorder: "rgba(239,68,68,0.4)",
      toastGlow: "rgba(239,68,68,0.1)",
      dot: "bg-red-400",
    };
  }
  return {
    Icon: Package,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    ring: "ring-amber-500/20",
    toastBorder: "rgba(245,158,11,0.4)",
    toastGlow: "rgba(245,158,11,0.1)",
    dot: "bg-amber-400",
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

const showNotifToast = (notif) => {
  const style = getNotifStyle(notif.type, notif.message);
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        className={`flex items-start gap-3 px-4 py-3.5 rounded-[16px] shadow-2xl cursor-pointer transition-all duration-300 ${
          t.visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-3 scale-95"
        }`}
        style={{
          background: "linear-gradient(145deg,#1a0a3e,#120630)",
          border: `1px solid ${style.toastBorder}`,
          boxShadow: `0 8px 32px ${style.toastGlow}`,
          minWidth: 290,
          maxWidth: 360,
        }}
      >
        <div
          className={`w-9 h-9 rounded-full ${style.bg} border flex items-center justify-center shrink-0 mt-0.5`}
        >
          <style.Icon size={17} className={style.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${style.color}`}>
            {notif.type === "PAYMENT"
              ? "Payment Successful 💰"
              : "Booking Update 🧳"}
          </p>
          <p className="text-white/90 text-xs mt-0.5 leading-snug">
            {notif.message}
          </p>
        </div>
        <X
          size={13}
          className="text-[#6b5a8e] hover:text-white transition-colors shrink-0 mt-1"
        />
      </div>
    ),
    { duration: 5000 },
  );
};

const POLL_MS = 10000;
// After a socket event fires, suppress toast from the follow-up poll/refetch
// for this many ms.  Covers the 1.5 s refetch delay + backend write lag.
const SOCKET_COOLDOWN_MS = 4000;

const socketEventToNotif = (event, payload) => {
  const map = {
    bookingConfirmed: {
      type: "BOOKING",
      message: payload.message || "🎉 Your booking has been confirmed!",
    },
    bookingCancelled: {
      type: "BOOKING",
      message: payload.message || "❌ Your booking was cancelled by the guide.",
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

// ─────────────────────────────────────────────────────────────────────────────
// useNotifications
// ─────────────────────────────────────────────────────────────────────────────
const useNotifications = (userId) => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);

  const knownIds = useRef(null); // null = first fetch not seeded yet
  const mounted = useRef(true);
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // ── Cooldown flag ─────────────────────────────────────────────────────────
  // Set to true when a socket event arrives.  While true, doFetch will seed
  // new DB IDs silently (no toast) because the socket already toasted the user.
  const socketCooldown = useRef(false);
  const cooldownTimer = useRef(null);

  const activateCooldown = () => {
    socketCooldown.current = true;
    clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => {
      socketCooldown.current = false;
    }, SOCKET_COOLDOWN_MS);
  };

  // ── REST fetch ────────────────────────────────────────────────────────────
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
        // Very first fetch — seed all IDs silently, no toasts ever
        knownIds.current = new Set(raw.map((n) => n._id));
      } else {
        const newOnes = raw.filter((n) => !knownIds.current.has(n._id));

        // Always add to knownIds so they are never processed again
        newOnes.forEach((n) => knownIds.current.add(n._id));

        // ── THE FIX ───────────────────────────────────────────────────────
        // Only show a poll-triggered toast when no socket event has fired
        // recently.  If the cooldown is active, the socket already showed the
        // toast — swallow the duplicate silently.
        if (!socketCooldown.current) {
          newOnes.forEach((n) => showNotifToast(n));
        }
      }
    } catch {
      if (mounted.current) setConnected(false);
    }
  }, []);

  // ── Socket.io ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const socket = socketIO(serverURL, {
      query: { userId },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    const SOCKET_EVENTS = [
      "bookingConfirmed",
      "bookingCancelled",
      "newBooking",
      "paymentSuccess",
      "guideApproved",
    ];

    SOCKET_EVENTS.forEach((event) => {
      socket.on(event, (payload) => {
        if (!mounted.current) return;

        // 1️⃣  Start cooldown BEFORE showing toast so doFetch can't race ahead
        activateCooldown();

        // 2️⃣  Build pseudo-notif and show exactly ONE toast
        const pseudoNotif = {
          _id: `socket-${Date.now()}-${Math.random()}`,
          ...socketEventToNotif(event, payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        showNotifToast(pseudoNotif);

        // 3️⃣  Optimistically prepend & bump badge
        setNotifs((prev) => [pseudoNotif, ...prev]);
        setUnread((prev) => prev + 1);

        // 4️⃣  Seed pseudo-ID (belt-and-suspenders)
        if (knownIds.current) knownIds.current.add(pseudoNotif._id);

        // 5️⃣  Re-fetch to replace pseudo-entry with real DB record (silently)
        setTimeout(() => {
          if (mounted.current) doFetch();
        }, 1500);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, doFetch]);

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
    doFetch();
    timerRef.current = setInterval(doFetch, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timerRef.current);
      clearTimeout(cooldownTimer.current);
    };
  }, [doFetch]);

  // ── Mark all as read ──────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Notification Panel
// ─────────────────────────────────────────────────────────────────────────────
const NotifPanel = ({ notifs, connected, onClose, onNavigate, onRefresh }) => (
  <div
    className="absolute right-0 mt-2 w-[380px] rounded-[22px] overflow-hidden z-50"
    style={{
      background: "linear-gradient(145deg,#180a38,#0e051f)",
      border: "1px solid rgba(139,92,246,0.28)",
      boxShadow:
        "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.06)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/15">
      <div className="flex items-center gap-2.5">
        <Bell size={15} className="text-violet-400" />
        <span className="font-bold text-white text-sm">Notifications</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/18">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}
          />
          <span
            className={`text-[0.57rem] font-bold ${connected ? "text-emerald-400" : "text-gray-500"}`}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-[8px] text-[#6b5a8e] hover:text-violet-300 hover:bg-violet-500/10 transition-all cursor-pointer border-none bg-transparent"
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-[8px] text-[#6b5a8e] hover:text-white hover:bg-violet-500/10 transition-all cursor-pointer border-none bg-transparent"
        >
          <X size={14} />
        </button>
      </div>
    </div>

    {/* List */}
    <div
      className="max-h-[420px] overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#4c1d95 transparent" }}
    >
      {notifs.length === 0 ? (
        <div className="text-center py-14 px-6">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-violet-500/40" />
          </div>
          <p className="text-[#6b5a8e] text-sm font-semibold">
            No notifications yet
          </p>
          <p className="text-[#4a3a6a] text-xs mt-1">
            Booking & payment updates appear here
          </p>
        </div>
      ) : (
        <div className="p-3 flex flex-col gap-1.5">
          {notifs.map((n) => {
            const style = getNotifStyle(n.type, n.message);
            const isUnread = !n.isRead;
            return (
              <div
                key={n._id}
                onClick={onNavigate}
                className={`relative flex items-start gap-3 p-3.5 rounded-[14px] border cursor-pointer transition-all duration-200 hover:scale-[1.012] hover:brightness-110 ${style.bg} ${isUnread ? `ring-1 ${style.ring}` : "opacity-85"}`}
              >
                {isUnread && (
                  <span
                    className={`absolute top-3 right-3 w-2 h-2 rounded-full ${style.dot} animate-pulse`}
                  />
                )}
                <div
                  className={`w-9 h-9 rounded-full border ${style.bg} flex items-center justify-center shrink-0`}
                >
                  <style.Icon size={16} className={style.color} />
                </div>
                <div className="flex-1 min-w-0 pr-5">
                  <p className={`font-bold text-xs ${style.color}`}>
                    {n.type === "PAYMENT"
                      ? "Payment Successful 💰"
                      : "Booking Update 🧳"}
                  </p>
                  <p className="text-white/88 text-xs mt-0.5 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-[#4a3a6a] text-[0.57rem] mt-1.5 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Footer */}
    {notifs.length > 0 && (
      <div className="px-4 py-3 border-t border-violet-500/12">
        <button
          onClick={onNavigate}
          className="w-full py-2.5 rounded-[12px] text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/18 hover:bg-violet-500/20 hover:text-violet-200 transition-all cursor-pointer"
        >
          View All Bookings →
        </button>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
  useUser();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const userId = userData?.userDetails?._id;
  const { notifs, unread, connected, markAllRead, refreshNow } =
    useNotifications(userId);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const openNotifs = () => {
    setShowNotifs((v) => {
      if (!v) markAllRead();
      return !v;
    });
    setShowProfile(false);
  };

  const handleLogout = () => {
    setShowProfile(false);
    toast
      .promise(
        new Promise((res) =>
          setTimeout(() => {
            localStorage.removeItem("token");
            res();
          }, 800),
        ),
        { loading: "Logging out…", success: "Logged out!", error: "Failed" },
      )
      .then(() => setTimeout(() => window.location.reload(), 500));
  };

  const initial =
    userData?.userDetails?.username?.charAt(0)?.toUpperCase() || "U";
  const username = userData?.userDetails?.username || "User";
  const email = userData?.userDetails?.email || "";

  const navBg = scrolled
    ? "bg-[rgba(7,3,15,0.96)] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-violet-500/20"
    : "bg-[rgba(7,3,15,0.75)] backdrop-blur-md border-b border-violet-500/12";

  const NAV_LINKS = [
    { to: "/home", label: "Home" },
    { to: "/explore", label: "Explore" },
    { to: "/package", label: "Packages" },
    { to: "/mybookings", label: "My Bookings" },
  ];

  return (
    <>
      <Toaster position="top-right" containerStyle={{ top: 68 }} />

      <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/home"
            className="text-[1.75rem] font-black tracking-tight leading-none text-white"
          >
            Travel<span className="text-amber-400">Ease</span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 text-sm font-semibold transition-all rounded-lg ${
                    isActive
                      ? "text-white font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-violet-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifs}
                className="relative p-2.5 rounded-[12px] text-white/70 hover:text-white hover:bg-violet-500/15 transition-all"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[0.52rem] font-black rounded-full flex items-center justify-center px-0.5 shadow-lg animate-bounce">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <NotifPanel
                  notifs={notifs}
                  connected={connected}
                  onClose={() => setShowNotifs(false)}
                  onNavigate={() => {
                    navigate("/mybookings");
                    setShowNotifs(false);
                  }}
                  onRefresh={refreshNow}
                />
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfile((v) => !v);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_22px_rgba(139,92,246,0.55)] hover:scale-[1.02] transition-all"
              >
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-xs uppercase border border-white/30">
                  {initial}
                </div>
                <span className="max-w-[80px] truncate text-sm font-semibold">
                  {username}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
                />
              </button>

              {showProfile && (
                <div
                  className="absolute right-0 mt-2 w-[260px] rounded-[20px] overflow-hidden z-50"
                  style={{
                    background: "linear-gradient(145deg,#180a38,#0e051f)",
                    border: "1px solid rgba(139,92,246,0.28)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                  }}
                >
                  <div
                    className="px-5 py-4 border-b border-violet-500/15"
                    style={{ background: "rgba(139,92,246,0.1)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {username}
                        </p>
                        <p className="text-violet-300/65 text-xs truncate">
                          {email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/mybookings");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-white/80 hover:bg-violet-500/15 hover:text-white transition-all text-left cursor-pointer border-none bg-transparent"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-violet-500/20 flex items-center justify-center">
                        <Compass size={15} className="text-violet-400" />
                      </div>
                      My Bookings
                    </button>
                    <div className="my-1.5 border-t border-violet-500/12" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left cursor-pointer border-none bg-transparent"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-red-500/12 flex items-center justify-center">
                        <LogOut size={15} className="text-red-400" />
                      </div>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-[12px] text-white hover:bg-violet-500/15 transition-all"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-violet-500/15 bg-[#0c0420]">
            <div className="px-5 py-4 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-[14px] bg-violet-500/10 border border-violet-500/18">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-base">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate">
                    {username}
                  </p>
                  <p className="text-violet-400 text-xs truncate">{email}</p>
                </div>
                {unread > 0 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.58rem] font-black bg-red-500 text-white">
                    {unread} new
                  </span>
                )}
              </div>

              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-[12px] font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-violet-500/15 text-white"
                        : "text-white/80 hover:bg-violet-500/10"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-violet-500/12 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-all cursor-pointer border-none"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
