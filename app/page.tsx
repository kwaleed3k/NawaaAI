"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Brain, Calendar, Sparkles, Globe, Target, Download,
  Building2, Play, Image as ImageIcon, Zap, Search, Heart, Hash,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { AnimatedCounter } from "@/components/AnimatedCounter";

/* ═══════════════════════════════
   3D Cube
   ═══════════════════════════════ */
function Cube3D({ size, border, bg, dur, reverse }: {
  size: number; border: string; bg: string; dur: number; reverse?: boolean;
}) {
  const h = size / 2;
  const f: React.CSSProperties = {
    position: "absolute", width: size, height: size, borderRadius: "25%",
    border: `2px solid ${border}`, background: bg,
  };
  return (
    <div className="nl-cube" style={{ width: size, height: size, animation: `nl-spin ${dur}s linear infinite ${reverse ? "reverse" : ""}` }}>
      <div style={{ ...f, transform: `translateZ(${h}px)` }} />
      <div style={{ ...f, transform: `translateZ(${-h}px) rotateY(180deg)` }} />
      <div style={{ ...f, transform: `translateX(${-h}px) rotateY(-90deg)` }} />
      <div style={{ ...f, transform: `translateX(${h}px) rotateY(90deg)` }} />
      <div style={{ ...f, transform: `translateY(${-h}px) rotateX(90deg)` }} />
      <div style={{ ...f, transform: `translateY(${h}px) rotateX(-90deg)` }} />
    </div>
  );
}

/* Floating particle dots */
function Particles({ count, className }: { count: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => {
        const s1 = (i * 7 + 13) % 100;
        const s2 = (i * 11 + 37) % 100;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + (s1 % 5),
              height: 3 + (s2 % 5),
              top: `${s1}%`,
              left: `${s2}%`,
              background: ["#23ab7e", "#8054b8", "#e67af3", "#a6ffea", "#c4a8e8"][i % 5],
              opacity: 0.15 + (s1 % 25) / 100,
              animation: `nl-float-particle ${8 + (s1 % 12)}s ease-in-out infinite`,
              animationDelay: `${(s2 % 60) / 10}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* Platform SVG Icons */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
      <defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#feda75"/><stop offset="25%" stopColor="#fa7e1e"/><stop offset="50%" stopColor="#d62976"/><stop offset="75%" stopColor="#962fbf"/><stop offset="100%" stopColor="#4f5bd5"/></linearGradient></defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#ig)" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="url(#ig)" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig)"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="none">
      <path d="M16.6 5.82A4.27 4.27 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.43 0-2.59-1.16-2.59-2.59a2.59 2.59 0 012.59-2.59c.27 0 .53.04.78.12V9.6a5.73 5.73 0 00-.78-.05A5.73 5.73 0 004.13 15.3a5.73 5.73 0 005.73 5.73 5.73 5.73 0 005.73-5.73V9.4a7.34 7.34 0 004.28 1.37V7.68A4.28 4.28 0 0116.6 5.82z" fill="#1a1d2e"/>
      <path d="M16.6 5.82A4.27 4.27 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.43 0-2.59-1.16-2.59-2.59a2.59 2.59 0 012.59-2.59c.27 0 .53.04.78.12V9.6" fill="none" stroke="#25f4ee" strokeWidth="0.5"/>
    </svg>
  );
}
function SnapchatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="#FFFC00" stroke="#1a1d2e" strokeWidth="0.3">
      <path d="M12 2C8.13 2 5 5.13 5 9v.5c0 .55-.16 1-.45 1.36-.38.47-.88.7-1.38.84-.3.08-.5.35-.45.66.04.25.22.46.48.5.6.1 1.2.3 1.45.8.17.34.1.74-.2 1.26-.38.66-.97 1.18-1.57 1.56-.3.2-.38.6-.2.9.13.22.38.36.63.32a6.4 6.4 0 011.69.24c.5.16.87.47 1.33.87C7.6 19.68 9.5 22 12 22s4.4-2.32 5.67-3.19c.46-.4.83-.7 1.33-.87a6.4 6.4 0 011.69-.24c.25.04.5-.1.63-.32.18-.3.1-.7-.2-.9-.6-.38-1.19-.9-1.57-1.56-.3-.52-.37-.92-.2-1.26.25-.5.85-.7 1.45-.8.26-.04.44-.25.48-.5.05-.31-.15-.58-.45-.66-.5-.14-1-.37-1.38-.84A2.5 2.5 0 0119 9.5V9c0-3.87-3.13-7-7-7z"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-11 h-11 sm:w-14 sm:h-14 lg:w-18 lg:h-18" fill="#ffffff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const { locale, setLocale } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(min-width:769px)").matches) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      scene.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".nl-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Card carousel — center focus
  const updateActiveCard = useCallback(() => {
    const tk = trackRef.current;
    if (!tk) return;
    const cards = tk.querySelectorAll<HTMLElement>("[data-scard]");
    if (!cards.length) return;
    const tkRect = tk.getBoundingClientRect();
    const tkCenter = tkRect.left + tkRect.width / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - tkCenter);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });
    setActiveCard(closestIdx);
  }, []);

  useEffect(() => {
    const tk = trackRef.current;
    if (!tk) return;
    let raf: number;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateActiveCard); };
    tk.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(updateActiveCard);
    return () => tk.removeEventListener("scroll", onScroll);
  }, [updateActiveCard]);

  const goToCard = (idx: number) => {
    const tk = trackRef.current;
    if (!tk) return;
    const cards = tk.querySelectorAll<HTMLElement>("[data-scard]");
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(idx, cards.length - 1));
    const target = cards[clamped];
    // scrollIntoView handles RTL automatically
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const L = messages[locale].landing;
  const N = messages[locale].nav;
  const isRtl = locale === "ar";
  const headingFont = isRtl ? "var(--font-cairo),'IBM Plex Sans Arabic',sans-serif" : "'Playfair Display',var(--font-cairo),serif";

  const services = [
    { num: "01", icon: Brain, title: L.feature1Title, desc: L.feature1Desc, tag: isRtl ? "استراتيجي العلامة" : "Brand Strategist", color: "#23ab7e", bg: "rgba(35,171,126,.08)" },
    { num: "02", icon: Calendar, title: L.feature2Title, desc: L.feature2Desc, tag: isRtl ? "استراتيجي المحتوى" : "Content Strategist", color: "#8054b8", bg: "rgba(128,84,184,.08)" },
    { num: "03", icon: ImageIcon, title: L.feature3Title, desc: L.feature3Desc, tag: isRtl ? "المصمم" : "Graphic Designer", color: "#e67af3", bg: "rgba(230,122,243,.08)" },
    { num: "04", icon: Hash, title: L.feature4Title, desc: L.feature4Desc, tag: isRtl ? "مدير التواصل" : "Social Manager", color: "#2dd4a0", bg: "rgba(45,212,160,.08)" },
    { num: "05", icon: Target, title: L.feature5Title, desc: L.feature5Desc, tag: isRtl ? "ذكاء استراتيجي" : "Intelligence", color: "#c4a8e8", bg: "rgba(196,168,232,.08)" },
    { num: "06", icon: Download, title: L.feature6Title, desc: L.feature6Desc, tag: isRtl ? "خزنة المحتوى" : "Content Vault", color: "#f5c6fa", bg: "rgba(245,198,250,.08)" },
  ];

  const stepColors = ["#23ab7e", "#8054b8", "#e67af3"];

  return (
    <div className="overflow-x-hidden bg-white text-[#2d3142] antialiased" dir={isRtl ? "rtl" : "ltr"}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] h-16 lg:h-20 flex items-center justify-between px-5 sm:px-8 lg:px-14 transition-all duration-300 nl-glass-nav ${scrolled ? "bg-white/96 shadow-[0_2px_20px_rgba(0,0,0,.06)]" : ""}`} style={{ borderBottom: "1px solid rgba(0,0,0,.04)" }}>
        <Link href="/" className="flex items-center gap-3 shrink-0 no-underline">
          <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#23ab7e,#8054b8)", boxShadow: "0 4px 16px rgba(35,171,126,.3)" }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 lg:w-7 lg:h-7">
              <path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2" fill="#a6ffea"/><circle cx="24" cy="16" r="2" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl lg:text-2xl font-extrabold text-[#1a1d2e]">{isRtl ? "نواة" : "Nawaa"} <span className="bg-gradient-to-r from-[#23ab7e] to-[#8054b8] bg-clip-text text-transparent">AI</span></span>
        </Link>
        <ul className="hidden lg:flex list-none gap-2">
          {[{ href: "#features", label: N.features }, { href: "#how-it-works", label: L.howItWorks }, { href: "#platforms", label: isRtl ? "المنصات" : "Platforms" }].map((l) => (
            <li key={l.href}><a href={l.href} className="text-base font-medium text-[#505868] no-underline px-4 py-2 rounded-lg hover:text-[#2d3142] hover:bg-[#f4f6f8] transition-all">{l.label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-sm font-semibold text-[#505868] px-4 py-2 rounded-xl border border-[#e8ecf0] bg-white cursor-pointer hover:bg-[#f4f6f8] transition-all">{locale === "ar" ? "EN" : "عر"}</button>
          <Link href="/login" className="hidden sm:block"><button className="text-base font-semibold text-[#505868] px-5 py-2.5 rounded-lg border-none bg-transparent cursor-pointer hover:text-[#2d3142]">{N.login}</button></Link>
          <Link href="/signup"><button className="text-sm lg:text-base font-bold text-white px-5 lg:px-8 py-2.5 lg:py-3.5 rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#23ab7e,#1a8a64)", boxShadow: "0 4px 16px rgba(35,171,126,.3)" }}>{N.signUp}</button></Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 lg:pt-32 px-5 sm:px-8 lg:px-14 pb-14 lg:pb-20" style={{ background: "linear-gradient(170deg,#f0fdf8 0%,#fff 25%,#f5f0ff 60%,#fef5ff 100%)" }}>
        {/* 3D Scene */}
        <div ref={sceneRef} className="absolute inset-0 pointer-events-none" style={{ perspective: "1200px", transformStyle: "preserve-3d" }}>
          {/* Cubes */}
          <div className="absolute top-[6%] left-[2%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-a 16s ease-in-out infinite" }}>
            <Cube3D size={80} border="rgba(35,171,126,.2)" bg="rgba(35,171,126,.05)" dur={18} />
          </div>
          <div className="absolute top-[10%] right-[4%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-b 18s ease-in-out infinite" }}>
            <Cube3D size={60} border="rgba(128,84,184,.2)" bg="rgba(128,84,184,.05)" dur={24} reverse />
          </div>
          <div className="absolute bottom-[18%] left-[4%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-c 14s ease-in-out infinite" }}>
            <Cube3D size={50} border="rgba(230,122,243,.2)" bg="rgba(230,122,243,.05)" dur={15} />
          </div>
          <div className="absolute bottom-[10%] right-[3%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-a 20s ease-in-out infinite reverse" }}>
            <Cube3D size={70} border="rgba(166,255,234,.22)" bg="rgba(166,255,234,.05)" dur={22} reverse />
          </div>
          <div className="absolute top-[40%] left-[12%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-d 22s ease-in-out infinite" }}>
            <Cube3D size={35} border="rgba(196,168,232,.18)" bg="rgba(196,168,232,.04)" dur={20} />
          </div>
          <div className="absolute top-[25%] right-[15%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-c 19s ease-in-out infinite" }}>
            <Cube3D size={42} border="rgba(245,198,250,.2)" bg="rgba(245,198,250,.04)" dur={26} reverse />
          </div>

          {/* 3D Rings */}
          <div className="absolute top-[28%] right-[6%] w-[140px] h-[140px] lg:w-[200px] lg:h-[200px] rounded-full" style={{ border: "2.5px solid rgba(166,255,234,.22)", transformStyle: "preserve-3d", animation: "nl-ring-rotate 14s linear infinite" }}>
            <div className="absolute inset-[18px] rounded-full" style={{ border: "2px solid rgba(128,84,184,.15)" }} />
          </div>
          <div className="absolute bottom-[30%] left-[8%] w-[90px] h-[90px] lg:w-[130px] lg:h-[130px] rounded-full" style={{ border: "2px solid rgba(230,122,243,.15)", transformStyle: "preserve-3d", animation: "nl-ring-rotate-2 18s linear infinite" }}>
            <div className="absolute inset-[12px] rounded-full" style={{ border: "1.5px solid rgba(35,171,126,.12)" }} />
          </div>

          {/* Spheres */}
          <div className="absolute bottom-[5%] right-[3%] w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%,rgba(166,255,234,.4),rgba(35,171,126,.04) 70%)", animation: "nl-drift-b 20s ease-in-out infinite" }} />
          <div className="absolute top-[5%] left-[12%] w-[120px] h-[120px] lg:w-[180px] lg:h-[180px] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%,rgba(196,168,232,.4),rgba(128,84,184,.04) 70%)", animation: "nl-drift-c 16s ease-in-out infinite" }} />
          <div className="absolute top-[55%] right-[20%] w-[60px] h-[60px] lg:w-[100px] lg:h-[100px] rounded-full" style={{ background: "radial-gradient(circle at 40% 40%,rgba(230,122,243,.3),transparent 70%)", animation: "nl-drift-d 15s ease-in-out infinite" }} />

          {/* Orbiting dots */}
          <div className="absolute top-[20%] left-[30%]" style={{ animation: "nl-orbit 12s linear infinite" }}>
            <div className="w-3 h-3 rounded-full bg-[#23ab7e] opacity-40" />
          </div>
          <div className="absolute top-[50%] right-[25%]" style={{ animation: "nl-orbit-lg 16s linear infinite reverse" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#8054b8] opacity-35" />
          </div>

          {/* Particles */}
          <Particles count={20} className="absolute inset-0" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center w-full max-w-[1000px]">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold text-[#1a8a64] mb-8 sm:mb-10" style={{ background: "rgba(35,171,126,.08)", border: "1.5px solid rgba(35,171,126,.15)", opacity: 0, animation: "nl-fade-up .7s ease forwards .2s" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#23ab7e]" style={{ animation: "nl-pulse-dot 2s ease infinite" }} />
            {L.heroBadge}
          </div>

          <h1 className="whitespace-nowrap pb-4" style={{ fontSize: "clamp(42px, 9vw, 120px)", fontFamily: headingFont, lineHeight: 1.2, fontWeight: 900, opacity: 0, animation: "nl-fade-up-lg .9s ease forwards .3s" }}>
            <span className="block text-[#1a1d2e]">{L.heroLine1}</span>
            <span className="block nl-gradient-text pb-2">{L.heroLine2}</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-[#505868] leading-relaxed max-w-[650px] mx-auto mt-5 sm:mt-6 mb-8 sm:mb-10" style={{ opacity: 0, animation: "nl-fade-up .7s ease forwards .5s" }}>
            {L.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5" style={{ opacity: 0, animation: "nl-fade-up .7s ease forwards .6s" }}>
            <Link href="/signup">
              <button className="relative text-lg sm:text-xl font-bold text-white py-4 sm:py-5 px-10 sm:px-14 rounded-2xl border-none cursor-pointer w-full sm:w-auto overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(35,171,126,.4)]" style={{ background: "linear-gradient(135deg,#23ab7e,#1a8a64)", boxShadow: "0 8px 32px rgba(35,171,126,.35)" }}>
                <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
                <span className="relative">{L.startFreeBilingual}</span>
              </button>
            </Link>
            <button className="inline-flex items-center gap-3 text-lg font-semibold text-[#505868] py-4 px-8 rounded-2xl border-2 border-[#d1d6df] bg-white cursor-pointer hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all">
              <Play className="w-5 h-5 fill-current" />
              {L.watchDemo}
            </button>
          </div>

          <div className="flex justify-center gap-10 sm:gap-16 mt-10 sm:mt-14" style={{ opacity: 0, animation: "nl-fade-up .7s ease forwards .75s" }}>
            {[{ val: 500, suf: "+", label: L.statBrands }, { val: 50, suf: "K+", label: L.statPosts }, { val: 10, suf: "x", label: L.statFaster }].map((s) => (
              <div key={s.label}>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#23ab7e]">
                  <AnimatedCounter end={s.val} suffix={s.suf} duration={2000} />
                </div>
                <div className="text-sm sm:text-base text-[#8f96a3] mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CASE STUDY ══════════ */}
      <section id="case" className="relative overflow-hidden py-28 sm:py-36 lg:py-48 px-0 bg-[#1a1d2e]">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 0% 100%,rgba(35,171,126,.18),transparent 60%),radial-gradient(ellipse 60% 60% at 100% 0%,rgba(128,84,184,.12),transparent 50%)" }} />
        {/* Floating cubes in dark section */}
        <div className="absolute inset-0 pointer-events-none" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          <div className="absolute top-[8%] right-[6%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-b 20s ease-in-out infinite" }}>
            <Cube3D size={55} border="rgba(35,171,126,.2)" bg="rgba(35,171,126,.05)" dur={20} />
          </div>
          <div className="absolute bottom-[12%] left-[4%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-a 18s ease-in-out infinite" }}>
            <Cube3D size={40} border="rgba(128,84,184,.2)" bg="rgba(128,84,184,.05)" dur={16} reverse />
          </div>
          <div className="absolute top-[45%] left-[50%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-d 22s ease-in-out infinite" }}>
            <Cube3D size={30} border="rgba(230,122,243,.15)" bg="rgba(230,122,243,.04)" dur={25} />
          </div>
          <Particles count={18} className="absolute inset-0" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center px-6 sm:px-10 lg:px-20">
          <div className="nl-reveal">
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#a6ffea] mb-7">
              <span className="w-10 h-0.5 rounded bg-[#a6ffea]" />
              {isRtl ? "قصة نجاح" : "Success Story"}
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-8" style={{ fontFamily: headingFont }}>
              {isRtl ? "كيف وفّر مقهى بلوم " : "How Bloom Café saved "}
              <span className="text-[#2dd4a0]">{isRtl ? "١٨,٠٠٠ ر.س/شهر" : "SAR 18,000/mo"}</span>
              {isRtl ? " مع نواة AI" : " with Nawaa AI"}
            </h2>
            <p className="text-lg lg:text-xl text-white/65 leading-relaxed mb-12 max-w-[560px]">
              {isRtl ? "كان مقهى بلوم ينفق ٢٢,٠٠٠ ريال شهرياً على وكالة بنتائج غير ثابتة. مع نواة AI، يولّدون أسبوعاً كاملاً من المحتوى والمرئيات والهاشتاقات في أقل من ١٠ دقائق." : "Bloom Café spent SAR 22,000/mo on an agency with inconsistent results. With Nawaa AI, they generate a full week of bilingual content, branded visuals, and optimized hashtags in under 10 minutes."}
            </p>
            <div className="flex gap-12 flex-wrap">
              {[{ v: "82%", l: isRtl ? "توفير" : "Cost Saved" }, { v: "3.4x", l: isRtl ? "تفاعل" : "Engagement" }, { v: "10 min", l: isRtl ? "إعداد أسبوعي" : "Weekly Setup" }].map((n) => (
                <div key={n.l}>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2dd4a0]">{n.v}</div>
                  <div className="text-base text-white/40 mt-2 font-medium">{n.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="nl-reveal nl-reveal-d1" style={{ perspective: "1000px" }}>
            <div className="rounded-3xl overflow-hidden nl-mock-3d" style={{ background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.12)", boxShadow: "-20px 20px 60px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.06) inset,0 0 100px rgba(35,171,126,.1)" }}>
              <div className="flex items-center gap-4 px-8 sm:px-10 py-7 sm:py-8" style={{ background: "linear-gradient(135deg,#23ab7e,#1a8a64)" }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl sm:text-3xl">🌸</div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">Bloom Café</div>
                  <div className="text-sm sm:text-base text-white/70">Coffee &amp; Pastry · Riyadh</div>
                </div>
              </div>
              <div className="px-8 sm:px-10 py-6 sm:py-8">
                {[
                  { label: isRtl ? "المحتوى الأسبوعي" : "Weekly Content", value: "28 Posts", cls: "text-[#2dd4a0]" },
                  { label: isRtl ? "التفاعل" : "Engagement", value: "8.7%", cls: "text-[#c4a8e8]", bar: 87, bc: "#c4a8e8" },
                  { label: isRtl ? "درجة العلامة" : "Brand Score", value: "96%", cls: "text-[#f5c6fa]", bar: 96, bc: "#f5c6fa" },
                  { label: isRtl ? "التوفير الشهري" : "Monthly Savings", value: "SAR 18,200", cls: "text-[#2dd4a0]" },
                  { label: isRtl ? "جودة العربية" : "Arabic Quality", value: "94%", cls: "text-[#2dd4a0]", bar: 94, bc: "#2dd4a0" },
                ].map((r, i, a) => (
                  <div key={r.label} className={`flex justify-between items-center py-4 sm:py-5 ${i < a.length - 1 ? "border-b border-white/[.06]" : ""}`}>
                    <span className="text-base sm:text-lg text-white/55">{r.label}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-base sm:text-lg font-bold ${r.cls}`}>{r.value}</span>
                      {r.bar && <div className="w-20 sm:w-24 h-2 bg-white/[.08] rounded-sm overflow-hidden"><div className="h-full rounded-sm" style={{ width: `${r.bar}%`, background: r.bc }} /></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SERVICE CARDS — CENTER FOCUS ══════════ */}
      <section id="features" className="relative overflow-hidden py-28 sm:py-36 lg:py-44" style={{ background: "linear-gradient(180deg,#f7f9fb 0%,#f0f4f8 50%,#f7f9fb 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%,black,transparent)" }} />

        <div className="text-center px-5 sm:px-8 pb-16 lg:pb-24 relative z-10 nl-reveal">
          <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#23ab7e] mb-6">
            <span className="w-10 h-0.5 rounded bg-[#23ab7e]" />
            {L.featuresLabel}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#1a1d2e] leading-tight mb-5" style={{ fontFamily: headingFont }}>
            {L.featuresTitle}
          </h2>
          <p className="text-lg lg:text-2xl text-[#8f96a3] max-w-[650px] mx-auto">{L.featuresSub}</p>
        </div>

        <div ref={trackRef} className="nl-track flex gap-7 lg:gap-10 px-[calc(50vw-200px)] sm:px-[calc(50vw-220px)] lg:px-[calc(50vw-240px)] pb-10 overflow-x-auto overflow-y-visible snap-x snap-mandatory relative z-10" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
          {services.map((s, i) => {
            const isActive = i === activeCard;
            return (
              <div
                key={s.num}
                data-scard
                className="shrink-0 w-[400px] sm:w-[440px] lg:w-[480px] min-h-[500px] lg:min-h-[560px] snap-center relative flex flex-col select-none rounded-3xl p-9 sm:p-10 lg:p-12"
                style={{
                  background: isActive ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.6)",
                  backdropFilter: "blur(20px) saturate(1.5)",
                  border: isActive ? "1.5px solid rgba(255,255,255,1)" : "1px solid rgba(255,255,255,.7)",
                  boxShadow: isActive
                    ? `0 4px 8px rgba(0,0,0,.04),0 12px 32px rgba(0,0,0,.08),0 32px 80px rgba(0,0,0,.08),0 40px 80px ${s.color}22`
                    : "0 2px 8px rgba(0,0,0,.03),0 8px 20px rgba(0,0,0,.04)",
                  transform: isActive ? "scale(1)" : "scale(0.88)",
                  filter: isActive ? "none" : "blur(1.5px)",
                  opacity: isActive ? 1 : 0.5,
                  transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(${isRtl ? "270deg" : "90deg"},${s.color},transparent)`, opacity: isActive ? 0.8 : 0.3 }} />
                {isActive && <div className="absolute -bottom-6 left-[15%] right-[15%] h-8 rounded-full" style={{ background: s.color, filter: "blur(24px)", opacity: 0.3 }} />}
                <div className="absolute top-6 text-7xl lg:text-8xl font-black leading-none tracking-[-4px]" style={{ color: isActive ? "#e8ecf0" : "#f4f6f8", insetInlineEnd: 28 }}>{s.num}</div>
                <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mb-7" style={{ background: s.bg }}>
                  <s.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11" style={{ color: s.color }} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#1a1d2e] mb-3">{s.title}</h3>
                <p className="text-base lg:text-lg text-[#8f96a3] leading-relaxed flex-1">{s.desc}</p>
                <span className="inline-block self-start mt-6 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color }}>{s.tag}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 relative z-10 pt-6">
          <button onClick={() => goToCard(activeCard - (isRtl ? -1 : 1))} className="w-12 h-12 rounded-full border-2 border-[#d1d6df] bg-white flex items-center justify-center cursor-pointer text-[#8f96a3] hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all active:scale-95">
            {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="flex gap-2">
            {services.map((_, i) => (
              <div key={i} onClick={() => goToCard(i)} className={`h-2.5 rounded-full cursor-pointer transition-all duration-400 ${i === activeCard ? "w-8 bg-gradient-to-r from-[#23ab7e] to-[#8054b8]" : "w-2.5 bg-[#d1d6df] hover:bg-[#8f96a3]"}`} />
            ))}
          </div>
          <button onClick={() => goToCard(activeCard + (isRtl ? -1 : 1))} className="w-12 h-12 rounded-full border-2 border-[#d1d6df] bg-white flex items-center justify-center cursor-pointer text-[#8f96a3] hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all active:scale-95">
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS — 3D Glass ══════════ */}
      <section id="how-it-works" className="relative overflow-hidden px-5 sm:px-8 lg:px-14 py-28 sm:py-36 lg:py-44" style={{ background: "linear-gradient(170deg,#fff 0%,#f5f0ff 40%,#f0fdf8 70%,#fff 100%)" }}>
        <Particles count={15} className="absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-[1300px]">
          <div className="text-center mb-20 lg:mb-28 nl-reveal">
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#8054b8] mb-6">
              <span className="w-10 h-0.5 rounded bg-[#8054b8]" />
              {L.howItWorksLabel}
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#1a1d2e] leading-tight" style={{ fontFamily: headingFont }}>
              {L.howItWorksTitle}
            </h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {/* Animated connecting line */}
            <div className="absolute top-[80px] lg:top-[90px] hidden sm:block h-1.5 rounded-full overflow-hidden" style={{ left: "18%", right: "18%" }}>
              <div className="h-full w-full rounded-full" style={{ background: "linear-gradient(90deg,#23ab7e,#8054b8,#e67af3)", backgroundSize: "200% 100%", animation: "nl-aurora 4s ease infinite" }} />
            </div>

            {[
              { step: "1", icon: Building2, title: L.addCompany, desc: L.addCompanyDesc },
              { step: "2", icon: Sparkles, title: L.generatePlan, desc: L.generatePlanDesc },
              { step: "3", icon: Download, title: L.downloadPost, desc: L.downloadPostDesc },
            ].map((s, i) => (
              <div key={s.step} className={`nl-reveal ${i > 0 ? `nl-reveal-d${i}` : ""} relative text-center`}>
                <div className="nl-step-glass rounded-3xl p-8 sm:p-10 lg:p-12" style={{ boxShadow: `0 12px 40px ${stepColors[i]}15, 0 4px 12px rgba(0,0,0,.04)` }}>
                  {/* Glowing number circle */}
                  <div className="relative mx-auto mb-8 w-24 h-24 lg:w-28 lg:h-28">
                    <div className="absolute inset-0 rounded-full" style={{ background: stepColors[i], opacity: 0.15, animation: "nl-glow-breathe 3s ease-in-out infinite", animationDelay: `${i * 0.5}s` }} />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${stepColors[i]},${stepColors[i]}dd)`, boxShadow: `0 10px 40px ${stepColors[i]}40` }}>
                      <s.icon className="w-10 h-10 lg:w-13 lg:h-13 text-white" />
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full" style={{ border: `2.5px solid ${stepColors[i]}`, animation: "nl-pulse-ring 2.5s ease-in-out infinite", animationDelay: `${i * 0.8}s` }} />
                  </div>
                  <span className="inline-block text-5xl lg:text-6xl font-black mb-4" style={{ color: stepColors[i] }}>{s.step}</span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#1a1d2e] mb-4">{s.title}</h3>
                  <p className="text-base lg:text-lg text-[#8f96a3] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORMS ══════════ */}
      <section id="platforms" className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32 lg:py-40 bg-[#1a1d2e] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(35,171,126,.1),transparent 70%)" }} />
        <Particles count={14} className="absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-[1100px] relative z-10">
          <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-14 lg:mb-20 nl-reveal" style={{ fontFamily: headingFont }}>
            {L.platformTitle}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 nl-reveal nl-reveal-d1">
            {[
              { name: "Instagram", Icon: InstagramIcon, shadow: "rgba(225,48,108,.25)" },
              { name: "TikTok", Icon: TikTokIcon, shadow: "rgba(0,0,0,.2)" },
              { name: "Snapchat", Icon: SnapchatIcon, shadow: "rgba(255,252,0,.2)" },
              { name: "X", Icon: XIcon, shadow: "rgba(255,255,255,.12)" },
              { name: "LinkedIn", Icon: LinkedInIcon, shadow: "rgba(10,102,194,.25)" },
              { name: "YouTube", Icon: YouTubeIcon, shadow: "rgba(255,0,0,.2)" },
            ].map((p) => (
              <div key={p.name} className="nl-platform-icon flex flex-col items-center gap-4 cursor-default">
                <p.Icon />
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-white/60">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA — Aurora ══════════ */}
      <section className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32 lg:py-40 relative overflow-hidden" style={{ background: "linear-gradient(170deg,#f0fdf8,#fff,#f5f0ff)" }}>
        <div className="mx-auto max-w-[1100px]">
          <div className="nl-reveal relative overflow-hidden rounded-[32px] lg:rounded-[40px] p-10 sm:p-16 lg:p-24 text-center nl-aurora-bg" style={{ boxShadow: "0 30px 80px rgba(35,171,126,.25),0 0 120px rgba(128,84,184,.1)" }}>
            {/* Floating 3D elements */}
            <div className="absolute inset-0 pointer-events-none" style={{ perspective: "600px", transformStyle: "preserve-3d" }}>
              <div className="absolute top-[10%] left-[8%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-c 12s ease-in-out infinite" }}>
                <Cube3D size={35} border="rgba(255,255,255,.25)" bg="rgba(255,255,255,.06)" dur={14} />
              </div>
              <div className="absolute bottom-[15%] right-[10%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-b 15s ease-in-out infinite" }}>
                <Cube3D size={28} border="rgba(255,255,255,.2)" bg="rgba(255,255,255,.05)" dur={18} reverse />
              </div>
              <div className="absolute top-[20%] right-[15%] w-[80px] h-[80px] rounded-full border-2 border-white/15" style={{ animation: "nl-ring-rotate 10s linear infinite" }} />
            </div>

            <div className="absolute -top-28 h-[300px] w-[300px] rounded-full opacity-20" style={{ background: "radial-gradient(circle,#fff,transparent)", insetInlineEnd: -112 }} />
            <div className="absolute -bottom-24 -left-24 h-[250px] w-[250px] rounded-full opacity-15" style={{ background: "radial-gradient(circle,#fff,transparent)" }} />

            <h2 className="relative text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 lg:mb-8" style={{ fontFamily: headingFont }}>
              {L.ctaTitle}
            </h2>
            <p className="relative text-white/80 text-xl lg:text-2xl mb-10 lg:mb-14 max-w-[700px] mx-auto">{L.ctaSub}</p>

            <Link href="/signup">
              <button className="relative text-xl lg:text-2xl font-bold text-[#1a8a64] bg-white px-14 lg:px-20 py-5 lg:py-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,.2)] active:scale-[0.98]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,.15)" }}>
                {L.ctaButton}
              </button>
            </Link>

            <div className="relative flex flex-wrap justify-center gap-6 sm:gap-12 mt-12 lg:mt-16">
              {[{ icon: Zap, label: isRtl ? "إعداد في ٥ دقائق" : "5 min setup" }, { icon: Heart, label: isRtl ? "بدون بطاقة" : "No credit card" }, { icon: Globe, label: isRtl ? "عربي + إنجليزي" : "Arabic + English" }].map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 text-white/70">
                  <t.icon className="w-5 h-5" />
                  <span className="text-base font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative overflow-hidden bg-[#1a1d2e] py-16 px-5 sm:px-8 lg:py-20 lg:px-14 pb-8">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#23ab7e,#8054b8,#e67af3,#23ab7e)", backgroundSize: "300% 100%", animation: "nl-footer-line 6s linear infinite" }} />
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 no-underline mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#23ab7e,#8054b8)" }}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5"><path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2" fill="#a6ffea"/><circle cx="24" cy="16" r="2" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <span className="text-xl font-extrabold text-white">{isRtl ? "نواة" : "Nawaa"} <span className="bg-gradient-to-r from-[#23ab7e] to-[#8054b8] bg-clip-text text-transparent">AI</span></span>
              </Link>
              <p className="text-sm text-white/45 leading-relaxed max-w-[280px] mt-3">{L.footerBuilt}</p>
              <p className="text-xs text-white/30 mt-2">{L.footerTagline}</p>
            </div>
            {[
              { title: isRtl ? "المنتج" : "Product", links: isRtl ? ["بناء العلامة","مخطط المحتوى","استوديو الرؤية","مركز الهاشتاقات"] : ["Brand Builder","Content Planner","Vision Studio","Hashtag Hub"] },
              { title: isRtl ? "الشركة" : "Company", links: isRtl ? ["عنّا","الوظائف","المدونة","تواصل معنا"] : ["About Us","Careers","Blog","Contact"] },
              { title: isRtl ? "الموارد" : "Resources", links: isRtl ? ["التوثيق","الخصوصية","الشروط","المساعدة"] : ["Documentation","Privacy Policy","Terms","Help"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-[2px] mb-4">{col.title}</h4>
                {col.links.map((l) => <a key={l} href="#" className="block text-sm text-white/40 no-underline py-1 hover:text-[#a6ffea] transition-all">{l}</a>)}
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/[.06] flex flex-col md:flex-row items-center md:justify-between gap-3">
            <p className="text-xs text-white/25">© 2026 Nawaa AI by Siyada Tech.</p>
            <div className="flex gap-5">
              {(isRtl ? ["الخصوصية","الشروط","ملفات تعريف"] : ["Privacy","Terms","Cookies"]).map((l) => <a key={l} href="#" className="text-xs text-white/25 no-underline hover:text-[#a6ffea] transition-colors">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
