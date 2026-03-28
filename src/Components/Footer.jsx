import React, { useEffect, useRef } from "react";

const Footer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.3,
      o: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      stars.forEach((s) => {
        const opacity = s.o * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const links = {
    Company: ["About Us", "Careers", "Press", "Blog"],
    Explore: ["Destinations", "Experiences", "Luxury Stays", "Travel Guides"],
    Support: ["Help Center", "Terms of Service", "Privacy Policy", "Cookies"],
  };

  const socials = [
    {
      label: "IG",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "YT",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: "LI",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative bg-[#07070f] overflow-hidden">
      {/* Star canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-700/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-violet-800/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10">

        {/* Gradient top divider */}
        <div className="w-full h-px mb-14 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        {/* Main grid — 1 col mobile, 2 col tablet, 5 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">

          {/* ── Brand col (spans 2 on lg) ── */}
          <div className="sm:col-span-2 lg:col-span-2">
            {/* Logo row */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 2C8 6 3 9 3 14a9 9 0 0 0 18 0c0-5-5-8-9-12z" />
                </svg>
              </div>
              <span className="text-2xl sm:text-3xl font-light tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-violet-300">
                TravelEase
              </span>
            </div>

            <p className="text-[9px] tracking-[0.3em] uppercase text-amber-400/40 font-light mb-5 pl-10">
              Luxury Travel · Est. 2019
            </p>

            <p className="text-sm font-light text-violet-300/50 leading-relaxed max-w-xs mb-8">
              Crafting extraordinary journeys for those who seek wonder in every corner of the world. Your dream, our craft.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <button
                  key={s.label}
                  className="w-9 h-9 rounded-full border border-violet-500/20 bg-white/[0.03] flex items-center justify-center text-violet-400/50 hover:border-amber-400/50 hover:text-amber-200 hover:bg-amber-400/5 transition-all duration-300 cursor-pointer"
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Link columns ── */}
          {Object.entries(links).map(([col, items]) => (
            <div key={col}>
              <h4 className="text-[9px] tracking-[0.28em] uppercase font-semibold text-amber-400/55 mb-5">
                {col}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[13px] font-light text-violet-300/50 hover:text-amber-200/90 hover:tracking-wide transition-all duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter + Contact card ── */}
        <div className="mt-14 rounded-2xl border border-violet-500/10 bg-white/[0.02] backdrop-blur-sm px-6 sm:px-8 py-7 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Newsletter */}
          <div>
            <h4 className="text-[9px] tracking-[0.28em] uppercase font-semibold text-amber-400/55 mb-2">
              Newsletter
            </h4>
            <p className="text-xs font-light text-violet-300/45 mb-4 leading-relaxed">
              Handpicked destinations &amp; exclusive deals, straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white/[0.04] border border-violet-500/20 rounded-lg px-4 py-2.5 text-xs font-light text-violet-200/80 placeholder-violet-500/30 outline-none focus:border-amber-400/40 transition-colors duration-300"
              />
              <button className="shrink-0 px-5 py-2.5 rounded-lg border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-violet-500/10 text-[9px] tracking-[0.22em] uppercase font-semibold text-amber-300/80 hover:from-amber-400/20 hover:to-violet-500/20 hover:border-amber-400/50 transition-all duration-300 cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>

          {/* Contact details */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 md:justify-end md:items-center">
            {[
              { label: "Email", value: "support@travelease.com" },
              { label: "Phone", value: "+977 98-123-4567" },
              { label: "HQ", value: "Kathmandu, Nepal" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] tracking-[0.22em] uppercase text-amber-400/40 font-medium mb-0.5">
                  {label}
                </p>
                <p className="text-xs font-light text-violet-300/60">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-violet-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] font-light tracking-widest text-violet-400/30">
            © 2026 TravelEase. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-light tracking-wider text-amber-400/30">
            <span className="w-1 h-1 rounded-full bg-amber-400/30 hidden sm:inline-block" />
            <span>Condé Nast Gold List 2025</span>
            <span className="w-1 h-1 rounded-full bg-amber-400/30" />
            <span>World's Best Luxury Travel Brand</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;