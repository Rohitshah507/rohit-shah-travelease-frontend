import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  UserCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  Calendar,
} from "lucide-react";
import { serverURL } from "../App";

const GuideApprovals = ({ onUpdate }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected

  useEffect(() => {
    fetchGuides();
  }, [filter]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${serverURL}/api/admin/guides?status=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGuides(response.data.data || []);
    } catch (error) {
      console.error("Error fetching guides:", error);
      toast.error("Failed to load guides");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (guideId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${serverURL}/api/admin/guide/${guideId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Guide approved successfully! 🎉");
      setShowModal(false);
      fetchGuides();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve guide");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (guideId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${serverURL}/api/admin/guide/${guideId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Guide rejected");
      setShowModal(false);
      fetchGuides();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject guide");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Guide Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve guide registrations</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2 border-2 border-violet-100">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
              filter === status
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === "pending" && guides.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white text-violet-600 rounded-full text-xs font-bold">
                {guides.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Loading guides...</p>
          </div>
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border-2 border-violet-100">
          <UserCheck size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No {filter} guides</h3>
          <p className="text-gray-500">There are no guides with status: {filter}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div
              key={guide._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-violet-100 overflow-hidden group"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-violet-600 font-black text-2xl shadow-lg">
                    {guide.username?.charAt(0).toUpperCase()}
                  </div>
                  {getStatusBadge(guide.status || "pending")}
                </div>
                <h3 className="font-black text-xl mb-1">{guide.username}</h3>
                <p className="text-violet-100 text-sm">Guide ID: {guide._id.slice(-6)}</p>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-violet-500" />
                  <span className="text-gray-700 truncate">{guide.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-violet-500" />
                  <span className="text-gray-700">{guide.phoneNumber || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-violet-500" />
                  <span className="text-gray-700">{guide.country || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-violet-500" />
                  <span className="text-gray-700">
                    {new Date(guide.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Documents */}
                {guide.documents && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                      <FileText size={14} />
                      Documents Uploaded
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {guide.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors flex items-center gap-1"
                        >
                          <Download size={12} />
                          Doc {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowModal(true);
                    }}
                    className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-violet-200 animate-[slideUp_0.3s_ease-out]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
              <h3 className="text-2xl font-black text-white">Review Guide Application</h3>
              <p className="text-violet-100 text-sm">Review documents and approve or reject</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Full Name</p>
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
                  <p className="text-xs font-bold text-gray-500 mb-1">Country</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedGuide.country || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedGuide.status || "pending")}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Applied On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedGuide.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Documents */}
              {selectedGuide.documents && selectedGuide.documents.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-3">Uploaded Documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedGuide.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-violet-50 hover:bg-violet-100 rounded-xl border-2 border-violet-200 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-violet-600" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Document {idx + 1}</p>
                            <p className="text-xs text-gray-600">Click to view</p>
                          </div>
                        </div>
                        <Download size={20} className="text-violet-600 group-hover:scale-110 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              {selectedGuide.status === "pending" && (
                <>
                  <button
                    onClick={() => handleReject(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Approve
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideApprovals;