import { useState, useEffect } from "react";
import {
  MapPin,
  Award,
  Star,
  Mail,
  Phone,
  FileText,
  Edit2,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";

const Skeleton5 = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function Profile({ guideId }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, sRes] = await Promise.all([
          axios.get(`${serverURL}/api/guide/${guideId}/profile`, { headers }),
          axios.get(`${serverURL}/api/guide/${guideId}/stats`, { headers }),
        ]);
        setProfile(pRes.data.guide || pRes.data);
        setStats(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [guideId]);

  if (loading)
    return (
      <div className="max-w-3xl space-y-5">
        <Skeleton5 className="h-64" />
        <Skeleton5 className="h-48" />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative">
          <div className="absolute -bottom-10 left-6 w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-gray-900 font-black text-2xl border-4 border-white shadow-lg">
            {profile?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") ?? "G"}
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {profile?.name}
              </h2>
              <p className="text-yellow-600 font-medium">
                {profile?.role ?? "Tour Guide"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {profile?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Award size={14} />
                  {profile?.experience} exp.
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  {stats?.avgRating ?? 0} rating
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition">
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Personal Info</h3>
          {[
            { icon: Mail, label: "Email", value: profile?.email },
            { icon: Phone, label: "Phone", value: profile?.phone },
            { icon: MapPin, label: "Location", value: profile?.location },
            { icon: FileText, label: "License", value: profile?.license },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
                <f.icon size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{f.label}</p>
                <p className="text-sm font-medium text-gray-900">{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.specializations ?? []).map((s, i) => (
              <span
                key={i}
                className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 pt-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.languages ?? []).map((l, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-gray-900">
                Profile Completion
              </span>
              <span className="text-sm font-bold text-yellow-600">
                {profile?.profileCompletion ?? 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${profile?.profileCompletion ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
