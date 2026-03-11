import { useState, useEffect } from "react";
import {
  MapPin,
  Award,
  Star,
  Mail,
  Phone,
  FileText,
  Edit2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import { getToken } from "../Login";

const Skeleton5 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.username ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    location: profile?.location ?? "Nepal",
    experience: profile?.experience ?? "",
    specializations: (profile?.specializations ?? []).join(", "),
    languages: (profile?.languages ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const token = getToken();

      const payload = {
        ...form,
        specializations: form.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: form.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      };

      const { data } = await axios.put(
        `${serverURL}/api/auth/user/update/${profile._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSaved(data.user ?? data.userDetails ?? data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {[
            { name: "username", label: "Full Name", type: "text" },
            { name: "phoneNumber", label: "Phone", type: "tel" },
            { name: "location", label: "Location", type: "text" },
            { name: "experience", label: "Experience (e.g. 5 years)", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Specializations{" "}
              <span className="normal-case font-normal text-gray-400">(comma-separated)</span>
            </label>
            <input
              name="specializations"
              value={form.specializations}
              onChange={handleChange}
              placeholder="History, Adventure, Food…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Languages{" "}
              <span className="normal-case font-normal text-gray-400">(comma-separated)</span>
            </label>
            <input
              name="languages"
              value={form.languages}
              onChange={handleChange}
              placeholder="English, Nepali, Hindi…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-gray-900 font-bold px-5 py-2 rounded-xl text-sm transition"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Component ────────────────────────────────────────────────────
export function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(`${serverURL}/api/auth/user`, { headers });
        const userData = data.userDetails ?? data.user ?? data;

        console.log("User Data:", userData);
        setProfile(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="max-w-3xl space-y-5">
        <Skeleton5 className="h-64" />
        <Skeleton5 className="h-48" />
      </div>
    );

  const initials =
    profile?.username
      ?.split(" ")
      .map((n) => n[0])
      .join("") ??
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ??
    "G";

  return (
    <>
      <div className="max-w-3xl space-y-5">
        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative">
            <div className="absolute -bottom-10 left-6 w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-gray-900 font-black text-2xl border-4 border-white shadow-lg">
              {initials}
            </div>
          </div>
          <div className="pt-14 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {profile?.username}
                </h2>
                <p className="text-yellow-600 font-medium">
                  {profile?.role ?? "Tour Guide"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profile.location}
                    </span>
                  )}
                  {profile?.experience && (
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      {profile.experience} exp.
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    {stats?.avgRating ?? 0} rating
                  </span>
                </div>
              </div>

              {/* Edit button — always visible on own profile */}
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── Detail cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Personal Info</h3>
            {[
              { icon: Mail, label: "Email", value: profile?.email },
              { icon: Phone, label: "Phone", value: profile?.phoneNumber },
              { icon: MapPin, label: "Location", value: profile?.location ?? "Nepal" },
              { icon: FileText, label: "Role", value: profile?.role ?? "Tour Guide" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <f.icon size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {f.value ?? "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Specializations & Languages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.specializations ?? []).length ? (
                profile.specializations.map((s, i) => (
                  <span
                    key={i}
                    className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">None added yet</span>
              )}
            </div>

            <h3 className="font-bold text-gray-900 pt-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.languages ?? []).length ? (
                profile.languages.map((l, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">None added yet</span>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-bold text-gray-900">Profile Completion</span>
                <span className="text-sm font-bold text-yellow-600">
                  {profile?.profileCompletion ?? 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${profile?.profileCompletion ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editOpen && (
        <EditModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </>
  );
}