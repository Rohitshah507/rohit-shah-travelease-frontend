import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Star, Heart, Clock, Compass, TrendingUp,
  Award, Eye, Calendar, Mountain, Waves, Building2, Landmark,
  X, Sparkles, ChevronRight, Sun, Wind, Thermometer, Camera,
  Info, DollarSign, Bot, Send, Loader2
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import Footer from "../../Components/Footer";
import Navbar from "../../Components/Navbar";

// ─── AI Description Modal ─────────────────────────────────────────────────────
const AIModal = ({ place, onClose }) => {
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    generateDescription();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const generateDescription = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a travel expert and writer. Create a vivid, engaging travel guide description for:

Place: ${place.title}
Destination: ${place.destination}
Duration: ${place.duration}
Price: $${place.price}

Write a beautiful 3-paragraph travel guide covering:
1. What makes this place magical and unique (atmosphere, culture, landscape)
2. Top highlights, must-see spots, local experiences
3. Practical travel wisdom (what to expect, local tips, hidden gems)

Be poetic, inspiring, and specific. Make the traveler feel they MUST visit. Keep it under 300 words.`
          }]
        })
      });
      const data = await response.json();
      setAiText(data.content?.[0]?.text || "Unable to generate description.");
    } catch (err) {
      setAiText("Could not connect to AI. Please check your API key setup.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!userQuestion.trim() || chatLoading) return;
    const q = userQuestion.trim();
    setUserQuestion("");
    setChatHistory(prev => [...prev, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a travel expert for ${place.title} in ${place.destination}. Answer this traveler question concisely and helpfully: ${q}`
            }
          ]
        })
      });
      const data = await response.json();
      const answer = data.content?.[0]?.text || "Sorry, I couldn't answer that.";
      setChatHistory(prev => [...prev, { role: "ai", text: answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: "Connection error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,5,30,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1a0a3e 0%, #0f0524 100%)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 80px rgba(139,92,246,0.3)" }}>
        
        {/* Header */}
        <div className="relative p-6 pb-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                  <Bot size={16} className="text-white" />
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#a78bfa" }}>AI Travel Guide</span>
              </div>
              <h2 className="text-2xl font-black text-white">{place.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={14} style={{ color: "#a78bfa" }} />
                <span className="text-sm" style={{ color: "#c4b5fd" }}>{place.destination}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* AI Description */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#6d28d9 transparent" }}>
          <div className="rounded-2xl p-5" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#8b5cf6", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: "#a78bfa" }}>Crafting your travel guide...</span>
              </div>
            ) : (
              <p className="leading-relaxed text-sm" style={{ color: "#e2d9f3", fontFamily: "'Georgia', serif" }}>{aiText}</p>
            )}
          </div>

          {/* Chat History */}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white" }
                  : { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#e2d9f3" }
                }>
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#8b5cf6", animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="flex gap-2 items-center rounded-2xl px-4 py-2" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Sparkles size={16} style={{ color: "#a78bfa" }} />
            <input
              type="text"
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askQuestion()}
              placeholder="Ask anything about this place..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "white" }}
            />
            <button onClick={askQuestion} disabled={chatLoading || !userQuestion.trim()} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Place Card ───────────────────────────────────────────────────────────────
const PlaceCard = ({ place, onAIClick }) => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const bestTime = place.bestTime || "October – March";
  const entryFee = place.entryFee || (place.price ? `$${place.price}` : "Free");

  return (
    <div
      className="group relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg, #1a0a3e, #120630)",
        border: hovered ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(139,92,246,0.2)",
        boxShadow: hovered ? "0 20px 60px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.1)" : "0 4px 24px rgba(0,0,0,0.4)",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/booking/${place._id}`)}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={place.imageUrls?.[0] || `https://source.unsplash.com/800x600/?${place.destination?.split(' ')[0]},travel`}
          alt={place.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,5,30,0.95) 0%, rgba(10,5,30,0.3) 50%, transparent 100%)" }} />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md" style={{ background: "rgba(139,92,246,0.85)", color: "white" }}>
            {place.category || "Destination"}
          </span>
          <button
            onClick={e => { e.stopPropagation(); setWishlisted(!wishlisted); }}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
            style={{ background: "rgba(10,5,30,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Heart size={16} className={wishlisted ? "fill-red-400 text-red-400" : "text-white"} />
          </button>
        </div>

        {/* Bottom price */}
        <div className="absolute bottom-4 left-4">
          <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>Entry Fee</p>
          <p className="text-xl font-black text-white">{entryFee}</p>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md" style={{ background: "rgba(10,5,30,0.7)", border: "1px solid rgba(255,220,50,0.3)" }}>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-300">{place.rating || "4.8"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black text-white mb-1 group-hover:text-violet-300 transition-colors line-clamp-1" style={{ fontFamily: "'Georgia', serif" }}>
          {place.title}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <MapPin size={13} style={{ color: "#8b5cf6" }} />
          <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{place.destination}</span>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Clock size={11} />
            {place.duration || "3–5 Days"}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Sun size={11} />
            {bestTime}
          </div>
        </div>

        {/* Short description */}
        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "#9e9ab5" }}>
          {place.description || `Discover the wonders of ${place.destination}. A breathtaking journey awaits with stunning landscapes and rich cultural heritage.`}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation(); onAIClick(place); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", boxShadow: "0 4px 15px rgba(139,92,246,0.4)" }}
          >
            <Sparkles size={13} />
            AI Guide
          </button>
          <button
            onClick={e => { e.stopPropagation(); }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PlacesToVisit = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [aiPlace, setAiPlace] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const categories = [
    { id: "all", label: "All", icon: Compass },
    { id: "mountain", label: "Mountains", icon: Mountain },
    { id: "beach", label: "Beaches", icon: Waves },
    { id: "city", label: "Cities", icon: Building2 },
    { id: "heritage", label: "Heritage", icon: Landmark },
  ];

  // Static showcase places (shown when no API data)
  const staticPlaces = [
    {
      _id: "1", title: "Phewa Lake", destination: "Pokhara, Nepal",
      category: "nature", duration: "2–3 Days", price: 0, rating: "4.9",
      bestTime: "October – March", entryFee: "Free",
      description: "Reflecting the Annapurna range in its serene waters, Phewa Lake is the crown jewel of Pokhara. Boat rides, lakeside cafés, and stunning sunsets await.",
      imageUrls: ["https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800"]
    },
    {
      _id: "2", title: "Pashupatinath Temple", destination: "Kathmandu, Nepal",
      category: "heritage", duration: "1 Day", price: 15, rating: "4.8",
      bestTime: "Year Round", entryFee: "$15",
      description: "One of the most sacred Hindu temples in the world, nestled on the banks of the Bagmati River. A deeply spiritual and culturally immersive experience.",
      imageUrls: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"]
    },
    {
      _id: "3", title: "Everest Base Camp", destination: "Solukhumbu, Nepal",
      category: "mountain", duration: "14–16 Days", price: 1200, rating: "5.0",
      bestTime: "March – May, Oct – Nov", entryFee: "$1200+",
      description: "The ultimate trekking adventure — through Sherpa villages, ancient monasteries, and glaciers to the foot of the world's highest peak.",
      imageUrls: ["https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800"]
    },
    {
      _id: "4", title: "Chitwan National Park", destination: "Chitwan, Nepal",
      category: "nature", duration: "2–4 Days", price: 50, rating: "4.7",
      bestTime: "October – March", entryFee: "$50",
      description: "A UNESCO World Heritage site teeming with one-horned rhinos, Bengal tigers, and diverse bird species. Jungle safaris and canoe rides through pristine wilderness.",
      imageUrls: ["https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800"]
    },
    {
      _id: "5", title: "Swayambhunath Stupa", destination: "Kathmandu, Nepal",
      category: "heritage", duration: "Half Day", price: 3, rating: "4.8",
      bestTime: "Year Round", entryFee: "$3",
      description: "The iconic 'Monkey Temple' perched atop a hill overlooking the Kathmandu Valley. The all-seeing eyes of Buddha gaze across the city from this ancient hilltop.",
      imageUrls: ["https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800"]
    },
    {
      _id: "6", title: "Annapurna Circuit", destination: "Annapurna, Nepal",
      category: "mountain", duration: "12–21 Days", price: 800, rating: "4.9",
      bestTime: "September – November", entryFee: "$800+",
      description: "Trek through diverse landscapes from subtropical jungles to high-altitude desert plateaus, crossing the Thorong La Pass at 5,416m.",
      imageUrls: ["https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=800"]
    },
  ];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetched = response.data.getPackages || [];
        setPlaces(fetched.length > 0 ? fetched : staticPlaces);
      } catch {
        setPlaces(staticPlaces);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Auto-rotate featured
  useEffect(() => {
    if (places.length === 0) return;
    const t = setInterval(() => setFeaturedIndex(i => (i + 1) % Math.min(3, places.length)), 5000);
    return () => clearInterval(t);
  }, [places]);

  const filtered = places.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const featured = places[featuredIndex];

  return (
    <div className="min-h-screen" style={{ background: "#07030f", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4c1d95 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />

        {/* ── HERO ── */}
        <div className="relative overflow-hidden pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Sparkles size={14} style={{ color: "#a78bfa" }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#a78bfa" }}>AI-Powered Travel Guide</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Georgia', serif", textShadow: "0 0 80px rgba(139,92,246,0.5)" }}>
                Discover Your Next<br />
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Adventure
                </span>
              </h1>
              <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: "#9e9ab5" }}>
                Explore breathtaking destinations with AI-powered travel guides. Click any place to get a personalized guide.
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto flex gap-2 p-2 rounded-2xl" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <Search size={18} style={{ color: "#8b5cf6", margin: "auto 8px" }} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-white placeholder-gray-500"
                />
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 4px 15px rgba(139,92,246,0.4)" }}>
                  Search
                </button>
              </div>
            </div>

            {/* Featured Card */}
            {featured && (
              <div className="relative rounded-3xl overflow-hidden h-72 md:h-80 cursor-pointer group"
                style={{ border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.2)" }}
                onClick={() => navigate(`/booking/${featured._id}`)}>
                <img src={featured.imageUrls?.[0] || "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200"}
                  alt={featured.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,5,30,0.95) 0%, rgba(10,5,30,0.5) 50%, transparent 100%)" }} />
                <div className="absolute inset-0 flex items-end p-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(139,92,246,0.8)", color: "white" }}>Featured</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-300">{featured.rating || "4.9"}</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>{featured.title}</h2>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={14} style={{ color: "#a78bfa" }} />
                      <span style={{ color: "#c4b5fd" }} className="text-sm">{featured.destination}</span>
                      <span style={{ color: "#6b5a8e" }}>·</span>
                      <Clock size={14} style={{ color: "#a78bfa" }} />
                      <span style={{ color: "#c4b5fd" }} className="text-sm">{featured.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); setAiPlace(featured); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", boxShadow: "0 4px 15px rgba(139,92,246,0.5)" }}>
                        <Bot size={15} />
                        Get AI Guide
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                        <Calendar size={15} />
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
                {/* Slide dots */}
                <div className="absolute bottom-4 right-6 flex gap-2">
                  {places.slice(0, 3).map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setFeaturedIndex(i); }}
                      className="rounded-full transition-all"
                      style={{ width: i === featuredIndex ? 20 : 8, height: 8, background: i === featuredIndex ? "#8b5cf6" : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={selectedCategory === cat.id
                    ? { background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", boxShadow: "0 4px 15px rgba(139,92,246,0.4)" }
                    : { background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }
                  }>
                  <cat.icon size={15} />
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm font-medium outline-none"
                style={{ background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
              <span className="text-sm" style={{ color: "#6b5a8e" }}>{filtered.length} places</span>
            </div>
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden animate-pulse h-96"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <MapPin size={56} style={{ color: "#4c1d95", margin: "0 auto 16px" }} />
              <h3 className="text-2xl font-bold text-white mb-2">No places found</h3>
              <p style={{ color: "#6b5a8e" }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(place => (
                <PlaceCard key={place._id} place={place} onAIClick={setAiPlace} />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* AI Modal */}
      {aiPlace && <AIModal place={aiPlace} onClose={() => setAiPlace(null)} />}
    </div>
  );
};

export default PlacesToVisit;