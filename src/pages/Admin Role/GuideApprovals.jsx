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
  User,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const GuideApprovals = ({ onUpdate }) => {
  const [allGuides, setAllGuides] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetchAllGuides();
  }, []);

  useEffect(() => {
    setGuides(
      allGuides.filter((g) => normalizeStatus(g.guideStatus) === filter),
    );
  }, [filter, allGuides]);

  const normalizeStatus = (guideStatus) => {
    if (!guideStatus) return "PENDING";
    if (Array.isArray(guideStatus)) return guideStatus[0] || "PENDING";
    return guideStatus;
  };

  const fetchAllGuides = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      let combined = [];

      try {
        const res = await axios.get(`${serverURL}/api/auth/all-guides`, {
          headers,
        });
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) combined = data;
      } catch (_) {}

      if (combined.length === 0) {
        const results = await Promise.allSettled(
          ["PENDING", "APPROVED", "REJECTED"].map((s) =>
            axios.get(`${serverURL}/api/auth/pending-guides?status=${s}`, {
              headers,
            }),
          ),
        );
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const data = r.value.data.data || r.value.data || [];
            if (Array.isArray(data)) combined.push(...data);
          }
        });
      }

      if (combined.length === 0) {
        const res = await axios.get(`${serverURL}/api/auth/pending-guides`, {
          headers,
        });
        const data = res.data.data || res.data || [];
        if (Array.isArray(data)) combined = data;
      }

      const seen = new Set();
      setAllGuides(
        combined.filter((g) => {
          if (seen.has(g._id)) return false;
          seen.add(g._id);
          return true;
        }),
      );
    } catch {
      toast.error("❌ Failed to load guides.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (guideId) => {
    try {
      setProcessing(true);
      setProcessingAction("approve");
      const token = getToken();
      await axios.put(
        `${serverURL}/api/auth/approve-guide/${guideId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("✅ Guide approved!");
      setShowModal(false);
      setSelectedGuide(null);
      fetchAllGuides();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to approve.");
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleReject = async (guideId) => {
    try {
      setProcessing(true);
      setProcessingAction("reject");
      const token = getToken();
      await axios.put(
        `${serverURL}/api/auth/reject-guide/${guideId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("🚫 Guide rejected.");
      setShowModal(false);
      setSelectedGuide(null);
      fetchAllGuides();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to reject.");
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const getGuideStatus = (guide) => normalizeStatus(guide.guideStatus);

  const statusBadge = (raw) => {
    const s = normalizeStatus(raw);
    const map = {
      PENDING: {
        cls: "bg-yellow-100 text-yellow-700",
        Icon: Clock,
        label: "Pending",
      },
      APPROVED: {
        cls: "bg-green-100 text-green-700",
        Icon: CheckCircle,
        label: "Approved",
      },
      REJECTED: {
        cls: "bg-red-100 text-red-700",
        Icon: XCircle,
        label: "Rejected",
      },
    };
    const { cls, Icon, label } = map[s] || map.PENDING;
    return (
      <span
        className={`${cls} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}
      >
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const tabs = [
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Guide Approvals</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Review and manage guide registrations
          </p>
        </div>
        <button
          onClick={fetchAllGuides}
          className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-1.5 flex gap-1.5 border border-gray-200 w-fit">
        {tabs.map(({ key, label }) => {
          const count = allGuides.filter(
            (g) => normalizeStatus(g.guideStatus) === key,
          ).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`py-2 px-5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                filter === key
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-black ${
                    filter === key
                      ? "bg-white text-violet-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border-2 border-dashed border-violet-200">
          <UserCheck size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">
            No {filter.toLowerCase()} guides
          </p>
        </div>
      ) : (
        /* Same flex-wrap pattern — each card exactly 310px like demo */
        <div className="flex flex-wrap gap-5">
          {guides.map((guide) => (
            <div
              key={guide._id}
              style={{ width: "310px" }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 shrink-0"
            >
              {/* ── Card "image" area — colored header with avatar ── */}
              {/* Same height as demo image area: 172px */}
              <div
                className="relative bg-gradient-to-br from-violet-500 to-purple-600"
                style={{ height: "172px" }}
              >
                {/* Big avatar centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-violet-600 font-black text-2xl">
                      {guide.username?.charAt(0).toUpperCase() || "G"}
                    </span>
                  </div>
                  <p className="text-white font-black text-base">
                    {guide.username}
                  </p>
                  <p className="text-violet-200 text-xs">
                    ID: {guide._id?.slice(-6).toUpperCase()}
                  </p>
                </div>

                {/* Status badge — bottom-left like demo */}
                <div className="absolute bottom-3 left-3">
                  {statusBadge(guide.guideStatus)}
                </div>

                {/* Document indicator — top-right like demo's duration badge */}
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 text-gray-700 rounded-full text-[11px] font-bold shadow-sm">
                  {guide.guideDocument ? "📄 Has Doc" : "No Doc"}
                </span>
              </div>

              {/* ── Card body ── */}
              <div className="px-4 pt-3 pb-4 space-y-2">
                {/* Email */}
                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <Mail size={12} className="text-violet-400 shrink-0" />
                  <span className="truncate">{guide.email}</span>
                </div>

                {/* Phone + Location */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[12px] text-gray-400">
                    <Phone size={11} className="text-violet-400" />
                    {guide.phoneNumber || "N/A"}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-gray-400">
                    <MapPin size={11} className="text-violet-400" />
                    {guide.location || "N/A"}
                  </span>
                </div>

                {/* Applied date */}
                <p className="flex items-center gap-1 text-[12px] text-gray-400">
                  <Calendar size={11} className="text-violet-400" />
                  Applied:{" "}
                  {guide.createdAt
                    ? new Date(guide.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>

                {/* Buttons — outlined like demo */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowModal(true);
                    }}
                    className="flex-1 py-[9px] rounded-xl border-2 border-violet-200 text-violet-600 font-bold text-[12px] hover:bg-violet-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} /> Review
                  </button>
                  {getGuideStatus(guide) === "PENDING" && (
                    <button
                      onClick={() => handleApprove(guide._id)}
                      className="flex-1 py-[9px] rounded-xl border-2 border-green-200 text-green-600 font-bold text-[12px] hover:bg-green-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      {showModal && selectedGuide && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-violet-600 font-black text-xl">
                    {selectedGuide.username?.charAt(0).toUpperCase() || "G"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {selectedGuide.username}
                  </h3>
                  <p className="text-violet-200 text-xs mt-0.5">
                    Guide Application Review
                  </p>
                </div>
                <div className="ml-auto">
                  {statusBadge(selectedGuide.guideStatus)}
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "EMAIL", value: selectedGuide.email },
                  { label: "PHONE", value: selectedGuide.phoneNumber || "N/A" },
                  { label: "LOCATION", value: selectedGuide.location || "N/A" },
                  {
                    label: "APPLIED",
                    value: selectedGuide.createdAt
                      ? new Date(selectedGuide.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "N/A",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-all">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              {selectedGuide.guideDocument ? (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                    Documents
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Array.isArray(selectedGuide.guideDocument)
                      ? selectedGuide.guideDocument
                      : [selectedGuide.guideDocument]
                    ).map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-violet-50 hover:bg-violet-100 rounded-xl border-2 border-violet-200 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <FileText
                            size={20}
                            className="text-violet-600 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-xs">
                              Doc {idx + 1}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Click to view
                            </p>
                          </div>
                        </div>
                        <Download
                          size={16}
                          className="text-violet-600 group-hover:scale-110 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertTriangle
                    size={16}
                    className="text-yellow-600 shrink-0"
                  />
                  <p className="text-sm text-yellow-700 font-semibold">
                    No documents uploaded.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedGuide(null);
                }}
                disabled={processing}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50 text-sm"
              >
                Close
              </button>
              {getGuideStatus(selectedGuide) === "PENDING" && (
                <>
                  <button
                    onClick={() => handleReject(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing && processingAction === "reject" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedGuide._id)}
                    disabled={processing}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {processing && processingAction === "approve" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Approve
                      </>
                    )}
                  </button>
                </>
              )}
              {getGuideStatus(selectedGuide) === "APPROVED" && (
                <div className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Already Approved
                </div>
              )}
              {getGuideStatus(selectedGuide) === "REJECTED" && (
                <div className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center gap-2">
                  <XCircle size={16} /> Already Rejected
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
