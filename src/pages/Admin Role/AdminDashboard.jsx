import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import useUser from "../../hooks/useUser";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  LayoutDashboard,
  MapPin,
  Package,
  FileText,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { serverURL } from "../../App";

import AdminOverview from "./AdminOverview";
import GuideApprovals from "./GuideApprovals";
import AllPackages from "./AllPackages";
import BookingManagement from "./BookingManagement";
import PaymentHistory from "./PaymentHistory";
import GuideTracking from "./GuideTracking";
import { getToken } from "../Login";

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers
// ─────────────────────────────────────────────────────────────────────────────
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
      label: "Payment Update 💰",
      toastBorder: "#6ee7b7",
      toastBg: "#f0fdf4",
    };
  if (m.includes("cancel"))
    return {
      Icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Booking Cancelled ❌",
      toastBorder: "#fca5a5",
      toastBg: "#fff1f2",
    };
  if (t === "BOOKING" || m.includes("confirm") || m.includes("booking"))
    return {
      Icon: CheckCircle,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      dot: "bg-violet-500",
      label: "Booking Update 🧳",
      toastBorder: "#c4b5fd",
      toastBg: "#f5f3ff",
    };
  if (t === "USER" || m.includes("guide") || m.includes("approved"))
    return {
      Icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      dot: "bg-blue-500",
      label: "Guide Update 👤",
      toastBorder: "#93c5fd",
      toastBg: "#eff6ff",
    };
  return {
    Icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Notification 🔔",
    toastBorder: "#fcd34d",
    toastBg: "#fffbeb",
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

// Light-theme toast for admin dashboard
const showAdminToast = (notif) => {
  const style = getNotifStyle(notif.type, notif.message);
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl cursor-pointer border transition-all duration-300 ${
          t.visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-3 scale-95"
        }`}
        style={{
          background: style.toastBg,
          borderColor: style.toastBorder,
          minWidth: 280,
          maxWidth: 340,
        }}
      >
        <div
          className={`w-9 h-9 rounded-xl border ${style.border} ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}
        >
          <style.Icon size={17} className={style.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${style.color}`}>{style.label}</p>
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
      message: payload.message || "🎉 A guide account has been approved!",
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

// ─────────────────────────────────────────────────────────────────────────────
// useAdminNotifications  (polling + Socket.io)
// ─────────────────────────────────────────────────────────────────────────────
const useAdminNotifications = (userId) => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);

  const knownIds = useRef(null); // null = first fetch not done yet
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
        // First fetch — seed silently, no toasts
        knownIds.current = new Set(raw.map((n) => n._id));
      } else {
        const newOnes = raw.filter((n) => !knownIds.current.has(n._id));
        newOnes.forEach((n) => {
          showAdminToast(n);
          knownIds.current.add(n._id);
        });
      }
    } catch {
      if (mounted.current) setConnected(false);
    }
  }, []);

  // ── Socket.io ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const socket = socketIO(serverURL, {
      query: { userId },
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

        showAdminToast(pseudoNotif);
        setNotifs((prev) => [pseudoNotif, ...prev]);
        setUnread((prev) => prev + 1);

        if (knownIds.current) knownIds.current.add(pseudoNotif._id);

        // Re-sync with DB after short delay
        setTimeout(() => {
          if (mounted.current) doFetch();
        }, 1500);
      });
    });

    return () => socket.disconnect();
  }, [userId, doFetch]);

  // ── Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
    doFetch();
    timerRef.current = setInterval(doFetch, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timerRef.current);
    };
  }, [doFetch]);

  // ── Mark all read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const unreadNotifs = notifs.filter((n) => !n.isRead);
    if (unreadNotifs.length === 0) return;

    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);

    const token = getToken();
    if (!token) return;

    // Skip pseudo socket IDs — only hit real DB records
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
// Notification Panel  (admin light theme)
// ─────────────────────────────────────────────────────────────────────────────
const AdminNotifPanel = ({
  notifs,
  unread,
  connected,
  onClose,
  onRefresh,
  onMarkRead,
  onNavigate,
}) => (
  <>
    {/* Backdrop */}
    <div className="fixed inset-0 z-40" onClick={onClose} />

    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Notifications</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`}
                />
                <span className="text-[10px] text-violet-200 font-semibold">
                  {connected ? "Live" : "Offline"}
                </span>
              </div>
              <span className="text-violet-300 text-[10px]">·</span>
              <span className="text-violet-100 text-xs">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                onClick={onMarkRead}
                className="text-[11px] text-violet-200 hover:text-white font-semibold px-2.5 py-1 rounded-lg hover:bg-white/15 transition-all border-none bg-transparent cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onRefresh}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-300 hover:text-white hover:bg-white/15 transition-all border-none bg-transparent cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-300 hover:text-white hover:bg-white/15 transition-all border-none bg-transparent cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        className="max-h-[360px] overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#ddd6fe transparent",
        }}
      >
        {notifs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-violet-300" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">
              No notifications yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Booking & payment updates appear here
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
                  onClick={() => {
                    // Route admin to relevant page based on type
                    if (
                      n.type === "USER" ||
                      n.message?.toLowerCase().includes("guide")
                    ) {
                      onNavigate("/admin/guide-approvals");
                    } else if (n.type === "PAYMENT") {
                      onNavigate("/admin/payments");
                    } else {
                      onNavigate("/admin/bookings");
                    }
                    onClose();
                  }}
                  className={`relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm hover:scale-[1.01] ${style.bg} ${style.border} ${isUnread ? "shadow-sm" : "opacity-75"}`}
                >
                  {/* Unread dot */}
                  {isUnread && (
                    <span
                      className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${style.dot} animate-pulse`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl border ${style.border} ${style.bg} flex items-center justify-center shrink-0`}
                  >
                    <style.Icon size={16} className={style.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`font-bold text-xs ${style.color}`}>
                      {style.label}
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

      {/* Footer */}
      {notifs.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {notifs.length} total notification{notifs.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => {
              onMarkRead();
              onClose();
            }}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 border-none bg-transparent cursor-pointer transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingGuides, setPendingGuides] = useState([]);

  const notifBellRef = useRef(null);

  useUser();
  const userData = useSelector((state) => state.user.userData);
  const userId = userData?.userDetails?._id;

  // ── Notification hook ────────────────────────────────────────────────────
  const { notifs, unread, connected, markAllRead, refreshNow } =
    useAdminNotifications(userId);

  const admin = {
    name: userData?.userDetails?.username || "Admin User",
    email: userData?.userDetails?.email || "admin@travelease.com",
    avatar: userData?.userDetails?.username
      ? userData.userDetails.username.slice(0, 2).toUpperCase()
      : "AD",
  };

  // Close notif panel on outside click
  useEffect(() => {
    const fn = (e) => {
      if (notifBellRef.current && !notifBellRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Fetch pending guides (for sidebar badge) ─────────────────────────────
  useEffect(() => {
    fetchPendingGuides();
  }, []);

  const fetchPendingGuides = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${serverURL}/api/auth/pending-guides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingGuides(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pending guides:", error);
    }
  };

  const handleLogout = () => {
    toast
      .promise(
        new Promise((resolve) => {
          setTimeout(() => {
            localStorage.removeItem("token");
            resolve();
          }, 800);
        }),
        {
          loading: "Logging out...",
          success: "Logged out successfully!",
          error: "Logout failed",
        },
      )
      .then(() => setTimeout(() => navigate("/login"), 500));
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
    {
      path: "/admin/guide-approvals",
      icon: UserCheck,
      label: "Guide Approvals",
      badge: pendingGuides.length,
    },
    { path: "/admin/packages", icon: Package, label: "All Packages" },
    { path: "/admin/bookings", icon: FileText, label: "Bookings" },
    { path: "/admin/payments", icon: CreditCard, label: "Payment History" },
    { path: "/admin/guide-tracking", icon: MapPin, label: "Guide Tracking" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-gray-50 to-purple-50">
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: { iconTheme: { primary: "#7c3aed", secondary: "#fff" } },
        }}
      />

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: toggle + logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X size={24} className="text-gray-700" />
                ) : (
                  <Menu size={24} className="text-gray-700" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900">
                    TravelEase
                  </h1>
                  <p className="text-xs text-gray-500 font-semibold">
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Right: notifications + profile */}
            <div className="flex items-center gap-4">
              {/* ── Bell ── */}
              <div className="relative" ref={notifBellRef}>
                <button
                  onClick={() => {
                    setShowNotifications((v) => {
                      if (!v) markAllRead(); // mark read when opening
                      return !v;
                    });
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2.5 hover:bg-violet-50 rounded-xl transition-colors group"
                >
                  <Bell
                    size={24}
                    className="text-gray-700 group-hover:text-violet-600 transition-colors"
                  />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[0.55rem] font-black rounded-full flex items-center justify-center px-1 shadow-lg animate-bounce">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <AdminNotifPanel
                    notifs={notifs}
                    unread={unread}
                    connected={connected}
                    onClose={() => setShowNotifications(false)}
                    onRefresh={refreshNow}
                    onMarkRead={markAllRead}
                    onNavigate={(path) => {
                      navigate(path);
                      setShowNotifications(false);
                    }}
                  />
                )}
              </div>

              {/* ── Profile ── */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-violet-600 font-bold text-sm">
                    {admin.avatar}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-5 bg-gradient-to-r from-violet-600 to-purple-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-violet-600 font-black text-lg shadow-md">
                            {admin.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-white">{admin.name}</p>
                            <p className="text-xs text-violet-100">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left border-none bg-transparent cursor-pointer"
                        >
                          <LogOut size={20} className="text-red-500" />
                          <span className="font-semibold text-gray-700">
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden fixed left-0 top-[73px] h-[calc(100vh-73px)] z-40 shadow-lg`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-300/40"
                      : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-white text-violet-600"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main
          className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300 p-6`}
        >
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route
              path="/guide-approvals"
              element={<GuideApprovals onUpdate={fetchPendingGuides} />}
            />
            <Route path="/packages" element={<AllPackages />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/guide-tracking" element={<GuideTracking />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
