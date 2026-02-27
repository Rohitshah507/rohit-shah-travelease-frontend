// src/pages/Hero.jsx
import React from "react";
import { ChevronRight, MapPin, Calendar, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const islanding = location.pathname === "/home";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black-500 text-white shadow-lg"
            : islanding
              ? "bg-transparent text-white"
              : "bg-transparent text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient from-amber-600 to-orange-700 rounded-lg flex items-center justify-center"></div>
              <span
                className={`text-2xl font-bold ${isScrolled ? "text-gray-900" : "text-white"}`}
              >
                TravelEase
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className={`hover:text-amber-600 transition cursor-pointer font-bold ${isScrolled ? "text-gray-700" : "text-white"}`}
              >
                Home
              </a>
              <a
                href="#destinations"
                className={`hover:text-amber-600 transition cursor-pointer font-bold ${isScrolled ? "text-gray-700" : "text-white"}`}
              >
                Destinations
              </a>
              <a
                href="#experiences"
                className={`hover:text-amber-600 transition cursor-pointer font-bold ${isScrolled ? "text-gray-700" : "text-white"}`}
              >
                TourList
              </a>
              <a
                href="#about"
                className={`hover:text-amber-600 transition cursor-pointer font-bold ${isScrolled ? "text-gray-700" : "text-white"}`}
              >
                About
              </a>
              <a
                href="#contact"
                className={`hover:text-amber-600 transition cursor-pointer font-bold ${isScrolled ? "text-gray-700" : "text-white"}`}
              >
                Contact
              </a>
            </div>

            <div className="hidden md:block">
              <button
                className="bg-gradient-to-r from-amber-600 to-orange-700 font-bold text-white px-6 py-2 rounded-full hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Book Now
              </button>
            </div>

            <div className="hidden md:block">
              <button
                className="bg-gradient-to-r from-gray-200 to-amber-600 font-bold text-white px-6 py-2 rounded-full hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="text-white" />
              ) : (
                <Menu className={isScrolled ? "text-gray-900" : "text-white"} />
              )}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a
                href="#home"
                className="block text-white hover:text-amber-300 cursor-pointer"
              >
                Home
              </a>
              <a
                href="#destinations"
                className="block text-white hover:text-amber-300 cursor-pointer"
              >
                Destinations
              </a>
              <a
                href="#experiences"
                className="block text-white hover:text-amber-300 cursor-pointer"
              >
                TourList
              </a>
              <a
                href="#about"
                className="block text-white hover:text-amber-300 cursor-pointer"
              >
                About
              </a>
              <a
                href="#contact"
                className="block text-white hover:text-amber-300 cursor-pointer"
              >
                Contact
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section – more dramatic, immersive, bigger type */}
      <section
        id="home"
        className="relative h-screen min-h-[800px] overflow-hidden"
      >
        <div
          className="absolute inset-0 cursor-pointer transition-transform duration-700 hover:scale-105"
          onClick={() => navigate("/signup")}
        >
          <img
            src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80"
            alt="Mystical Chinese Temple at Dawn"
            className="w-full h-full object-cover brightness-[0.75] scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>
        </div>

        <div className="relative h-full flex items-center justify-center z-10">
          <div className="text-center text-white px-5 sm:px-8 md:px-12 max-w-5xl">
            <p className="text-amber-300 font-medium tracking-[0.35em] text-sm sm:text-base md:text-lg uppercase mb-5 animate-pulse">
              Discover Ancient Wonders
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-2xl">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                Explore the Mystical
              </span>
              <br />
              Heritage of Asia
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-10 md:mb-12 text-gray-100/90 max-w-3xl mx-auto font-light drop-shadow-lg">
              Journey through breathtaking landscapes, sacred temples, and
              living traditions that have enchanted explorers for millennia.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-center">
              <button
                onClick={() => navigate("/signup")}
                className="group bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">Start Your Journey</span>
                <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="bg-white/15 backdrop-blur-xl border-2 border-white/40 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-white/25 hover:border-white/60 transition-all duration-300 shadow-lg">
                Watch Cinematic Trailer
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight
            className="text-white/80 rotate-90"
            size={40}
            strokeWidth={1.5}
          />
        </div>
      </section>

      {/* Destinations – glassmorphism cards + better hover */}
      <section
        id="destinations"
        className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-amber-700 font-semibold text-sm md:text-base uppercase tracking-widest mb-4">
              Curated Journeys
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5">
              Iconic Destinations
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              Handpicked locations that capture the soul of Asia — from misty
              mountains to timeless wonders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-3xl font-bold mb-1 drop-shadow-md">
                      {dest.title}
                    </h3>
                    <p className="flex items-center gap-2 text-base drop-shadow">
                      <MapPin size={18} /> {dest.location}
                    </p>
                  </div>

                  {/* Floating rating badge */}
                  <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-1 text-white font-semibold shadow-lg">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    {dest.rating}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences – richer visuals, premium cards */}
      <section
        id="experiences"
        className="py-24 md:py-32 bg-gradient-to-br from-teal-50 via-gray-50 to-amber-50/30"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center mb-20 lg:mb-28">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              <img
                src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80"
                alt="Vibrant Asian Night Festival"
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-end p-10">
                <p className="text-white text-2xl font-bold drop-shadow-lg">
                  Feel the pulse of ancient traditions
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-amber-700 font-semibold text-sm md:text-base uppercase tracking-widest">
                Authentic Cultural Immersion
              </p>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Live the Heritage of Asia
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed">
                Step into living history — lantern-lit streets, meditative tea
                rituals, temple ceremonies, and artisan workshops that connect
                you deeply with centuries-old traditions.
              </p>

              <ul className="space-y-6">
                {[
                  "Master traditional tea ceremonies & calligraphy",
                  "Join lantern festivals & moonlit cultural performances",
                  "Learn ancient crafts from master artisans",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <ChevronRight className="text-white" size={24} />
                    </div>
                    <span className="text-gray-800 text-lg font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature cards – premium look */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
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
              <div
                key={i}
                className="bg-white/80 backdrop-blur-lg border border-gray-100/80 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 group"
              >
                <feature.icon
                  className="text-amber-600 mb-6"
                  size={48}
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
