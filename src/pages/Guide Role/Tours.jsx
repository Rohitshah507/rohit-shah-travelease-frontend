import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  X,
  Star,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App.jsx";
import { getToken } from "../Login.jsx";

/* ── helpers ── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-violet-100 rounded-2xl ${className}`} />
);

const emptyForm = {
  title: "",
  price: "",
  duration: "",
  destination: "",
  startDate: "",
  image: null,
  status: "Active",
};

/* Deterministic amenity pills per card index */
const AMENITY_SETS = [
  [
    { icon: "✈️", label: "Flights" },
    { icon: "🏨", label: "5-Star Hotel" },
    { icon: "🍽️", label: "All Meals" },
  ],
  [
    { icon: "✈️", label: "Flights" },
    { icon: "🏨", label: "4-Star Hotel" },
    { icon: "🔭", label: "Guided Tours" },
  ],
  [
    { icon: "✈️", label: "Flights" },
    { icon: "🏨", label: "5-Star Hotel" },
    { icon: "🎯", label: "Activities" },
  ],
  [
    { icon: "✈️", label: "Flights" },
    { icon: "🍽️", label: "All Meals" },
    { icon: "📶", label: "Free WiFi" },
  ],
];

const BADGE_SETS = [
  { emoji: "🔥", label: "BESTSELLER", color: "bg-violet-600" },
  { emoji: "⭐", label: "POPULAR", color: "bg-orange-500" },
  { emoji: "💎", label: "LUXURY", color: "bg-violet-700" },
  { emoji: "🌟", label: "TOP RATED", color: "bg-fuchsia-600" },
];

/* fake star ratings per index */
const RATINGS = [
  { stars: 4.9, reviews: 324 },
  { stars: 4.7, reviews: 218 },
  { stars: 5.0, reviews: 186 },
  { stars: 4.8, reviews: 142 },
];

function StarRow({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={
              i < full
                ? "text-yellow-400 fill-yellow-400"
                : i === full && half
                  ? "text-yellow-400 fill-yellow-200"
                  : "text-gray-300 fill-gray-200"
            }
          />
        ))}
      </div>
      <span className="text-[11px] font-bold text-gray-700">
        {rating.toFixed(1)}
      </span>
      <span className="text-[10px] text-gray-400">
        · {Math.floor(rating * 37 + 89).toLocaleString()} reviews
      </span>
    </div>
  );
}

/* ── Tour Card ── */
function TourCard({ t, idx, onEdit, onDelete }) {
  const amenities = AMENITY_SETS[idx % AMENITY_SETS.length];
  const badge = BADGE_SETS[idx % BADGE_SETS.length];
  const rating = 4.6 + (idx % 4) * 0.1;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-violet-100 flex flex-col group">
      {/* ── Image ── */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {t.imageUrls && t.imageUrls.length > 0 ? (
          <img
            src={t.imageUrls[0]}
            alt={t.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center text-5xl">
            🗺️
          </div>
        )}

        {/* dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Left badge - BESTSELLER/POPULAR/etc */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1 ${badge.color} text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-lg`}
        >
          <span>{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>

        {/* Right badge - duration */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
          {t.duration || "7 Nights"}
        </div>

        {/* Edit / Delete overlay buttons */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={() => onEdit(t)}
            className="w-7 h-7 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => onDelete(t._id)}
            className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Status dot */}
        <div
          className={`absolute bottom-2.5 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold ${
            t.status === "ACTIVE" || t.status === "Active"
              ? "bg-emerald-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {t.status === "Active" || t.status === "ACTIVE"
            ? "● Active"
            : "● Inactive"}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title + Price row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-black text-gray-900 text-[15px] leading-tight group-hover:text-violet-700 transition-colors line-clamp-2 flex-1">
            {t.title}
          </h3>
          <div className="text-right flex-shrink-0">
            <p className="text-violet-600 font-black text-xl leading-none">
              ${t.price}
            </p>
            <p className="text-gray-400 text-[10px] font-medium">per person</p>
          </div>
        </div>

        {/* Destination subtitle */}
        <p className="text-gray-400 text-[11px] mb-3 flex items-center gap-1">
          <MapPin size={10} className="text-violet-400" />
          {t.destination}
          {t.startDate && (
            <span className="ml-1 text-gray-300">
              ·{" "}
              {new Date(t.startDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </p>

        {/* Amenity pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {amenities.map((a, i) => (
            <span
              key={i}
              className="flex items-center gap-1 border border-gray-200 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 bg-gray-50"
            >
              <span>{a.icon}</span>
              {a.label}
            </span>
          ))}
        </div>

        {/* Star rating */}
        <div className="mb-3">
          <StarRow rating={rating} />
        </div>

        {/* Book / Actions row */}
        <div className="mt-auto space-y-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(t)}
              className="flex-1 flex items-center justify-center gap-1.5 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 text-violet-700 font-bold py-1.5 rounded-xl text-[11px] transition"
            >
              <Edit2 size={11} /> Edit
            </button>
            <button
              onClick={() => onDelete(t._id)}
              className="flex-1 flex items-center justify-center gap-1.5 border-2 border-red-100 hover:border-red-300 hover:bg-red-50 text-red-500 font-bold py-1.5 rounded-xl text-[11px] transition"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setField = (k, v) => setTourForm((p) => ({ ...p, [k]: v }));

  /* ── Fetch ── */
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTours(response.data.getPackages || []);
      } catch (error) {
        console.error("Error fetching tour packages:", error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTourPackages();
  }, []);

  /* ── Create / Update ── */
  const handleSave = async () => {
    if (
      !tourForm.title ||
      !tourForm.price ||
      !tourForm.destination ||
      !tourForm.duration ||
      !tourForm.startDate
    ) {
      alert("All fields are required");
      return;
    }
    try {
      setSaving(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("title", tourForm.title);
      formData.append("price", Number(tourForm.price));
      formData.append("duration", tourForm.duration);
      formData.append("destination", tourForm.destination);
      formData.append("startDate", tourForm.startDate);
      formData.append("status", tourForm.status);
      if (tourForm.image && typeof tourForm.image !== "string") {
        formData.append("images", tourForm.image);
      }

      if (editingTour) {
        const res = await axios.put(
          `${serverURL}/api/user/${editingTour._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setTours((prev) =>
          prev.map((t) =>
            t._id === editingTour._id
              ? (res.data.data ?? { ...t, ...tourForm })
              : t,
          ),
        );
      } else {
        const res = await axios.post(`${serverURL}/api/user`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setTours((prev) => [...prev, res.data.data]);
      }

      setShowModal(false);
      setTourForm(emptyForm);
      setEditingTour(null);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = getToken();
      await axios.delete(`${serverURL}/api/user/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTours((prev) => prev.filter((t) => t._id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setEditingTour(null);
    setTourForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditingTour(t);
    setTourForm({
      title: t.title,
      price: t.price,
      duration: t.duration,
      destination: t.destination,
      startDate: t.startDate ? t.startDate.slice(0, 10) : "",
      image: t.imageUrls?.[0] ?? "",
      status: t.status,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-violet-400 text-sm font-medium">
          {tours.length} total ·{" "}
          <span className="text-emerald-600 font-bold">
            {
              tours.filter(
                (t) => t.status === "ACTIVE" || t.status === "Active",
              ).length
            }{" "}
            active
          </span>
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-md shadow-violet-300/50"
        >
          <Plus size={15} /> Add New Tour
        </button>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl">
            🗺️
          </div>
          <p className="font-bold text-violet-600 text-base">No tours yet</p>
          <p className="text-violet-400 text-xs mt-1">
            Click "Add New Tour" to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tours.map((t, i) => (
            <TourCard
              key={t._id}
              t={t}
              idx={i}
              onEdit={openEdit}
              onDelete={setDeleteConfirm}
            />
          ))}

          {/* Add Placeholder */}
          <button
            onClick={openAdd}
            className="border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center text-violet-300 hover:border-violet-500 hover:text-violet-500 hover:bg-violet-50/50 transition-all cursor-pointer group min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center mb-2 transition-colors">
              <Plus size={22} />
            </div>
            <p className="font-bold text-sm">Add New Tour</p>
            <p className="text-[10px] mt-0.5 opacity-60">Click to create</p>
          </button>
        </div>
      )}

      {/* ── Tour Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-violet-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-violet-900/20 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-xl">
                  {editingTour ? "Edit Tour" : "Create New Tour"}
                </h3>
                <p className="text-violet-200 text-xs mt-0.5">
                  {editingTour
                    ? "Update your tour details"
                    : "Fill in the details for your new tour"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition active:scale-95"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                  Tour Title *
                </label>
                <input
                  type="text"
                  value={tourForm.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Ancient Temples Explorer"
                  className="w-full border-2 border-violet-100 focus:border-violet-500 rounded-xl px-4 py-3 text-sm placeholder-violet-300 focus:outline-none transition bg-violet-50/40 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={tourForm.price}
                      onChange={(e) => setField("price", e.target.value)}
                      placeholder="0"
                      className="w-full border-2 border-violet-100 focus:border-violet-500 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none transition bg-violet-50/40 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={tourForm.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    placeholder="e.g. 7 Nights"
                    className="w-full border-2 border-violet-100 focus:border-violet-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-violet-50/40 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                  Destination *
                </label>
                <div className="relative">
                  <MapPin
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"
                  />
                  <input
                    type="text"
                    value={tourForm.destination}
                    onChange={(e) => setField("destination", e.target.value)}
                    placeholder="e.g. Kathmandu Valley"
                    className="w-full border-2 border-violet-100 focus:border-violet-500 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition bg-violet-50/40 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"
                  />
                  <input
                    type="date"
                    value={tourForm.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                    className="w-full border-2 border-violet-100 focus:border-violet-500 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition bg-violet-50/40 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                  Upload Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setField("image", e.target.files[0])}
                  className="w-full border-2 border-violet-100 rounded-xl px-4 py-3 text-sm bg-violet-50/40 text-violet-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-600 file:text-white hover:file:bg-violet-700 file:cursor-pointer focus:outline-none"
                />
                {tourForm.image && typeof tourForm.image !== "string" && (
                  <div className="mt-3 rounded-xl overflow-hidden h-28 border-2 border-violet-100">
                    <img
                      src={URL.createObjectURL(tourForm.image)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {tourForm.image &&
                  typeof tourForm.image === "string" &&
                  tourForm.image.startsWith("http") && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28 border-2 border-violet-100">
                      <img
                        src={tourForm.image}
                        alt="current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 block">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Active", "Inactive"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField("status", s)}
                      className={`py-3 rounded-xl text-sm font-bold capitalize transition border-2 ${
                        tourForm.status === s
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-violet-100 bg-violet-50/30 text-violet-400 hover:border-violet-200"
                      }`}
                    >
                      {s === "Active" ? "✅ Active" : "⏸ Inactive"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-violet-50/60 border-t border-violet-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-violet-200 text-violet-600 font-bold text-sm hover:bg-violet-100 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 active:scale-95 text-white font-black text-sm transition shadow-md shadow-violet-300/50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {saving
                  ? "Saving..."
                  : editingTour
                    ? "💾 Save Changes"
                    : "🚀 Create Tour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-violet-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-violet-900/20 w-full max-w-sm p-6 text-center border border-violet-100">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-black text-violet-900 text-lg mb-1.5">
              Delete Tour?
            </h3>
            <p className="text-violet-400 text-sm mb-5">
              This action cannot be undone. This tour and all its data will be
              permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-violet-200 text-violet-600 font-bold text-sm hover:bg-violet-50 transition active:scale-95"
              >
                Keep It
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
