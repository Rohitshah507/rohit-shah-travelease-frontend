import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --purple-dark: #1a0a2e;
    --purple-mid: #2d1457;
    --purple-soft: #4a1e8a;
    --purple-accent: #7c3aed;
    --purple-light: #a855f7;
    --pink-primary: #ec4899;
    --pink-soft: #f472b6;
    --pink-light: #fce7f3;
    --pink-glow: rgba(236,72,153,0.15);
    --text-primary: #f8f4ff;
    --text-secondary: #c4b5d4;
    --text-muted: #8b7aab;
    --border-color: rgba(236,72,153,0.2);
    --card-bg: rgba(45,20,87,0.5);
    --card-border: rgba(236,72,153,0.15);
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--purple-dark);
    color: var(--text-primary);
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--purple-dark); }
  ::-webkit-scrollbar-thumb { background: var(--purple-accent); border-radius: 3px; }

  /* NAVBAR */
  .te-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 16px 60px;
    display: flex; align-items: center; justify-content: space-between;
    background: transparent;
    transition: all 0.3s;
    border-bottom: 1px solid transparent;
  }
  .te-nav.scrolled {
    background: rgba(26,10,46,0.92);
    backdrop-filter: blur(16px);
    border-bottom-color: var(--border-color);
  }
  .te-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer; }
  .te-nav-logo-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px; color: #fff; letter-spacing: 0.5px;
  }
  .te-nav-logo-text { font-size: 20px; font-weight: 700; color: var(--text-primary); }
  .te-nav-logo-text span { color: var(--pink-primary); }
  .te-nav-links { display: flex; gap: 36px; }
  .te-nav-links a {
    text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500;
    transition: color 0.2s; letter-spacing: 0.3px;
  }
  .te-nav-links a:hover { color: var(--text-primary); }
  .te-nav-actions { display: flex; align-items: center; gap: 12px; }
  .te-btn-login {
    padding: 9px 24px; border-radius: 50px; font-size: 13px; font-weight: 500;
    color: var(--text-primary); background: transparent; cursor: pointer;
    border: 1px solid rgba(236,72,153,0.35); font-family: 'Inter', sans-serif;
    transition: all 0.3s; letter-spacing: 0.3px;
  }
  .te-btn-login:hover {
    border-color: var(--pink-primary); color: var(--pink-soft);
    box-shadow: 0 0 20px rgba(236,72,153,0.2);
  }

  /* HERO */
  .te-hero {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.15) 0%, transparent 60%),
                linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 120px 20px 80px;
    position: relative; overflow: hidden;
  }
  .te-hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(236,72,153,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(236,72,153,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .te-hero-blob {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
    pointer-events: none; animation: blobFloat 6s ease-in-out infinite;
  }
  @keyframes blobFloat {
    0%,100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  .te-hero-blob-1 { width: 300px; height: 300px; left: 5%; top: 15%; animation-delay: 0s; }
  .te-hero-blob-2 { width: 200px; height: 200px; right: 10%; top: 30%; animation-delay: 2s; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); }
  .te-hero-blob-3 { width: 150px; height: 150px; right: 30%; bottom: 10%; animation-delay: 4s; }

  .te-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 20px; border-radius: 50px; margin-bottom: 32px;
    border: 1px solid rgba(236,72,153,0.3);
    background: rgba(236,72,153,0.06);
    animation: fadeUp 0.8s ease 0.2s both;
  }
  .te-hero-badge-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--pink-primary);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .te-hero-badge span { font-size: 12px; color: var(--pink-soft); letter-spacing: 1px; font-weight: 500; }

  .te-hero-title {
    font-size: clamp(40px, 7vw, 76px); font-weight: 800; line-height: 1.1;
    margin-bottom: 20px; animation: fadeUp 0.8s ease 0.4s both;
  }
  .te-hero-title .pink { color: var(--pink-primary); }
  .te-hero-subtitle {
    font-size: clamp(15px, 2vw, 18px); color: var(--text-secondary); max-width: 560px;
    line-height: 1.7; margin-bottom: 44px; font-weight: 400;
    animation: fadeUp 0.8s ease 0.6s both;
  }
  .te-hero-btns {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    margin-bottom: 60px; animation: fadeUp 0.8s ease 0.7s both;
  }
  .te-btn-primary {
    padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 600;
    color: #fff; border: none; cursor: pointer; font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    transition: all 0.3s; letter-spacing: 0.3px;
  }
  .te-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(236,72,153,0.4); }
  .te-btn-secondary {
    padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 500;
    color: var(--text-primary); background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-family: 'Inter', sans-serif;
    transition: all 0.3s;
  }
  .te-btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(236,72,153,0.4); }

  .te-hero-stats { display: flex; gap: 0; animation: fadeUp 0.8s ease 0.8s both; }
  .te-stat-item { text-align: center; padding: 0 32px; }
  .te-stat-item + .te-stat-item { border-left: 1px solid rgba(255,255,255,0.1); }
  .te-stat-num { font-size: 26px; font-weight: 800; color: var(--pink-primary); }
  .te-stat-label { font-size: 11px; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .te-hero-chips {
    position: absolute; bottom: 0; left: 0; right: 0;
    display: flex; justify-content: center; gap: 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(26,10,46,0.6); backdrop-filter: blur(10px);
  }
  .te-chip {
    padding: 18px 32px; font-size: 13px; font-weight: 500; color: var(--text-muted);
    border-right: 1px solid rgba(255,255,255,0.06); flex: 1; text-align: center;
    transition: color 0.2s;
  }
  .te-chip:hover { color: var(--pink-soft); }
  .te-chip:last-child { border-right: none; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* SECTIONS */
  .te-section { padding: 100px 60px; }
  .te-section-tag {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 18px; border-radius: 50px; margin-bottom: 20px;
    border: 1px solid rgba(236,72,153,0.25); background: rgba(236,72,153,0.06);
    font-size: 12px; font-weight: 600; color: var(--pink-soft); letter-spacing: 1.5px; text-transform: uppercase;
  }
  .te-section-tag::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--pink-primary);
  }
  .te-section-title { font-size: clamp(32px, 4vw, 52px); font-weight: 800; margin-bottom: 16px; }
  .te-section-title .pink { color: var(--pink-primary); }
  .te-section-desc { font-size: 17px; color: var(--text-secondary); max-width: 680px; line-height: 1.7; }

  /* ABOUT */
  .te-about { background: linear-gradient(180deg, #0d0520 0%, #120832 100%); }
  .te-about-header { text-align: center; margin-bottom: 60px; display: flex; flex-direction: column; align-items: center; }
  .te-about-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 900px; margin: 0 auto 40px; }
  .te-about-card {
    background: var(--card-bg); border-radius: 16px; padding: 36px;
    border: 1.5px solid var(--card-border); backdrop-filter: blur(10px);
    transition: all 0.3s;
  }
  .te-about-card:hover { border-color: var(--pink-primary); transform: translateY(-4px); }
  .te-about-card.active { border-color: var(--pink-primary); }
  .te-about-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
  .te-about-card p { font-size: 15px; color: var(--text-secondary); line-height: 1.7; }
  .te-about-card-line { width: 48px; height: 3px; border-radius: 2px; margin-top: 28px; }
  .te-about-card.active .te-about-card-line { background: var(--pink-primary); }
  .te-about-card:not(.active) .te-about-card-line { background: rgba(255,255,255,0.15); }
  .te-about-text-card {
    max-width: 900px; margin: 0 auto;
    background: var(--card-bg); border-radius: 16px; padding: 40px;
    border: 1px solid var(--card-border); backdrop-filter: blur(10px);
  }
  .te-about-text-card p { font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; }
  .te-about-text-card p:last-child { margin-bottom: 0; }

  /* STATS */
  .te-stats-section { background: linear-gradient(180deg, #120832 0%, #0d0520 100%); text-align: center; }
  .te-stats-headline {
    max-width: 900px; margin: 0 auto 48px;
    padding: 40px 48px; border-radius: 16px;
    border: 1.5px solid var(--pink-primary);
    background: rgba(236,72,153,0.04);
  }
  .te-stats-headline h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; line-height: 1.3; }
  .te-stats-headline h2 span { color: var(--pink-primary); }
  .te-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 900px; margin: 0 auto; }
  .te-stat-card {
    background: var(--card-bg); border-radius: 12px; padding: 28px 20px;
    border: 1px solid var(--card-border); text-align: center;
  }
  .te-stat-card-num { font-size: 32px; font-weight: 800; color: var(--pink-primary); margin-bottom: 6px; }
  .te-stat-card-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }

  /* SERVICES */
  .te-services { background: linear-gradient(180deg, #0d0520 0%, #120832 100%); }
  .te-services-header { text-align: center; margin-bottom: 70px; display: flex; flex-direction: column; align-items: center; }
  .te-service-item {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    max-width: 1100px; margin: 0 auto 80px;
  }
  .te-service-item.reverse { direction: rtl; }
  .te-service-item.reverse > * { direction: ltr; }
  .te-service-img-wrap {
    position: relative; border-radius: 20px; overflow: hidden;
    border: 1.5px solid var(--card-border);
  }
  .te-service-img-wrap img { width: 100%; height: 360px; object-fit: cover; display: block; }
  .te-service-icon-badge {
    position: absolute; top: 20px; left: 20px;
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .te-service-content h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; color: var(--pink-primary); margin-bottom: 16px; }
  .te-service-content p { font-size: 16px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px; }
  .te-key-benefit {
    padding: 20px 24px; border-radius: 12px;
    background: rgba(236,72,153,0.06); border: 1px solid rgba(236,72,153,0.2);
    margin-bottom: 28px;
  }
  .te-key-benefit-label { font-size: 11px; font-weight: 700; color: var(--pink-soft); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .te-key-benefit p { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 0; }
  .te-service-divider { width: 60px; height: 3px; background: var(--pink-primary); border-radius: 2px; margin-top: 20px; }

  .te-cta-band {
    max-width: 1100px; margin: 0 auto;
    padding: 60px 48px; border-radius: 20px; text-align: center;
    border: 1.5px solid var(--pink-primary);
    background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(124,58,237,0.08));
  }
  .te-cta-band h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; margin-bottom: 12px; }
  .te-cta-band p { font-size: 16px; color: var(--text-secondary); margin-bottom: 28px; }

  /* CONTACT */
  .te-contact { background: linear-gradient(180deg, #120832 0%, #0d0520 100%); }
  .te-contact-header { text-align: center; margin-bottom: 50px; display: flex; flex-direction: column; align-items: center; }
  .te-contact-desc { font-size: 17px; color: var(--text-secondary); max-width: 560px; line-height: 1.7; }
  .te-contact-card {
    max-width: 760px; margin: 0 auto;
    background: var(--card-bg); border-radius: 20px; padding: 52px 48px;
    border: 1.5px solid var(--pink-primary); text-align: center;
    backdrop-filter: blur(10px);
  }
  .te-contact-card p { font-size: 16px; color: var(--text-secondary); margin-bottom: 28px; }
  .te-contact-divider { width: 60px; height: 2px; background: var(--pink-primary); border-radius: 1px; margin: 0 auto 32px; }
  .te-btn-email {
    display: inline-block; padding: 16px 44px; border-radius: 50px;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    color: #fff; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;
    text-decoration: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: all 0.3s;
  }
  .te-btn-email:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(236,72,153,0.4); }

  /* FOOTER */
  .te-footer {
    background: #0a0518;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 70px 60px 36px;
  }
  .te-footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .te-footer-logo-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px; color: #fff;
  }
  .te-footer-logo-text { font-size: 22px; font-weight: 700; }
  .te-footer-logo-text span { color: var(--pink-primary); }
  .te-footer-grid {
    display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 60px;
    max-width: 1100px; margin: 60px auto 0 auto;
    padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .te-footer-col h4 { font-size: 15px; font-weight: 700; color: var(--pink-primary); margin-bottom: 24px; }
  .te-footer-col .te-footer-brand-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; }
  .te-footer-col-line { width: 36px; height: 2px; background: var(--pink-primary); border-radius: 1px; margin-top: 20px; }
  .te-footer-col ul { list-style: none; }
  .te-footer-col ul li { margin-bottom: 14px; }
  .te-footer-col ul li a { text-decoration: none; color: var(--text-muted); font-size: 14px; transition: color 0.2s; }
  .te-footer-col ul li a:hover { color: var(--pink-soft); }
  .te-footer-bottom {
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1100px; margin: 28px auto 0;
    font-size: 13px; color: var(--text-muted);
  }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .te-nav { padding: 14px 24px; }
    .te-nav-links { display: none; }
    .te-section { padding: 70px 24px; }
    .te-footer { padding: 50px 24px 28px; }
    .te-about-cards { grid-template-columns: 1fr; }
    .te-service-item { grid-template-columns: 1fr; gap: 32px; }
    .te-service-item.reverse { direction: ltr; }
    .te-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .te-footer-grid { grid-template-columns: 1fr; gap: 36px; }
    .te-footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    .te-hero-chips { display: none; }
    .te-stat-item { padding: 0 18px; }
  }
  @media (max-width: 500px) {
    .te-hero-stats { flex-direction: column; gap: 20px; }
    .te-stat-item + .te-stat-item { border-left: none; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .te-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .te-cta-band { padding: 40px 24px; }
    .te-contact-card { padding: 40px 24px; }
    .te-stats-headline { padding: 30px 24px; }
  }
`;

const services = [
  {
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    alt: "Flight Tickets",
    icon: "✈️",
    title: "Flight Tickets",
    desc: "Book flights, train tickets, and bus passes with real-time pricing and availability. Get instant confirmations and e-tickets delivered straight to your app.",
    benefit: "Save up to 15% compared to booking on multiple platforms.",
    reverse: false,
  },
  {
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    alt: "Accommodations",
    icon: "🏨",
    title: "Accommodations",
    desc: "Find and book hotels, hostels, and vacation rentals that match your preferences and budget. Filter by amenities, location, and price.",
    benefit: "Price match guarantee on all accommodations.",
    reverse: true,
  },
  {
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    alt: "Transportation",
    icon: "🚗",
    title: "Transportation",
    desc: "Access local transportation options including rideshares, car rentals, and public transit. Compare prices and book directly within the app.",
    benefit: "Seamless connections between all your travel points.",
    reverse: false,
  },
  {
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Restaurants",
    icon: "🍽️",
    title: "Restaurants",
    desc: "Discover and reserve tables at local eateries with exclusive in-app discounts. Browse menus, read reviews, and make reservations in seconds.",
    benefit: "Exclusive in-app discounts at 500+ partner restaurants.",
    reverse: true,
  },
  {
    img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
    alt: "Tourist Attractions",
    icon: "🏛️",
    title: "Tourist Attractions",
    desc: "Explore local sights and activities with skip-the-line ticket options and guided tours. Discover hidden gems and popular destinations.",
    benefit: "Priority access to major attractions worldwide.",
    reverse: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className={`te-nav${scrolled ? " scrolled" : ""}`}>
        <div className="te-nav-logo" onClick={() => scrollTo("home")}>
          <div className="te-nav-logo-icon">TE</div>
          <span className="te-nav-logo-text">
            Travel<span>Ease</span>
          </span>
        </div>
        <div className="te-nav-links">
          {["home", "about", "services", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(id);
              }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>
        <div className="te-nav-actions">
          <button className="te-btn-login" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="te-hero" id="home">
        <div className="te-hero-blob te-hero-blob-1" />
        <div className="te-hero-blob te-hero-blob-2" />
        <div className="te-hero-blob te-hero-blob-3" />

        <div className="te-hero-badge">
          <div className="te-hero-badge-dot" />
          <span>Your Ultimate Travel Companion</span>
        </div>

        <h1 className="te-hero-title">
          Travel Made
          <br />
          <span className="pink">Effortless</span>
        </h1>

        <p className="te-hero-subtitle">
          All your travel needs in one beautiful app — flights, accommodations,
          <br />
          restaurants, transportation, and attractions at your fingertips.
        </p>

        <div className="te-hero-btns">
          <button
            className="te-btn-primary"
            onClick={() => scrollTo("services")}
          >
            Explore Services
          </button>
          <button
            className="te-btn-secondary"
            onClick={() => scrollTo("about")}
          >
            Learn More
          </button>
        </div>

        <div className="te-hero-stats">
          {stats.map((s) => (
            <div className="te-stat-item" key={s.label}>
              <div className="te-stat-num">{s.num}</div>
              <div className="te-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="te-hero-chips">
          {["Smart Booking", "Local Guides", "Best Prices", "24/7 Support"].map(
            (c) => (
              <div className="te-chip" key={c}>
                {c}
              </div>
            ),
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section className="te-section te-about" id="about">
        <div className="te-about-header">
          <div className="te-section-tag">Our Story</div>
          <h2 className="te-section-title">
            <span className="pink">About</span> TravelEase
          </h2>
        </div>
        <div className="te-about-cards">
          <div className="te-about-card active">
            <h3>Our Mission</h3>
            <p>
              TravelEase was founded with a simple mission: to make independent
              travel truly effortless. We understand the challenges travelers
              face when coordinating different aspects of their journey.
            </p>
            <div className="te-about-card-line" />
          </div>
          <div className="te-about-card">
            <h3>Our Team</h3>
            <p>
              Our team of travel enthusiasts and tech experts came together to
              create a solution that puts everything you need in one place — no
              more juggling between multiple apps and websites.
            </p>
            <div className="te-about-card-line" />
          </div>
        </div>
        <div className="te-about-text-card">
          <p>
            We believe that travel should be about the experience, not the
            logistics. That's why we've built an app that handles all the
            details, so you can focus on creating memories.
          </p>
          <p>
            Our platform combines cutting-edge technology with a deep
            understanding of travelers' needs, creating a seamless experience
            from planning to your journey's end.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="te-section te-stats-section" id="stats">
        <div className="te-stats-headline">
          <h2>
            Everything you need for travel —<br />
            <span>in one beautiful app.</span>
          </h2>
        </div>
        <div className="te-stats-grid">
          {stats.map((s) => (
            <div className="te-stat-card" key={s.label}>
              <div className="te-stat-card-num">{s.num}</div>
              <div className="te-stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="te-section te-services" id="services">
        <div className="te-services-header">
          <div className="te-section-tag">What We Offer</div>
          <h2 className="te-section-title">
            <span className="pink">Our</span> Services
          </h2>
          <p className="te-section-desc">
            Everything you need for a perfect travel experience, all in one
            place.
          </p>
        </div>

        {services.map((svc) => (
          <div
            key={svc.title}
            className={`te-service-item${svc.reverse ? " reverse" : ""}`}
          >
            <div className="te-service-img-wrap">
              <img src={svc.img} alt={svc.alt} />
              <div className="te-service-icon-badge">{svc.icon}</div>
            </div>
            <div className="te-service-content">
              <h2>{svc.title}</h2>
              <p>{svc.desc}</p>
              <div className="te-key-benefit">
                <div className="te-key-benefit-label">Key Benefit</div>
                <p>{svc.benefit}</p>
              </div>
              <button
                className="te-btn-primary"
                onClick={() => navigate("/login")}
              >
                Book Now
              </button>
              <div className="te-service-divider" />
            </div>
          </div>
        ))}

        <div className="te-cta-band">
          <h2>Ready to start your journey?</h2>
          <p>
            Download TravelEase today and experience travel like never before.
          </p>
          <button
            className="te-btn-primary"
            style={{ fontSize: "16px", padding: "16px 48px" }}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* CONTACT */}
      <section className="te-section te-contact" id="contact">
        <div className="te-contact-header">
          <div className="te-section-tag">Get In Touch</div>
          <h2 className="te-section-title">
            <span className="pink">Contact</span> Us
          </h2>
          <p className="te-contact-desc">
            Have questions or feedback? We'd love to hear from you. Our team is
            always ready to assist you with any inquiries.
          </p>
        </div>
        <div className="te-contact-card">
          <p>
            Contact us directly via email. We'll get back to you as soon as
            possible.
          </p>
          <div className="te-contact-divider" />
          <a className="te-btn-email" href="mailto:support@travellerease.com">
            support@travellerease.com
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="te-footer">
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div className="te-footer-logo" style={{ justifyContent: "center" }}>
            <div className="te-footer-logo-icon">TE</div>
            <span className="te-footer-logo-text">
              Travel<span>Ease</span>
            </span>
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginTop: "8px",
            }}
          >
            Your journey begins with us. Experience the future of travel
            planning.
          </p>
        </div>

        <div className="te-footer-grid">
          <div className="te-footer-col">
            <h4>About Us</h4>
            <p className="te-footer-brand-desc">
              Everything you need for travel — in one beautiful, intuitive app.
            </p>
            <div className="te-footer-col-line" />
          </div>
          <div className="te-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {["home", "about", "services", "contact"].map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(id);
                    }}
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="te-footer-col">
            <h4>Services</h4>
            <ul>
              {[
                "Flights",
                "Hotels",
                "Experiences",
                "Transportation",
                "Local Guide",
              ].map((s) => (
                <li key={s}>
                  <a href="#">{s}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="te-footer-bottom">
          <span>© 2025 TravelEase Ltd. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
