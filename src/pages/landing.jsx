import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plane,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Compass,
  MapPin,
  Star,
  Calendar,
  Heart,
  Quote,
  ChevronRight,
  MessageSquare,
  Users,
} from "lucide-react";
import { serverURL } from "../../App.jsx";
import { getToken } from "./Login.jsx";

// ─── PACKAGE HELPERS (same as TouristDashboard) ───────────────────────────────

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

const StarRating = ({ value, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={
          s <= value
            ? "text-amber-400 fill-amber-400"
            : "text-white/20 fill-transparent"
        }
        style={{
          filter:
            s <= value ? "drop-shadow(0 0 5px rgba(251,191,36,0.55))" : "none",
        }}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="relative rounded-[20px] p-5 border border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_10px_40px_rgba(139,92,246,0.18)] transition-all duration-500 bg-gradient-to-br from-[#1a0a3e]/80 to-[#0f0524]/80 backdrop-blur-sm">
    <div className="absolute top-4 right-5 text-violet-500/15 pointer-events-none">
      <Quote size={28} />
    </div>
    <StarRating value={review.rating} size={13} />
    <p className="text-[#c4b8df] text-sm leading-[1.85] mt-3 mb-4 italic">
      "{review.comment}"
    </p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
        {review.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white font-bold text-sm block">
          {review.name}
        </span>
        <div className="text-[#6b5a8e] text-xs">
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

// ─── MAIN LANDING COMPONENT ───────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Packages state
  const [packages, setPackages] = useState([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [favoriteCards, setFavoriteCards] = useState(new Set());

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // Search state
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTravelers, setSearchTravelers] = useState("2");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch packages (public endpoint — no token required for landing)
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setPkgLoading(true);
        // Try with token if available, else without
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers,
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

  // Fetch reviews (public)
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
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    if (!searchDestination.trim()) return;
    navigate(`/explore?search=${encodeURIComponent(searchDestination.trim())}`);
  };

  const toggleFavorite = (id) => {
    setFavoriteCards((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

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

  const reviewFilters = ["All", "5 Stars", "4 Stars", "3 Stars & below"];

  const services = [
    {
      img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
      icon: "✈️",
      title: "Flight Tickets",
      desc: "Book flights with real-time pricing and availability. Get instant confirmations and e-tickets delivered straight to your app.",
      benefit: "Save up to 15% compared to booking on multiple platforms.",
      reverse: false,
    },
    {
      img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      icon: "🏨",
      title: "Accommodations",
      desc: "Find and book hotels, hostels, and vacation rentals that match your preferences and budget.",
      benefit: "Price match guarantee on all accommodations.",
      reverse: true,
    },
    {
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
      icon: "🚗",
      title: "Transportation",
      desc: "Access local transportation options including rideshares, car rentals, and public transit.",
      benefit: "Seamless connections between all your travel points.",
      reverse: false,
    },
    {
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      icon: "🍽️",
      title: "Restaurants",
      desc: "Discover and reserve tables at local eateries with exclusive in-app discounts.",
      benefit: "Exclusive in-app discounts at 500+ partner restaurants.",
      reverse: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .blob-float { animation: blobFloat 6s ease-in-out infinite; }
        .blob-float-2 { animation: blobFloat 6s ease-in-out 2s infinite; }
        .blob-float-3 { animation: blobFloat 6s ease-in-out 4s infinite; }
        .anim-blink { animation: blink 2s ease-in-out infinite; }
        .spinner { animation: spin 0.8s linear infinite; }
        .fade-up { animation: fadeSlideIn 0.8s ease both; }
        .fade-up-2 { animation: fadeSlideIn 0.8s ease 0.15s both; }
        .fade-up-3 { animation: fadeSlideIn 0.8s ease 0.3s both; }
        .fade-up-4 { animation: fadeSlideIn 0.8s ease 0.45s both; }
      `}</style>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="blob-float absolute top-[-8%] left-[20%] w-[280px] h-[280px] sm:w-[520px] sm:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-[70px]" />
        <div className="blob-float-2 absolute top-[40%] right-[-5%] w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.13)_0%,transparent_70%)] blur-[80px]" />
        <div className="blob-float-3 absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[360px] sm:h-[360px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.15)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10">
        {/* ── NAVBAR ── */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "bg-[#07030f]/90 backdrop-blur-[16px] border-b border-violet-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
              : "bg-transparent"
          }`}
        >
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => scrollTo("home")}
          >
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-black">
              TE
            </div>
            <span
              className="text-xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Travel<span className="text-violet-400">Ease</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8">
            {[
              "home",
              "about",
              "packages",
              "services",
              "reviews",
              "contact",
            ].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(id);
                }}
                className="text-[#9e9ab5] text-sm font-medium hover:text-white transition-colors capitalize no-underline"
              >
                {id}
              </a>
            ))}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full text-sm font-semibold text-violet-300 bg-transparent border border-violet-500/40 hover:bg-violet-500/15 hover:border-violet-500/70 transition-all cursor-pointer"
          >
            Login
          </button>
        </nav>

        {/* ── HERO ── */}
        <div
          id="home"
          className="relative pt-24 pb-16 sm:pb-24 overflow-hidden min-h-screen flex items-center"
        >
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle,rgba(139,92,246,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="hidden lg:block absolute right-[-80px] top-[20%] w-[500px] h-[500px] rounded-full border border-violet-500/15 animate-spin [animation-duration:22s] pointer-events-none" />
          <div className="hidden sm:block absolute right-8 top-[30%] w-[280px] h-[280px] rounded-full border border-violet-500/10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-violet-500/10 border border-violet-500/20">
                <span className="w-2 h-2 rounded-full bg-violet-300 anim-blink" />
                <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-violet-400">
                  ✦ 500+ Destinations Worldwide
                </span>
              </div>
              <h1
                className="fade-up-2 font-black leading-tight mb-5 text-white"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2.4rem,5vw,4.5rem)",
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
              <p className="fade-up-3 text-[#9e9ab5] text-base sm:text-lg leading-relaxed max-w-[420px] mb-9">
                From ancient temples to pristine beaches — we craft
                unforgettable journeys tailored to your soul.
              </p>
              <div className="fade-up-4 flex flex-wrap gap-3 mb-12">
                <a
                  href="#packages"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("packages");
                  }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all no-underline"
                >
                  Explore Packages <ChevronRight size={16} />
                </a>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-violet-300 bg-violet-500/10 border border-violet-500/40 hover:bg-violet-500/20 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
              <div className="flex gap-8 sm:gap-12">
                {[
                  ["500+", "Destinations"],
                  ["10K+", "Happy Travelers"],
                  ["98%", "Satisfaction"],
                ].map(([num, label], i) => (
                  <div
                    key={label}
                    className="flex items-center gap-8 sm:gap-12"
                  >
                    {i > 0 && (
                      <div className="w-px bg-violet-500/30 h-10 mr-[-16px] sm:mr-[-20px]" />
                    )}
                    <div>
                      <div
                        className="text-[1.9rem] sm:text-[2.5rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {num}
                      </div>
                      <div className="text-[#6b5a8e] text-[0.62rem] font-semibold tracking-[0.15em] uppercase mt-1">
                        {label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <div className="rounded-[28px] p-6 sm:p-8 border border-violet-500/35 shadow-[0_0_60px_rgba(139,92,246,0.2)] bg-gradient-to-br from-[#1a0a3e] to-[#0f0524]">
              <h3
                className="text-[1.5rem] sm:text-[1.7rem] font-black text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Find Your Dream Trip
              </h3>
              <p className="text-[#6b5a8e] text-sm mb-6">
                Search from 500+ curated destinations
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                    Destination
                  </label>
                  <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-4 py-3 focus-within:border-violet-400/60 transition-colors">
                    <MapPin size={15} className="text-violet-500 shrink-0" />
                    <input
                      className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-violet-400/50 min-w-0"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                      Check-in
                    </label>
                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-3 py-3 focus-within:border-violet-400/60 transition-colors">
                      <Calendar
                        size={13}
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
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                      Travelers
                    </label>
                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-3 py-3 focus-within:border-violet-400/60 transition-colors">
                      <Users size={13} className="text-violet-500 shrink-0" />
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
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                >
                  <Compass size={15} /> Search Destinations
                </button>
              </div>
              <div className="mt-5 pt-5 border-t border-violet-500/20">
                <p className="text-[#6b5a8e] text-xs mb-2">🔥 Popular:</p>
                <div className="flex flex-wrap gap-2">
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
                      className="px-3 py-1.5 rounded-full text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 cursor-pointer hover:bg-violet-500/25 transition-all select-none"
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
        <div id="about" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="rounded-[24px] overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.2)] border border-violet-500/20">
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
                className="font-black text-white mb-5 leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                }}
              >
                The Kingdom We Call Home
              </h2>
              <p className="text-[#9e9ab5] mb-4 leading-[1.8] text-sm">
                Nestled in the Himalayas, Nepal is a land of stunning natural
                beauty, rich cultural heritage, and deep spiritual traditions.
              </p>
              <p className="text-[#9e9ab5] mb-8 leading-[1.8] text-sm">
                Our mission is to share the magic of Nepal with the world while
                preserving its unique culture and environment for future
                generations.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  ["5,500+", "Happy Travelers"],
                  ["98%", "Satisfaction Rate"],
                  ["16", "Years Experience"],
                  ["27+", "Tour Packages"],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="bg-violet-500/8 border border-violet-500/20 rounded-[16px] p-4 text-center hover:bg-violet-500/15 transition-all"
                  >
                    <div
                      className="text-[1.8rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {num}
                    </div>
                    <div className="text-[#6b5a8e] text-xs font-semibold mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-105 transition-all border-none cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div id="packages" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
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
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 spinner" />
                <p className="text-[#6b5a8e] font-semibold">
                  Loading packages...
                </p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-20">
                <MapPin size={48} className="text-violet-900 mx-auto mb-4" />
                <p className="text-[#6b5a8e] text-xl font-bold">
                  No packages available
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {packages.slice(0, 3).map((pkg, index) => {
                    const badge = getBadgeInfo(pkg, index);
                    const amenities = getAmenities(pkg);
                    const nights =
                      pkg.duration ||
                      (pkg.nights ? `${pkg.nights} Nights` : "—");
                    return (
                      <div
                        key={pkg._id}
                        className="rounded-[28px] overflow-hidden border border-violet-500/20 hover:border-violet-500/55 hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)] hover:-translate-y-1.5 transition-all duration-[400ms] cursor-pointer bg-gradient-to-br from-[#1a0a3e] to-[#120630]"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={pkg.imageUrls?.[0]}
                            alt={pkg.title}
                            className="w-full h-[220px] object-cover block hover:scale-[1.06] transition-transform duration-500"
                          />
                          <span
                            className={`absolute top-3 left-3 text-[0.68rem] font-bold px-3 py-1.5 rounded-full ${badgeClass[badge.cls]}`}
                          >
                            {badge.label}
                          </span>
                          <div className="absolute top-3 right-3 bg-[#07030f]/70 backdrop-blur-sm text-violet-300 text-[0.7rem] font-bold px-3 py-1.5 rounded-full border border-violet-500/30">
                            {nights}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(pkg._id);
                            }}
                            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${
                              favoriteCards.has(pkg._id)
                                ? "bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.5)]"
                                : "bg-[#07030f]/70 backdrop-blur-sm"
                            }`}
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
                        <div className="p-5 sm:p-6">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h3
                                className="text-[1.2rem] font-black text-white leading-tight"
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
                                className="text-[1.5rem] font-black leading-none bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                }}
                              >
                                Rs.{pkg.price}
                              </div>
                              <div className="text-[#6b5a8e] text-xs">
                                per person
                              </div>
                            </div>
                          </div>
                          {amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 my-3">
                              {amenities.map((a, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/12 text-violet-300 border border-violet-500/20"
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
                            <span className="ml-1 text-sm font-bold text-white">
                              {pkg.rating}
                            </span>
                            <span className="text-[#6b5a8e] text-xs">
                              {" "}
                              · {pkg.reviews} reviews
                            </span>
                          </div>
                          {pkg.startDate && (
                            <div className="flex items-center gap-1.5 text-xs text-[#6b5a8e] mb-4">
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
                            className="w-full py-3.5 rounded-[16px] font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all border-none cursor-pointer"
                            onClick={() => navigate(`/package/${pkg._id}`)}
                          >
                            Book This Package
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-10">
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full font-bold text-sm text-violet-300 bg-transparent border-2 border-violet-500/50 hover:bg-violet-500/15 hover:border-violet-500/80 transition-all cursor-pointer"
                  >
                    View All Packages <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SERVICES ── */}
        <div id="services" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
                ✦ What We Offer
              </div>
              <h2
                className="font-black text-white mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem,4vw,3.5rem)",
                }}
              >
                Our{" "}
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-[#6b5a8e] max-w-[500px] mx-auto leading-[1.7] text-sm">
                Everything you need for a perfect travel experience, all in one
                place.
              </p>
            </div>

            <div className="flex flex-col gap-20">
              {services.map((svc, i) => (
                <div
                  key={svc.title}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${svc.reverse ? "md:[direction:rtl]" : ""}`}
                >
                  <div
                    className={`relative rounded-[20px] overflow-hidden border border-violet-500/20 ${svc.reverse ? "[direction:ltr]" : ""}`}
                  >
                    <img
                      src={svc.img}
                      alt={svc.title}
                      className="w-full h-[320px] object-cover block"
                    />
                    <div className="absolute top-5 left-5 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-2xl shadow-[0_4px_20px_rgba(139,92,246,0.5)]">
                      {svc.icon}
                    </div>
                  </div>
                  <div className={svc.reverse ? "[direction:ltr]" : ""}>
                    <h3
                      className="text-[1.6rem] sm:text-[2rem] font-black text-white mb-4 bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {svc.title}
                    </h3>
                    <p className="text-[#9e9ab5] text-sm leading-[1.8] mb-5">
                      {svc.desc}
                    </p>
                    <div className="p-4 rounded-[14px] bg-violet-500/8 border border-violet-500/20 mb-6">
                      <div className="text-[0.62rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-2">
                        Key Benefit
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {svc.benefit}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-7 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-105 transition-all border-none cursor-pointer"
                    >
                      Book Now
                    </button>
                    <div className="w-14 h-[3px] rounded-full bg-gradient-to-r from-violet-500 to-violet-300 mt-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Band */}
            <div className="mt-20 rounded-[24px] p-10 sm:p-14 text-center border border-violet-500/35 bg-gradient-to-br from-violet-500/10 to-violet-900/10 shadow-[0_0_60px_rgba(139,92,246,0.12)]">
              <h2
                className="font-black text-white text-[1.8rem] sm:text-[2.4rem] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to start your journey?
              </h2>
              <p className="text-[#9e9ab5] mb-6 text-sm">
                Join thousands of travelers and experience the world like never
                before.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-10 py-4 rounded-full font-bold text-base text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.6)] hover:scale-105 transition-all border-none cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div id="reviews" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
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
              <p className="text-[#6b5a8e] max-w-[500px] mx-auto leading-[1.7] text-sm">
                Real stories from real adventurers — unfiltered and unsponsored.
              </p>
            </div>

            {/* Rating Summary */}
            <div className="rounded-[28px] p-6 sm:p-8 border border-violet-500/25 bg-gradient-to-br from-[#1a0a3e]/70 to-[#0f0524]/70 backdrop-blur-sm mb-8 max-w-[680px] mx-auto shadow-[0_0_50px_rgba(139,92,246,0.12)]">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-[4rem] sm:text-[4.5rem] font-black leading-none bg-gradient-to-r from-violet-300 via-violet-400 to-violet-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {avgRating}
                  </div>
                  <StarRating
                    value={Math.round(parseFloat(avgRating))}
                    size={18}
                  />
                  <div className="text-[#6b5a8e] text-xs mt-2">
                    {reviews.length} total reviews
                  </div>
                </div>
                <div className="flex-1 w-full sm:min-w-[200px]">
                  {ratingCounts.map(({ n, count }) => (
                    <div key={n} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-violet-300 w-8 shrink-0">
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
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center mb-7">
              {reviewFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer
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

            {/* Review Cards */}
            {reviewsLoading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 spinner" />
                <p className="text-[#6b5a8e] font-semibold">
                  Loading reviews...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {filteredReviews.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare
                      size={40}
                      className="mx-auto mb-3 text-violet-900"
                    />
                    <p className="text-[#6b5a8e] font-semibold">
                      No reviews for this filter yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA to login for writing review */}
            <div className="mt-10 text-center p-8 rounded-[20px] border border-violet-500/20 bg-violet-500/5">
              <p className="text-[#9e9ab5] text-sm mb-4">
                Traveled with us? Share your experience with the community!
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-105 transition-all border-none cursor-pointer"
              >
                Login to Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div id="contact" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-[760px] mx-auto text-center">
            <div className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-violet-400 mb-3">
              ✦ Get In Touch
            </div>
            <h2
              className="font-black text-white mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem,4vw,3.2rem)",
              }}
            >
              Contact{" "}
              <span className="bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent">
                Us
              </span>
            </h2>
            <p className="text-[#9e9ab5] mb-10 leading-[1.7] text-sm">
              Have questions or feedback? We'd love to hear from you. Our team
              is always ready to assist.
            </p>
            <div className="rounded-[24px] p-10 sm:p-14 border border-violet-500/30 bg-gradient-to-br from-[#1a0a3e]/90 to-[#0f0524]/90 backdrop-blur-sm shadow-[0_0_60px_rgba(139,92,246,0.15)]">
              <p className="text-[#9e9ab5] text-sm mb-6">
                Contact us directly via email. We'll get back to you as soon as
                possible.
              </p>
              <div className="w-14 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-violet-300 mx-auto mb-8" />
              <a
                href="mailto:support@travellerease.com"
                className="inline-block px-10 py-4 rounded-full font-bold text-base text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.6)] hover:scale-105 transition-all no-underline"
              >
                support@travellerease.com
              </a>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="bg-[#040210] border-t border-violet-500/15 pt-14 pb-8 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-12 border-b border-violet-500/15">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-black">
                    TE
                  </div>
                  <span
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Travel<span className="text-violet-400">Ease</span>
                  </span>
                </div>
                <p className="text-[#6b5a8e] text-sm leading-[1.7]">
                  Your journey begins with us. Experience the future of travel
                  planning.
                </p>
                <div className="w-10 h-[2px] bg-gradient-to-r from-violet-500 to-violet-300 rounded-full mt-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-violet-400 mb-5">
                  Quick Links
                </h4>
                <ul className="flex flex-col gap-3">
                  {[
                    "home",
                    "about",
                    "packages",
                    "services",
                    "reviews",
                    "contact",
                  ].map((id) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollTo(id);
                        }}
                        className="text-[#6b5a8e] text-sm hover:text-violet-300 transition-colors no-underline capitalize"
                      >
                        {id}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-violet-400 mb-5">
                  Services
                </h4>
                <ul className="flex flex-col gap-3">
                  {[
                    "Flights",
                    "Hotels",
                    "Experiences",
                    "Transportation",
                    "Local Guide",
                  ].map((s) => (
                    <li key={s}>
                      <a
                        href="#"
                        className="text-[#6b5a8e] text-sm hover:text-violet-300 transition-colors no-underline"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-7 text-xs text-[#6b5a8e]">
              <span>© 2025 TravelEase Ltd. All rights reserved.</span>
              <span>Made with ♥ for adventurers</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
