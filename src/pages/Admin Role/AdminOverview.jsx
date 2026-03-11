import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Package,
  CreditCard,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { serverURL } from "../../App";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalGuides: 0,
    pendingGuides: 0,
    approvedGuides: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${serverURL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Guides",
      value: stats.totalGuides || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingGuides || 0,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Approved Guides",
      value: stats.approvedGuides || 0,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Packages",
      value: stats.totalPackages || 0,
      icon: Package,
      color: "from-violet-500 to-purple-500",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: UserCheck,
      color: "from-pink-500 to-rose-500",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue || 0}`,
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 w-12" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-24" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-violet-100 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} className={card.iconColor} />
                </div>
                <div className={`px-3 py-1 bg-gradient-to-r ${card.color} rounded-full`}>
                  <TrendingUp size={16} className="text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-black text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-violet-100">
        <h2 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-105">
            View Pending Guides
          </button>
          <button className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold transition-all transform hover:scale-105">
            Manage Packages
          </button>
          <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all transform hover:scale-105">
            View Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;