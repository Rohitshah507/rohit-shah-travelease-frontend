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
  Clock,
  ChevronLeft,
  ChevronRight,
  Tag,
  User,
  CalendarDays,
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
      await axios.delete(`${serverURL}/api/user/${pkgId}`, {
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

  // ✅ FIX: Safely resolve guide name from populated or raw guideId
  const getGuideName = (pkg) => {
    if (!pkg.guideId) return "N/A";
    if (typeof pkg.guideId === "object" && pkg.guideId?.username)
      return pkg.guideId.username;
    if (typeof pkg.guideId === "string") return pkg.guideId;
    return "N/A";
  };

  const openView = (pkg) => {
    setSelectedPkg(pkg);
    setImgIndex(0);
    setShowModal(true);
  };

  const isActive = (status) => (status || "").toLowerCase() === "active";

  return (
    <>
      <style>{`
        .pkg-font { font-family: 'Times New Roman', Times, serif; }
        .pkg-italic { font-family: 'Times New Roman', Times, serif; font-style: italic; }
        .pkg-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #e8e0ff;
          box-shadow: 0 2px 12px 0 rgba(109,77,255,0.08), 0 0 0 0px rgba(109,77,255,0);
          overflow: hidden;
          transition: box-shadow 0.25s, border-color 0.25s, transform 0.18s;
        }
        .pkg-card:hover {
          box-shadow: 0 4px 28px 0 rgba(109,77,255,0.18), 0 0 0 2px rgba(139,92,246,0.13);
          border-color: #c4b5fd;
          transform: translateY(-2px);
        }
        .pkg-badge-active {
          background: linear-gradient(90deg,#22c55e,#16a34a);
          color: #fff;
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }
        .pkg-badge-inactive {
          background: linear-gradient(90deg,#f97316,#ea580c);
          color: #fff;
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .pkg-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-weight: 600;
        }
        .pkg-pill-purple { background:#f3f0ff; color:#6d28d9; border:1px solid #ddd6fe; }
        .pkg-pill-green  { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .pkg-pill-blue   { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .pkg-pill-amber  { background:#fffbeb; color:#b45309; border:1px solid #fde68a; }
        .pkg-pill-pink   { background:#fdf2f8; color:#be185d; border:1px solid #f9a8d4; }
        .pkg-btn-view {
          flex: 1;
          padding: 8px 0;
          border-radius: 10px;
          border: 1.5px solid #ddd6fe;
          background: #f5f3ff;
          color: #6d28d9;
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .pkg-btn-view:hover { background:#ede9fe; box-shadow:0 0 8px rgba(139,92,246,0.18); }
        .pkg-btn-del {
          flex: 1;
          padding: 8px 0;
          border-radius: 10px;
          border: 1.5px solid #fecaca;
          background: #fff5f5;
          color: #dc2626;
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pkg-btn-del:hover { background:#fee2e2; }
        .pkg-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(30,10,60,0.65);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .pkg-modal {
          background: #fff;
          border-radius: 20px;
          border: 2px solid #ede9fe;
          box-shadow: 0 8px 48px 0 rgba(109,77,255,0.22), 0 0 0 4px rgba(139,92,246,0.07);
          width: 100%;
          max-width: 400px;
          overflow: hidden;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
        }
        .pkg-section-label {
          font-family: 'Times New Roman', Times, serif;
          font-size: 9px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #a78bfa;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .pkg-section-value {
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-size: 13px;
          font-weight: 700;
          color: #1e1b4b;
        }
        .pkg-divider {
          border: none;
          border-top: 1px solid #ede9fe;
          margin: 10px 0;
        }
        .pkg-glow-title {
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 0 12px rgba(196,165,255,0.6), 0 1px 3px rgba(0,0,0,0.5);
          font-size: 17px;
          line-height: 1.2;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900"
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontStyle: "italic",
              }}
            >
              All Packages
            </h1>
            <p className="text-gray-400 mt-0.5 text-xs pkg-italic">
              Tour packages created by guides
            </p>
          </div>
          <button
            onClick={fetchPackages}
            className="px-4 py-2 font-bold rounded-xl text-sm transition-all w-full sm:w-auto pkg-italic"
            style={{
              background: "#f5f3ff",
              color: "#6d28d9",
              border: "1.5px solid #ddd6fe",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {!loading && packages.length > 0 && (
          <p className="text-sm pkg-italic" style={{ color: "#6b7280" }}>
            <span className="font-bold" style={{ color: "#111827" }}>
              {packages.length} total
            </span>
            {" · "}
            <span className="font-bold" style={{ color: "#16a34a" }}>
              {packages.filter((p) => isActive(p.status)).length} active
            </span>
          </p>
        )}

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: "2px dashed #ddd6fe", background: "#faf8ff" }}
          >
            <Package
              size={36}
              style={{ color: "#c4b5fd", margin: "0 auto 10px" }}
            />
            <p className="pkg-italic font-bold" style={{ color: "#a78bfa" }}>
              No packages yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {packages.map((pkg) => (
              <div key={pkg._id} className="pkg-card">
                {/* Image */}
                <div
                  className="relative overflow-hidden bg-gray-100"
                  style={{ height: "156px" }}
                >
                  {pkg.imageUrls?.[0] ? (
                    <img
                      src={pkg.imageUrls[0]}
                      alt={pkg.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
                      }}
                    >
                      <Package size={32} style={{ color: "#c4b5fd" }} />
                    </div>
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(30,10,60,0.45), transparent)",
                    }}
                  />
                  <span
                    className={`absolute bottom-2.5 left-3 ${isActive(pkg.status) ? "pkg-badge-active" : "pkg-badge-inactive"}`}
                  >
                    {pkg.status || "Active"}
                  </span>
                  {pkg.duration && (
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold pkg-italic"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        color: "#4c1d95",
                        fontSize: "10px",
                      }}
                    >
                      {pkg.duration}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="px-3.5 pt-3 pb-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-black text-gray-900 leading-snug line-clamp-1 flex-1"
                      style={{
                        fontFamily: "'Times New Roman', Times, serif",
                        fontStyle: "italic",
                        fontSize: "14px",
                      }}
                    >
                      {pkg.title}
                    </h3>
                    <div className="text-right shrink-0">
                      <p
                        className="font-black leading-none"
                        style={{
                          color: "#6d28d9",
                          fontSize: "13px",
                          fontFamily: "'Times New Roman', Times, serif",
                          fontStyle: "italic",
                        }}
                      >
                        Rs.{(pkg.price || 0).toLocaleString()}
                      </p>
                      <p
                        className="pkg-italic"
                        style={{
                          color: "#9ca3af",
                          fontSize: "9px",
                          marginTop: "2px",
                        }}
                      >
                        per person
                      </p>
                    </div>
                  </div>

                  <p
                    className="flex items-center gap-1 pkg-italic"
                    style={{ fontSize: "11px", color: "#9ca3af" }}
                  >
                    <MapPin
                      size={10}
                      style={{ color: "#a78bfa", flexShrink: 0 }}
                    />
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

                  {/* ✅ Guide name shown on card */}
                  <p
                    className="flex items-center gap-1 pkg-italic"
                    style={{ fontSize: "11px", color: "#9ca3af" }}
                  >
                    <User
                      size={10}
                      style={{ color: "#a78bfa", flexShrink: 0 }}
                    />
                    Guide:{" "}
                    <span style={{ color: "#6d28d9", fontWeight: 700 }}>
                      {getGuideName(pkg)}
                    </span>
                  </p>

                  {pkg.inclusions?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pkg.inclusions.slice(0, 3).map((inc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full pkg-italic"
                          style={{
                            background: "#f3f0ff",
                            color: "#6d28d9",
                            fontSize: "10px",
                            border: "1px solid #ede9fe",
                          }}
                        >
                          {inc}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-0.5">
                    <button
                      className="pkg-btn-view"
                      onClick={() => openView(pkg)}
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      className="pkg-btn-del"
                      onClick={() => setDeleteId(pkg._id)}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── View Modal ── */}
        {showModal && selectedPkg && (
          <div
            className="pkg-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div className="pkg-modal">
              {/* Image header */}
              <div
                className="relative shrink-0 bg-gray-900"
                style={{ height: "170px" }}
              >
                {selectedPkg.imageUrls?.length > 0 ? (
                  <img
                    src={selectedPkg.imageUrls[imgIndex]}
                    alt={selectedPkg.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#4c1d95,#6d28d9)",
                    }}
                  >
                    <Package size={40} style={{ color: "#c4b5fd" }} />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(30,10,60,0.7) 0%, transparent 55%)",
                  }}
                />

                {selectedPkg.imageUrls?.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                      disabled={imgIndex === 0}
                      style={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 26,
                        height: 26,
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        opacity: imgIndex === 0 ? 0.3 : 1,
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setImgIndex((i) =>
                          Math.min(selectedPkg.imageUrls.length - 1, i + 1),
                        )
                      }
                      disabled={imgIndex === selectedPkg.imageUrls.length - 1}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 26,
                        height: 26,
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        opacity:
                          imgIndex === selectedPkg.imageUrls.length - 1
                            ? 0.3
                            : 1,
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                  <p className="pkg-glow-title">{selectedPkg.title}</p>
                  <span
                    className={`inline-block mt-1 ${isActive(selectedPkg.status) ? "pkg-badge-active" : "pkg-badge-inactive"}`}
                  >
                    {selectedPkg.status || "Active"}
                  </span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 26,
                    height: 26,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Content */}
              <div
                className="overflow-y-auto"
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* Pill row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span className="pkg-pill pkg-pill-purple">
                    <MapPin size={11} />
                    {selectedPkg.destination || "N/A"}
                  </span>
                  <span className="pkg-pill pkg-pill-green">
                    <Tag size={11} />
                    Rs.{(selectedPkg.price || 0).toLocaleString()}
                  </span>
                  {(selectedPkg.group || selectedPkg.groupSize) && (
                    <span className="pkg-pill pkg-pill-blue">
                      <Users size={11} />
                      Group: {selectedPkg.group || selectedPkg.groupSize}
                    </span>
                  )}
                  {selectedPkg.duration && (
                    <span className="pkg-pill pkg-pill-amber">
                      <Clock size={11} />
                      {selectedPkg.duration}
                    </span>
                  )}
                </div>

                {selectedPkg.description && (
                  <p
                    className="pkg-italic"
                    style={{
                      fontSize: "12.5px",
                      color: "#374151",
                      lineHeight: 1.65,
                    }}
                  >
                    {selectedPkg.description}
                  </p>
                )}

                <hr className="pkg-divider" />

                {/* Details grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {selectedPkg.startDate && (
                    <div
                      style={{
                        background: "#faf8ff",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid #ede9fe",
                      }}
                    >
                      <p className="pkg-section-label">Start Date</p>
                      <p className="pkg-section-value">
                        {new Date(selectedPkg.startDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  )}
                  {selectedPkg.endDate && (
                    <div
                      style={{
                        background: "#faf8ff",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid #ede9fe",
                      }}
                    >
                      <p className="pkg-section-label">End Date</p>
                      <p className="pkg-section-value">
                        {new Date(selectedPkg.endDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  )}

                  {/* ✅ FIXED: Guide name properly resolved */}
                  <div
                    style={{
                      background: "#faf8ff",
                      borderRadius: 10,
                      padding: "10px 12px",
                      border: "1px solid #ede9fe",
                    }}
                  >
                    <p className="pkg-section-label">Guide</p>
                    <p
                      className="pkg-section-value"
                      style={{
                        color:
                          getGuideName(selectedPkg) === "N/A"
                            ? "#9ca3af"
                            : "#1e1b4b",
                      }}
                    >
                      {getGuideName(selectedPkg)}
                    </p>
                  </div>

                  <div
                    style={{
                      background: "#faf8ff",
                      borderRadius: 10,
                      padding: "10px 12px",
                      border: "1px solid #ede9fe",
                    }}
                  >
                    <p className="pkg-section-label">Created</p>
                    <p className="pkg-section-value">
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
              <div
                style={{
                  padding: "10px 14px",
                  background: "#faf8ff",
                  borderTop: "1px solid #ede9fe",
                  display: "flex",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="pkg-italic"
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 10,
                    border: "1.5px solid #ddd6fe",
                    background: "#fff",
                    color: "#6d28d9",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDeleteId(selectedPkg._id);
                  }}
                  className="pkg-italic"
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div className="pkg-modal-overlay">
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "2px solid #fecaca",
                boxShadow: "0 8px 32px rgba(220,38,38,0.13)",
                width: "100%",
                maxWidth: 320,
                padding: "24px 20px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Trash2 size={22} style={{ color: "#dc2626" }} />
              </div>
              <h3
                className="pkg-italic"
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#111827",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                Delete Package?
              </h3>
              <p
                className="pkg-italic"
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="pkg-italic"
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 10,
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    opacity: deleting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="pkg-italic"
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 10,
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: "pointer",
                    border: "none",
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? (
                    <>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
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
    </>
  );
};

export default AllPackages;
