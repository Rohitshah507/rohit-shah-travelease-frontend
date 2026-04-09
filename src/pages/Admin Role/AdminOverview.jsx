import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  BookOpen,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const AdminOverview = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalGuides: 0,
    pendingGuides: 0,
    approvedGuides: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [guidesRes, packagesRes, bookingsRes, paymentsRes] =
        await Promise.allSettled([
          axios.get(`${serverURL}/api/auth/all-guides`, { headers }),
          axios.get(`${serverURL}/api/user/package`, { headers }),
          axios.get(`${serverURL}/api/booking/admin`, { headers }),
          axios.get(`${serverURL}/api/payment/all-payments`, { headers }),
        ]);

      let allGuides = [];
      if (guidesRes.status === "fulfilled") {
        allGuides = guidesRes.value.data.data || guidesRes.value.data || [];
      }
      const normalizeStatus = (s) => {
        if (!s) return "PENDING";
        if (Array.isArray(s)) return s[0] || "PENDING";
        return s;
      };
      const totalGuides = allGuides.length;
      const pendingGuides = allGuides.filter(
        (g) => normalizeStatus(g.guideStatus) === "PENDING",
      ).length;
      const approvedGuides = allGuides.filter(
        (g) => normalizeStatus(g.guideStatus) === "APPROVED",
      ).length;

      let allPackages = [];
      if (packagesRes.status === "fulfilled") {
        allPackages =
          packagesRes.value.data.getPackages ||
          packagesRes.value.data.data ||
          [];
      }
      const totalPackages = allPackages.length;

      let allBookings = [];
      if (bookingsRes.status === "fulfilled") {
        allBookings =
          bookingsRes.value.data.data || bookingsRes.value.data || [];
      }
      const totalBookings = allBookings.length;
      const pendingBookings = allBookings.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "pending",
      ).length;
      const confirmedBookings = allBookings.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "confirmed",
      ).length;

      let allPayments = [];
      if (paymentsRes.status === "fulfilled") {
        allPayments =
          paymentsRes.value.data.data || paymentsRes.value.data || [];
      }
      const totalRevenue = allPayments
        .filter((p) => (p.status || "").toUpperCase() === "COMPLETED")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = allPayments.filter(
        (p) => (p.status || "").toUpperCase() === "PENDING",
      ).length;

      setStats({
        totalGuides,
        pendingGuides,
        approvedGuides,
        totalPackages,
        totalBookings,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        pendingPayments,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Overview fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Guides",
      value: stats.totalGuides,
      sub: `${stats.approvedGuides} approved`,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      pillBg: "bg-blue-500",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingGuides,
      sub: "awaiting review",
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      pillBg: "bg-yellow-500",
    },
    {
      title: "Approved Guides",
      value: stats.approvedGuides,
      sub: "active guides",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      pillBg: "bg-green-500",
    },
    {
      title: "Total Packages",
      value: stats.totalPackages,
      sub: "tour packages",
      icon: Package,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      pillBg: "bg-violet-500",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      sub: `${stats.pendingBookings} pending`,
      icon: BookOpen,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      pillBg: "bg-pink-500",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      sub: `${stats.pendingPayments} pending payments`,
      icon: TrendingUp,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      pillBg: "bg-indigo-500",
    },
  ];

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl" />
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 sm:w-28 mb-3" />
      <div className="h-7 sm:h-8 bg-gray-200 rounded w-14 sm:w-16 mb-2" />
      <div className="h-2.5 bg-gray-100 rounded w-16 sm:w-20" />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : "Welcome back! Here's what's happening today."}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all disabled:opacity-60 w-full sm:w-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {loading
          ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${card.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <card.icon size={20} className={card.iconColor} />
                  </div>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${card.pillBg} rounded-full flex items-center justify-center`}
                  >
                    <TrendingUp size={12} className="text-white" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
      </div>

      {/* Booking Summary Bar */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-black text-gray-900 mb-3 sm:mb-4">
            Booking Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Pending Bookings",
                value: stats.pendingBookings,
                dot: "bg-yellow-500",
              },
              {
                label: "Confirmed Bookings",
                value: stats.confirmedBookings,
                dot: "bg-green-500",
              },
              {
                label: "Pending Payments",
                value: stats.pendingPayments,
                dot: "bg-red-500",
              },
            ].map(({ label, value, dot }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className={`w-3 h-3 rounded-full ${dot} shrink-0`} />
                <div>
                  <p className="text-lg sm:text-xl font-black text-gray-900">
                    {value}
                  </p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
        <h2 className="text-sm sm:text-base font-black text-gray-900 mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/admin/guide-approvals")}
            className="p-3 sm:p-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
          >
            <Clock size={16} />
            View Pending Guides
            {stats.pendingGuides > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-black">
                {stats.pendingGuides}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/admin/packages")}
            className="p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
          >
            <Package size={16} />
            Manage Packages
          </button>

          <button
            onClick={() => navigate("/admin/payments")}
            className="p-3 sm:p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
          >
            <DollarSign size={16} />
            View Payments
            {stats.pendingPayments > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-black">
                {stats.pendingPayments}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
