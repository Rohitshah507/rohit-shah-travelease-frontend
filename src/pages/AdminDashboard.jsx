import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  FileText,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { serverURL } from "../App";

// Import child components (we'll create these)
import AdminOverview from "./AdminOverview";
import GuideApprovals from "./GuideApprovals";
import AllPackages from "./AllPackages";
import BookingManagement from "./BookingManagement";
import PaymentHistory from "./PaymentHistory";
import GuideTracking from "./GuideTracking";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const admin = {
    name: "Admin User",
    email: "admin@travelease.com",
    avatar: "AD",
  };

  // Fetch pending guide approvals
  useEffect(() => {
    fetchPendingGuides();
  }, []);

  const fetchPendingGuides = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${serverURL}/api/admin/pending-guides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingGuides(response.data.data || []);
      
      // Create notifications for pending guides
      const guideNotifications = (response.data.data || []).map(guide => ({
        id: guide._id,
        type: "guide_approval",
        message: `New guide registration: ${guide.username}`,
        time: new Date(guide.createdAt).toLocaleString(),
        unread: true,
      }));
      setNotifications(guideNotifications);
    } catch (error) {
      console.error("Error fetching pending guides:", error);
    }
  };

  const handleLogout = () => {
    toast.promise(
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
      }
    ).then(() => {
      setTimeout(() => {
        navigate("/login");
      }, 500);
    });
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
    { path: "/admin/guide-approvals", icon: UserCheck, label: "Guide Approvals", badge: pendingGuides.length },
    { path: "/admin/packages", icon: Package, label: "All Packages" },
    { path: "/admin/bookings", icon: FileText, label: "Bookings" },
    { path: "/admin/payments", icon: CreditCard, label: "Payment History" },
    { path: "/admin/guide-tracking", icon: MapPin, label: "Guide Tracking" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-gray-50 to-purple-50">
      
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: { primary: "#7c3aed", secondary: "#fff" },
          },
        }}
      />

      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo + Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900">TravelEase</h1>
                  <p className="text-xs text-gray-500 font-semibold">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-4">
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-violet-50 rounded-xl transition-colors group"
                >
                  <Bell size={24} className="text-gray-700 group-hover:text-violet-600 transition-colors" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-[slideDown_0.2s_ease-out]">
                      <div className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 border-b">
                        <h3 className="font-bold text-white text-lg">Notifications</h3>
                        <p className="text-xs text-violet-100">You have {notifications.filter(n => n.unread).length} unread notifications</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-gray-100 hover:bg-violet-50 transition-colors cursor-pointer ${
                                notif.unread ? "bg-violet-50/50" : ""
                              }`}
                              onClick={() => navigate("/admin/guide-approvals")}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{notif.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 border-t text-center">
                        <button
                          onClick={() => {
                            setNotifications([]);
                            setShowNotifications(false);
                          }}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                        >
                          Clear all notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-violet-600 font-bold text-sm">
                    {admin.avatar}
                  </div>
                  <ChevronDown size={18} className={`transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-[slideDown_0.2s_ease-out]">
                      <div className="p-5 bg-gradient-to-r from-violet-600 to-purple-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-violet-600 font-black text-lg shadow-md">
                            {admin.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-white">{admin.name}</p>
                            <p className="text-xs text-violet-100">{admin.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut size={20} className="text-red-500" />
                          <span className="font-semibold text-gray-700">Logout</span>
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
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden fixed left-0 top-[73px] h-[calc(100vh-73px)] z-40 shadow-lg`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-300/40"
                      : "text-gray-700 hover:bg-violet-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-white text-violet-600" : "bg-red-500 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300 p-6`}>
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/guide-approvals" element={<GuideApprovals onUpdate={fetchPendingGuides} />} />
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