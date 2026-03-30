import React, { useState, useEffect } from "react";
import { getToken } from "../Login.jsx";
import {
  Search,
  MapPin,
  Calendar,
  CreditCard,
  Compass,
  ArrowRight,
  Star,
  Users,
  Clock,
  Heart,
  Plane,
  Building2,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App.jsx";
import Navbar from "../../Components/Navbar.jsx";

const getBadgeInfo = (destination, index) => {
  const status = destination.status?.toLowerCase();
  if (status === "bestseller" || index % 3 === 0)
    return { label: "🔥 BESTSELLER", cls: "bestseller" };
  if (status === "popular" || index % 3 === 1)
    return { label: "⭐ POPULAR", cls: "popular" };
  return { label: "✦ LUXURY", cls: "luxury" };
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

const Destinations = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCards, setFavoriteCards] = useState(new Set());
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDestinations(response.data.getPackages || []);
      } catch (error) {
        console.error("Error fetching tour packages:", error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTourPackages();
  }, []);

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filters = [
    { id: "all", label: "All Destinations" },
    { id: "adventure", label: "Adventure" },
    { id: "cultural", label: "Cultural" },
    { id: "nature", label: "Nature" },
    { id: "beach", label: "Beach" },
  ];

  const filteredDestinations = destinations.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCardClick = (id) => navigate(`/package/${id}`);

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[15%] w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,transparent_70%)] blur-[70px]" />
        <div className="absolute top-[50%] right-[-5%] w-[200px] sm:w-[380px] h-[200px] sm:h-[380px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[180px] sm:w-[300px] h-[180px] sm:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.14)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <div className="pt-20 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5 sm:mb-7 bg-violet-500/10 border border-violet-500/20">
                <span className="w-2 h-2 rounded-full bg-violet-300 animate-pulse" />
                <span className="text-[0.65rem] sm:text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400">
                  How it works
                </span>
              </div>

              <h1
                className="font-black leading-tight mb-4 sm:mb-6 text-white"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2.2rem,5vw,4.5rem)",
                }}
              >
                One click
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                  for you
                </span>
              </h1>

              <p className="text-[#9e9ab5] text-sm sm:text-base leading-[1.8] max-w-[460px] mb-7 sm:mb-10">
                Our tourist destinations offer an unrivaled blend of natural
                beauty and cultural richness, where you can explore breathtaking
                landscapes.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    icon: Search,
                    title: "Find your destination",
                    desc: "Search from hundreds of curated destinations where adventure meets serenity",
                  },
                  {
                    icon: Calendar,
                    title: "Book a ticket",
                    desc: "Simple booking process with flexible dates and instant confirmation",
                  },
                  {
                    icon: CreditCard,
                    title: "Make payment",
                    desc: "Secure payment with hassle-free transactions and instant receipts",
                  },
                  {
                    icon: Compass,
                    title: "Explore destination",
                    desc: "Begin your journey with expert guides and unforgettable experiences",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-violet-500/7 border border-violet-500/18 rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 cursor-pointer hover:bg-violet-500/14 hover:border-violet-500/45 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(139,92,246,0.2)] transition-all duration-[400ms]"
                  >
                    <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[14px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mb-3 sm:mb-4 shadow-[0_4px_15px_rgba(139,92,246,0.4)]">
                      <feature.icon size={18} className="text-white" />
                    </div>
                    <h3 className="font-extrabold text-white text-xs sm:text-sm mb-1 sm:mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-[#6b5a8e] text-[0.65rem] sm:text-xs leading-[1.65] hidden sm:block">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — hero image */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] border border-violet-500/30 shadow-[0_0_60px_rgba(139,92,246,0.2)] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/15 to-violet-700/10 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500" />
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop"
                alt="Travel"
                className="w-full h-[280px] sm:h-[380px] lg:h-[520px] object-cover group-hover:scale-[1.05] transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 py-5 sm:py-7 bg-gradient-to-t from-[#07030f]/92 to-transparent z-20">
                <h3
                  className="text-xl sm:text-[1.6rem] font-black text-white mb-1.5 sm:mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Escape to paradise where dreams meet reality
                </h3>
                <p className="text-violet-400 text-xs sm:text-sm leading-[1.6]">
                  Discover the adventure that lies beyond the ordinary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 sm:p-4 rounded-[18px] sm:rounded-[22px] border border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-gradient-to-br from-[#1a0a3e] to-[#120630]">
            <div className="flex-1 flex items-center gap-2 bg-violet-500/8 border border-violet-500/25 rounded-[14px] sm:rounded-[18px] px-3 sm:px-4 focus-within:border-violet-500/70 transition-colors">
              <Search size={16} className="text-violet-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-sm py-2.5 sm:py-3 placeholder:text-violet-400/45"
                placeholder="Search destinations, cities, or countries..."
              />
            </div>
            <button className="px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-[13px] sm:rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer whitespace-nowrap">
              Search Now
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
          <div className="flex gap-2 sm:gap-2.5 flex-wrap justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-full font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 cursor-pointer transition-all hover:scale-105 ${
                  activeFilter === filter.id
                    ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white border-none shadow-[0_4px_15px_rgba(139,92,246,0.4)]"
                    : "bg-violet-500/8 text-violet-300 border border-violet-500/20 hover:bg-violet-500/18 hover:border-violet-500/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-[0.65rem] sm:text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-2 sm:mb-3">
              Tour packages
            </div>
            <h2
              className="font-black text-white mb-3 sm:mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem,4vw,3.2rem)",
              }}
            >
              Our tourist{" "}
              <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                destination
              </span>
            </h2>
            <p className="text-[#6b5a8e] max-w-[560px] mx-auto leading-[1.75] text-sm sm:text-base">
              Our tourist destinations offer an unrivaled blend of natural
              beauty and cultural richness.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-16 sm:py-20 gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
              <p className="text-[#6b5a8e] font-semibold text-sm sm:text-base">
                Loading amazing destinations...
              </p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <MapPin
                size={48}
                className="text-violet-900 mx-auto mb-4 block"
              />
              <p className="text-lg sm:text-xl font-bold text-white mb-2">
                No destinations found
              </p>
              <p className="text-[#6b5a8e] text-sm sm:text-base">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDestinations.map((destination, index) => {
                const badge = getBadgeInfo(destination, index);
                const amenities = getAmenities(destination);
                const nights =
                  destination.duration ||
                  (destination.nights ? `${destination.nights} Nights` : "—");

                return (
                  <div
                    key={destination._id}
                    className="rounded-[20px] sm:rounded-[24px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/20 hover:border-violet-500/55 hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)] hover:-translate-y-1.5 transition-all duration-[400ms] cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-[200px] sm:h-[220px]">
                      <img
                        src={destination.imageUrls?.[0]}
                        alt={destination.title}
                        className="w-full h-full object-cover hover:scale-[1.08] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/50 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 text-[0.65rem] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full ${badgeClass[badge.cls]}`}
                      >
                        {badge.label}
                      </span>
                      <div className="absolute top-3 right-3 bg-[#07030f]/70 backdrop-blur-sm text-violet-300 text-[0.65rem] sm:text-[0.7rem] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-violet-500/30">
                        {nights}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(destination._id);
                        }}
                        className={`absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${favoriteCards.has(destination._id) ? "bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.5)]" : "bg-[#07030f]/70 backdrop-blur-sm"}`}
                      >
                        <Heart
                          size={13}
                          className="text-white"
                          fill={
                            favoriteCards.has(destination._id)
                              ? "white"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start gap-2 sm:gap-3 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg sm:text-xl font-black text-white leading-tight mb-1"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {destination.title}
                          </h3>
                          <p className="flex items-center gap-1 text-[#6b5a8e] text-xs">
                            <MapPin
                              size={10}
                              className="text-violet-500 shrink-0"
                            />
                            <span className="truncate">
                              {destination.destination}
                              {destination.type ? ` · ${destination.type}` : ""}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className="text-[1.3rem] sm:text-[1.55rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            ${destination.price}
                          </div>
                          <div className="text-[#6b5a8e] text-xs">
                            per person
                          </div>
                        </div>
                      </div>

                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 my-2 sm:my-3">
                          {amenities.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-violet-500/12 text-violet-300 border border-violet-500/20"
                            >
                              <a.icon size={9} />
                              {a.label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-violet-500/12 my-2 sm:my-3" />

                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={
                                i < Math.round(destination.rating || 4)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-white/15 fill-white/10"
                              }
                            />
                          ))}
                          <span className="ml-1 text-xs sm:text-sm font-bold text-white">
                            {destination.rating}
                          </span>
                          <span className="text-[#6b5a8e] text-xs">
                            {" "}
                            · {destination.reviews} reviews
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[#6b5a8e] text-xs">
                          <Users size={10} className="text-violet-500" />
                          {destination.group}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-[#6b5a8e] mb-3 sm:mb-4">
                        <Calendar size={10} className="text-violet-500" />
                        Starts:{" "}
                        {new Date(destination.startDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </div>

                      <button
                        className="w-full py-2.5 sm:py-3 rounded-[12px] sm:rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(destination._id);
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

          {!loading && filteredDestinations.length > 0 && (
            <div className="text-center mt-10 sm:mt-14">
              <button className="inline-flex items-center gap-2 px-7 sm:px-10 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-violet-300 bg-transparent border-2 border-violet-500/40 hover:bg-violet-500/15 hover:border-violet-500/70 hover:-translate-y-0.5 transition-all cursor-pointer">
                View More Destinations <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Destinations;