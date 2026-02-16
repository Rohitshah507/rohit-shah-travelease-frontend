import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  X,
  Image,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App.jsx";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const emptyForm = {
  title: "",
  price: "",
  duration: "",
  destination: "",
  startDate: "",
  image: null,
  status: ["Active", "INActive"],
};

export default function Tours({ guideId }) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setField = (k, v) => setTourForm((p) => ({ ...p, [k]: v }));

  // ── Fetch tours ────────────────────────────────────────────
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("PACKAGES FROM API: ", response.data);

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

  // ── Create / Update ────────────────────────────────────────
  const handleSave = async () => {
    if (
      !tourForm.title ||
      !tourForm.price ||
      !tourForm.destination ||
      !tourForm.duration ||
      !tourForm.startDate ||
      !tourForm.image
    ) {
      alert("All fields including image are required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", tourForm.title);
      formData.append("price", Number(tourForm.price));
      formData.append("duration", tourForm.duration);
      formData.append("destination", tourForm.destination);
      formData.append("startDate", tourForm.startDate);
      formData.append("status", tourForm.status);
      formData.append("images", tourForm.image);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const res = await axios.post(`${serverURL}/api/user`, formData, {
        headers,
      });

      setTours((prev) => [...prev, res.data.data]);

      setShowModal(false);
      setTourForm(emptyForm);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${serverURL}/api/user/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTours((prev) => prev.filter((t) => t._id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete tour error:", err);
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
      startDate: t.startDate,
      image: t.image ?? "",
      status: t.status,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          {tours.length} total ·{" "}
          <span className="text-green-600 font-medium">
            {tours.filter((t) => t.status === "ACTIVE").length} active
          </span>
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-gray-900 font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-yellow-200"
        >
          <Plus size={18} /> Add New Tour
        </button>
      </div>

      {/* ── Tour Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tours.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
              style={{ minHeight: "420px" }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden flex-shrink-0">
                {t.imageUrls && t.imageUrls.length > 0 ? (
                  <img
                    src={t.imageUrls[0]}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-5xl">
                    🗺️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${t.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-gray-600 text-white"}`}
                >
                  {t.status === "Active" ? "● Active" : "● Inactive"}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow">
                  {t.booked ?? 0} bookings
                </div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-white text-2xl font-black drop-shadow-lg">
                    ${t.price}
                  </span>
                  <span className="text-white/80 text-xs ml-1">/ person</span>
                </div>
              </div>


              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 group-hover:text-yellow-600 transition-colors">
                  {t.title}
                </h3>
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {t.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {t.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-purple-500" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      Starts {new Date(t.startDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )} 
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-4" />
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-gray-900 font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    <Edit2 size={15} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t._id)}
                    className="w-11 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add placeholder */}
          <button
            onClick={openAdd}
            className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-yellow-400 hover:text-yellow-500 hover:bg-yellow-50/50 transition-all cursor-pointer group"
            style={{ minHeight: "420px" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center mb-3 transition-colors">
              <Plus size={28} />
            </div>
            <p className="font-bold text-sm">Add New Tour</p>
            <p className="text-xs mt-1 opacity-60">Click to create</p>
          </button>
        </div>
      )}

      {/* ── Tour Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-xl">
                  {editingTour ? "Edit Tour" : "Create New Tour"}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {editingTour
                    ? "Update your tour details"
                    : "Fill in the details for your new tour"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Tour Title *
                </label>
                <input
                  type="text"
                  value={tourForm.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Ancient Temples Explorer"
                  className="w-full border-2 border-gray-100 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none transition bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={tourForm.price}
                      onChange={(e) => setField("price", e.target.value)}
                      placeholder="0"
                      className="w-full border-2 border-gray-100 focus:border-yellow-400 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={tourForm.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    placeholder="e.g. 4 hours"
                    className="w-full border-2 border-gray-100 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Destination *
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={tourForm.destination}
                    onChange={(e) => setField("destination", e.target.value)}
                    placeholder="e.g. Kathmandu Valley"
                    className="w-full border-2 border-gray-100 focus:border-yellow-400 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={tourForm.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                    className="w-full border-2 border-gray-100 focus:border-yellow-400 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Upload Image *
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setField("image", e.target.files[0])}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50"
                />

                {tourForm.image && (
                  <div className="mt-3 rounded-xl overflow-hidden h-28 border-2 border-gray-100">
                    <img
                      src={URL.createObjectURL(tourForm.image)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Active", "Inactive"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField("status", s)}
                      className={`py-3 rounded-xl text-sm font-bold capitalize transition border-2
                        ${tourForm.status === s ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"}`}
                    >
                      {s === "Active" ? "✅ Active" : "⏸ Inactive"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-gray-900 font-bold text-sm transition shadow-md shadow-yellow-200 disabled:opacity-60"
              >
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">
              Delete Tour?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Keep It
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
