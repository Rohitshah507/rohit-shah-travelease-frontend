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
  AlertTriangle,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const GuideApprovals = ({ onUpdate }) => {
  const [allGuides, setAllGuides] = useState([]); // all guides cached
  const [guides, setGuides] = useState([]);        // filtered for current tab
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null); // "approve" | "reject"
  const [filter, setFilter] = useState("PENDING"); // PENDING, APPROVED, REJECTED

  useEffect(() => {
    fetchAllGuides();
  }, []);

  // Re-filter whenever tab changes or allGuides updates
  useEffect(() => {
    const filtered = allGuides.filter((g) => {
      const status = normalizeStatus(g.guideStatus);
      return status === filter;
    });
    setGuides(filtered);
  }, [filter, allGuides]);

  // Normalize guideStatus — handles array, string, or undefined
  const normalizeStatus = (guideStatus) => {
    if (!guideStatus) return "PENDING";
    if (Array.isArray(guideStatus)) return guideStatus[0] || "PENDING";
    return guideStatus;
  };

  // ─── Fetch ALL guides (pending + approved + rejected) ─────────────────────
  // Strategy: hit both /pending-guides (which may return all) AND
  // try /all-guides as a fallback. We deduplicate by _id.
  const fetchAllGuides = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      let combined = [];

      // Primary: try a dedicated all-guides endpoint first
      try {
        const res = await axios.get(`${serverURL}/api/auth/all-guides`, { headers });
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          combined = data;
        }
      } catch (_) {
        // endpoint doesn't exist yet — fall through
      }

      // If all-guides returned nothing, fetch each status separately
      if (combined.length === 0) {
        const statuses = ["PENDING", "APPROVED", "REJECTED"];
        const results = await Promise.allSettled(
          statuses.map((s) =>
            axios.get(`${serverURL}/api/auth/pending-guides?status=${s}`, { headers })
          )
        );

        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const data = r.value.data.data || r.value.data || [];
            if (Array.isArray(data)) combined.push(...data);
          }
        });
      }

      // If still empty, fall back to the plain pending-guides endpoint
      if (combined.length === 0) {
        const res = await axios.get(`${serverURL}/api/auth/pending-guides`, { headers });
        const data = res.data.data || res.data || [];
        if (Array.isArray(data)) combined = data;
      }

      // Deduplicate by _id
      const seen = new Set();
      const deduped = combined.filter((g) => {
        if (seen.has(g._id)) return false;
        seen.add(g._id);
        return true;
      });

      setAllGuides(deduped);
    } catch (error) {
      console.error("Error fetching guides:", error);
      toast.error("❌ Failed to load guides. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh helper — re-fetches everything
  const refreshGuides = () => fetchAllGuides();

  // ─── Approve Guide ────────────────────────────────────────────────────────
  // PUT /api/auth/approve-guide/:id
  const handleApprove = async (guideId) => {
    try {
      setProcessing(true);
      setProcessingAction("approve");
      const token = getToken();

      await axios.put(
        `${serverURL}/api/auth/approve-guide/${guideId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Guide approved successfully! They can now take bookings.");
      setShowModal(false);
      setSelectedGuide(null);
      refreshGuides();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(
        error.response?.data?.message || "❌ Failed to approve guide. Try again."
      );
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  // ─── Reject Guide ─────────────────────────────────────────────────────────
  // No dedicated reject endpoint in adminRoute — using approve endpoint pattern.
  // Update this URL if you add a reject route later (e.g. /api/auth/reject-guide/:id)
  const handleReject = async (guideId) => {
    try {
      setProcessing(true);
      setProcessingAction("reject");
      const token = getToken();

      // ⚠️  Replace with your actual reject endpoint when added to adminRoute.js
      // e.g.: router.put("/reject-guide/:id", auth, roleBasedAuth("ADMIN"), adminController.rejectGuide)
      await axios.put(
        `${serverURL}/api/auth/reject-guide/${guideId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("🚫 Guide rejected. They have been notified.");
      setShowModal(false);
      setSelectedGuide(null);
      refreshGuides();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(
        error.response?.data?.message || "❌ Failed to reject guide. Try again."
      );
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  // ─── Status badge helper ──────────────────────────────────────────────────
  const getStatusBadge = (rawStatus) => {
    const status = normalizeStatus(rawStatus);
    const badges = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Approved",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Rejected",
      },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span
        className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  // Helper: get current status string from guide object
  const getGuideStatus = (guide) => normalizeStatus(guide.guideStatus);

  // ─── Tabs config ──────────────────────────────────────────────────────────
  const tabs = [
    { key: "PENDING", label: "Pending", color: "text-yellow-600" },
    { key: "APPROVED", label: "Approved", color: "text-green-600" },
    { key: "REJECTED", label: "Rejected", color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Guide Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and manage guide registrations
          </p>
        </div>
        <button
          onClick={refreshGuides}
          className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2 border-2 border-violet-100">
        {tabs.map(({ key, label }) => {
          const tabCount = allGuides.filter(
            (g) => normalizeStatus(g.guideStatus) === key
          ).length;
          return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
              filter === key
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
            {tabCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === key ? "bg-white text-violet-600" : "bg-gray-200 text-gray-600"
              }`}>
                {tabCount}
              </span>
            )}
          </button>
          );
        })}
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
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            No {filter.toLowerCase()} guides
          </h3>
          <p className="text-gray-500">
            There are no guides with status:{" "}
            <span className="font-semibold">{filter}</span>
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div
              key={guide._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-violet-100 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-violet-600 font-black text-2xl shadow-lg">
                    {guide.username?.charAt(0).toUpperCase() || "G"}
                  </div>
                  {getStatusBadge(guide.guideStatus)}
                </div>
                <h3 className="font-black text-xl mb-1">{guide.username}</h3>
                <p className="text-violet-100 text-sm">
                  Guide ID: {guide._id.slice(-6).toUpperCase()}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-violet-500 shrink-0" />
                  <span className="text-gray-700 truncate">{guide.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-violet-500 shrink-0" />
                  <span className="text-gray-700">
                    {guide.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-violet-500 shrink-0" />
                  <span className="text-gray-700">{guide.location || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-violet-500 shrink-0" />
                  <span className="text-gray-700">
                    {guide.createdAt
                      ? new Date(guide.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {/* Documents */}
                {/* guideDocument can be a string or array */}
                {guide.guideDocument && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                      <FileText size={14} />
                      Document
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(guide.guideDocument)
                        ? guide.guideDocument
                        : [guide.guideDocument]
                      ).map((doc, idx) => (
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

                {/* Action Button */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowModal(true);
                    }}
                    className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Review Application
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Review Modal ──────────────────────────────────────────────────── */}
      {showModal && selectedGuide && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-violet-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
              <h3 className="text-2xl font-black text-white">
                Review Guide Application
              </h3>
              <p className="text-violet-100 text-sm mt-1">
                Carefully review all documents before making a decision
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedGuide.username}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedGuide.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedGuide.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedGuide.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    Current Status
                  </p>
                  {getStatusBadge(selectedGuide.guideStatus)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    Applied On
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedGuide.createdAt
                      ? new Date(selectedGuide.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Documents */}
              {/* guideDocument can be a string or array */}
              {selectedGuide.guideDocument ? (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-violet-600" />
                    Uploaded Document(s)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Array.isArray(selectedGuide.guideDocument)
                      ? selectedGuide.guideDocument
                      : [selectedGuide.guideDocument]
                    ).map((doc, idx) => (
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
                            <p className="font-bold text-gray-900 text-sm">
                              Document {idx + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              Click to view
                            </p>
                          </div>
                        </div>
                        <Download
                          size={20}
                          className="text-violet-600 group-hover:scale-110 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertTriangle size={18} className="text-yellow-600" />
                    <p className="text-sm text-yellow-700 font-semibold">
                      No documents uploaded by this guide.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedGuide(null);
                }}
                disabled={processing}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Close
              </button>

              {/* Show approve/reject only for PENDING guides */}
              {getGuideStatus(selectedGuide) === "PENDING" && (
                <>
                  {/* Reject Button */}
                  <button
                    onClick={() => handleReject(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing && processingAction === "reject" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        Reject
                      </>
                    )}
                  </button>

                  {/* Approve Button */}
                  <button
                    onClick={() => handleApprove(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing && processingAction === "approve" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Approving...
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

              {/* Already approved */}
              {getGuideStatus(selectedGuide) === "APPROVED" && (
                <div className="flex-1 py-3 rounded-xl bg-green-100 text-green-700 font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Already Approved
                </div>
              )}

              {/* Already rejected */}
              {getGuideStatus(selectedGuide) === "REJECTED" && (
                <div className="flex-1 py-3 rounded-xl bg-red-100 text-red-700 font-bold flex items-center justify-center gap-2">
                  <XCircle size={20} />
                  Already Rejected
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideApprovals;