import React, { useState, useEffect } from "react";
import { getToken } from "../Login.jsx";

import {
  Search,
  MapPin,
  Calendar,
  CreditCard,
  Compass,
  ArrowRight,
  X,
  Menu,
  Star,
  Users,
  Clock,
  Heart,
  Plane,
  Building2,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App.jsx";
import Navbar from "../../Components/Navbar.jsx";

// Helper: pick badge label & color based on status or index
const getBadgeInfo = (destination, index) => {
  const status = destination.status?.toLowerCase();
  if (status === "bestseller" || index % 3 === 0)
    return { label: "🔥 BESTSELLER", bg: "bg-purple-700 text-white" };
  if (status === "popular" || index % 3 === 1)
    return { label: "⭐ POPULAR", bg: "bg-violet-500 text-white" };
  return { label: "✦ LUXURY", bg: "bg-indigo-600 text-white" };
};

// Helper: derive amenity pills from destination data
const getAmenities = (destination) => {
  const pills = [];
  if (destination.flights !== false)
    pills.push({ icon: Plane, label: "Flights" });
  const hotel = destination.hotel || "Hotel";
  pills.push({ icon: Building2, label: hotel });
  if (destination.meals)
    pills.push({ icon: UtensilsCrossed, label: destination.meals });
  else if (destination.activities)
    pills.push({ icon: Sparkles, label: "Activities" });
  else if (destination.tours)
    pills.push({ icon: Compass, label: destination.tours });
  return pills;
};

const Destinations = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCards, setFavoriteCards] = useState(new Set());
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch tour packages from MongoDB
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("PACKAGES FROM API: ", response.data);
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

  console.log("PACKAGES FROM API:", destinations);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const filters = [
    { id: "all", label: "All Destinations" },
    { id: "adventure", label: "Adventure" },
    { id: "cultural", label: "Cultural" },
    { id: "nature", label: "Nature" },
    { id: "beach", label: "Beach" },
  ];

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.destination
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  {
    filteredDestinations.map((destination) => {
      console.log("DESTINATION OBJECT:", destination);
      return (
        <div key={destination._id}>
          <h3>{destination.title}</h3>
          <p>{destination.destination}</p>
        </div>
      );
    });
  }

  const navigate = useNavigate();

  const handleCardClick = (id) => {
    console.log("NAVIGATING WITH ID:", id);
    navigate(`/booking/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 relative overflow-hidden">
      <Navbar />

      {/* Animated Background Blobs */}
      <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* ── Hero Section ── */}
      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 z-10 mt-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              How it works
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 via-violet-900 to-gray-900 bg-clip-text text-transparent">
              One click for you
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              Our tourist destinations offer an unrivaled blend of natural
              beauty and cultural richness, where you can explore breathtaking
              landscapes, experience vibrant local cultures, and create
              unforgettable memories.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-4">
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
                  desc: "Secure payment options with hassle-free transactions and instant receipts",
                },
                {
                  icon: Compass,
                  title: "Explore destination",
                  desc: "Begin your journey with expert guides and unforgettable experiences",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-2xl hover:shadow-violet-100 transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-violet-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-violet-200">
                    <feature.icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-purple-500/20 z-10 group-hover:opacity-0 transition-opacity duration-500" />
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop"
              alt="Beach destination"
              className="w-full h-64 sm:h-80 md:h-[500px] object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                Escape to paradise where dreams meet reality
              </h3>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                Discover the adventure that lies beyond the ordinary, where
                every journey becomes an extraordinary story waiting to be told
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12 sm:mb-16 relative z-20 animate-fade-in-up animation-delay-300">
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl shadow-violet-100 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center border border-violet-100">
          <div className="flex-1 relative w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-300"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300"
              placeholder="Search destinations, cities, or countries..."
            />
          </div>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300/40 transition-all duration-300 whitespace-nowrap active:scale-95 text-sm sm:text-base">
            Search Now
          </button>
        </div>
      </div>

      {/* ── Filter Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 animate-fade-in-up animation-delay-400">
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
          {filters.map((filter, index) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-400/40"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-500 hover:text-violet-600 hover:shadow-md"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Destinations Cards ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-in-up animation-delay-500">
          <div className="inline-block text-violet-600 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 px-4 py-1 bg-violet-50 rounded-full border border-violet-100">
            Tour packages
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
            Our tourist destination
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our tourist destinations offer an unrivaled blend of natural beauty
            and cultural richness
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-semibold animate-pulse">
              Loading amazing destinations...
            </p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 bg-violet-50 rounded-full flex items-center justify-center">
              <MapPin className="text-violet-300" size={48} />
            </div>
            <p className="text-2xl font-bold text-gray-400 mb-2">
              No destinations found
            </p>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDestinations.map((destination, index) => {
              const badge = getBadgeInfo(destination, index);
              const amenities = getAmenities(destination);
              const nights = destination.duration
                ? destination.duration
                : destination.nights
                  ? `${destination.nights} Nights`
                  : "—";

              return (
                <div
                  key={destination._id}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    boxShadow:
                      "0 4px 24px 0 rgba(109,40,217,0.10), 0 1.5px 6px 0 rgba(109,40,217,0.07)",
                    transition:
                      "box-shadow 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 16px 48px 0 rgba(109,40,217,0.22), 0 4px 16px 0 rgba(109,40,217,0.14)";
                    e.currentTarget.style.transform = "translateY(-6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 24px 0 rgba(109,40,217,0.10), 0 1.5px 6px 0 rgba(109,40,217,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Card Image */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-200">
                    <img
                      src={destination.imageUrls?.[0]}
                      alt={destination.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Status Badge top-left */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md ${badge.bg}`}
                    >
                      {badge.label}
                    </div>

                    {/* Nights badge top-right */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-md">
                      {nights}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(destination._id);
                      }}
                      className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                        favoriteCards.has(destination._id)
                          ? "bg-violet-600"
                          : "bg-white/90 hover:bg-violet-50"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={`transition-all duration-300 ${
                          favoriteCards.has(destination._id)
                            ? "text-white fill-white"
                            : "text-violet-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Title + Price */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight group-hover:text-violet-700 transition-colors duration-300">
                          {destination.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin
                            size={12}
                            className="text-violet-400 shrink-0"
                          />
                          <span className="truncate">
                            {destination.destination}
                            {destination.type ? ` · ${destination.type}` : ""}
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-black text-violet-600 leading-tight">
                          ${destination.price}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          per person
                        </div>
                      </div>
                    </div>

                    {/* Amenity Pills */}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {amenities.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-full transition-colors duration-200 border border-violet-100"
                          >
                            <a.icon size={11} />
                            {a.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-violet-50" />

                    {/* Stars + Group */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < Math.round(destination.rating || 4)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 fill-gray-200"
                            }
                          />
                        ))}
                        <span className="ml-1 text-xs sm:text-sm font-bold text-gray-700">
                          {destination.rating}
                        </span>
                        <span className="text-xs text-gray-400 ml-0.5">
                          · {destination.reviews} reviews
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Users size={12} className="text-violet-400" />
                        <span className="font-medium">{destination.group}</span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar size={12} className="text-violet-400" />
                      <span>
                        Starts:{" "}
                        {new Date(destination.startDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    {/* Book Button */}
                    <button
                      className="w-full mt-1 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 active:scale-95 shadow-md hover:shadow-xl hover:shadow-violet-400/40"
                      style={{
                        background:
                          "linear-gradient(90deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)",
                      }}
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

        {/* View More Button */}
        {!loading && filteredDestinations.length > 0 && (
          <div className="text-center mt-12 sm:mt-16 animate-fade-in-up animation-delay-600">
            <button className="inline-flex items-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 bg-white border-2 border-violet-500 text-violet-600 rounded-full text-sm sm:text-base font-bold hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white hover:border-transparent transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-300/40 transition-all duration-300 active:scale-95 group">
              View More Destinations
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
