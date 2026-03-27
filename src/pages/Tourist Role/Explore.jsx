import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowLeft,
  Camera,
  Sun,
  Thermometer,
  ArrowRight,
  Compass,
  Star,
  Eye,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { serverURL } from "../../App";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { getToken } from "../Login";

// ─── Styles injected once ────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg: #04080f;
    --surface: rgba(255,255,255,0.03);
    --surface-2: rgba(255,255,255,0.06);
    --border: rgba(255,255,255,0.08);
    --border-hover: rgba(255,255,255,0.18);
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --gold-dim: rgba(201,168,76,0.15);
    --text: #f0ece4;
    --muted: rgba(240,236,228,0.45);
    --muted-2: rgba(240,236,228,0.25);
  }

  .explore-root { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); min-height: 100vh; }

  .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

  /* ── Noise overlay ── */
  .noise::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  /* ── Ambient light ── */
  .ambient-top {
    position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
    width: 900px; height: 500px; border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .ambient-br {
    position: fixed; bottom: -100px; right: -100px;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(100,160,255,0.04) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* ── Search ── */
  .search-wrap {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 22px; border-radius: 100px;
    background: var(--surface); border: 1px solid var(--border);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .search-wrap:focus-within {
    border-color: rgba(201,168,76,0.4);
    box-shadow: 0 0 0 4px rgba(201,168,76,0.06), 0 8px 32px rgba(0,0,0,0.4);
  }
  .search-wrap input { background: transparent; border: none; outline: none; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; flex: 1; }
  .search-wrap input::placeholder { color: var(--muted-2); }

  /* ── Card ── */
  .pkg-card {
    border-radius: 20px; overflow: hidden; cursor: pointer;
    background: var(--surface);
    border: 1px solid var(--border);
    transition: border-color 0.4s, transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s;
    position: relative;
  }
  .pkg-card:hover {
    border-color: rgba(201,168,76,0.35);
    transform: translateY(-6px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.12);
  }
  .card-img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform 0.8s cubic-bezier(0.22,1,0.36,1); }
  .pkg-card:hover .card-img { transform: scale(1.06); }
  .card-img-wrap { position: relative; overflow: hidden; height: 220px; }
  .card-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(4,8,15,0.9) 0%, rgba(4,8,15,0.2) 50%, transparent 100%);
  }

  .badge-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600;
  }
  .badge-gold {
    background: rgba(201,168,76,0.18); color: var(--gold-light);
    border: 1px solid rgba(201,168,76,0.25); letter-spacing: 0.04em;
  }
  .badge-dark {
    background: rgba(4,8,15,0.75); color: var(--text);
    backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1);
  }
  .badge-rating {
    background: rgba(4,8,15,0.8); color: #fbbf24;
    backdrop-filter: blur(8px); border: 1px solid rgba(251,191,36,0.2);
  }

  .card-body { padding: 20px; }
  .card-dest { font-size: 11px; font-weight: 600; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 5px; margin-bottom: 6px; }
  .card-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 8px; }
  .card-desc { font-size: 13px; line-height: 1.65; color: var(--muted); margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
  .card-price { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: var(--gold-light); }
  .card-price span { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 400; color: var(--muted); margin-left: 3px; }

  .card-cta {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 100px; font-size: 12px; font-weight: 600;
    background: transparent; border: 1px solid var(--border-hover);
    color: var(--muted); cursor: pointer; transition: all 0.3s; letter-spacing: 0.02em;
  }
  .pkg-card:hover .card-cta {
    background: var(--gold); border-color: var(--gold); color: #04080f;
  }

  /* ── Divider line ── */
  .card-divider { height: 1px; background: var(--border); margin: 14px 0; }

  /* ── Detail view ── */
  .detail-hero { border-radius: 24px; overflow: hidden; position: relative; }
  .detail-back {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 100px; font-size: 13px; font-weight: 500;
    background: var(--surface); border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; transition: all 0.3s; margin-bottom: 28px;
  }
  .detail-back:hover { border-color: var(--border-hover); color: var(--text); }

  .info-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 24px;
  }
  .info-row { display: flex; align-items: flex-start; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--gold-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .info-label { font-size: 10px; font-weight: 600; color: var(--muted-2); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 2px; }
  .info-value { font-size: 14px; font-weight: 500; color: var(--text); }

  .place-chip {
    display: flex; align-items: flex-start; gap: 14px; padding: 16px;
    border-radius: 14px; background: var(--surface); border: 1px solid var(--border);
    transition: border-color 0.3s, transform 0.3s;
  }
  .place-chip:hover { border-color: rgba(201,168,76,0.25); transform: translateY(-2px); }
  .place-emoji { width: 42px; height: 42px; border-radius: 12px; background: var(--gold-dim); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

  .cta-btn {
    width: 100%; padding: 15px; border-radius: 14px; font-size: 15px; font-weight: 600;
    background: var(--gold); color: #04080f; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.3s; letter-spacing: 0.02em;
  }
  .cta-btn:hover { background: var(--gold-light); box-shadow: 0 8px 30px rgba(201,168,76,0.35); transform: translateY(-1px); }

  /* ── Skeleton ── */
  .skel { border-radius: 20px; background: var(--surface); border: 1px solid var(--border); overflow: hidden; }
  .skel-img { height: 220px; background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; }
  .skel-line { height: 12px; border-radius: 6px; background: var(--surface-2); animation: shimmer 1.6s infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Gallery thumbnails ── */
  .thumb { border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.3s; opacity: 0.5; }
  .thumb.active { opacity: 1; box-shadow: 0 0 0 2px var(--gold); }
  .thumb:hover { opacity: 0.85; }

  /* ── Header decorative line ── */
  .header-line { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 20px; }
  .header-line::before, .header-line::after { content: ''; flex: 1; max-width: 80px; height: 1px; background: linear-gradient(to right, transparent, rgba(201,168,76,0.4)); }
  .header-line::after { background: linear-gradient(to left, transparent, rgba(201,168,76,0.4)); }
  .header-diamond { width: 6px; height: 6px; background: var(--gold); transform: rotate(45deg); }

  /* ── Section heading ── */
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }

  /* ── Responsive grid ── */
  .pkg-grid { display: grid; gap: 20px; grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 1280px) { .pkg-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px) { .pkg-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .pkg-grid { grid-template-columns: 1fr; } }

  .detail-grid { display: grid; gap: 36px; grid-template-columns: 3fr 2fr; align-items: start; }
  @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }

  .gallery-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
  @media (max-width: 480px) { .gallery-thumbs { grid-template-columns: repeat(3, 1fr); } }

  .places-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  @media (max-width: 480px) { .places-grid { grid-template-columns: 1fr; } }

  /* ── Count tag ── */
  .count-tag { font-size: 12px; color: var(--muted-2); margin-top: 36px; text-align: center; letter-spacing: 0.04em; }

  /* ── Scrollbar ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,0.2) transparent; }
`;

// ─── Image Gallery ────────────────────────────────────────────────────────────
const ImageGallery = ({ images = [], title = "" }) => {
  const [active, setActive] = useState(0);
  const valid = images.filter(Boolean);
  if (!valid.length) return null;

  return (
    <div>
      <div className="detail-hero" style={{ height: 340, marginBottom: 10 }}>
        <img
          src={valid[active]}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "all 0.5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(4,8,15,0.5) 0%, transparent 60%)",
          }}
        />
        {/* counter */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 100,
            background: "rgba(4,8,15,0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <Camera size={11} /> {active + 1}/{valid.length}
        </div>
        {valid.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((a) => (a - 1 + valid.length) % valid.length)
              }
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(4,8,15,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % valid.length)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(4,8,15,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      {valid.length > 1 && (
        <div className="gallery-thumbs">
          {valid.map((img, i) => (
            <div
              key={i}
              className={`thumb${i === active ? " active" : ""}`}
              style={{ height: 64 }}
              onClick={() => setActive(i)}
            >
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Package Detail ───────────────────────────────────────────────────────────
const PackageDetail = ({ pkg, onBack }) => {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState("");
  const [aiPlaces, setAiPlaces] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);
  const duration = pkg.duration || (pkg.nights ? `${pkg.nights} Nights` : "—");

  useEffect(() => {
    generateAIContent();
  }, [pkg._id]);

  const generateAIContent = async () => {
    setAiLoading(true);
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
              content: `You are a travel expert. For this tour package respond ONLY with valid JSON (no markdown, no extra text):

Package Title: ${pkg.title}
Destination: ${pkg.destination}
Duration: ${duration}
Price: $${pkg.price}
Type: ${pkg.type || "Tour"}

Return ONLY this JSON structure:
{
  "description": "A vivid 3-sentence travel guide that inspires visitors to experience this specific destination",
  "places": [
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"},
    {"name": "Top attraction name", "desc": "One compelling sentence about it", "icon": "relevant emoji"}
  ]
}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAiText(parsed.description || pkg.description || "");
      setAiPlaces(parsed.places || []);
    } catch {
      setAiText(pkg.description || "");
      setAiPlaces([]);
    } finally {
      setAiLoading(false);
    }
  };

  const infoItems = [
    { icon: MapPin, label: "Destination", value: pkg.destination },
    { icon: Thermometer, label: "Duration", value: duration },
    {
      icon: DollarSign,
      label: "Starting Price",
      value: `$${pkg.price} per person`,
    },
    { icon: Sun, label: "Best Time", value: pkg.bestTime || "October – March" },
    {
      icon: Calendar,
      label: "Start Date",
      value: pkg.startDate
        ? new Date(pkg.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Flexible",
    },
    {
      icon: Users,
      label: "Group Size",
      value: pkg.group || "Contact for info",
    },
  ];

  return (
    <div>
      <button className="detail-back" onClick={onBack}>
        <ArrowLeft size={15} /> Back to Destinations
      </button>

      {/* Hero */}
      <div
        className="detail-hero"
        style={{
          height: 300,
          marginBottom: 40,
          border: "1px solid var(--border)",
        }}
      >
        <img
          src={pkg.imageUrls?.[0]}
          alt={pkg.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(4,8,15,0.96) 0%, rgba(4,8,15,0.55) 55%, rgba(4,8,15,0.1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            padding: "36px 40px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <MapPin size={12} color="var(--gold)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--gold)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {pkg.destination}
              </span>
            </div>
            <h1
              className="serif"
              style={{
                fontSize: "clamp(28px,5vw,50px)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.1,
                margin: "0 0 8px",
              }}
            >
              {pkg.title}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
              {pkg.type ? `${pkg.type} · ` : ""}
              {duration}
            </p>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {pkg.imageUrls?.length > 0 && (
            <section>
              <p className="section-label">Gallery</p>
              <h2
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 16px",
                }}
              >
                Visual Journey
              </h2>
              <ImageGallery images={pkg.imageUrls} title={pkg.title} />
            </section>
          )}

          <section>
            <p className="section-label">About</p>
            <h2
              className="serif"
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 14px",
              }}
            >
              {pkg.title}
            </h2>
            {aiLoading ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[100, 85, 70].map((w, i) => (
                  <div
                    key={i}
                    className="skel-line"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.85,
                  color: "var(--muted)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {aiText || pkg.description}
              </p>
            )}
          </section>

          <section>
            <p className="section-label">Highlights</p>
            <h2
              className="serif"
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 16px",
              }}
            >
              Top Places to Visit
            </h2>
            {aiLoading ? (
              <div className="places-grid">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 80,
                      borderRadius: 14,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      animation: "shimmer 1.6s infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              aiPlaces.length > 0 && (
                <div className="places-grid">
                  {aiPlaces.map((place, i) => (
                    <div key={i} className="place-chip">
                      <div className="place-emoji">{place.icon || "📍"}</div>
                      <div>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: "0 0 4px",
                          }}
                        >
                          {place.name}
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            lineHeight: 1.55,
                            margin: 0,
                          }}
                        >
                          {place.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: 24,
          }}
        >
          {pkg.rating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    style={{
                      color:
                        i < Math.round(pkg.rating || 4)
                          ? "#fbbf24"
                          : "rgba(255,255,255,0.1)",
                      fill:
                        i < Math.round(pkg.rating || 4)
                          ? "#fbbf24"
                          : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
              <span
                style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}
              >
                {pkg.rating}
              </span>
              {pkg.reviews && (
                <span style={{ fontSize: 12, color: "var(--muted-2)" }}>
                  ({pkg.reviews} reviews)
                </span>
              )}
            </div>
          )}

          <div className="info-card">
            <p className="section-label" style={{ marginBottom: 12 }}>
              Travel Info
            </p>
            {infoItems.map((item, i) => (
              <div key={i} className="info-row">
                <div className="info-icon">
                  <item.icon size={15} color="var(--gold)" />
                </div>
                <div>
                  <p className="info-label">{item.label}</p>
                  <p className="info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <span
                className="serif"
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: "var(--gold-light)",
                }}
              >
                ${pkg.price}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                / person
              </span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted-2)",
                marginBottom: 16,
              }}
            >
              Includes accommodation & guided tours
            </p>
            <button
              className="cta-btn"
              onClick={() => navigate(`/package/${pkg._id}`)}
            >
              Book This Package <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skel">
    <div className="skel-img" />
    <div
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div className="skel-line" style={{ width: "40%" }} />
      <div className="skel-line" style={{ width: "70%" }} />
      <div className="skel-line" style={{ width: "55%" }} />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Explore = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/user/package`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(res.data.getPackages || []);
      } catch {
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const filtered = packages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCardClick = (pkg) => {
    setSelectedPkg(pkg);
    setTimeout(
      () => topRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };
  const handleBack = () => {
    setSelectedPkg(null);
    setTimeout(
      () => topRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const getDuration = (pkg) =>
    pkg.duration || (pkg.nights ? `${pkg.nights} Nights` : "—");

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="explore-root noise">
        <div className="ambient-top" />
        <div className="ambient-br" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />

          <div
            ref={topRef}
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              padding: "clamp(90px,10vw,120px) clamp(16px,4vw,40px) 80px",
            }}
          >
            {selectedPkg ? (
              <PackageDetail pkg={selectedPkg} onBack={handleBack} />
            ) : (
              <>
                {/* ── Header ── */}
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                  <div className="header-line">
                    <div className="header-diamond" />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                      }}
                    >
                      Curated Destinations
                    </span>
                    <div className="header-diamond" />
                  </div>

                  <h1
                    className="serif"
                    style={{
                      fontSize: "clamp(40px,7vw,76px)",
                      fontWeight: 700,
                      color: "var(--text)",
                      lineHeight: 1.05,
                      margin: "0 0 20px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Explore the World,
                    <br />
                    <em
                      style={{
                        fontStyle: "italic",
                        color: "var(--gold-light)",
                      }}
                    >
                      Your Way
                    </em>
                  </h1>

                  <p
                    style={{
                      fontSize: "clamp(14px,2vw,16px)",
                      color: "var(--muted)",
                      maxWidth: 460,
                      margin: "0 auto 36px",
                      lineHeight: 1.7,
                    }}
                  >
                    Handpicked journeys to extraordinary places. Discover
                    packages crafted for every kind of traveller.
                  </p>

                  <div style={{ maxWidth: 480, margin: "0 auto" }}>
                    <div className="search-wrap">
                      <Search size={17} color="var(--gold)" />
                      <input
                        type="text"
                        placeholder="Search destinations or packages…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X size={15} color="var(--muted)" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Grid ── */}
                {loading ? (
                  <div className="pkg-grid">
                    {[...Array(8)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <MapPin
                      size={44}
                      color="var(--muted-2)"
                      style={{ margin: "0 auto 16px" }}
                    />
                    <h3
                      className="serif"
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 8,
                      }}
                    >
                      No destinations found
                    </h3>
                    <p style={{ color: "var(--muted)", fontSize: 14 }}>
                      Try searching for something else
                    </p>
                  </div>
                ) : (
                  <div className="pkg-grid">
                    {filtered.map((pkg) => {
                      const duration = getDuration(pkg);
                      return (
                        <div
                          key={pkg._id}
                          className="pkg-card"
                          onClick={() => handleCardClick(pkg)}
                        >
                          <div className="card-img-wrap">
                            <img
                              src={pkg.imageUrls?.[0]}
                              alt={pkg.title}
                              className="card-img"
                            />
                            <div className="card-img-overlay" />

                            {/* Duration top-left */}
                            <div
                              style={{
                                position: "absolute",
                                top: 14,
                                left: 14,
                              }}
                            >
                              <span className="badge-pill badge-gold">
                                {duration}
                              </span>
                            </div>

                            {/* Rating top-right */}
                            {pkg.rating && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  right: 14,
                                }}
                              >
                                <span
                                  className="badge-pill badge-rating"
                                  style={{ gap: 5 }}
                                >
                                  <Star size={10} style={{ fill: "#fbbf24" }} />{" "}
                                  {pkg.rating}
                                </span>
                              </div>
                            )}

                            {/* Multi-image count bottom-right */}
                            {pkg.imageUrls?.length > 1 && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 12,
                                  right: 14,
                                }}
                              >
                                <span
                                  className="badge-pill badge-dark"
                                  style={{ fontSize: 11, gap: 4 }}
                                >
                                  <Camera size={10} /> {pkg.imageUrls.length}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="card-body">
                            <div className="card-dest">
                              <MapPin size={11} /> {pkg.destination}
                            </div>
                            <h3 className="card-title">{pkg.title}</h3>
                            <p className="card-desc">
                              {pkg.description ||
                                `Discover the wonders of ${pkg.destination}.`}
                            </p>

                            <div className="card-divider" />

                            <div className="card-meta">
                              <div>
                                <div className="card-price">
                                  ${pkg.price}
                                  <span>/ person</span>
                                </div>
                              </div>
                              <button className="card-cta">
                                Explore <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loading && filtered.length > 0 && (
                  <p className="count-tag">
                    {filtered.length} destination
                    {filtered.length !== 1 ? "s" : ""} available
                  </p>
                )}
              </>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Explore;
