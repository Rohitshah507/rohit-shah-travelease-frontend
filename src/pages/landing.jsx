// src/pages/Hero.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, MapPin, Calendar, Users, Star } from "lucide-react";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";

const Hero = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rootRef = useRef(null);

  const location = useLocation();
  const islanding = location.pathname === "/home";

  // ── Scroll handler ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Animated star field ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let W, H;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    const mkStar = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.004 + 0.001,
      drift: (Math.random() - 0.5) * 0.02,
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.phase += s.speed;
        s.x += s.drift;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        if (s.r > 0.9) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${alpha * 0.08})`;
          ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    stars = Array.from({ length: 280 }, mkStar);
    draw();

    const handleResize = () => {
      cancelAnimationFrame(animRef.current);
      resize();
      stars = Array.from({ length: 280 }, mkStar);
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ── Shooting stars ──────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const spawn = () => {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;
        left:${Math.random() * 80 + 5}%;top:${Math.random() * 35}%;
        animation:shootStar ${1.5 + Math.random() * 2}s linear forwards;
        pointer-events:none;z-index:1;opacity:0;
      `;
      root.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    };
    const id = setInterval(spawn, 2800);
    return () => clearInterval(id);
  }, []);

  const destinations = [
    {
      image:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
      title: "Zhangjiajie",
      location: "Hunan, China",
      description: "Towering sandstone pillars rise through misty clouds",
      rating: 4.9,
    },
    {
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      title: "Guilin Mountains",
      location: "Guangxi, China",
      description: "Karst peaks and peaceful rivers create stunning vistas",
      rating: 4.8,
    },
    {
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
      title: "Giant Buddha",
      location: "Leshan, China",
      description: "Majestic ancient statue carved into cliff face",
      rating: 4.7,
    },
  ];

  return (
    <>
      {/* ── Keyframe injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        @keyframes shootStar {
          0%   { opacity: 0; transform: translateX(0) translateY(0) scaleX(1); }
          10%  { opacity: 1; }
          80%  { opacity: 0.3; }
          100% { opacity: 0; transform: translateX(-400px) translateY(200px) scaleX(80); }
        }
        @keyframes pulseAtmo   { from { opacity: 0.4; } to { opacity: 0.75; } }
        @keyframes fadeUp      { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blinkDot    { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes scrollPulse { 0%,100% { opacity: 0.3; transform: scaleY(1); } 50% { opacity: 0.8; transform: scaleY(1.2); } }

        .te-login-btn {
          padding: 8px 22px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50px;
          font-size: 12px;
          color: #fff;
          background: transparent;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          letter-spacing: 1px;
          transition: all 0.35s;
          position: relative;
          overflow: hidden;
        }
        .te-login-btn:hover {
          border-color: rgba(232,160,69,0.7);
          color: #e8a045;
          box-shadow: 0 0 20px rgba(232,160,69,0.2);
        }

        /* Dark destination cards */
        .te-dest-card {
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: transform 0.4s ease, border-color 0.4s ease;
        }
        .te-dest-card:hover {
          transform: translateY(-8px);
          border-color: rgba(232,160,69,0.3);
        }
        .te-dest-card:hover img {
          transform: scale(1.08);
        }
        .te-dest-card img {
          transition: transform 0.6s ease;
        }

        /* Dark feature cards */
        .te-feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.3s ease;
        }
        .te-feat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(232,160,69,0.25);
          background: rgba(232,160,69,0.04);
        }
        .te-feat-card:hover h3 {
          color: #e8a045;
        }

        /* Planet atmosphere pulse */
        .te-atmo-pulse {
          animation: pulseAtmo 3s ease-in-out infinite alternate;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center">
                <span
                  className="text-white font-black text-[10px] tracking-wide"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  TE
                </span>
              </div>
              <span
                className="text-lg sm:text-xl font-semibold text-white tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                TravelEase
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {["Home", "Destinations", "TourList", "About", "Contact"].map(
                (item, i) => (
                  <a
                    key={item}
                    href={`#${["home", "destinations", "experiences", "about", "contact"][i]}`}
                    className="text-white/40 hover:text-white transition-colors text-xs font-normal tracking-widest cursor-pointer uppercase"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {item}
                  </a>
                ),
              )}
            </div>

            {/* Login + hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="te-login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="md:hidden p-1 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X size={22} className="text-white" />
                ) : (
                  <Menu size={22} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pb-4 flex flex-col gap-3 bg-black/90 backdrop-blur-md rounded-xl px-4 pt-3 border border-white/10">
              {[
                ["Home", "#home"],
                ["Destinations", "#destinations"],
                ["Experiences", "#experiences"],
                ["About", "#about"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/50 hover:text-amber-400 text-sm font-medium py-1 border-b border-white/10 last:border-0 transition-colors"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {label}
                </a>
              ))}
              <button
                className="w-full text-white font-semibold py-2.5 rounded-full text-sm mt-1"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "linear-gradient(135deg, #e8a045, #c96a1a)",
                }}
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section
        id="home"
        ref={rootRef}
        className="relative h-screen min-h-[600px] overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Star canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* ── BLACK PLANET with horizon glow ── */}
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{
            bottom: "-140px",
            transform: "translateX(-50%)",
            width: "min(780px, 115vw)",
            height: "min(780px, 115vw)",
            zIndex: 1,
          }}
        >
          <svg
            viewBox="0 0 800 800"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              {/* Pure black planet */}
              <radialGradient id="planetFill" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#0a0a0a" />
                <stop offset="70%" stopColor="#050505" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* Horizon atmospheric glow */}
              <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
                <stop offset="0%" stopColor="rgba(200,230,255,0.9)" />
                <stop offset="30%" stopColor="rgba(160,200,255,0.5)" />
                <stop offset="60%" stopColor="rgba(100,160,255,0.2)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* Outer atmosphere ring */}
              <radialGradient id="atmoRing" cx="50%" cy="50%" r="50%">
                <stop offset="82%" stopColor="transparent" />
                <stop offset="90%" stopColor="rgba(160,210,255,0.12)" />
                <stop offset="95%" stopColor="rgba(200,230,255,0.25)" />
                <stop offset="100%" stopColor="rgba(220,240,255,0.08)" />
              </radialGradient>
              {/* Bottom bright spill */}
              <radialGradient id="bottomSpill" cx="50%" cy="98%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="20%" stopColor="rgba(200,225,255,0.4)" />
                <stop offset="50%" stopColor="rgba(140,190,255,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <clipPath id="planetClip">
                <circle cx="400" cy="400" r="370" />
              </clipPath>
            </defs>

            {/* Wide diffuse glow below planet */}
            <ellipse
              cx="400"
              cy="750"
              rx="340"
              ry="120"
              fill="rgba(160,210,255,0.08)"
              className="te-atmo-pulse"
            />
            <ellipse
              cx="400"
              cy="780"
              rx="280"
              ry="90"
              fill="rgba(200,230,255,0.06)"
            />

            {/* Atmosphere ring */}
            <circle
              cx="400"
              cy="400"
              r="370"
              fill="url(#atmoRing)"
              className="te-atmo-pulse"
            />

            {/* Planet body — pure black */}
            <circle cx="400" cy="400" r="368" fill="url(#planetFill)" />

            {/* Horizon glow on planet bottom */}
            <ellipse
              cx="400"
              cy="760"
              rx="370"
              ry="160"
              fill="url(#horizonGlow)"
              clipPath="url(#planetClip)"
              className="te-atmo-pulse"
            />

            {/* Bright horizon line */}
            <ellipse
              cx="400"
              cy="768"
              rx="320"
              ry="50"
              fill="url(#bottomSpill)"
              clipPath="url(#planetClip)"
            />

            {/* Thin bright rim arc */}
            <path
              d="M 32,400 A 368,368 0 0,0 768,400"
              fill="none"
              stroke="rgba(220,240,255,0.35)"
              strokeWidth="1.5"
              clipPath="url(#planetClip)"
              transform="rotate(165, 400, 400)"
            />

            {/* Planet edge glow ring */}
            <circle
              cx="400"
              cy="400"
              r="368"
              fill="none"
              stroke="rgba(180,215,255,0.2)"
              strokeWidth="2"
            />

            {/* Subtle darkness on top half (terminator effect) */}
            <ellipse
              cx="400"
              cy="40"
              rx="380"
              ry="280"
              fill="rgba(0,0,0,0.25)"
              clipPath="url(#planetClip)"
            />
          </svg>
        </div>

        {/* Mountain silhouette */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
          viewBox="0 0 1400 280"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax meet"
          style={{ zIndex: 3 }}
        >
          <defs>
            <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
          <path
            d="M0,280 L0,220 Q50,215 80,180 Q110,145 140,90 Q155,65 165,45 Q175,25 185,15 L195,5 L205,15 Q215,28 225,50 Q235,75 250,100 Q280,148 310,175 Q340,200 380,215 Q420,228 460,220 Q490,210 520,185 Q545,165 565,140 Q580,120 590,105 Q600,90 610,78 L618,65 L626,78 Q638,98 650,120 Q668,148 690,168 Q720,192 755,205 Q785,215 820,210 Q855,203 885,185 Q910,168 930,148 Q950,128 965,108 Q978,90 988,75 L996,62 L1005,75 Q1018,95 1035,118 Q1058,148 1085,168 Q1112,188 1145,200 Q1175,210 1210,205 Q1245,198 1275,180 Q1300,165 1320,148 Q1340,132 1355,115 Q1368,100 1378,88 L1388,75 L1400,100 L1400,280 Z"
            fill="url(#mtGrad)"
          />
        </svg>

        {/* Horizon fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "220px",
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* Hero text content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 sm:px-8"
          style={{ zIndex: 5, paddingBottom: "180px", paddingTop: "80px" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 sm:mb-8"
            style={{
              border: "1px solid rgba(232,160,69,0.3)",
              background: "rgba(232,160,69,0.05)",
              animation: "fadeUp 1s ease 0.2s both",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{ animation: "blinkDot 2s ease-in-out infinite" }}
            />
            <span
              className="text-amber-400/85 text-[10px] sm:text-xs tracking-[2px] uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Nepal Travel Agency
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-white font-light leading-tight mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(40px, 8vw, 86px)",
              letterSpacing: "-1px",
              animation: "fadeUp 1s ease 0.4s both",
            }}
          >
            Discover Journeys
            <br />
            <span
              style={{
                fontWeight: 700,
                background: "linear-gradient(135deg,#e8c070,#e8a045,#d4762a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Written in Mountains
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/45 max-w-lg mx-auto font-light leading-relaxed mb-8 sm:mb-10"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(13px, 1.8vw, 16px)",
              animation: "fadeUp 1s ease 0.6s both",
            }}
          >
            A gateway to the roof of the world — sacred trails, ancient temples,
            and Himalayan horizons that reshape how you see the earth.
          </p>

          {/* Stats */}
          <div
            className="flex items-center gap-6 sm:gap-10 justify-center mb-8 sm:mb-10"
            style={{ animation: "fadeUp 1s ease 0.7s both" }}
          >
            {[
              ["8,849m", "Mt. Everest"],
              ["4,000+", "Trek Routes"],
              ["240+", "Destinations"],
            ].map(([num, label], i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className="w-px h-7 bg-white/10" />}
                <div className="text-center">
                  <div
                    className="text-amber-400 font-bold"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(18px,3vw,26px)",
                    }}
                  >
                    {num}
                  </div>
                  <div
                    className="text-white/35 mt-0.5"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {label}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ animation: "fadeUp 1s ease 0.8s both" }}
          >
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(135deg, #e8a045, #c96a1a)",
                boxShadow: "0 8px 30px rgba(232,160,69,0.25)",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(232,160,69,0.42)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(232,160,69,0.25)")
              }
            >
              Explore Nepal
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 rounded-full text-sm font-normal text-white/75 hover:text-white transition-all duration-300"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              Plan Your Trek
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            bottom: "72px",
            zIndex: 7,
            animation: "fadeUp 1s ease 1s both",
          }}
        >
          <span
            className="text-white/25 text-[9px] tracking-[2.5px] uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Scroll
          </span>
          <div
            className="w-px h-9 origin-top"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))",
              animation: "scrollPulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Partner strip */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center flex-wrap gap-x-6 gap-y-2 px-4 py-3 sm:py-4"
          style={{
            zIndex: 6,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
          }}
        >
          <span
            className="text-white/25 text-[10px] tracking-[2px] uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Trusted by
          </span>
          <div className="w-px h-3.5 bg-white/10 hidden sm:block" />
          {[
            "Nepal Tourism Board",
            "Himalayan Trust",
            "TAAN Nepal",
            "NMA",
            "Everest Base Camp",
          ].map((name, i) => (
            <React.Fragment key={name}>
              {i > 0 && (
                <div className="w-px h-3.5 bg-white/10 hidden sm:block" />
              )}
              <span
                className="text-white/20 hover:text-white/45 transition-colors cursor-default"
                style={{
                  fontSize: "clamp(9px,1.5vw,11px)",
                  letterSpacing: "1.5px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS — dark theme ── */}
      <section
        id="destinations"
        style={{
          background:
            "linear-gradient(to bottom, #000 0%, #070a0e 30%, #0a0f16 60%, #0d1520 100%)",
          padding: "100px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 md:mb-20">
            <p
              className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Curated Journeys
            </p>
            <h2
              className="text-white mb-3 sm:mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 700,
              }}
            >
              Iconic Destinations
            </h2>
            <p
              className="text-white/40 text-base sm:text-lg max-w-3xl mx-auto px-2 leading-relaxed"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Handpicked locations that capture the soul of Asia — from misty
              mountains to timeless wonders
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 lg:gap-6">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="te-dest-card"
                onClick={() => navigate("/login")}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: "280px" }}
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                    }}
                  />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h3
                      className="text-white mb-1"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "28px",
                        fontWeight: 700,
                      }}
                    >
                      {dest.title}
                    </h3>
                    <p
                      className="flex items-center gap-1.5 text-white/65"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "13px",
                      }}
                    >
                      <MapPin size={13} /> {dest.location}
                    </p>
                  </div>
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1.5 text-white font-semibold text-sm px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {dest.rating}
                  </div>
                </div>
                <div className="p-5">
                  <p
                    className="text-white/45 leading-relaxed"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    {dest.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES — dark theme ── */}
      <section
        id="experiences"
        style={{
          background:
            "linear-gradient(to bottom, #0d1520 0%, #060a10 50%, #000 100%)",
          padding: "100px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-16 items-center mb-14 sm:mb-20 lg:mb-28">
            <div
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              <img
                src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80"
                alt="Vibrant Asian Night Festival"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ height: "clamp(300px, 45vw, 500px)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                }}
              />
              <div className="absolute inset-0 flex items-end p-6 sm:p-10">
                <p
                  className="text-white drop-shadow-lg"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(18px, 2.5vw, 24px)",
                    fontWeight: 700,
                  }}
                >
                  Feel the pulse of ancient traditions
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-8">
              <p
                className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-widest"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Authentic Cultural Immersion
              </p>
              <h2
                className="text-white leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(32px, 4vw, 52px)",
                  fontWeight: 700,
                }}
              >
                Live the Heritage of Asia
              </h2>
              <p
                className="text-white/45 leading-relaxed"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(14px, 1.6vw, 16px)",
                }}
              >
                Step into living history — lantern-lit streets, meditative tea
                rituals, temple ceremonies, and artisan workshops that connect
                you deeply with centuries-old traditions.
              </p>
              <ul className="space-y-4 sm:space-y-6">
                {[
                  "Master traditional tea ceremonies & calligraphy",
                  "Join lantern festivals & moonlit cultural performances",
                  "Learn ancient crafts from master artisans",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #e8a045, #c96a1a)",
                      }}
                    >
                      <ChevronRight className="text-white" size={18} />
                    </div>
                    <span
                      className="text-white/65 pt-1.5"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(14px, 1.5vw, 16px)",
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature cards — dark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 lg:gap-6">
            {[
              {
                icon: Calendar,
                title: "Tailored Journeys",
                desc: "Build your perfect itinerary — every moment shaped by your desires",
              },
              {
                icon: Users,
                title: "Local Storytellers",
                desc: "Passionate guides who share hidden stories & authentic experiences",
              },
              {
                icon: Star,
                title: "Curated Luxury",
                desc: "Handpicked moments designed for wonder & lasting memories",
              },
            ].map((feature, i) => (
              <div key={i} className="te-feat-card">
                <feature.icon
                  className="text-amber-500 mb-4 sm:mb-6"
                  size={36}
                  strokeWidth={1.5}
                />
                <h3
                  className="text-white mb-2 sm:mb-4 transition-colors duration-300"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(20px, 2vw, 24px)",
                    fontWeight: 700,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-white/40 leading-relaxed"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Hero;
