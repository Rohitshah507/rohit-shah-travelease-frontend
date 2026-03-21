import React, { useState, useEffect, useRef } from "react";
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
  User,
  Compass,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { serverURL } from "../App";
import { getToken } from "../Pages/Login";

// ── Notification helpers ──────────────────────────────────────────────────────
const notifStatusConfig = {
  confirmed: {
    label: "Booking Confirmed!",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/25",
  },
  pending: {
    label: "Booking Pending",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/15  border-amber-500/25",
  },
  cancelled: {
    label: "Booking Cancelled",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/15    border-red-500/25",
  },
};

const getNotifConfig = (status = "") =>
  notifStatusConfig[status.toLowerCase()] || notifStatusConfig.pending;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((state) => state.user.userData);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [seenIds, setSeenIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("seenNotifIds") || "[]"));
    } catch {
      return new Set();
    }
  });

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Detect if current page is a dark page (most pages) or light (TourList)
  const isLightPage = location.pathname === "/tourList";

  // ── Scroll ──
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Close dropdowns on outside click ──
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

  // ── Fetch bookings for notifications ──
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await axios.get(`${serverURL}/api/booking/tourist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || [];
        setBookings(data);

        // Toast for newly confirmed bookings
        data.forEach((b) => {
          if (
            b.bookingStatus?.toLowerCase() === "confirmed" &&
            !seenIds.has(b._id)
          ) {
            toast.custom(
              (t) => (
                <div
                  className={`flex items-start gap-3 px-4 py-3 rounded-[14px] shadow-xl transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                  style={{
                    background: "linear-gradient(145deg,#1a0a3e,#120630)",
                    border: "1px solid rgba(16,185,129,0.35)",
                    minWidth: 300,
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={17} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">
                      Booking Confirmed! 🎉
                    </p>
                    <p className="text-emerald-300/80 text-xs mt-0.5 truncate">
                      {b.tourPackageId?.title || "Your tour"}
                    </p>
                    <p className="text-[#6b5a8e] text-xs mt-0.5">
                      Guide has confirmed your booking.
                    </p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-[#6b5a8e] hover:text-white transition-colors mt-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ),
              { duration: 6000 },
            );
          }
        });
      } catch {
        /* silent */
      }
    };
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // ── Mark all as seen ──
  const markAllSeen = () => {
    const allIds = new Set(bookings.map((b) => b._id));
    setSeenIds(allIds);
    localStorage.setItem("seenNotifIds", JSON.stringify([...allIds]));
  };

  const unreadCount = bookings.filter((b) => !seenIds.has(b._id)).length;

  // ── Logout ──
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

  // ── Username initial ──
  const initial =
    userData?.userDetails?.username?.charAt(0)?.toUpperCase() || "U";
  const username = userData?.userDetails?.username || "User";
  const email = userData?.userDetails?.email || "";

  // ── Styles based on page ──
  const navBg = isLightPage
    ? scrolled
      ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200"
      : "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
    : scrolled
      ? "bg-[rgba(7,3,15,0.92)] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-violet-500/20"
      : "bg-[rgba(7,3,15,0.6)] backdrop-blur-md border-b border-violet-500/10";

  const logoColor = isLightPage ? "text-violet-700" : "text-white";
  const logoAccent = isLightPage ? "text-amber-500" : "text-amber-400";
  const linkColor = isLightPage ? "text-gray-700" : "text-white/80";
  const linkActive = isLightPage ? "text-violet-700" : "text-white";
  const linkHover = isLightPage ? "hover:text-violet-700" : "hover:text-white";
  const activeBar = isLightPage ? "bg-violet-700" : "bg-violet-400";
  const iconColor = isLightPage ? "text-gray-600" : "text-white/70";
  const mobileMenuBg = isLightPage
    ? "bg-white border-gray-200"
    : "bg-[#0f0524] border-violet-500/20";
  const mobileLinkBase = isLightPage
    ? "text-gray-700 hover:bg-gray-50"
    : "text-white/80 hover:bg-violet-500/10";
  const mobileLinkActive = isLightPage
    ? "bg-violet-50 text-violet-700"
    : "bg-violet-500/15 text-white";

  return (
    <>
      <Toaster position="top-right" />

      <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* ── Logo ── */}
          <NavLink
            to="/home"
            className={`text-[1.8rem] font-black tracking-tight leading-none ${logoColor}`}
          >
            Travel<span className={logoAccent}>Ease</span>
          </NavLink>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { to: "/home", label: "Home" },
              { to: "/destinations", label: "Destinations" },
              { to: "/places-to-visit", label: "Places to Visit" },
              { to: "/packages", label: "Packages" },
              { to: "/mybookings", label: "My Bookings" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 font-semibold text-sm transition-all rounded-lg ${
                    isActive
                      ? `${linkActive} font-bold`
                      : `${linkColor} ${linkHover}`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span
                        className={`absolute bottom-0 left-3 right-3 h-[2px] ${activeBar} rounded-full`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* ── Right Section ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* ── Notifications ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) markAllSeen();
                }}
                className={`relative p-2.5 rounded-[12px] transition-all ${
                  isLightPage
                    ? "hover:bg-violet-50 text-gray-600"
                    : "hover:bg-violet-500/15 text-white/70 hover:text-white"
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[0.55rem] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifs && (
                <div
                  className="absolute right-0 mt-2 w-[360px] rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-violet-500/25 z-50"
                  style={{
                    background: "linear-gradient(145deg,#1a0a3e,#0f0524)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-violet-400" />
                      <span className="font-bold text-white text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-black bg-violet-500/25 text-violet-300 border border-violet-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-[#6b5a8e] hover:text-white transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* List */}
                  <div
                    className="max-h-[380px] overflow-y-auto"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#6d28d9 transparent",
                    }}
                  >
                    {bookings.length === 0 ? (
                      <div className="text-center py-10">
                        <Bell
                          size={32}
                          className="text-violet-500/30 mx-auto mb-3"
                        />
                        <p className="text-[#6b5a8e] text-sm font-medium">
                          No notifications yet
                        </p>
                        <p className="text-[#4a3a6a] text-xs mt-1">
                          Your booking updates will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 flex flex-col gap-2">
                        {bookings.slice(0, 10).map((b) => {
                          const cfg = getNotifConfig(b.bookingStatus);
                          const StatusIcon = cfg.icon;
                          const isNew = !seenIds.has(b._id);
                          return (
                            <div
                              key={b._id}
                              onClick={() => {
                                navigate("/tourList");
                                setShowNotifs(false);
                              }}
                              className={`relative flex items-start gap-3 p-3.5 rounded-[14px] border cursor-pointer transition-all hover:scale-[1.01] ${cfg.bg} ${isNew ? "ring-1 ring-violet-500/30" : ""}`}
                            >
                              {/* Unread dot */}
                              {isNew && (
                                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                              )}

                              <div
                                className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}
                              >
                                <StatusIcon size={16} className={cfg.color} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-xs leading-snug">
                                  {cfg.label}
                                </p>
                                <p className="text-white/80 text-xs font-semibold mt-0.5 truncate">
                                  {b.tourPackageId?.title || "Tour Package"}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {b.tourPackageId?.destination && (
                                    <span className="flex items-center gap-1 text-[#6b5a8e] text-[0.65rem]">
                                      <MapPin size={9} />{" "}
                                      {b.tourPackageId.destination}
                                    </span>
                                  )}
                                  <span className="text-[#4a3a6a] text-[0.6rem]">
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

                  {/* Footer */}
                  {bookings.length > 0 && (
                    <div className="px-4 py-3 border-t border-violet-500/15">
                      <button
                        onClick={() => {
                          navigate("/tourList");
                          setShowNotifs(false);
                        }}
                        className="w-full py-2.5 rounded-[12px] text-xs font-bold text-violet-300 bg-violet-500/12 border border-violet-500/20 hover:bg-violet-500/20 transition-all cursor-pointer"
                      >
                        View All Bookings →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm transition-all bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.55)] hover:scale-[1.02]"
              >
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-xs uppercase border border-white/30">
                  {initial}
                </div>
                <span className="max-w-[80px] truncate text-sm font-bold">
                  {username}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform shrink-0 ${showProfile ? "rotate-180" : ""}`}
                />
              </button>

              {showProfile && (
                <div
                  className="absolute right-0 mt-2 w-[260px] rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-violet-500/25 z-50"
                  style={{
                    background: "linear-gradient(145deg,#1a0a3e,#0f0524)",
                  }}
                >
                  {/* Profile header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-violet-600/30 to-purple-600/20 border-b border-violet-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(139,92,246,0.5)]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {username}
                        </p>
                        <p className="text-violet-300/70 text-xs truncate">
                          {email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/tourList");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-white/80 hover:bg-violet-500/15 hover:text-white transition-all text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-violet-500/20 flex items-center justify-center">
                        <Compass size={15} className="text-violet-400" />
                      </div>
                      My Bookings
                    </button>

                    <div className="my-1.5 border-t border-violet-500/15" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-red-500/15 flex items-center justify-center">
                        <LogOut size={15} className="text-red-400" />
                      </div>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2.5 rounded-[12px] transition-all ${isLightPage ? "hover:bg-violet-50 text-gray-700" : "hover:bg-violet-500/15 text-white"}`}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className={`md:hidden border-t ${mobileMenuBg}`}>
            <div className="px-5 py-4 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-[14px] bg-violet-500/10 border border-violet-500/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold text-sm truncate ${isLightPage ? "text-gray-900" : "text-white"}`}
                  >
                    {username}
                  </p>
                  <p className="text-violet-400 text-xs truncate">{email}</p>
                </div>
                {/* mobile notif count */}
                {unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[0.6rem] font-black bg-red-500 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {[
                { to: "/home", label: "Home" },
                { to: "/destinations", label: "Destinations" },
                { to: "/places-to-visit", label: "Places to Visit" },
                { to: "/packages", label: "Packages" },
                { to: "/tourList", label: "My Bookings" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-[12px] font-semibold text-sm transition-all ${isActive ? mobileLinkActive : mobileLinkBase}`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-violet-500/15">
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
