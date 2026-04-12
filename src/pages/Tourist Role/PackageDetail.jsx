import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
  ImageOff,
} from "lucide-react";
import { serverURL } from "../../App.jsx";
import { getToken } from "../Login.jsx";
import Navbar from "../../Components/Navbar.jsx";

/* ─── tiny markdown-ish renderer for the AI description ─── */
const renderDescription = (raw) => {
  if (!raw) return null;
  return raw
    .split(/\n+/)
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="text-violet-200 font-bold">
            {part}
          </strong>
        ) : (
          part
        ),
      );
      const isBullet =
        line.trim().startsWith("**") || line.trim().startsWith("*");
      return isBullet ? (
        <li
          key={i}
          className="flex items-start gap-2 text-[#b8afd4] text-sm sm:text-[0.95rem] leading-[1.8] mb-1"
        >
          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
          <span>{rendered}</span>
        </li>
      ) : (
        <p
          key={i}
          className="text-[#b8afd4] text-sm sm:text-[0.97rem] leading-[1.85] mb-2 sm:mb-3"
        >
          {rendered}
        </p>
      );
    });
};

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.packageId;
        setPkg(data);
      } catch (err) {
        console.error("Failed to fetch package:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07030f] flex flex-col items-center justify-center gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
        <p className="text-[#6b5a8e] font-semibold tracking-wide animate-pulse text-sm sm:text-base">
          Loading package details…
        </p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#07030f] flex flex-col items-center justify-center gap-4 text-white px-4">
        <MapPin size={44} className="text-violet-900" />
        <p className="text-lg sm:text-xl font-bold">Package not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-bold text-violet-300 border border-violet-500/40 hover:bg-violet-500/15 transition-all cursor-pointer bg-transparent"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const images = pkg.imageUrls?.length ? pkg.imageUrls : [];
  const descriptionLines = pkg.description
    ? renderDescription(pkg.description)
    : null;

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[15%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[200px] sm:w-[380px] h-[200px] sm:h-[380px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.1)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-500/50 hover:-translate-x-1 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Packages
          </button>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-10 items-start">
            {/* LEFT — Image gallery */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Main image */}
              <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-violet-500/25 shadow-[0_0_60px_rgba(139,92,246,0.18)] aspect-[4/3]">
                {images.length > 0 && !imgError[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={pkg.title}
                    onError={() =>
                      setImgError((p) => ({ ...p, [activeImg]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-violet-500/8 gap-3">
                    <ImageOff size={36} className="text-violet-800" />
                    <span className="text-[#6b5a8e] text-xs sm:text-sm">
                      No image available
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/50 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold bg-violet-500/85 text-white backdrop-blur-sm truncate max-w-[60%]">
                  ✦ {pkg.title}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-[10px] sm:rounded-[12px] overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImg === i
                          ? "border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                          : "border-violet-500/20 hover:border-violet-500/50"
                      }`}
                    >
                      {!imgError[i] ? (
                        <img
                          src={url}
                          alt={`view-${i}`}
                          onError={() =>
                            setImgError((p) => ({ ...p, [i]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-violet-500/10 flex items-center justify-center">
                          <ImageOff size={12} className="text-violet-700" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick stats pills */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  {
                    icon: Clock,
                    label: "Duration",
                    value: pkg.duration || "—",
                  },
                  {
                    icon: DollarSign,
                    label: "Price",
                    value: pkg.price ? `Rs.${pkg.price} / person` : "—",
                  },
                  {
                    icon: MapPin,
                    label: "Destination",
                    value: pkg.destination || "—",
                  },
                  {
                    icon: Calendar,
                    label: "Start Date",
                    value: pkg.startDate
                      ? new Date(pkg.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[14px] sm:rounded-[16px] bg-violet-500/8 border border-violet-500/18"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[9px] sm:rounded-[10px] bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.58rem] sm:text-[0.6rem] font-bold tracking-[0.15em] uppercase text-[#6b5a8e]">
                        {label}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Description */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Title block */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full mb-3 sm:mb-4 bg-violet-500/10 border border-violet-500/20">
                  <Sparkles size={11} className="text-violet-400" />
                </div>

                <h1
                  className="font-black text-white leading-tight mb-2"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(1.6rem,3.5vw,2.8rem)",
                  }}
                >
                  {pkg.title}
                </h1>

                <div className="flex items-center gap-2 text-[#6b5a8e] text-xs sm:text-sm mb-3 sm:mb-4 flex-wrap">
                  <MapPin size={12} className="text-violet-500 shrink-0" />
                  <span>{pkg.destination}</span>
                  {pkg.type && (
                    <>
                      <span className="text-violet-800">·</span>
                      <span>{pkg.type}</span>
                    </>
                  )}
                </div>

                {/* Stars */}
                {pkg.rating && (
                  <div className="flex items-center gap-1.5 mb-4 sm:mb-6 flex-wrap">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < Math.round(pkg.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-white/15 fill-white/10"
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs sm:text-sm font-bold text-white">
                      {pkg.rating}
                    </span>
                    {pkg.reviews && (
                      <span className="text-[#6b5a8e] text-xs">
                        · {pkg.reviews} reviews
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description card */}
              <div className="rounded-[18px] sm:rounded-[22px] p-5 sm:p-7 bg-gradient-to-br from-[#1a0a3e]/80 to-[#120630]/80 border border-violet-500/20 backdrop-blur-sm">
                <h2 className="text-sm sm:text-base font-bold text-violet-300 mb-4 sm:mb-5 flex items-center gap-2">
                  <span className="w-4 sm:w-5 h-px bg-violet-500" />
                  About This Package
                  <span className="w-4 sm:w-5 h-px bg-violet-500" />
                </h2>

                {descriptionLines ? (
                  <ul className="list-none p-0 m-0">{descriptionLines}</ul>
                ) : (
                  <p className="text-[#6b5a8e] italic text-xs sm:text-sm">
                    No description available.
                  </p>
                )}
              </div>

              {/* Price + Book CTA */}
              <div className="rounded-[18px] sm:rounded-[22px] p-4 sm:p-6 bg-gradient-to-r from-violet-500/12 to-violet-700/8 border border-violet-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
                <div>
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-bold tracking-[0.18em] uppercase text-violet-400 mb-1">
                    Starting from
                  </p>
                  <div
                    className="text-[2rem] sm:text-[2.4rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Rs.{pkg.price}
                  </div>
                  <p className="text-[#6b5a8e] text-xs mt-0.5">
                    per person · all inclusive
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/booking/${id}`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-9 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[18px] font-bold text-white text-sm bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_20px_rgba(139,92,246,0.45)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.65)] hover:scale-[1.03] transition-all border-none cursor-pointer whitespace-nowrap"
                >
                  Book The Tour <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
