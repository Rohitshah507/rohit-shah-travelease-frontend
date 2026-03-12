import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Package,
  MapPin,
  Users,
  Eye,
  Trash2,
  X,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  Tag,
} from "lucide-react";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(`${serverURL}/api/user/package`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(res.data.getPackages || res.data.data || []);
    } catch {
      toast.error("❌ Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pkgId) => {
    try {
      setDeleting(true);
      const token = getToken();
      await axios.delete(`${serverURL}/api/user/package/${pkgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Package deleted.");
      setDeleteId(null);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const openView = (pkg) => {
    setSelectedPkg(pkg);
    setImgIndex(0);
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">All Packages</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Tour packages created by guides
          </p>
        </div>
        <button
          onClick={fetchPackages}
          className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary pills */}
      {!loading && packages.length > 0 && (
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">
            {packages.length} total
          </span>
          {" · "}
          <span className="font-bold text-green-600">
            {
              packages.filter(
                (p) => (p.status || "").toLowerCase() === "active",
              ).length
            }{" "}
            active
          </span>
        </p>
      )}

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-violet-200">
          <Package size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">No packages yet</p>
        </div>
      ) : (
        /* Flex-wrap so cards never stretch — each card is exactly 310px wide like demo */
        <div className="flex flex-wrap gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              style={{ width: "310px" }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 shrink-0"
            >
              {/* ── Image (same ratio as demo: 310×172) ── */}
              <div
                className="relative overflow-hidden bg-gray-100"
                style={{ height: "172px" }}
              >
                {pkg.imageUrls?.[0] ? (
                  <img
                    src={pkg.imageUrls[0]}
                    alt={pkg.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <Package size={36} className="text-violet-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Status pill — bottom-left, green dot like demo */}
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {pkg.status || "Active"}
                </span>

                {/* Duration badge — top-right like demo */}
                {pkg.duration && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 text-gray-800 rounded-full text-xs font-bold shadow-sm">
                    {pkg.duration}
                  </span>
                )}
              </div>

              {/* ── Card body ── */}
              <div className="px-4 pt-3 pb-4 space-y-2">
                {/* Title + Price — same row like demo */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-gray-900 text-[15px] leading-snug line-clamp-1 flex-1">
                    {pkg.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <p className="font-black text-violet-600 text-[15px] leading-none">
                      Rs.{(pkg.price || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-[10px] mt-0.5">
                      per person
                    </p>
                  </div>
                </div>

                {/* Location · date — like demo */}
                <p className="flex items-center gap-1 text-[12px] text-gray-400">
                  <MapPin size={11} className="text-violet-400 shrink-0" />
                  <span className="truncate">{pkg.destination || "N/A"}</span>
                  {pkg.startDate && (
                    <span className="shrink-0">
                      ·{" "}
                      {new Date(pkg.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </p>

                {/* Inclusions tags — like demo's "Flights · 5-Star Hotel · All Meals" */}
                {pkg.inclusions?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.inclusions.slice(0, 3).map((inc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium"
                      >
                        {inc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Group size */}
                {(pkg.group || pkg.groupSize) && (
                  <p className="flex items-center gap-1 text-[12px] text-gray-400">
                    <Users size={11} className="text-blue-400" />
                    Group of {pkg.group || pkg.groupSize}
                  </p>
                )}

                {/* Buttons — outlined like demo's Edit / Delete */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openView(pkg)}
                    className="flex-1 py-[9px] rounded-xl border-2 border-violet-200 text-violet-600 font-bold text-[12px] hover:bg-violet-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    onClick={() => setDeleteId(pkg._id)}
                    className="flex-1 py-[9px] rounded-xl border-2 border-red-200 text-red-500 font-bold text-[12px] hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Modal ─────────────────────────────────────────────────────── */}
      {showModal && selectedPkg && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Carousel */}
            <div className="relative h-52 shrink-0 bg-gray-900">
              {selectedPkg.imageUrls?.length > 0 ? (
                <img
                  src={selectedPkg.imageUrls[imgIndex]}
                  alt={selectedPkg.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-violet-100">
                  <Package size={48} className="text-violet-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {selectedPkg.imageUrls?.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                    disabled={imgIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setImgIndex((i) =>
                        Math.min(selectedPkg.imageUrls.length - 1, i + 1),
                      )
                    }
                    disabled={imgIndex === selectedPkg.imageUrls.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-black text-white">
                  {selectedPkg.title}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                  {selectedPkg.status || "Active"}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold">
                  <MapPin size={12} />
                  {selectedPkg.destination || "N/A"}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                  <Tag size={12} />
                  Rs.{(selectedPkg.price || 0).toLocaleString()}
                </span>
                {(selectedPkg.group || selectedPkg.groupSize) && (
                  <span className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold">
                    <Users size={12} />
                    Group: {selectedPkg.group || selectedPkg.groupSize}
                  </span>
                )}
                {selectedPkg.duration && (
                  <span className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-xs font-semibold">
                    <Clock size={12} />
                    {selectedPkg.duration}
                  </span>
                )}
              </div>
              {selectedPkg.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedPkg.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {selectedPkg.startDate && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">
                      START DATE
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedPkg.startDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                )}
                {selectedPkg.endDate && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">
                      END DATE
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedPkg.endDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                )}
                {selectedPkg.guideId && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">
                      GUIDE
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPkg.guideId?.username || "N/A"}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">
                    CREATED
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPkg.createdAt
                      ? new Date(selectedPkg.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(selectedPkg._id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center gap-2"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center mb-1">
              Delete Package?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPackages;
