import React, { useState, useEffect } from "react";
import {
  Heart,
  Star,
  MapPin,
  Calendar,
  Plane,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Compass,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { serverURL } from "../../App.jsx";
import { getToken } from "../Login.jsx";
import Navbar from "../../Components/Navbar.jsx";
import Footer from "../../Components/Footer.jsx";

const getBadgeInfo = (destination, index) => {
  const status = destination.status?.toLowerCase();
  if (status === "bestseller" || index % 3 === 0)
    return { label: "🔥 BESTSELLER", cls: "bestseller" };
  if (status === "popular" || index % 3 === 1)
    return { label: "⭐ POPULAR", cls: "popular" };
  return { label: "💎 LUXURY", cls: "luxury" };
};

const getAmenities = (destination) => {
  const pills = [];
  if (destination.flights !== false)
    pills.push({ icon: Plane, label: "Flights" });
  pills.push({ icon: Building2, label: destination.hotel || "Hotel" });
  if (destination.meals)
    pills.push({ icon: UtensilsCrossed, label: destination.meals });
  else if (destination.activities)
    pills.push({ icon: Sparkles, label: "Activities" });
  else if (destination.tours)
    pills.push({ icon: Compass, label: destination.tours });
  return pills;
};

const badgeClass = {
  bestseller: "bg-red-500/20 text-red-300 border border-red-500/30",
  popular: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  luxury: "bg-violet-500/25 text-violet-300 border border-violet-500/30",
};

const Packages = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ← NEW: read URL query params

  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteCards, setFavoriteCards] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // ── READ ?search= PARAM FROM URL (new) ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pkgs = response.data.getPackages || [];
        setPackages(pkgs);
        setFilteredPackages(pkgs);
      } catch (error) {
        toast.error("Failed to load packages");
        setPackages([]);
        setFilteredPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    let result = [...packages];
    if (searchQuery)
      result = result.filter(
        (pkg) =>
          pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.destination?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    if (priceRange !== "all")
      result = result.filter((pkg) => {
        if (priceRange === "budget") return pkg.price < 500;
        if (priceRange === "mid") return pkg.price >= 500 && pkg.price <= 1500;
        if (priceRange === "luxury") return pkg.price > 1500;
        return true;
      });
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating")
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredPackages(result);
  }, [searchQuery, priceRange, sortBy, packages]);

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleCardClick = (id) => navigate(`/booking/${id}`);

  const sortLabels = {
    featured: "Featured",
    "price-low": "$ Low",
    "price-high": "$ High",
    rating: "⭐ Top",
  };

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-8%] left-[20%] w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[520px] lg:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-[70px]" />
        <div className="absolute top-[45%] right-[-5%] w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.13)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[350px] lg:h-[350px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.15)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Toaster />

        {/* ── HERO ── */}
        <div className="relative pt-[100px] sm:pt-[120px] pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle,rgba(139,92,246,0.1)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute right-[-60px] top-[10%] w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] rounded-full border border-violet-500/13 pointer-events-none" />
          <div className="hidden sm:block absolute right-10 top-[20%] w-[160px] h-[160px] sm:w-[260px] sm:h-[260px] rounded-full border border-violet-500/8 pointer-events-none" />

          <div className="max-w-[900px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full mb-5 sm:mb-7 bg-violet-500/10 border border-violet-500/20">
              <span className="w-[7px] h-[7px] rounded-full bg-violet-300 animate-pulse" />
              <span className="text-[0.6rem] sm:text-[0.68rem] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-violet-400">
                ✦ All Tour Packages
              </span>
            </div>

            <h1
              className="font-black leading-tight mb-4 sm:mb-5 text-white"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.2rem,5.5vw,4.8rem)",
              }}
            >
              Explore All
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                Tour Packages
              </span>
            </h1>

            <p className="text-[#9e9ab5] text-sm sm:text-base mb-8 sm:mb-12 max-w-[540px] mx-auto px-4">
              Choose from our curated collection of {packages.length}+ premium
              travel packages
            </p>

            {/* Search bar — pre-filled if navigated from homepage */}
            <div className="max-w-[680px] mx-auto flex items-center gap-0 bg-violet-500/10 border border-violet-500/30 rounded-[14px] sm:rounded-[18px] px-3 sm:px-4 py-1 focus-within:border-violet-500/70 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all">
              <Search size={16} className="text-violet-500 shrink-0" />
              <input
                type="text"
                placeholder="Search destinations, packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-3 placeholder:text-violet-400/45 min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    // Also clear the URL param so it doesn't re-trigger
                    navigate("/explore", { replace: true });
                  }}
                  className="bg-none border-none cursor-pointer text-violet-400 p-1 flex items-center shrink-0"
                >
                  <X size={14} />
                </button>
              )}
              <button className="px-4 sm:px-7 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer shrink-0 whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Show active search label when navigated from homepage */}
            {searchQuery && (
              <p className="text-violet-400 text-xs sm:text-sm mt-4">
                Showing results for{" "}
                <span className="text-white font-bold">"{searchQuery}"</span>
                {" — "}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    navigate("/explore", { replace: true });
                  }}
                  className="text-violet-400 underline underline-offset-2 cursor-pointer bg-transparent border-none hover:text-violet-300 transition-colors"
                >
                  Clear
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ── CONTROLS BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-[12px] sm:rounded-[14px] font-bold text-xs sm:text-sm cursor-pointer transition-all ${showFilters ? "bg-violet-500/25 border border-violet-500/50 text-violet-300" : "bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/60"}`}
              >
                <SlidersHorizontal size={14} />
                {showFilters ? "Hide Filters" : "Filters"}
              </button>

              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-violet-500/6 border border-violet-500/15 rounded-[12px] sm:rounded-[14px] px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-[#9e9ab5]">
                Showing{" "}
                <span className="text-violet-300 font-bold">
                  {filteredPackages.length}
                </span>{" "}
                of{" "}
                <span className="text-violet-300 font-bold">
                  {packages.length}
                </span>{" "}
                packages
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
              <span className="text-[#6b5a8e] text-xs font-semibold hidden sm:inline">
                Sort:
              </span>
              {["featured", "price-low", "price-high", "rating"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-[8px] sm:rounded-[10px] text-[0.65rem] sm:text-xs font-semibold cursor-pointer transition-all border-none ${sortBy === opt ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-[0_4px_12px_rgba(139,92,246,0.35)]" : "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"}`}
                >
                  {sortLabels[opt]}
                </button>
              ))}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 sm:p-6 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-[#140932] to-[#0f0720] border border-violet-500/25">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 sm:gap-6">
                <div className="w-full sm:w-auto">
                  <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full sm:w-auto bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-[12px] px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-500/70 [&>option]:bg-[#1a0a3e]"
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Budget (&lt; $500)</option>
                    <option value="mid">Mid-Range ($500–$1500)</option>
                    <option value="luxury">Luxury (&gt; $1500)</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-[12px] px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-500/70 [&>option]:bg-[#1a0a3e]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPriceRange("all");
                    setSortBy("featured");
                    navigate("/explore", { replace: true });
                  }}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[12px] text-sm font-bold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer sm:ml-auto"
                >
                  <X size={13} /> Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── GRID ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
              <p className="text-[#6b5a8e] font-semibold">
                Loading packages...
              </p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-24 px-4">
              <MapPin
                size={60}
                className="text-violet-900 mx-auto mb-5 block"
              />
              <h3
                className="text-[1.4rem] sm:text-[1.8rem] font-black text-white mb-2.5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                No packages found
              </h3>
              <p className="text-[#6b5a8e] mb-7">
                {searchQuery
                  ? `No packages match "${searchQuery}". Try a different destination.`
                  : "Try adjusting your filters or search query"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange("all");
                  setSortBy("featured");
                  navigate("/explore", { replace: true });
                }}
                className="px-7 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPackages.map((pkg, index) => {
                const badge = getBadgeInfo(pkg, index);
                const amenities = getAmenities(pkg);
                const nights =
                  pkg.duration || (pkg.nights ? `${pkg.nights} Nights` : "—");

                return (
                  <div
                    key={pkg._id}
                    className="rounded-[20px] sm:rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/20 hover:border-violet-500/60 hover:shadow-[0_24px_64px_rgba(139,92,246,0.28)] hover:-translate-y-2 transition-all duration-[400ms] cursor-pointer"
                    onClick={() => handleCardClick(pkg._id)}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={pkg.imageUrls?.[0]}
                        alt={pkg.title}
                        className="w-full h-[200px] sm:h-[220px] object-cover block hover:scale-[1.07] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/60 to-transparent" />
                      <span
                        className={`absolute top-3 sm:top-4 left-3 sm:left-4 text-[0.6rem] sm:text-[0.68rem] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${badgeClass[badge.cls]}`}
                      >
                        {badge.label}
                      </span>
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-[#07030f]/70 backdrop-blur-sm text-violet-300 text-[0.65rem] sm:text-[0.7rem] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-violet-500/30">
                        {nights}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pkg._id);
                        }}
                        className={`absolute bottom-3 right-3 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${favoriteCards.has(pkg._id) ? "bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.5)]" : "bg-[#07030f]/70 backdrop-blur-sm"}`}
                      >
                        <Heart
                          size={14}
                          className="text-white"
                          fill={favoriteCards.has(pkg._id) ? "white" : "none"}
                        />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start gap-2 sm:gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-base sm:text-xl font-black text-white leading-tight mb-1"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {pkg.title}
                          </h3>
                          <p className="flex items-center gap-1 text-[#6b5a8e] text-xs">
                            <MapPin
                              size={10}
                              className="text-violet-500 shrink-0"
                            />
                            <span className="truncate">
                              {pkg.destination}
                              {pkg.type ? ` · ${pkg.type}` : ""}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className="text-[1.3rem] sm:text-[1.6rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            ${pkg.price}
                          </div>
                          <div className="text-[#6b5a8e] text-xs">
                            per person
                          </div>
                        </div>
                      </div>

                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 my-2.5 sm:my-3.5">
                          {amenities.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold bg-violet-500/12 text-violet-300 border border-violet-500/20"
                            >
                              <a.icon size={9} />
                              {a.label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-violet-500/12 my-2.5 sm:my-3" />

                      <div className="flex items-center gap-0.5 mb-2 sm:mb-2.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={
                              i < Math.round(pkg.rating || 4)
                                ? "text-amber-400 fill-amber-400"
                                : "text-white/12 fill-white/8"
                            }
                          />
                        ))}
                        <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm font-bold text-white">
                          {pkg.rating}
                        </span>
                        <span className="text-[#6b5a8e] text-xs">
                          {" "}
                          · {pkg.reviews} reviews
                        </span>
                      </div>

                      {pkg.startDate && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6b5a8e] mb-3 sm:mb-4">
                          <Calendar size={10} className="text-violet-500" />
                          Starts:{" "}
                          {new Date(pkg.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}

                      <button
                        className="w-full py-3 sm:py-3.5 rounded-[12px] sm:rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(pkg._id);
                        }}
                      >
                        Book This Package
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Packages;
