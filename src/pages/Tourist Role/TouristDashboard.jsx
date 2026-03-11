import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Users,
  Award,
  Globe,
  ShoppingCart,
  LogOut,
  UserCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../Components/Navbar";

const TouristDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div
        id="home"
        className="relative min-h-screen flex items-center pt-[72px] overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-purple-800"
      >
        {/* Dot grid via Tailwind arbitrary bg */}
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        {/* Orbs */}
        <div className="animate-pulse absolute top-20 right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
        <div className="animate-pulse absolute bottom-28 left-12 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Spinning rings */}
        <div className="animate-spin absolute -right-20 top-1/4 w-[440px] h-[440px] rounded-full border-2 border-violet-400/20 pointer-events-none [animation-duration:18s]" />
        <div className="absolute -right-6 top-1/3 w-[280px] h-[280px] rounded-full border border-violet-300/15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 rounded-full px-4 py-2 mb-7">
              <span className="w-2 h-2 bg-violet-300 rounded-full animate-pulse" />
              <span className="text-violet-200 text-xs font-semibold tracking-widest uppercase">
                ✦ 500+ Destinations Worldwide
              </span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              Discover the
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
                World's Most
              </span>
              <br />
              Beautiful Places
            </h1>

            <p className="text-violet-200 text-lg leading-relaxed max-w-md mb-10 font-light">
              From ancient temples to pristine beaches — we craft unforgettable
              journeys tailored to your soul. Let every trip become a story
              worth telling.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <a
                href="#destinations"
                className="bg-white text-violet-800 font-semibold px-8 py-3.5 rounded-full hover:bg-violet-50 transition-colors shadow-xl shadow-black/20 flex items-center gap-2 text-sm"
              >
                Explore Destinations
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#packages"
                className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                View Packages
              </a>
            </div>

            <div className="flex gap-8">
              {[
                ["500+", "Destinations"],
                ["10K+", "Happy Travelers"],
                ["98%", "Satisfaction"],
              ].map(([num, label], i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div className="w-px bg-white/20" />}
                  <div>
                    <div className="text-4xl font-black text-violet-300">
                      {num}
                    </div>
                    <div className="text-violet-400 text-xs font-medium uppercase tracking-widest mt-1">
                      {label}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT — Search Card */}
          <div className="bg-gradient-to-br from-violet-400 via-gray-500 to-purple-800 rounded-3xl p-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-1">
                Find Your Dream Trip
              </h3>
              <p className="text-violet-300 text-sm mb-6">
                Search from 500+ curated destinations
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1.5 ml-1">
                    Destination
                  </label>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 focus-within:border-violet-400 rounded-2xl px-4 py-3.5 transition-colors">
                    <svg
                      className="w-4 h-4 text-violet-300 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    <input
                      className="flex-1 bg-transparent text-white placeholder-violet-400 outline-none text-sm"
                      placeholder="Where do you want to go?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1.5 ml-1">
                      Check-in
                    </label>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 focus-within:border-violet-400 rounded-2xl px-3 py-3.5 transition-colors">
                      <svg
                        className="w-4 h-4 text-violet-300 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <input
                        type="date"
                        className="flex-1 bg-transparent text-violet-200 outline-none text-xs min-w-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1.5 ml-1">
                      Travelers
                    </label>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 focus-within:border-violet-400 rounded-2xl px-3 py-3.5 transition-colors">
                      <svg
                        className="w-4 h-4 text-violet-300 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <select className="flex-1 bg-transparent text-violet-200 outline-none text-xs">
                        <option className="bg-violet-900">2 Persons</option>
                        <option className="bg-violet-900">1 Person</option>
                        <option className="bg-violet-900">3 Persons</option>
                        <option className="bg-violet-900">4+ Persons</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-violet-800 font-semibold py-4 rounded-2xl hover:bg-violet-50 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Destinations
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-violet-400 text-xs mb-3">🔥 Popular:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["🏝", "Maldives"],
                    ["🗼", "Paris"],
                    ["🏯", "Kyoto"],
                    ["🏔", "Nepal"],
                  ].map(([icon, name]) => (
                    <span
                      key={name}
                      className="bg-white/10 border border-white/15 text-violet-200 text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      {icon} {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 72"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 72L80 60C160 48 320 24 480 18C640 12 800 24 960 33C1120 42 1280 48 1360 51L1440 54V72H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          ABOUT
      ════════════════════════════════════════════════ */}
      <div id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80"
              alt="Buddha Statue"
              className="rounded-2xl shadow-2xl w-full object-cover"
            />
          </div>
          <div>
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Welcome
            </p>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              The Kingdom We Call Home
            </h2>
            <p className="text-gray-500 mb-5 leading-relaxed text-sm">
              Nestled in the eastern Himalayas, Nepal is a land of stunning
              natural beauty, rich cultural heritage, and deep spiritual
              traditions. This mystical kingdom offers travelers an unparalleled
              experience of pristine landscapes, ancient monasteries, and warm
              hospitality.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              Our mission is to share the magic of Nepal with the world while
              preserving its unique culture and environment. We believe in
              sustainable tourism that benefits local communities and protects
              our precious heritage.
            </p>
            <button className="border-2 border-violet-700 text-violet-700 px-6 py-2.5 rounded-full hover:bg-violet-700 hover:text-white transition font-semibold text-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════ */}
      <div className="bg-violet-50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["5,500", "Happy Travelers"],
            ["98%", "Satisfaction Rate"],
            ["16", "Years Experience"],
            ["27", "Tour Packages"],
          ].map(([num, label]) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl font-black text-violet-700 mb-2">
                {num}
              </div>
              <div className="text-gray-500 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          FEATURED DESTINATIONS
      ════════════════════════════════════════════════ */}
      <div id="destinations" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-6">
            <div>
              <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                ✦ Handpicked Gems
              </p>
              <h2 className="text-5xl lg:text-6xl font-black text-stone-900 leading-tight">
                Featured
                <br />
                <span className="text-violet-700">Destinations</span>
              </h2>
            </div>
            <p className="text-stone-500 max-w-sm leading-relaxed text-sm">
              From ancient wonders to sun-drenched shores — every destination
              tells a timeless story worth living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 tall */}
            <div className="group rounded-3xl overflow-hidden relative shadow-md cursor-pointer lg:row-span-2 min-h-[560px] hover:-translate-y-1.5 transition-transform duration-300">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80"
                alt="Dubai"
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-950/85 via-violet-900/30 to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  🏆 Editor's Pick
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-7">
                <div className="text-yellow-400 text-sm mb-1">
                  ★★★★★ <span className="text-white/60 text-xs ml-1">4.9</span>
                </div>
                <h3 className="text-3xl font-black text-white leading-tight">
                  Dubai, UAE
                </h3>
                <p className="text-violet-200 text-sm mt-1 mb-4">
                  City of Gold & Wonders
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">
                    From{" "}
                    <span className="text-violet-300 text-xl font-black">
                      $899
                    </span>
                  </span>
                  <button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-full transition-colors">
                    Explore →
                  </button>
                </div>
              </div>
            </div>

            {/* Cards 2-5 */}
            {[
              {
                src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
                alt: "Paris",
                label: "Romance",
                title: "Paris, France",
                price: "$699",
                rating: "4.8",
              },
              {
                src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
                alt: "Maldives",
                label: "Beach",
                title: "Maldives",
                price: "$1,299",
                rating: "5.0",
              },
              {
                src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
                alt: "Kyoto",
                label: "Temples",
                title: "Kyoto, Japan",
                price: "$849",
                rating: "4.9",
              },
              {
                src: "https://images.unsplash.com/photo-1543358851-a2b376a24f77?w=600&q=80",
                alt: "Santorini",
                label: "Islands",
                title: "Santorini, Greece",
                price: "$999",
                rating: "4.8",
              },
            ].map(({ src, alt, label, title, price, rating }) => (
              <div
                key={title}
                className="group rounded-3xl overflow-hidden relative shadow-md cursor-pointer h-[265px] hover:-translate-y-1.5 transition-transform duration-300"
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-white/90 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  {label}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <div className="text-yellow-400 text-xs mb-1">
                    ★★★★★ {rating}
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <span className="text-violet-300 font-black text-sm">
                      {price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <a
              href="places.html"
              className="inline-flex items-center gap-2 border-2 border-violet-600 text-violet-700 font-semibold px-9 py-3.5 rounded-full hover:bg-violet-700 hover:text-white transition-all text-sm"
            >
              View All Destinations
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          POPULAR PACKAGES
      ════════════════════════════════════════════════ */}
      <div id="packages" className="py-28 bg-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              ✦ Best Value
            </p>
            <h2 className="text-5xl lg:text-6xl font-black text-stone-900 mb-4">
              Popular Tour <span className="text-violet-700">Packages</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              All-inclusive packages — flights, hotels, meals, and expert guides
              — bundled for the best experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                src: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
                alt: "Bali",
                badge: "🔥 BESTSELLER",
                badgeCls: "bg-violet-700",
                nights: "7 Nights",
                title: "Bali Bliss",
                sub: "Indonesia · Cultural Retreat",
                price: "$799",
                tags: ["✈ Flights", "🏨 5-Star Hotel", "🍽 All Meals"],
                stars: "★★★★★",
                rating: "4.9",
                reviews: "324",
              },
              {
                src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
                alt: "India",
                badge: "⭐ POPULAR",
                badgeCls: "bg-orange-500",
                nights: "10 Nights",
                title: "Golden Triangle",
                sub: "India · Heritage Tour",
                price: "$649",
                tags: ["✈ Flights", "🏨 4-Star Hotel", "🎟 Guided Tours"],
                stars: "★★★★☆",
                rating: "4.7",
                reviews: "218",
              },
              {
                src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=80",
                alt: "Switzerland",
                badge: "💎 LUXURY",
                badgeCls: "bg-violet-500",
                nights: "8 Nights",
                title: "Swiss Alps Dream",
                sub: "Switzerland · Alpine Adventure",
                price: "$1,499",
                tags: ["✈ Flights", "🏨 5-Star Hotel", "🚠 Activities"],
                stars: "★★★★★",
                rating: "5.0",
                reviews: "186",
              },
            ].map((pkg) => (
              <div
                key={pkg.title}
                className="bg-white rounded-3xl overflow-hidden border border-violet-100 shadow-sm cursor-pointer hover:-translate-y-1.5 transition-transform duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={pkg.src}
                    alt={pkg.alt}
                    className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className={`absolute top-4 left-4 ${pkg.badgeCls} text-white text-xs font-bold px-3 py-1.5 rounded-full`}
                  >
                    {pkg.badge}
                  </span>
                  <div className="absolute top-4 right-4 bg-white/90 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    {pkg.nights}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-black text-stone-900">
                        {pkg.title}
                      </h3>
                      <p className="text-stone-400 text-sm mt-0.5">{pkg.sub}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-violet-700 text-2xl font-black">
                        {pkg.price}
                      </div>
                      <div className="text-stone-400 text-xs">per person</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 my-4">
                    {pkg.tags.map((t) => (
                      <span
                        key={t}
                        className="bg-violet-50 border border-violet-200 text-violet-700 text-xs px-2.5 py-1 rounded-full font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-yellow-400 text-sm mb-5">
                    {pkg.stars}{" "}
                    <span className="text-stone-400 text-xs font-normal">
                      {pkg.rating} · {pkg.reviews} reviews
                    </span>
                  </div>
                  <button className="w-full bg-violet-700 hover:bg-violet-800 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm shadow-md shadow-violet-100">
                    Book This Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          PLACES TO VISIT
      ════════════════════════════════════════════════ */}
      <div id="places" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Experiences
            </p>
            <h2 className="text-4xl font-black text-stone-900 mb-4">
              Places To Visit
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-sm">
              Discover the hidden gems and iconic landmarks that make Nepal a
              truly magical destination
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                className="relative group overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={src}
                  alt={title}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-black mb-1">{title}</h3>
                    <p className="text-sm text-white/80 mb-3">{sub}</p>
                    <button className="border border-white px-4 py-1.5 rounded-full text-sm hover:bg-white hover:text-gray-800 transition font-medium">
                      Discover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
                className="relative group overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={src}
                  alt={title}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-black mb-1">{title}</h3>
                    <p className="text-sm text-white/80 mb-3">{sub}</p>
                    <button className="border border-white px-4 py-1.5 rounded-full text-sm hover:bg-white hover:text-gray-800 transition font-medium">
                      Discover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════════ */}
      <div id="why-us" className="py-28 bg-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                ✦ Why Wanderlux
              </p>
              <h2 className="text-5xl lg:text-6xl font-black text-stone-900 leading-tight mb-6">
                We Make Travel
                <br />
                <span className="text-violet-700">Effortless</span> &<br />
                Extraordinary
              </h2>
              <p className="text-stone-500 text-lg leading-relaxed mb-12">
                From the moment you dream it to the moment you live it — we're
                with you every step of the way. No hidden fees, no
                disappointments, just pure wanderlust.
              </p>

              <div className="space-y-8">
                {[
                  {
                    title: "100% Verified Packages",
                    desc: "Every tour vetted by our travel experts for quality, safety, and real value — guaranteed.",
                    d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  },
                  {
                    title: "24 / 7 Customer Support",
                    desc: "Wherever you are in the world, our support team is just one call away — any hour.",
                    d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                  },
                  {
                    title: "Best Price Guarantee",
                    desc: "Found it cheaper anywhere else? We'll match the price — no questions asked.",
                    d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  },
                  {
                    title: "Tailor-Made Itineraries",
                    desc: "Our travel designers craft bespoke journeys designed just around you.",
                    d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
                  },
                ].map(({ title, desc, d }) => (
                  <div key={title} className="flex items-start gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center shadow-md shadow-violet-200">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d={d} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-stone-900 mb-1">
                        {title}
                      </h4>
                      <p className="text-stone-500 text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&q=80"
                  className="w-full h-56 object-cover rounded-3xl shadow-md"
                  alt="t1"
                />
                <img
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80"
                  className="w-full h-56 object-cover rounded-3xl shadow-md mt-10"
                  alt="t2"
                />
                <img
                  src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"
                  className="w-full h-56 object-cover rounded-3xl shadow-md -mt-4"
                  alt="t3"
                />
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80"
                  className="w-full h-56 object-cover rounded-3xl shadow-md mt-4"
                  alt="t4"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-violet-100 rounded-2xl shadow-2xl p-5 text-center pointer-events-none">
                <div className="text-4xl font-black text-violet-700">15+</div>
                <div className="text-stone-500 text-xs font-medium tracking-wide mt-1">
                  Years of Excellence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          WHY US — ICONS
      ════════════════════════════════════════════════ */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Why Us
            </p>
            <h2 className="text-4xl font-black text-stone-900 mb-4">
              We Do More Than Travel
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: Users,
                title: "Expert Local Guides",
                desc: "Our experienced guides are passionate storytellers who bring Nepal's history and culture to life.",
              },
              {
                Icon: Award,
                title: "Authentic Experiences",
                desc: "We create genuine connections with local communities and offer unique cultural immersion.",
              },
              {
                Icon: Globe,
                title: "Sustainable Tourism",
                desc: "We're committed to preserving Nepal's environment and supporting local communities.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 hover:shadow-xl transition-shadow rounded-2xl border border-transparent hover:border-violet-100"
              >
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-violet-700" size={30} />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3">
                  {title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CULTURAL SECTION
      ════════════════════════════════════════════════ */}
      <div className="py-20 px-6 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=80"
            alt="Cultural Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-violet-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            ✦ Immerse
          </p>
          <h2 className="text-4xl font-black mb-6">
            Experience Nepalese Culture & Festivals
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto text-sm">
            Witness ancient traditions come alive through vibrant festivals,
            sacred masked dances, and spiritual ceremonies. Participate in
            traditional archery, explore local markets, and connect with the
            warm-hearted Nepali people.
          </p>
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full transition font-semibold text-sm">
            View Festival Calendar
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CURATED TOUR PACKAGES (Nepal)
      ════════════════════════════════════════════════ */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Our Offerings
            </p>
            <h2 className="text-4xl font-black text-stone-900 mb-4">
              Curated Tour Packages
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                src: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
                title: "Cultural Heritage Tour",
                duration: "7 Days / 6 Nights",
                desc: "Explore ancient temples, monasteries, and immerse yourself in Nepali traditions.",
                price: "$1,850",
              },
              {
                src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
                title: "Himalayan Trekking",
                duration: "10 Days / 9 Nights",
                desc: "Trek through pristine valleys, high-altitude passes, and breathtaking mountain scenery.",
                price: "$2,450",
              },
              {
                src: "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=600&q=80",
                title: "Festival Experience",
                duration: "5 Days / 4 Nights",
                desc: "Witness vibrant masked dances and sacred rituals during Nepal's colorful festivals.",
                price: "$1,650",
              },
            ].map(({ src, title, duration, desc, price }) => (
              <div
                key={title}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              >
                <img
                  src={src}
                  alt={title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{duration}</p>
                  <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                    {desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-violet-700">
                      {price}
                    </span>
                    <button className="bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <div id="testimonials" className="py-28 bg-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              ✦ Happy Travelers
            </p>
            <h2 className="text-5xl lg:text-6xl font-black text-stone-900 mb-4">
              What Our <span className="text-violet-700">Travelers Say</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Authentic reviews from real adventures — because your trust means
              everything to us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-violet-100 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
              <div className="text-yellow-400 text-xl mb-5">★★★★★</div>
              <p className="italic text-stone-600 leading-relaxed mb-7 text-lg">
                "Our honeymoon in Santorini was absolutely magical. Every detail
                was perfect — from the sunset cruise to the private villa. We'll
                book again!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80"
                  className="w-12 h-12 rounded-full object-cover border-2 border-violet-200"
                  alt="Sarah"
                />
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    Sarah & James M.
                  </div>
                  <div className="text-violet-600 text-xs font-medium">
                    Santorini, Greece 🇬🇷
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-8 shadow-xl shadow-violet-200 bg-gradient-to-br from-violet-700 to-purple-800 hover:-translate-y-1.5 transition-transform duration-300">
              <div className="text-yellow-300 text-xl mb-5">★★★★★</div>
              <p className="italic text-white leading-relaxed mb-7 text-lg">
                "The Bali package was phenomenal — beautifully balanced between
                adventure, culture, and relaxation. The local guide was
                absolutely brilliant!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40"
                  alt="Michael"
                />
                <div>
                  <div className="font-bold text-white text-sm">
                    Michael Chen
                  </div>
                  <div className="text-violet-200 text-xs font-medium">
                    Bali, Indonesia 🇮🇩
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-violet-100 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
              <div className="text-yellow-400 text-xl mb-5">★★★★★</div>
              <p className="italic text-stone-600 leading-relaxed mb-7 text-lg">
                "When our flight got delayed, the team rearranged everything
                instantly with zero extra charge. World-class service — I'm a
                customer for life!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80"
                  className="w-12 h-12 rounded-full object-cover border-2 border-violet-200"
                  alt="Priya"
                />
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    Priya Sharma
                  </div>
                  <div className="text-violet-600 text-xs font-medium">
                    Kyoto, Japan 🇯🇵
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-violet-200 flex flex-wrap items-center justify-center gap-10">
            {[
              "Tripadvisor Travelers' Choice 2024",
              "IATA Certified Agency",
              "Travel & Leisure Award",
              "Lonely Planet Partner",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 text-stone-400 text-sm"
              >
                <span className="text-violet-500 font-bold">✓</span> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS DARK
      ════════════════════════════════════════════════ */}
      <div className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Testimonials
            </p>
            <h2 className="text-4xl font-black mb-4">What Our Travelers Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
                name: "Sarah Johnson",
                location: "United States",
                review:
                  "An absolutely life-changing experience! The attention to detail, cultural immersion, and stunning landscapes exceeded all expectations. Our guide was knowledgeable and made every moment special.",
              },
              {
                src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
                name: "David Chen",
                location: "Singapore",
                review:
                  "Nepal is a hidden paradise and this tour company made it accessible and unforgettable. From the monasteries to the festivals, every experience was authentic and deeply moving.",
              },
            ].map(({ src, name, location, review }) => (
              <div key={name} className="bg-gray-800 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <img
                    src={src}
                    alt={name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{name}</h4>
                    <p className="text-sm text-gray-400">{location}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic text-sm leading-relaxed">
                  "{review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════════ */}
      <div id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              ✦ Get In Touch
            </p>
            <h2 className="text-4xl font-black text-stone-900 mb-4">
              Start Your Journey
            </h2>
            <p className="text-stone-500 text-sm">
              Ready to explore the Land of the Thunder Dragon? Contact us today!
            </p>
          </div>

          <div className="bg-violet-50 rounded-3xl p-8 border border-violet-100">
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-violet-700 uppercase tracking-widest mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 text-sm bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-violet-700 uppercase tracking-widest mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-violet-700 uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 text-sm bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-violet-700 uppercase tracking-widest mb-1.5">
                  Message
                </label>
                <textarea
                  placeholder="Tell us about your dream trip…"
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 text-sm bg-white transition-colors resize-none"
                />
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Message sent! We'll get back to you soon.")
                  }
                  className="bg-violet-700 hover:bg-violet-800 text-white font-semibold px-12 py-3.5 rounded-full text-sm transition-all hover:scale-105 shadow-md shadow-violet-200"
                >
                  Send Message →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <div
        id="book"
        className="py-32 relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-purple-600"
      >
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
        <div className="animate-pulse absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
        <div className="animate-pulse absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-300/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 rounded-full px-5 py-2 text-violet-200 text-sm font-medium mb-8">
            <span className="animate-pulse">✈</span>
            Limited Spots Available — Book Early & Save
          </div>

          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            Your Next Great
            <br />
            Adventure Starts
            <br />
            <span className="text-violet-300">Right Now</span>
          </h2>

          <p className="text-violet-200 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop dreaming. Start exploring. Book today and receive up to{" "}
            <span className="text-white font-bold">20% off</span> on our most
            popular packages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#packages"
              className="bg-white text-violet-800 font-black px-10 py-4 rounded-full hover:bg-violet-50 transition-colors text-lg shadow-2xl shadow-violet-950/40"
            >
              Book Now — Save 20% 🎉
            </a>
            <a
              href="#destinations"
              className="border-2 border-white/50 text-white font-black px-10 py-4 rounded-full hover:bg-white/10 transition-colors text-lg"
            >
              Explore Places →
            </a>
          </div>

          <p className="text-violet-300 text-sm mt-8">
            Free cancellation within 48h · No booking fees · 24/7 support
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TouristDashboard;
