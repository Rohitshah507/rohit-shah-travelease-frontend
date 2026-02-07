import React, { useState, useEffect } from "react";
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
} from "lucide-react";

import { NavLink } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";

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
        const response = await axios.get(`${serverURL}/api/user/package`, {
          withCredentials: true,
        });
        console.log("PACKAGES FROM API: ", response.data);

        // FIX: extract the array
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
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

  // Filter destinations based on category and search query
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.destination
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg text-black" : "bg-transparent text-black"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-4xl font-bold text-amber-700 ">TravelEase</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center font-bold space-x-8">
            <NavLink to="/home" className="over:text-amber-700 transition">
              Home
            </NavLink>
            <NavLink
              to="/destinations"
              className=" hover:text-amber-700 transition "
            >
              Destinations
            </NavLink>

            <NavLink to="/places" className=" hover:text-amber-700 transition ">
              Places to Visit
            </NavLink>
            <NavLink
              to="/packages"
              className=" hover:text-amber-700 transition "
            >
              Packages
            </NavLink>
            <NavLink to="/tour" className=" hover:text-amber-700 transition ">
              TourList
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-6 py-4 space-y-4">
              <a
                href="#home"
                className="block text-gray-700 hover:text-amber-700"
              >
                Home
              </a>
              <a
                href="#about"
                className="block text-gray-700 hover:text-amber-700"
              >
                About Nepal
              </a>
              <a
                href="#places"
                className="block text-gray-700 hover:text-amber-700"
              >
                Places to Visit
              </a>
              <a
                href="#packages"
                className="block text-gray-700 hover:text-amber-700"
              >
                Packages
              </a>
              <a
                href="#contact"
                className="block text-gray-700 hover:text-amber-700"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-5 z-10 mt-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              How it works
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              One click for you
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Our tourist destinations offer an unrivaled blend of natural
              beauty and cultural richness, where you can explore breathtaking
              landscapes, experience vibrant local cultures, and create
              unforgettable memories.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
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
                  className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-orange-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-yellow-500/20 z-10 group-hover:opacity-0 transition-opacity duration-500" />
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop"
              alt="Beach destination"
              className="w-full h-[500px] object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-3xl font-bold mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                Escape to paradise where dreams meet reality
              </h3>
              <p className="text-sm opacity-90 leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                Discover the adventure that lies beyond the ordinary, where
                every journey becomes an extraordinary story waiting to be told
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-5 -mt-10 mb-16 relative z-20 animate-fade-in-up animation-delay-300">
        <div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-center backdrop-blur-lg bg-opacity-95">
          <div className="flex-1 relative w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300"
              placeholder="Search destinations, cities, or countries..."
            />
          </div>
          <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transform hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 whitespace-nowrap active:scale-95">
            Search Now
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-5 mb-12 animate-fade-in-up animation-delay-400">
        <div className="flex gap-3 flex-wrap justify-center">
          {filters.map((filter, index) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-md"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Section */}
      <div className="max-w-7xl mx-auto px-5 pb-20">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up animation-delay-500">
          <div className="inline-block text-orange-500 text-sm font-bold uppercase tracking-widest mb-3 px-4 py-1 bg-orange-50 rounded-full">
            Tour packages
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
            Our tourist destination
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our tourist destinations offer an unrivaled blend of natural beauty
            and cultural richness
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-semibold animate-pulse">
              Loading amazing destinations...
            </p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="text-gray-400" size={48} />
            </div>
            <p className="text-2xl font-bold text-gray-400 mb-2">
              No destinations found
            </p>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination, index) => (
              <div
                key={destination._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Image */}
                <div className="relative h-70 overflow-hidden bg-gray-200">
                  <img
                    src={destination.imageUrls?.[0]}
                    alt={destination.title}
                    className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-sm font-bold text-orange-500 capitalize shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {destination.status}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(destination._id);
                    }}
                    className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                      favoriteCards.has(destination._id)
                        ? "bg-orange-500 rotate-0"
                        : "bg-white/95 hover:bg-orange-50"
                    }`}
                  >
                    <Heart
                      size={20}
                      className={`transition-all duration-300 ${
                        favoriteCards.has(destination._id)
                          ? "text-white fill-white scale-110"
                          : "text-orange-500 hover:scale-110"
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        {destination.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin size={16} className="text-orange-500" />
                        <span>{destination.destination}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                        ${destination.price}
                      </div>
                    </div>
                  </div>

                  {/* Card Meta */}
                  <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Clock size={16} className="text-orange-500" />
                      <span className="font-medium">
                        {destination.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Users size={16} className="text-orange-500" />
                      <span className="font-medium">{destination.group}</span>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold ml-auto">
                      <Star size={16} className="fill-yellow-500" />
                      <span>{destination.rating}</span>
                      <span className="text-gray-400 font-normal">
                        ({destination.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="items-center gap-1 text-yellow-500 text-sm font-bold ml-auto">
                    <span>
                      <span>Started at: </span>
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

                  {/* Book Now Button */}
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:shadow-lg active:scale-95">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More Button */}
        {!loading && filteredDestinations.length > 0 && (
          <div className="text-center mt-16 animate-fade-in-up animation-delay-600">
            <button className="inline-flex items-center gap-3 px-12 py-4 bg-white border-2 border-orange-500 text-orange-500 rounded-full text-base font-bold hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white hover:border-transparent transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 active:scale-95 group">
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
