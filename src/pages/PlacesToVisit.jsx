import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  UserCircle,
  Filter,
  Clock,
  DollarSign,
  Compass,
  TrendingUp,
  Award,
  ChevronDown,
  Eye,
  Calendar,
  Users,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../App";
import Footer from "../Components/Footer";

const PlacesToVisit = () => {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock user data (replace with actual auth)
  const user = {
    name: "Mahesh Dalley",
    email: "hinduboy4444@gmail.com",
    avatar: "MD",
  };

  const categories = [
    { id: "all", label: "All Places", icon: Compass },
    { id: "mountain", label: "Mountains", icon: TrendingUp },
    { id: "beach", label: "Beaches", icon: Award },
    { id: "city", label: "Cities", icon: MapPin },
    { id: "heritage", label: "Heritage", icon: Award },
  ];

  // Fetch places from API
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("PLACES:", response.data);
        setPlaces(response.data.getPackages || []);
      } catch (error) {
        console.error("FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Filter and sort places
  const filteredPlaces = places
    .filter((place) => {
      const matchesSearch =
        place.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.destination?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || place.category === selectedCategory;
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "budget" && place.price < 100) ||
        (priceFilter === "mid" && place.price >= 100 && place.price < 500) ||
        (priceFilter === "luxury" && place.price >= 500);
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // popular (default order)
    });

  const toggleWishlist = (placeId) => {
    setWishlist((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId],
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* NAVBAR */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="bg-gradient-to-r from-white to-orange-50 shadow-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Compass size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-black">
                <span className="text-orange-600">Travel</span>
                <span className="text-gray-800">Ease</span>
              </h1>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="/home"
                className="text-gray-600 hover:text-orange-600 font-semibold transition-colors"
              >
                Home
              </a>
              <a
                href="/destinations"
                className="text-gray-600 hover:text-orange-600 font-semibold transition-colors"
              >
                Destinations
              </a>
              <a
                href="/places-to-visit"
                className="text-orange-600 font-bold border-b-2 border-orange-600"
              >
                Places to Visit
              </a>
              <a
                href="/packages"
                className="text-gray-600 hover:text-orange-600 font-semibold transition-colors"
              >
                Packages
              </a>
              <a
                href="/tourist"
                className="text-gray-600 hover:text-orange-600 font-semibold transition-colors"
              >
                Tourist
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button className="relative p-2 hover:bg-orange-50 rounded-xl transition-colors">
                <ShoppingCart size={24} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {user.avatar}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-[slideDown_0.2s_ease-out]">
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 font-black text-lg shadow-md">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-white/80">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-xl transition-colors text-left"
                      >
                        <UserCircle size={20} className="text-orange-600" />
                        <span className="font-semibold text-gray-700">
                          My Profile
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={20} className="text-red-500" />
                        <span className="font-semibold text-gray-700">
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* HERO SECTION */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-black text-white mb-4">
            Explore Amazing Places
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover breathtaking destinations, hidden gems, and unforgettable
            experiences
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
            <Search size={24} className="text-gray-400 ml-4" />
            <input
              type="text"
              placeholder="Search destinations, cities, attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 outline-none font-medium"
            />
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* FILTERS & CATEGORIES */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-300/50"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <span className="font-semibold text-gray-700">Filters:</span>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-orange-500 bg-white"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget ($100)</option>
              <option value="mid">Mid-Range ($100-$500)</option>
              <option value="luxury">Luxury ($500+)</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-orange-500 bg-white"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <p className="text-gray-600 font-medium">
            {filteredPlaces.length} places found
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PLACES GRID */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-64 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No places found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                onClick={() => navigate(`/booking/${place._id}`)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={
                      place.imageUrls?.[0] ||
                      "https://via.placeholder.com/400x300"
                    }
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(place._id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                  >
                    <Heart
                      size={20}
                      className={`${wishlist.includes(place._id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </button>

                  {/* Price Tag */}
                  <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                    <p className="text-xs text-gray-600 font-semibold">
                      Starting from
                    </p>
                    <p className="text-2xl font-black text-orange-600">
                      ${place.price}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg capitalize">
                    {place.status || "Active"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {place.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={16} className="text-orange-500" />
                    <span className="text-sm font-medium">
                      {place.destination}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {place.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {place.rating || "4.5"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/booking/${place._id}`);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} />
                      Book Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View details action
                      }}
                      className="px-4 py-2.5 border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* FOOTER */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      <Footer />
    </div>
  );
};

export default PlacesToVisit;
