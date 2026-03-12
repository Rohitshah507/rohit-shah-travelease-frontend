import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Package, MapPin, DollarSign, Users, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${serverURL}/api/user/package`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(response.data.getPackages || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">All Packages</h1>
          <p className="text-gray-600 mt-1">Manage all tour packages</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg">
          + Add Package
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-violet-100 overflow-hidden group">
              <div className="relative h-48">
                <img src={pkg.imageUrls?.[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 rounded-full text-xs font-bold text-violet-600 capitalize">
                  {pkg.status}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-black text-lg text-gray-900 line-clamp-1">{pkg.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-violet-500" />
                  <span>{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="font-bold text-gray-900">${pkg.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span className="font-bold text-gray-900">{pkg.group}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-1">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all">
                    <Edit size={14} />
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPackages;