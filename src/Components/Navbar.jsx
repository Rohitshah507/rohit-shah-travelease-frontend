import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Compass,
  RefreshCw,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { serverURL } from "../App";
import { getToken } from "../Pages/Login";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────
const POLL_MS = 10000;

const STATUS_CFG = {
  confirmed: {
    label: "Booking Confirmed! 🎉",
    Icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    ring: "ring-emerald-500/25",
    toastBorder: "rgba(16,185,129,0.4)",
    toastGlow: "rgba(16,185,129,0.12)",
  },
  pending: {
    label: "Booking Pending",
    Icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/12 border-amber-500/25",
    ring: "ring-amber-500/20",
    toastBorder: "rgba(245,158,11,0.35)",
    toastGlow: "rgba(245,158,11,0.08)",
  },
  cancelled: {
    label: "Booking Cancelled",
    Icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/12 border-red-500/25",
    ring: "ring-red-500/20",
    toastBorder: "rgba(239,68,68,0.35)",
    toastGlow: "rgba(239,68,68,0.08)",
  },
};

const getCfg = (status = "") =>
  STATUS_CFG[status.toLowerCase()] || STATUS_CFG.pending;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ── localStorage helpers ──────────────────────────────────────────────────────
const loadSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem("nf_seen") || "[]"));
  } catch {
    return new Set();
  }
};
const saveSeen = (set) =>
  localStorage.setItem("nf_seen", JSON.stringify([...set]));

// statusMap: persisted so page refresh doesn't re-trigger toasts
const loadStatusMap = () => {
  try {
    return JSON.parse(localStorage.getItem("nf_smap") || "{}");
  } catch {
    return {};
  }
};
const saveStatusMap = (obj) =>
  localStorage.setItem("nf_smap", JSON.stringify(obj));

// toastedIds: tracks which booking IDs have already shown a toast THIS session
// This prevents re-toasting on re-mount/refresh
const loadToasted = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem("nf_toasted") || "[]"));
  } catch {
    return new Set();
  }
};
const saveToasted = (set) =>
  localStorage.setItem("nf_toasted", JSON.stringify([...set]));

// ─────────────────────────────────────────────────────────────────────────────
// Custom Toast renderer
// ─────────────────────────────────────────────────────────────────────────────
const fireToast = (booking, cfg) => {
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
          border: `1px solid ${cfg.toastBorder}`,
          boxShadow: `0 8px 32px ${cfg.toastGlow}`,
          minWidth: 290,
          maxWidth: 350,
        }}
      >
        <div
          className={`w-9 h-9 rounded-full ${cfg.bg} border flex items-center justify-center shrink-0 mt-0.5`}
        >
          <cfg.Icon size={17} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{cfg.label}</p>
          <p className={`text-xs font-semibold mt-0.5 truncate ${cfg.color}`}>
            {booking.tourPackageId?.title || "Tour Package"}
          </p>
          {booking.tourPackageId?.destination && (
            <p className="text-[#6b5a8e] text-xs mt-0.5 flex items-center gap-1">
              <MapPin size={9} />
              {booking.tourPackageId.destination}
            </p>
          )}
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

// ─────────────────────────────────────────────────────────────────────────────
// useRealTimeBookings
//
// Toast rules:
//   1. First load: show toast ONLY for confirmed bookings that are
//      NOT already in "nf_toasted" localStorage (i.e., truly new confirmations).
//   2. Subsequent polls: show toast ONLY when a booking's status CHANGES
//      compared to the persisted statusMap.
//   3. Never re-toast the same booking+status combo twice.
// ─────────────────────────────────────────────────────────────────────────────
const useRealTimeBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [seenIds, setSeenIds] = useState(loadSeen);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);

  const isFirstFetch = useRef(true);
  const statusMapRef = useRef(loadStatusMap()); // { bookingId: "confirmed"|"pending"|"cancelled" }
  const toastedRef = useRef(loadToasted()); // { bookingId } — shown toast at least once
  const mounted = useRef(true);

  const doFetch = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${serverURL}/api/booking/tourist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mounted.current) return;

      const raw = res.data.data || [];

      // Sort newest-first by updatedAt / createdAt
      const sorted = [...raw].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );

      setBookings(sorted);
      setConnected(true);

      const newStatusMap = { ...statusMapRef.current };
      const newToasted = new Set(toastedRef.current);

      if (isFirstFetch.current) {
        // ── FIRST FETCH ──────────────────────────────────────────────────────
        // Build the status map silently.
        // ONLY toast for confirmed bookings that we've NEVER toasted before.
        sorted.forEach((b) => {
          const currStatus = b.bookingStatus?.toLowerCase() || "pending";
          newStatusMap[b._id] = currStatus;

          // Show toast for confirmed + never toasted before
          if (currStatus === "confirmed" && !newToasted.has(b._id)) {
            fireToast(b, getCfg("confirmed"));
            newToasted.add(b._id);
          }
        });

        isFirstFetch.current = false;
      } else {
        // ── SUBSEQUENT POLLS ─────────────────────────────────────────────────
        // Compare current status with stored map.
        // Toast only when status genuinely changed.
        sorted.forEach((b) => {
          const prevStatus = newStatusMap[b._id];
          const currStatus = b.bookingStatus?.toLowerCase() || "pending";

          if (prevStatus === undefined) {
            // Brand-new booking — record it, no toast
            newStatusMap[b._id] = currStatus;
          } else if (prevStatus !== currStatus) {
            // Status changed → toast
            fireToast(b, getCfg(currStatus));
            newStatusMap[b._id] = currStatus;
            // Mark as toasted so if page refreshes it won't re-fire
            // (unless status changes again later)
            // We intentionally do NOT add to newToasted here so that
            // the next refresh will detect the new status via statusMap diff.
          }
          // Same status → do nothing
        });
      }

      // Persist
      statusMapRef.current = newStatusMap;
      toastedRef.current = newToasted;
      saveStatusMap(newStatusMap);
      saveToasted(newToasted);

      // Unread count
      const currentSeen = loadSeen();
      setUnread(sorted.filter((b) => !currentSeen.has(b._id)).length);
    } catch {
      if (mounted.current) setConnected(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    doFetch();
    const timer = setInterval(doFetch, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [doFetch]);

  const markAllSeen = useCallback(() => {
    setBookings((prev) => {
      const ids = new Set(prev.map((b) => b._id));
      saveSeen(ids);
      setSeenIds(ids);
      setUnread(0);
      return prev;
    });
  }, []);

  const refreshNow = useCallback(() => doFetch(), [doFetch]);

  return { bookings, seenIds, unread, connected, markAllSeen, refreshNow };
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification Panel
// ─────────────────────────────────────────────────────────────────────────────
const NotifPanel = ({
  bookings,
  seenIds,
  connected,
  onClose,
  onNavigate,
  onRefresh,
}) => (
  <div
    className="absolute right-0 mt-2 w-[370px] rounded-[22px] overflow-hidden z-50"
    style={{
      background: "linear-gradient(145deg,#180a38,#0e051f)",
      border: "1px solid rgba(139,92,246,0.28)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/15">
      <div className="flex items-center gap-2.5">
        <Bell size={15} className="text-violet-400" />
        <span className="font-bold text-white text-sm">Notifications</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}
          />
          <span
            className={`text-[0.58rem] font-bold ${connected ? "text-emerald-400" : "text-gray-500"}`}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-[8px] text-[#6b5a8e] hover:text-violet-300 hover:bg-violet-500/10 transition-all cursor-pointer border-none bg-transparent"
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
      className="max-h-[400px] overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#4c1d95 transparent" }}
    >
      {bookings.length === 0 ? (
        <div className="text-center py-12 px-6">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-violet-500/40" />
          </div>
          <p className="text-[#6b5a8e] text-sm font-semibold">
            No notifications yet
          </p>
          <p className="text-[#4a3a6a] text-xs mt-1">
            Booking updates appear here in real-time
          </p>
        </div>
      ) : (
        <div className="p-3 flex flex-col gap-1.5">
          {bookings.map((b) => {
            const cfg = getCfg(b.bookingStatus);
            const isNew = !seenIds.has(b._id);
            return (
              <div
                key={b._id}
                onClick={onNavigate}
                className={`relative flex items-start gap-3 p-3.5 rounded-[14px] border cursor-pointer transition-all duration-200 hover:scale-[1.015] hover:brightness-110 ${cfg.bg} ${isNew ? `ring-1 ${cfg.ring}` : ""}`}
              >
                {isNew && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                )}

                <div
                  className={`w-9 h-9 rounded-full border ${cfg.bg} flex items-center justify-center shrink-0`}
                >
                  <cfg.Icon size={16} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <p className={`font-bold text-xs ${cfg.color}`}>
                    {cfg.label}
                  </p>
                  <p className="text-white/85 text-xs font-semibold mt-0.5 truncate">
                    {b.tourPackageId?.title || "Tour Package"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {b.tourPackageId?.destination && (
                      <span className="flex items-center gap-1 text-[#6b5a8e] text-[0.62rem]">
                        <MapPin size={9} className="shrink-0" />
                        {b.tourPackageId.destination}
                      </span>
                    )}
                    <span className="text-[#4a3a6a] text-[0.58rem] ml-auto">
                      {timeAgo(b.updatedAt || b.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {bookings.length > 0 && (
      <div className="px-4 py-3 border-t border-violet-500/12">
        <button
          onClick={onNavigate}
          className="w-full py-2.5 rounded-[12px] text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/18 hover:bg-violet-500/20 transition-all cursor-pointer border-none bg-transparent"
        >
          View All Bookings →
        </button>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Navbar — ALWAYS dark glass, no white mode at all
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

  const { bookings, seenIds, unread, connected, markAllSeen, refreshNow } =
    useRealTimeBookings();

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

  const openNotifs = () => {
    setShowNotifs((v) => {
      if (!v) markAllSeen();
      return !v;
    });
    setShowProfile(false);
  };

  const initial =
    userData?.userDetails?.username?.charAt(0)?.toUpperCase() || "U";
  const username = userData?.userDetails?.username || "User";
  const email = userData?.userDetails?.email || "";

  // ── Always dark navbar ──────────────────────────────────────────────────────
  const navBg = scrolled
    ? "bg-[rgba(7,3,15,0.96)] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-violet-500/20"
    : "bg-[rgba(7,3,15,0.75)] backdrop-blur-md border-b border-violet-500/12";

  const NAV_LINKS = [
    { to: "/home", label: "Home" },
    { to: "/destinations", label: "Destinations" },
    { to: "/places-to-visit", label: "Places to Visit" },
    { to: "/packages", label: "Packages" },
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
                  bookings={bookings}
                  seenIds={seenIds}
                  connected={connected}
                  onClose={() => setShowNotifs(false)}
                  onNavigate={() => {
                    navigate("/tourList");
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
                        navigate("/tourList");
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
              {/* User card */}
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
