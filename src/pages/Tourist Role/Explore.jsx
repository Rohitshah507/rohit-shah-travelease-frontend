import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowLeft,
  Camera,
  Sun,
  Thermometer,
  ArrowRight,
  Compass,
  Star,
  Eye,
  Users,
  Calendar,
  DollarSign,
  Bot,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { getToken } from "../Login";

// ─── Image Gallery ────────────────────────────────────────────────────────────
const ImageGallery = ({ images = [], title = "" }) => {
  const [active, setActive] = useState(0);
  const validImages = images.filter(Boolean);
  if (validImages.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden h-56 sm:h-72 md:h-80 group">
        <img
          src={validImages[active]}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(7,3,15,0.5) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold text-white"
          style={{
            background: "rgba(7,3,15,0.6)",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          <Camera size={11} />
          {active + 1} / {validImages.length}
        </div>
        {validImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive(
                  (a) => (a - 1 + validImages.length) % validImages.length,
                )
              }
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(7,3,15,0.7)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % validImages.length)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(7,3,15,0.7)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </>
        )}
      </div>
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative rounded-lg sm:rounded-xl overflow-hidden h-14 sm:h-20 transition-all duration-300"
              style={{
                border:
                  i === active ? "2px solid #8b5cf6" : "2px solid transparent",
                opacity: i === active ? 1 : 0.5,
                transform: i === active ? "scale(1)" : "scale(0.97)",
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Package Detail View ──────────────────────────────────────────────────────
const PackageDetail = ({ pkg, onBack }) => {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState("");
  const [aiPlaces, setAiPlaces] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);

  const duration = pkg.duration || (pkg.nights ? `${pkg.nights} Nights` : "—");

  useEffect(() => {
    generateAIContent();
  }, [pkg._id]);

  const generateAIContent = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a travel expert. For this tour package respond ONLY with valid JSON (no markdown, no extra text):

Package Title: ${pkg.title}
Destination: ${pkg.destination}
Duration: ${duration}
Price: $${pkg.price}
Type: ${pkg.type || "Tour"}

Return ONLY this JSON structure:
{
  "description": "A vivid 3-sentence travel guide that inspires visitors to experience this specific destination",
  "places": [
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"}
  ]
}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAiText(parsed.description || pkg.description || "");
      setAiPlaces(parsed.places || []);
    } catch (err) {
      console.error("AI generation error:", err);
      setAiText(pkg.description || "");
      setAiPlaces([]);
    } finally {
      setAiLoading(false);
    }
  };

  const infoItems = [
    {
      icon: Sun,
      label: "Best Time to Visit",
      value: pkg.bestTime || "October – March",
    },
    { icon: Thermometer, label: "Duration", value: duration },
    {
      icon: DollarSign,
      label: "Starting Price",
      value: `$${pkg.price} per person`,
    },
    { icon: MapPin, label: "Destination", value: pkg.destination },
    {
      icon: Calendar,
      label: "Start Date",
      value: pkg.startDate
        ? new Date(pkg.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Flexible",
    },
    {
      icon: Users,
      label: "Group Size",
      value: pkg.group || "Contact for info",
    },
  ];

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105"
        style={{
          background: "rgba(139,92,246,0.12)",
          color: "#c4b5fd",
          border: "1px solid rgba(139,92,246,0.25)",
        }}
      >
        <ArrowLeft size={15} /> Back to Explore
      </button>

      {/* Hero Banner */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-36 sm:h-48 md:h-64 mb-7 sm:mb-10"
        style={{
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 60px rgba(139,92,246,0.2)",
        }}
      >
        <img
          src={pkg.imageUrls?.[0]}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(7,3,15,0.92) 0%, rgba(7,3,15,0.5) 55%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end p-5 sm:p-8 md:p-10">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold mb-2 sm:mb-3"
              style={{
                background: "rgba(139,92,246,0.8)",
                color: "white",
                letterSpacing: "0.1em",
              }}
            >
              <MapPin size={10} />
              {pkg.destination}
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-1 sm:mb-2 leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {pkg.title}
            </h1>
            <p className="text-sm font-medium" style={{ color: "#c4b5fd" }}>
              {pkg.type ? `${pkg.type} · ` : ""}
              {duration}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 sm:gap-10">
        {/* LEFT col */}
        <div className="lg:col-span-3 space-y-7 sm:space-y-10">
          {/* Gallery */}
          {pkg.imageUrls?.length > 0 && (
            <section>
              <h2
                className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-5 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <Camera size={16} style={{ color: "#8b5cf6" }} /> Gallery
              </h2>
              <ImageGallery images={pkg.imageUrls} title={pkg.title} />
            </section>
          )}

          {/* About */}
          <section>
            <h2
              className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <Compass size={16} style={{ color: "#8b5cf6" }} /> About{" "}
              {pkg.title}
            </h2>
            {aiLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "#8b5cf6",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: "#a78bfa" }}
                >
                  Crafting your travel guide...
                </span>
              </div>
            ) : (
              <p
                className="leading-[1.9] text-sm sm:text-base"
                style={{
                  color: "#c4b5fd",
                  fontFamily: "'Georgia', serif",
                  opacity: 0.85,
                }}
              >
                {aiText || pkg.description}
              </p>
            )}
          </section>

          {/* Top Places */}
          <section>
            <h2
              className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-5 flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <Star size={16} style={{ color: "#8b5cf6" }} /> Top Places to
              Visit
            </h2>
            {aiLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 sm:h-20 rounded-xl sm:rounded-2xl animate-pulse"
                    style={{ background: "rgba(139,92,246,0.08)" }}
                  />
                ))}
              </div>
            ) : aiPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {aiPlaces.map((place, i) => (
                  <div
                    key={i}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "rgba(139,92,246,0.07)",
                      border: "1px solid rgba(139,92,246,0.18)",
                    }}
                  >
                    <div
                      className="text-xl sm:text-2xl w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(139,92,246,0.15)" }}
                    >
                      {place.icon || "📍"}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">
                        {place.name}
                      </h3>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "#9e9ab5" }}
                      >
                        {place.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        {/* RIGHT col */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Rating */}
          {pkg.rating && (
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(pkg.rating || 4)
                        ? "text-amber-400 fill-amber-400"
                        : "text-white/15 fill-white/10"
                    }
                  />
                ))}
              </div>
              <span className="font-bold text-white text-sm">{pkg.rating}</span>
              {pkg.reviews && (
                <span className="text-xs" style={{ color: "#6b5a8e" }}>
                  · {pkg.reviews} reviews
                </span>
              )}
            </div>
          )}

          {/* Travel Info */}
          <div
            className="rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-5"
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <h3
              className="font-black text-white text-sm sm:text-base"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Travel Info
            </h3>
            {infoItems.map((info, i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.2)" }}
                >
                  <info.icon size={14} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <p
                    className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: "#6b5a8e" }}
                  >
                    {info.label}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Badge */}
          <div
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(109,40,217,0.1) 100%)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">✦</div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Bot size={12} style={{ color: "#a78bfa" }} />
              <span
                className="text-[0.6rem] sm:text-xs font-bold uppercase tracking-widest"
                style={{ color: "#a78bfa" }}
              >
                AI-Powered Guide
              </span>
            </div>
            <p className="text-xs" style={{ color: "#9e9ab5" }}>
              Description & top places generated by Claude AI
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(`/package/${pkg._id}`)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white transition-all hover:scale-[1.02] text-sm sm:text-base"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: "0 4px 20px rgba(139,92,246,0.45)",
            }}
          >
            View Package in {pkg.destination}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Explore Page ────────────────────────────────────────────────────────
const Explore = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(response.data.getPackages || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const filtered = packages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCardClick = (pkg) => {
    setSelectedPkg(pkg);
    setTimeout(
      () => topRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const handleBack = () => {
    setSelectedPkg(null);
    setTimeout(
      () => topRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const getNights = (pkg) =>
    pkg.duration || (pkg.nights ? `${pkg.nights} Nights` : "—");

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#07030f", fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute top-1/2 right-0 w-60 sm:w-80 h-60 sm:h-80 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-52 sm:w-72 h-52 sm:h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #4c1d95 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div
          ref={topRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-24"
        >
          {selectedPkg ? (
            <PackageDetail pkg={selectedPkg} onBack={handleBack} />
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-10 sm:mb-14">
                <div
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.28)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#a78bfa" }}
                  />
                  <span
                    className="text-[0.65rem] sm:text-[0.68rem] font-bold tracking-[0.2em] uppercase"
                    style={{ color: "#a78bfa" }}
                  >
                    AI-Powered Travel Guide
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-white mb-4 sm:mb-5"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: "0 0 80px rgba(139,92,246,0.4)",
                  }}
                >
                  Explore{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #c4b5fd, #8b5cf6, #a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Destinations
                  </span>
                </h1>
                <p
                  className="text-sm sm:text-lg max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
                  style={{ color: "#9e9ab5" }}
                >
                  Discover curated tour packages with AI-powered travel guides.
                  Click any destination to explore.
                </p>

                {/* Search */}
                <div
                  className="max-w-lg mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  <Search size={16} style={{ color: "#8b5cf6" }} />
                  <input
                    type="text"
                    placeholder="Search destinations or packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-white placeholder-gray-600"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}>
                      <X size={15} style={{ color: "#6b5a8e" }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse h-80 sm:h-96"
                      style={{
                        background: "rgba(139,92,246,0.08)",
                        border: "1px solid rgba(139,92,246,0.12)",
                      }}
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 sm:py-24">
                  <MapPin
                    size={44}
                    style={{ color: "#4c1d95", margin: "0 auto 14px" }}
                  />
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    No packages found
                  </h3>
                  <p style={{ color: "#6b5a8e" }}>
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filtered.map((pkg) => {
                    const isHovered = hoveredCard === pkg._id;
                    const duration = getNights(pkg);

                    return (
                      <div
                        key={pkg._id}
                        className="rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(145deg, #1a0a3e, #120630)",
                          border: isHovered
                            ? "1px solid rgba(139,92,246,0.6)"
                            : "1px solid rgba(139,92,246,0.18)",
                          boxShadow: isHovered
                            ? "0 24px 64px rgba(139,92,246,0.28)"
                            : "0 4px 24px rgba(0,0,0,0.4)",
                          transform: isHovered
                            ? "translateY(-8px)"
                            : "translateY(0)",
                          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                        }}
                        onMouseEnter={() => setHoveredCard(pkg._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => handleCardClick(pkg)}
                      >
                        {/* Image */}
                        <div className="relative h-44 sm:h-52 overflow-hidden">
                          <img
                            src={pkg.imageUrls?.[0]}
                            alt={pkg.title}
                            className="w-full h-full object-cover transition-transform duration-700"
                            style={{
                              transform: isHovered ? "scale(1.1)" : "scale(1)",
                            }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(7,3,15,0.92) 0%, rgba(7,3,15,0.2) 55%, transparent 100%)",
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{
                                background: "rgba(139,92,246,0.85)",
                                color: "white",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {duration}
                            </span>
                          </div>
                          {pkg.rating && (
                            <div
                              className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md"
                              style={{
                                background: "rgba(7,3,15,0.7)",
                                border: "1px solid rgba(255,220,50,0.3)",
                              }}
                            >
                              <Star
                                size={10}
                                className="fill-yellow-400 text-yellow-400"
                              />
                              <span className="text-xs font-bold text-yellow-300">
                                {pkg.rating}
                              </span>
                            </div>
                          )}
                          {pkg.imageUrls?.length > 1 && (
                            <div
                              className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs"
                              style={{
                                background: "rgba(7,3,15,0.7)",
                                color: "#a78bfa",
                              }}
                            >
                              <Camera size={9} />
                              {pkg.imageUrls.length}
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin size={11} style={{ color: "#8b5cf6" }} />
                            <span
                              className="text-xs font-medium truncate"
                              style={{ color: "#a78bfa" }}
                            >
                              {pkg.destination}
                            </span>
                          </div>
                          <h3
                            className="text-lg sm:text-xl font-black leading-tight mb-1.5 sm:mb-2"
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              color: isHovered ? "#c4b5fd" : "white",
                              transition: "color 0.3s",
                            }}
                          >
                            {pkg.title}
                          </h3>
                          <p
                            className="text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-2"
                            style={{ color: "#9e9ab5" }}
                          >
                            {pkg.description ||
                              `Discover the wonders of ${pkg.destination}.`}
                          </p>

                          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-5">
                            {[
                              { icon: DollarSign, label: `$${pkg.price}` },
                              ...(pkg.group
                                ? [{ icon: Users, label: pkg.group }]
                                : []),
                              { icon: Sparkles, label: "AI Guide" },
                            ].map((pill, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-[0.68rem] font-semibold"
                                style={{
                                  background: "rgba(139,92,246,0.13)",
                                  color: "#c4b5fd",
                                  border: "1px solid rgba(139,92,246,0.2)",
                                }}
                              >
                                <pill.icon size={8} />
                                {pill.label}
                              </div>
                            ))}
                          </div>

                          <button
                            className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all"
                            style={{
                              background: isHovered
                                ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                                : "rgba(139,92,246,0.15)",
                              border: isHovered
                                ? "none"
                                : "1px solid rgba(139,92,246,0.28)",
                              boxShadow: isHovered
                                ? "0 4px 15px rgba(139,92,246,0.4)"
                                : "none",
                              color: isHovered ? "white" : "#c4b5fd",
                              transition: "all 0.3s",
                            }}
                          >
                            Explore More <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <p
                  className="text-center text-xs mt-10 sm:mt-12"
                  style={{ color: "#4c3670" }}
                >
                  {filtered.length} package{filtered.length !== 1 ? "s" : ""}{" "}
                  available · Click any card to explore with AI travel guide
                </p>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Explore;
