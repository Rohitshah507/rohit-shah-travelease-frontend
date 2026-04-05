// TouristDashboard.jsx - Responsive version with functional search

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  ChevronRight,
  Plane,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Compass,
  MapPin,
  Star,
  Calendar,
  Heart,
  Send,
  Shield,
  Quote,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import Footer from "../../Components/Footer";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App.jsx";
import { getToken } from "../Login.jsx";

// ─── ORIGINAL HELPERS ─────────────────────────────────────────────────────────

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
  luxury: "bg-violet-500/25 text-violet-300 border border-violet-500/25",
};

// ─── REVIEW HELPERS ────────────────────────────────────────────────────────────

const StarRating = ({ value, onChange, size = 22, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => !readonly && onChange?.(s)}
        className={`transition-transform border-none bg-transparent p-0 ${!readonly ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
      >
        <Star
          size={size}
          className={
            s <= value
              ? "text-amber-400 fill-amber-400"
              : "text-white/20 fill-transparent"
          }
          style={{
            filter:
              s <= value
                ? "drop-shadow(0 0 5px rgba(251,191,36,0.55))"
                : "none",
          }}
        />
      </button>
    ))}
  </div>
);

const transformReview = (review) => ({
  id: review._id,
  name: review.user?.name || review.userId?.name || review.name || "Anonymous",
  avatar: (() => {
    const n = review.user?.name || review.userId?.name || review.name || "A";
    return n
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  })(),
  location:
    review.user?.location ||
    review.userId?.location ||
    review.location ||
    "Traveler",
  rating: review.rating,
  comment: review.comment || "",
  date: new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
  package:
    review.tourPackage?.title ||
    review.tourPackageId?.title ||
    review.packageName ||
    "General",
});

const ReviewCard = ({ review, isNew }) => (
  <div
    className={`relative rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 border transition-all duration-500
    bg-gradient-to-br from-[#1a0a3e]/80 to-[#0f0524]/80 backdrop-blur-sm
    ${
      isNew
        ? "border-violet-400/70 shadow-[0_0_32px_rgba(139,92,246,0.38)] animate-[fadeSlideIn_0.5s_ease_both]"
        : "border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_10px_40px_rgba(139,92,246,0.18)]"
    }`}
  >
    <div className="absolute top-4 right-5 text-violet-500/15 pointer-events-none">
      <Quote size={32} />
    </div>
    <StarRating value={review.rating} readonly size={14} />
    <p className="text-[#c4b8df] text-xs sm:text-sm leading-[1.85] mt-3 sm:mt-4 mb-4 sm:mb-5 italic">
      "{review.comment}"
    </p>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
        {review.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-white font-bold text-xs sm:text-sm">
            {review.name}
          </span>
          {isNew && (
            <span className="text-[0.5rem] sm:text-[0.55rem] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-300 border border-violet-500/40 shrink-0">
              NEW
            </span>
          )}
        </div>
        <div className="text-[#6b5a8e] text-[0.65rem] sm:text-xs">
          {review.location} · {review.date}
        </div>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-[0.62rem] text-violet-400/70 font-semibold max-w-[120px] leading-tight">
          {review.package}
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TouristDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [favoriteCards, setFavoriteCards] = useState(new Set());
  const navigate = useNavigate();

  // ── SEARCH STATE (new) ──
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTravelers, setSearchTravelers] = useState("2");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReviewIds, setNewReviewIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState("All");
  const [reviewForm, setReviewForm] = useState({
    tourPackageId: "",
    rating: 0,
    comment: "",
  });
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const reviewSectionRef = useRef(null);

  const reviewFilters = ["All", "5 Stars", "4 Stars", "3 Stars & below"];

  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setPkgLoading(true);
        const token = getToken();
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(response.data.getPackages || []);
      } catch (error) {
        console.error("Error fetching tour packages:", error);
        setPackages([]);
      } finally {
        setPkgLoading(false);
      }
    };
    fetchTourPackages();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await axios.get(`${serverURL}/api/review/all`);
        const raw = response.data.reviews || [];
        setReviews(raw.map(transformReview));
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        toast.error("Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // ── SEARCH HANDLER (new) ──
  const handleSearch = () => {
    if (!searchDestination.trim()) {
      toast.error("Please enter a destination to search");
      return;
    }
    navigate(`/explore?search=${encodeURIComponent(searchDestination.trim())}`);
  };

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleCardClick = (id) => navigate(`/package/${id}`);

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "5 Stars") return r.rating === 5;
    if (activeFilter === "4 Stars") return r.rating === 4;
    if (activeFilter === "3 Stars & below") return r.rating <= 3;
    return true;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  const validateReviewForm = () => {
    const errs = {};
    if (!reviewForm.tourPackageId)
      errs.tourPackageId = "Please select a package";
    if (!reviewForm.rating) errs.rating = "Please select a rating";
    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 10)
      errs.comment = "Comment must be at least 10 characters";
    setReviewErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!validateReviewForm()) return;

    const token = getToken();
    if (!token) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/review`,
        {
          tourPackageId: reviewForm.tourPackageId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data?.success && response.data?.review) {
        const saved = response.data.review;
        const pkg = packages.find((p) => p._id === reviewForm.tourPackageId);

        const uiReview = {
          id: saved._id,
          name: saved.user?.name || saved.userId?.name || "You",
          avatar: (() => {
            const n = saved.user?.name || saved.userId?.name || "Y";
            return n
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
          })(),
          location:
            saved.user?.location || saved.userId?.location || "Traveler",
          rating: saved.rating,
          comment: saved.comment,
          date: new Date(saved.createdAt || Date.now()).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" },
          ),
          package: pkg?.title || "General",
        };

        setReviews((prev) => [uiReview, ...prev]);
        setNewReviewIds((prev) => new Set([...prev, uiReview.id]));

        setTimeout(() => {
          setNewReviewIds((prev) => {
            const s = new Set(prev);
            s.delete(uiReview.id);
            return s;
          });
        }, 5000);

        setReviewForm({ tourPackageId: "", rating: 0, comment: "" });
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 3500);
        toast.success("Your review has been published! 🎉");

        reviewSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        throw new Error(response.data?.message || "Unexpected response");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to submit review. Please try again.";
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-8%] left-[20%] w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[520px] lg:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-[70px]" />
        <div className="absolute top-[40%] right-[-5%] w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[420px] lg:h-[420px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.13)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[360px] lg:h-[360px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.15)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* ── HERO ── */}
        <div
          id="home"
          className="relative pt-20 sm:pt-24 pb-12 sm:pb-20 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle,rgba(139,92,246,0.1)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="hidden lg:block absolute right-[-80px] top-[20%] w-[480px] h-[480px] rounded-full border border-violet-500/15 animate-spin [animation-duration:22s] pointer-events-none" />
          <div className="hidden sm:block absolute right-5 top-[30%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full border border-violet-500/10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full mb-5 sm:mb-7 bg-violet-500/10 border border-violet-500/20">
                <span className="w-2 h-2 rounded-full bg-violet-300 animate-pulse" />
                <span className="text-[0.6rem] sm:text-[0.68rem] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-violet-400">
                  ✦ 500+ Destinations Worldwide
                </span>
              </div>
              <h1
                className="font-black leading-tight mb-4 sm:mb-6 text-white"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2.2rem,5vw,4.5rem)",
                }}
              >
                Discover the
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                  World's Most
                </span>
                <br />
                Beautiful Places
              </h1>
              <p className="text-[#9e9ab5] text-base sm:text-lg leading-relaxed max-w-[420px] mb-8 sm:mb-10">
                From ancient temples to pristine beaches — we craft
                unforgettable journeys tailored to your soul.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-10 sm:mb-14">
                <a
                  href="#destinations"
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all no-underline"
                >
                  Explore Destinations <ChevronRight size={16} />
                </a>
                <a
                  href="#packages"
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm text-violet-300 bg-violet-500/10 border border-violet-500/40 hover:bg-violet-500/20 transition-all no-underline"
                >
                  View Packages
                </a>
              </div>
              <div className="flex gap-6 sm:gap-10">
                {[
                  ["500+", "Destinations"],
                  ["10K+", "Happy Travelers"],
                  ["98%", "Satisfaction"],
                ].map(([num, label], i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <div className="w-px bg-violet-500/30" />}
                    <div>
                      <div
                        className="text-[1.8rem] sm:text-[2.4rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {num}
                      </div>
                      <div className="text-[#6b5a8e] text-[0.6rem] sm:text-[0.7rem] font-semibold tracking-[0.15em] uppercase mt-1">
                        {label}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── SEARCH CARD (updated) ── */}
            <div className="rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 border border-violet-500/35 shadow-[0_0_60px_rgba(139,92,246,0.2)] bg-gradient-to-br from-[#1a0a3e] to-[#0f0524] mt-4 lg:mt-0">
              <h3
                className="text-[1.3rem] sm:text-[1.6rem] font-black text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Find Your Dream Trip
              </h3>
              <p className="text-[#6b5a8e] text-sm mb-5 sm:mb-7">
                Search from 500+ curated destinations
              </p>
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Destination Input */}
                <div>
                  <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                    Destination
                  </label>
                  <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-4 py-3 focus-within:border-violet-400/60 transition-colors">
                    <MapPin size={16} className="text-violet-500 shrink-0" />
                    <input
                      className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-violet-400/50 min-w-0"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>

                {/* Check-in + Travelers */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Check-in */}
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                      Check-in
                    </label>
                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-3 py-2.5 sm:py-3 focus-within:border-violet-400/60 transition-colors">
                      <Calendar
                        size={14}
                        className="text-violet-500 shrink-0"
                      />
                      <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="flex-1 bg-transparent text-violet-300 outline-none text-xs min-w-0"
                      />
                    </div>
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                      Travelers
                    </label>
                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-3 py-2.5 sm:py-3 focus-within:border-violet-400/60 transition-colors">
                      <Users size={14} className="text-violet-500 shrink-0" />
                      <select
                        value={searchTravelers}
                        onChange={(e) => setSearchTravelers(e.target.value)}
                        className="flex-1 bg-transparent text-violet-300 outline-none text-xs [&>option]:bg-[#1a0a3e] min-w-0"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 Persons</option>
                        <option value="3">3 Persons</option>
                        <option value="4">4+ Persons</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                >
                  <Compass size={16} /> Search Destinations
                </button>
              </div>

              {/* Popular Pills */}
              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-violet-500/20">
                <p className="text-[#6b5a8e] text-xs mb-2">🔥 Popular:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[
                    ["🏝", "Maldives"],
                    ["🗼", "Paris"],
                    ["🏯", "Kyoto"],
                    ["🏔", "Nepal"],
                  ].map(([icon, name]) => (
                    <span
                      key={name}
                      onClick={() =>
                        navigate(`/explore?search=${encodeURIComponent(name)}`)
                      }
                      className="px-3 py-1.5 rounded-full text-xs text-violet-300 bg-violet-500/12 border border-violet-500/20 cursor-pointer hover:bg-violet-500/25 transition-all select-none"
                    >
                      {icon} {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div id="about" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.2)] border border-violet-500/20">
              <img
                src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80"
                alt="Nepal"
                className="w-full object-cover block"
              />
            </div>
            <div>
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ Welcome
              </div>
              <h2
                className="font-black text-white mb-4 sm:mb-6 leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                }}
              >
                The Kingdom We Call Home
              </h2>
              <p className="text-[#9e9ab5] mb-4 sm:mb-5 leading-[1.8] text-sm">
                Nestled in the eastern Himalayas, Nepal is a land of stunning
                natural beauty, rich cultural heritage, and deep spiritual
                traditions.
              </p>
              <p className="text-[#9e9ab5] mb-6 sm:mb-8 leading-[1.8] text-sm">
                Our mission is to share the magic of Nepal with the world while
                preserving its unique culture and environment.
              </p>
              <button className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-105 transition-all border-none cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {[
              ["5,500", "Happy Travelers"],
              ["98%", "Satisfaction Rate"],
              ["16", "Years Experience"],
              ["27", "Tour Packages"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="bg-violet-500/8 border border-violet-500/20 rounded-[16px] sm:rounded-[20px] p-5 sm:p-9 text-center hover:bg-violet-500/15 hover:border-violet-500/40 transition-all"
              >
                <div
                  className="text-[2rem] sm:text-[3rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {num}
                </div>
                <div className="text-[#6b5a8e] text-xs sm:text-sm font-semibold mt-2">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESTINATIONS ── */}
        <div id="destinations" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 sm:gap-5">
              <div>
                <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                  ✦ Handpicked Gems
                </div>
                <h2
                  className="font-black text-white leading-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(2rem,4vw,3.5rem)",
                  }}
                >
                  Featured
                  <br />
                  <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                    Destinations
                  </span>
                </h2>
              </div>
              <p className="text-[#6b5a8e] max-w-[320px] leading-[1.7] text-sm">
                From ancient wonders to sun-drenched shores — every destination
                tells a timeless story.
              </p>
            </div>

            {/* Desktop: 3-col grid */}
            <div className="hidden md:grid grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-[20px] row-span-2 min-h-[560px] cursor-pointer border border-violet-500/20 hover:border-violet-500/50 transition-all group">
                <img
                  src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80"
                  alt="Dubai"
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/90 via-[#07030f]/20 to-transparent" />
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/85 text-white">
                    🏆 Editor's Pick
                  </span>
                </div>
                <div className="absolute bottom-0 p-7">
                  <div className="text-amber-400 text-sm mb-1">
                    ★★★★★ <span className="text-white/50 text-xs">4.9</span>
                  </div>
                  <h3
                    className="text-[2rem] font-black text-white leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Dubai, UAE
                  </h3>
                  <p className="text-violet-300 text-sm mb-4">
                    City of Gold & Wonders
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">
                      From{" "}
                      <span
                        className="text-[1.5rem] font-black bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        $899
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        navigate(
                          `/explore?search=${encodeURIComponent("Dubai")}`,
                        )
                      }
                      className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-violet-700 border-none cursor-pointer hover:scale-105 transition-all"
                    >
                      Explore →
                    </button>
                  </div>
                </div>
              </div>
              {[
                {
                  src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
                  label: "Romance",
                  title: "Paris, France",
                  search: "Paris",
                  price: "$699",
                  rating: "4.8",
                },
                {
                  src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
                  label: "Beach",
                  title: "Maldives",
                  search: "Maldives",
                  price: "$1,299",
                  rating: "5.0",
                },
                {
                  src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
                  label: "Temples",
                  title: "Kyoto, Japan",
                  search: "Kyoto",
                  price: "$849",
                  rating: "4.9",
                },
                {
                  src: "https://www.royalcaribbean.com/media-assets/pmc/content/dam/shore-x/santorini-jtr/soc2-pyrgos-village-and-fira-town-with-wine-tasting/stock-photo-fira-town-volcano-sea-santorini_149799614.jpg?w=1024",
                  label: "Islands",
                  title: "Santorini, Greece",
                  search: "Santorini",
                  price: "$999",
                  rating: "4.8",
                },
              ].map(({ src, label, title, search, price, rating }) => (
                <div
                  key={title}
                  onClick={() =>
                    navigate(`/explore?search=${encodeURIComponent(search)}`)
                  }
                  className="relative overflow-hidden rounded-[20px] h-[265px] cursor-pointer border border-violet-500/20 hover:border-violet-500/50 transition-all group"
                >
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/85 to-transparent" />
                  <div className="absolute top-3.5 right-3.5 text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/85 text-white">
                    {label}
                  </div>
                  <div className="absolute bottom-0 p-4">
                    <div className="text-amber-400 text-xs mb-1">
                      ★★★★★ {rating}
                    </div>
                    <div className="flex justify-between items-center">
                      <h3
                        className="text-xl font-black text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {title}
                      </h3>
                      <span
                        className="font-black text-sm bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: simple grid */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80",
                  label: "Editor's Pick",
                  title: "Dubai, UAE",
                  search: "Dubai",
                  price: "$899",
                  rating: "4.9",
                },
                {
                  src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
                  label: "Romance",
                  title: "Paris, France",
                  search: "Paris",
                  price: "$699",
                  rating: "4.8",
                },
                {
                  src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
                  label: "Beach",
                  title: "Maldives",
                  search: "Maldives",
                  price: "$1,299",
                  rating: "5.0",
                },
                {
                  src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
                  label: "Temples",
                  title: "Kyoto, Japan",
                  search: "Kyoto",
                  price: "$849",
                  rating: "4.9",
                },
              ].map(({ src, label, title, search, price, rating }) => (
                <div
                  key={title}
                  onClick={() =>
                    navigate(`/explore?search=${encodeURIComponent(search)}`)
                  }
                  className="relative overflow-hidden rounded-[16px] h-[200px] cursor-pointer border border-violet-500/20 group"
                >
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/85 to-transparent" />
                  <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-500/85 text-white">
                    {label}
                  </div>
                  <div className="absolute bottom-0 p-4">
                    <div className="text-amber-400 text-xs mb-0.5">
                      ★★★★★ {rating}
                    </div>
                    <div className="flex justify-between items-center">
                      <h3
                        className="text-base font-black text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {title}
                      </h3>
                      <span
                        className="font-black text-sm bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div id="packages" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ Best Value
              </div>
              <h2
                className="font-black text-white mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem,4vw,3.5rem)",
                }}
              >
                Popular Tour{" "}
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                  Packages
                </span>
              </h2>
              <p className="text-[#6b5a8e] max-w-[500px] mx-auto leading-[1.7] text-sm sm:text-base">
                All-inclusive packages — flights, hotels, meals, and expert
                guides.
              </p>
            </div>

            {pkgLoading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
                <p className="text-[#6b5a8e] font-semibold">
                  Loading packages...
                </p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-16">
                <MapPin size={48} className="text-violet-900 mx-auto mb-4" />
                <p className="text-[#6b5a8e] text-xl font-bold">
                  No packages available
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {packages.slice(0, 3).map((pkg, index) => {
                    const badge = getBadgeInfo(pkg, index);
                    const amenities = getAmenities(pkg);
                    const nights =
                      pkg.duration ||
                      (pkg.nights ? `${pkg.nights} Nights` : "—");
                    return (
                      <div
                        key={pkg._id}
                        className="rounded-[20px] sm:rounded-[28px] overflow-hidden border border-violet-500/20 hover:border-violet-500/55 hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)] hover:-translate-y-1.5 transition-all duration-[400ms] cursor-pointer bg-gradient-to-br from-[#1a0a3e] to-[#120630]"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={pkg.imageUrls?.[0]}
                            alt={pkg.title}
                            className="w-full h-[200px] sm:h-[220px] object-cover block hover:scale-[1.06] transition-transform duration-500"
                          />
                          <span
                            className={`absolute top-3 left-3 text-[0.6rem] sm:text-[0.68rem] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${badgeClass[badge.cls]}`}
                          >
                            {badge.label}
                          </span>
                          <div className="absolute top-3 right-3 bg-[#07030f]/70 backdrop-blur-sm text-violet-300 text-[0.65rem] sm:text-[0.7rem] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-violet-500/30">
                            {nights}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(pkg._id);
                            }}
                            className={`absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${favoriteCards.has(pkg._id) ? "bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.5)]" : "bg-[#07030f]/70 backdrop-blur-sm"}`}
                          >
                            <Heart
                              size={14}
                              className="text-white"
                              fill={
                                favoriteCards.has(pkg._id) ? "white" : "none"
                              }
                            />
                          </button>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h3
                                className="text-base sm:text-[1.3rem] font-black text-white leading-tight"
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                }}
                              >
                                {pkg.title}
                              </h3>
                              <p className="flex items-center gap-1 text-[#6b5a8e] text-xs mt-1">
                                <MapPin size={10} className="text-violet-500" />
                                {pkg.destination}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div
                                className="text-[1.3rem] sm:text-[1.6rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                }}
                              >
                                ${pkg.price}
                              </div>
                              <div className="text-[#6b5a8e] text-xs">
                                per person
                              </div>
                            </div>
                          </div>
                          {amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-2 my-2.5 sm:my-3.5">
                              {amenities.map((a, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.6rem] sm:text-xs font-semibold bg-violet-500/12 text-violet-300 border border-violet-500/20"
                                >
                                  <a.icon size={9} />
                                  {a.label}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-0.5 mb-3">
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
                            <span className="ml-1 text-xs sm:text-sm font-bold text-white">
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
                              {new Date(pkg.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </div>
                          )}
                          <button
                            className="w-full py-3 sm:py-3.5 rounded-[12px] sm:rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                            onClick={() => handleCardClick(pkg._id)}
                          >
                            Book This Package
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-8 sm:mt-12">
                  <button
                    onClick={() => navigate("/explore")}
                    className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full font-bold text-sm text-violet-300 bg-transparent border-2 border-violet-500/50 hover:bg-violet-500/15 hover:border-violet-500/80 transition-all cursor-pointer"
                  >
                    View All Packages <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── PLACES TO VISIT ── */}
        <div id="places" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ Experiences
              </div>
              <h2
                className="font-black text-white mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem,3.5vw,3rem)",
                }}
              >
                Places To Visit
              </h2>
              <p className="text-[#6b5a8e] max-w-[520px] mx-auto leading-[1.7] text-sm sm:text-base">
                Discover the hidden gems and iconic landmarks that make Nepal
                truly magical.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
              {[
                {
                  src: "https://national-parks.org/wp-content/uploads/2025/10/Sagarmatha-National-Park.jpg",
                  title: "Sagarmatha",
                  sub: "Best Mountain",
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/5/57/Kangchenjunga%2C_India.jpg",
                  title: "Kanchunjunga",
                  sub: "The Place of Great Happiness",
                },
              ].map(({ src, title, sub }) => (
                <div
                  key={title}
                  className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] h-[260px] sm:h-[380px] border border-violet-500/20 cursor-pointer group hover:border-violet-500/50 transition-all"
                >
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/88 to-transparent" />
                  <div className="absolute bottom-0 p-4 sm:p-6">
                    <h3
                      className="text-[1.3rem] sm:text-[1.6rem] font-black text-white mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {title}
                    </h3>
                    <p className="text-violet-400 text-sm mb-3 sm:mb-4">
                      {sub}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/explore?search=${encodeURIComponent(title)}`)
                      }
                      className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold text-violet-300 bg-transparent border border-violet-500/50 hover:bg-violet-500/20 transition-all cursor-pointer"
                    >
                      Discover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              {[
                {
                  src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/40/f6/3f/manaslu-circuit-trekking.jpg?w=1200&h=-1&s=1",
                  title: "Mt. Manaslu",
                  sub: "The Mountain of the Manaslu Region",
                },
                {
                  src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/d6/96/36/photo4jpg.jpg?w=600&h=500&s=1",
                  title: "Pokhara Lakeside",
                  sub: "Scenic Views of Phewa Lake",
                },
              ].map(({ src, title, sub }) => (
                <div
                  key={title}
                  className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] h-[260px] sm:h-[380px] border border-violet-500/20 cursor-pointer group hover:border-violet-500/50 transition-all"
                >
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/88 to-transparent" />
                  <div className="absolute bottom-0 p-4 sm:p-6">
                    <h3
                      className="text-[1.3rem] sm:text-[1.6rem] font-black text-white mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {title}
                    </h3>
                    <p className="text-violet-400 text-sm mb-3 sm:mb-4">
                      {sub}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/explore?search=${encodeURIComponent(title)}`)
                      }
                      className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold text-violet-300 bg-transparent border border-violet-500/50 hover:bg-violet-500/20 transition-all cursor-pointer"
                    >
                      Discover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHY US ── */}
        <div id="why-us" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ Why Wanderlux
              </div>
              <h2
                className="font-black text-white leading-tight mb-4 sm:mb-6"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem,3.5vw,3.2rem)",
                }}
              >
                We Make Travel
                <br />
                <span className="bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent">
                  Effortless
                </span>{" "}
                &<br />
                Extraordinary
              </h2>
              <p className="text-[#6b5a8e] leading-[1.8] mb-8 sm:mb-12 text-sm">
                From the moment you dream it to the moment you live it — we're
                with you every step.
              </p>
              <div className="flex flex-col gap-6 sm:gap-8">
                {[
                  {
                    title: "100% Verified Packages",
                    desc: "Every tour vetted by our travel experts for quality, safety, and real value.",
                    icon: "✓",
                  },
                  {
                    title: "24 / 7 Customer Support",
                    desc: "Wherever you are in the world, our support team is just one call away.",
                    icon: "◷",
                  },
                  {
                    title: "Best Price Guarantee",
                    desc: "Found it cheaper anywhere else? We'll match the price — no questions asked.",
                    icon: "$",
                  },
                ].map(({ title, desc, icon }) => (
                  <div key={title} className="flex gap-4 sm:gap-5 items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[12px] sm:rounded-[14px] flex items-center justify-center text-lg sm:text-xl text-violet-500 bg-violet-500/15 border border-violet-500/30">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                        {title}
                      </h3>
                      <p className="text-[#6b5a8e] text-xs sm:text-sm leading-[1.7]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              {[
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
                "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
                "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
                "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=600&q=80",
              ].map((src, i) => (
                <div
                  key={i}
                  className={`rounded-[14px] sm:rounded-[18px] overflow-hidden border border-violet-500/20 ${i === 1 || i === 2 ? "mt-4 sm:mt-6" : ""}`}
                >
                  <img
                    src={src}
                    alt=""
                    className={`w-full object-cover block ${i === 0 || i === 3 ? "h-[140px] sm:h-[200px]" : "h-[110px] sm:h-[160px]"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div
          id="reviews"
          className="py-12 sm:py-20 px-4 sm:px-6"
          ref={reviewSectionRef}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ Traveler Stories
              </div>
              <h2
                className="font-black text-white mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem,4vw,3.5rem)",
                }}
              >
                What Our Travelers{" "}
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                  Say About Us
                </span>
              </h2>
              <p className="text-[#6b5a8e] max-w-[500px] mx-auto leading-[1.7] text-sm sm:text-base">
                Real stories from real adventurers — unfiltered and unsponsored.
              </p>
            </div>

            {/* Rating summary */}
            <div className="rounded-[20px] sm:rounded-[28px] p-5 sm:p-8 border border-violet-500/25 bg-gradient-to-br from-[#1a0a3e]/70 to-[#0f0524]/70 backdrop-blur-sm mb-8 sm:mb-10 max-w-[680px] mx-auto shadow-[0_0_50px_rgba(139,92,246,0.12)]">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-[3.5rem] sm:text-[4.5rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {avgRating}
                  </div>
                  <StarRating
                    value={Math.round(parseFloat(avgRating))}
                    readonly
                    size={18}
                  />
                  <div className="text-[#6b5a8e] text-xs mt-2">
                    {reviews.length} total reviews
                  </div>
                </div>
                <div className="flex-1 w-full sm:min-w-[200px]">
                  {ratingCounts.map(({ n, count }) => (
                    <div
                      key={n}
                      className="flex items-center gap-2 sm:gap-3 mb-2"
                    >
                      <span className="text-xs text-violet-300 w-7 sm:w-8 shrink-0">
                        {n} ★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                          style={{
                            width: reviews.length
                              ? `${(count / reviews.length) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-[0.7rem] text-[#6b5a8e] w-4 shrink-0 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center mb-6 sm:mb-8">
              {reviewFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[0.65rem] sm:text-xs font-bold transition-all border cursor-pointer
                    ${
                      activeFilter === f
                        ? "bg-violet-500 text-white border-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.4)]"
                        : "bg-transparent text-violet-400 border-violet-500/35 hover:bg-violet-500/15 hover:border-violet-500/55"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Review cards */}
            {reviewsLoading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
                <p className="text-[#6b5a8e] font-semibold">
                  Loading reviews...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-12 sm:mb-16">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isNew={newReviewIds.has(review.id)}
                  />
                ))}
                {filteredReviews.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare
                      size={40}
                      className="mx-auto mb-3 text-violet-900"
                    />
                    <p className="text-[#6b5a8e] font-semibold">
                      No reviews for this filter yet. Be the first!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Write a review form ── */}
            <div className="rounded-[24px] sm:rounded-[32px] overflow-hidden border border-violet-500/30 shadow-[0_0_80px_rgba(139,92,246,0.15)] bg-gradient-to-br from-[#1a0a3e]/90 to-[#0f0524]/90 backdrop-blur-md">
              <div className="relative px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-violet-500/20 overflow-hidden">
                <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] sm:rounded-[15px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_4px_15px_rgba(139,92,246,0.4)]">
                    <MessageSquare size={17} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-[1.2rem] sm:text-[1.5rem] font-black text-white leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Share Your Experience
                    </h3>
                    <p className="text-[#6b5a8e] text-xs sm:text-sm">
                      Help future travelers with your honest feedback
                    </p>
                  </div>
                </div>
              </div>

              {reviewSubmitted && (
                <div className="mx-4 sm:mx-8 mt-5 sm:mt-6 p-3 sm:p-4 rounded-[14px] bg-emerald-500/15 border border-emerald-500/35 flex items-center gap-3 animate-[fadeSlideIn_0.4s_ease_both]">
                  <CheckCircle
                    size={18}
                    className="text-emerald-400 shrink-0"
                  />
                  <p className="text-emerald-300 font-semibold text-xs sm:text-sm">
                    Your review has been published! Thank you 🎉
                  </p>
                </div>
              )}

              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
                  <div className="flex flex-col gap-4 sm:gap-5">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                        Tour Package <span className="text-red-400">*</span>
                      </label>
                      <div
                        className={`flex items-center gap-3 rounded-[14px] px-4 py-3 border transition-colors ${reviewErrors.tourPackageId ? "border-red-500/50 bg-red-500/5" : "border-violet-500/25 bg-violet-500/8 focus-within:border-violet-400/60"}`}
                      >
                        <Plane size={14} className="text-violet-500 shrink-0" />
                        <select
                          value={reviewForm.tourPackageId}
                          onChange={(e) =>
                            setReviewForm((p) => ({
                              ...p,
                              tourPackageId: e.target.value,
                            }))
                          }
                          className="flex-1 bg-transparent outline-none text-white text-sm [&>option]:bg-[#1a0a3e] min-w-0"
                        >
                          <option value="">
                            Select the package you booked
                          </option>
                          {packages.map((pkg) => (
                            <option key={pkg._id} value={pkg._id}>
                              {pkg.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      {reviewErrors.tourPackageId && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {reviewErrors.tourPackageId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-3">
                        Your Rating <span className="text-red-400">*</span>
                      </label>
                      <div
                        className={`p-3 sm:p-4 rounded-[14px] border transition-colors ${reviewErrors.rating ? "border-red-500/50 bg-red-500/5" : "border-violet-500/20 bg-violet-500/8"}`}
                      >
                        <StarRating
                          value={reviewForm.rating}
                          onChange={(v) =>
                            setReviewForm((p) => ({ ...p, rating: v }))
                          }
                          size={26}
                        />
                        <p className="text-[#6b5a8e] text-xs mt-2">
                          {reviewForm.rating === 0
                            ? "Click to rate your experience"
                            : [
                                "",
                                "Terrible 😔",
                                "Poor 😕",
                                "Average 😐",
                                "Good 😊",
                                "Excellent! 🌟",
                              ][reviewForm.rating]}
                        </p>
                      </div>
                      {reviewErrors.rating && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {reviewErrors.rating}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5 p-3 sm:p-4 rounded-[14px] bg-violet-500/8 border border-violet-500/15">
                      <Shield
                        size={13}
                        className="text-violet-400 shrink-0 mt-0.5"
                      />
                      <p className="text-[#6b5a8e] text-[0.65rem] sm:text-[0.7rem] leading-[1.65]">
                        Your review will be publicly visible under your account
                        name. We never share your personal details with third
                        parties.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-5">
                    <div className="flex-1 flex flex-col">
                      <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                        Your Review <span className="text-red-400">*</span>
                      </label>
                      <div
                        className={`flex-1 rounded-[14px] border transition-colors ${reviewErrors.comment ? "border-red-500/50 bg-red-500/5" : "border-violet-500/25 bg-violet-500/8 focus-within:border-violet-400/60 focus-within:bg-violet-500/12"}`}
                      >
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((p) => ({
                              ...p,
                              comment: e.target.value,
                            }))
                          }
                          className="w-full min-h-[160px] sm:min-h-[220px] bg-transparent outline-none text-white text-sm placeholder:text-violet-400/40 resize-none p-3 sm:p-4 leading-[1.85]"
                          placeholder="Tell us about your experience — the highlights, what surprised you, and whether you'd recommend it to others..."
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        {reviewErrors.comment ? (
                          <p className="text-red-400 text-xs">
                            {reviewErrors.comment}
                          </p>
                        ) : (
                          <p className="text-[#6b5a8e] text-xs">
                            Minimum 10 characters
                          </p>
                        )}
                        <p
                          className={`text-xs font-semibold ${reviewForm.comment.length < 10 ? "text-[#6b5a8e]" : "text-violet-400"}`}
                        >
                          {reviewForm.comment.length} chars
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleReviewSubmit}
                      disabled={reviewSubmitting}
                      className="w-full flex items-center justify-center gap-2 sm:gap-2.5 py-3.5 sm:py-4 rounded-[14px] sm:rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {reviewSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                          Publishing…
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Publish My Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default TouristDashboard;
