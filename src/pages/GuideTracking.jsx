import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MapPin, Users, Navigation, Clock, RefreshCw } from "lucide-react";
import { serverURL } from "../App";

const GuideTracking = () => {
  const [activeGuides, setActiveGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);

  useEffect(() => {
    fetchActiveGuides();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveGuides, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveGuides = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${serverURL}/api/admin/active-guides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveGuides(response.data.data || []);
    } catch (error) {
      console.error("Error fetching active guides:", error);
      toast.error("Failed to load guide locations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Guide Tracking</h1>
          <p className="text-gray-600 mt-1">Track active guides in real-time</p>
        </div>
        <button
          onClick={fetchActiveGuides}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-green-600" />
            </div>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Active Guides</p>
          <p className="text-3xl font-black text-gray-900">{activeGuides.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Navigation size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">On Tour</p>
          <p className="text-3xl font-black text-gray-900">
            {activeGuides.filter(g => g.onTour).length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Total Locations</p>
          <p className="text-3xl font-black text-gray-900">{activeGuides.length}</p>
        </div>
      </div>

      {/* Map Container (Placeholder - integrate Google Maps or Leaflet) */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
        <div className="h-96 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative">
          <MapPin size={64} className="text-violet-400 animate-bounce" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-black text-violet-600 mb-2">Live Map View</p>
              <p className="text-gray-600">Integrate Google Maps API here</p>
              <p className="text-sm text-gray-500 mt-2">Shows real-time guide locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Guides List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : activeGuides.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border-2 border-violet-100">
          <Navigation size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Guides</h3>
          <p className="text-gray-500">No guides are currently sharing their location</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border-2 border-violet-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-600">
            <h2 className="text-xl font-black text-white">Active Guides List</h2>
            <p className="text-violet-100 text-sm">Click on a guide to view details</p>
          </div>
          <div className="divide-y divide-gray-200">
            {activeGuides.map((guide) => (
              <div
                key={guide._id}
                onClick={() => setSelectedGuide(guide)}
                className="p-6 hover:bg-violet-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {guide.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{guide.username}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin size={14} className="text-violet-500" />
                        {guide.currentLocation || "Location not shared"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        Last updated
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {guide.lastUpdate ? new Date(guide.lastUpdate).toLocaleTimeString() : "N/A"}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-violet-200 animate-[slideUp_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
              <h3 className="text-2xl font-black text-white">Guide Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedGuide.username}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedGuide.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedGuide.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Status</p>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                    Active
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-500 mb-1">Current Location</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedGuide.currentLocation || "Not available"}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedGuide(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideTracking;