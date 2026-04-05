"use client";

import Link from "next/link";
import Script from "next/script";
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
              background: ["#23ab7e", "#003986", "#921cb4", "#a6ffea", "#003986"][i % 5],
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
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16">
      <defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#feda75"/><stop offset="25%" stopColor="#fa7e1e"/><stop offset="50%" stopColor="#d62976"/><stop offset="75%" stopColor="#962fbf"/><stop offset="100%" stopColor="#4f5bd5"/></linearGradient></defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#ig)" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="url(#ig)" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig)"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" fill="none">
      <path d="M16.6 5.82A4.27 4.27 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.43 0-2.59-1.16-2.59-2.59a2.59 2.59 0 012.59-2.59c.27 0 .53.04.78.12V9.6a5.73 5.73 0 00-.78-.05A5.73 5.73 0 004.13 15.3a5.73 5.73 0 005.73 5.73 5.73 5.73 0 005.73-5.73V9.4a7.34 7.34 0 004.28 1.37V7.68A4.28 4.28 0 0116.6 5.82z" fill="#1a1d2e"/>
      <path d="M16.6 5.82A4.27 4.27 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.43 0-2.59-1.16-2.59-2.59a2.59 2.59 0 012.59-2.59c.27 0 .53.04.78.12V9.6" fill="none" stroke="#25f4ee" strokeWidth="0.5"/>
    </svg>
  );
}
function SnapchatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" fill="#FFFC00" stroke="#1a1d2e" strokeWidth="0.3">
      <path d="M12 2C8.13 2 5 5.13 5 9v.5c0 .55-.16 1-.45 1.36-.38.47-.88.7-1.38.84-.3.08-.5.35-.45.66.04.25.22.46.48.5.6.1 1.2.3 1.45.8.17.34.1.74-.2 1.26-.38.66-.97 1.18-1.57 1.56-.3.2-.38.6-.2.9.13.22.38.36.63.32a6.4 6.4 0 011.69.24c.5.16.87.47 1.33.87C7.6 19.68 9.5 22 12 22s4.4-2.32 5.67-3.19c.46-.4.83-.7 1.33-.87a6.4 6.4 0 011.69-.24c.25.04.5-.1.63-.32.18-.3.1-.7-.2-.9-.6-.38-1.19-.9-1.57-1.56-.3-.52-.37-.92-.2-1.26.25-.5.85-.7 1.45-.8.26-.04.44-.25.48-.5.05-.31-.15-.58-.45-.66-.5-.14-1-.37-1.38-.84A2.5 2.5 0 0119 9.5V9c0-3.87-3.13-7-7-7z"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14" fill="#ffffff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" fill="#FF0000">
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
    { num: "02", icon: Calendar, title: L.feature2Title, desc: L.feature2Desc, tag: isRtl ? "استراتيجي المحتوى" : "Content Strategist", color: "#003986", bg: "rgba(0,57,134,.08)" },
    { num: "03", icon: ImageIcon, title: L.feature3Title, desc: L.feature3Desc, tag: isRtl ? "المصمم" : "Graphic Designer", color: "#921cb4", bg: "rgba(146,28,180,.08)" },
    { num: "04", icon: Hash, title: L.feature4Title, desc: L.feature4Desc, tag: isRtl ? "مدير التواصل" : "Social Manager", color: "#2dd4a0", bg: "rgba(45,212,160,.08)" },
    { num: "05", icon: Target, title: L.feature5Title, desc: L.feature5Desc, tag: isRtl ? "ذكاء استراتيجي" : "Intelligence", color: "#003986", bg: "rgba(0,57,134,.08)" },
    { num: "06", icon: Download, title: L.feature6Title, desc: L.feature6Desc, tag: isRtl ? "خزنة المحتوى" : "Content Vault", color: "#921cb4", bg: "rgba(245,198,250,.08)" },
  ];

  const stepColors = ["#23ab7e", "#003986", "#921cb4"];

  return (
    <div className="overflow-x-hidden bg-white text-[#2d3142] antialiased" dir={isRtl ? "rtl" : "ltr"}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] h-14 lg:h-16 flex items-center justify-between px-5 sm:px-8 lg:px-14 transition-all duration-300 nl-glass-nav ${scrolled ? "bg-white/96 shadow-[0_2px_20px_rgba(0,0,0,.06)]" : ""}`} style={{ borderBottom: "1px solid rgba(0,0,0,.04)" }}>
        <Link href="/" className="flex items-center shrink-0 no-underline">
          <img src="/nawaa-logo.svg" alt="Nawaa AI" className="h-56 lg:h-64 w-auto" />
        </Link>
        <ul className="hidden lg:flex list-none gap-2">
          {[{ href: "#features", label: N.features }, { href: "#how-it-works", label: L.howItWorks }, { href: "#platforms", label: isRtl ? "المنصات" : "Platforms" }].map((l) => (
            <li key={l.href}><a href={l.href} className="text-sm font-medium text-[#505868] no-underline px-3 py-1.5 rounded-lg hover:text-[#2d3142] hover:bg-[#f4f6f8] transition-all">{l.label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-xs font-semibold text-[#505868] px-3 py-1.5 rounded-lg border border-[#e8ecf0] bg-white cursor-pointer hover:bg-[#f4f6f8] transition-all">{locale === "ar" ? "EN" : "عر"}</button>
          <Link href="/login" className="hidden sm:block"><button className="text-sm font-semibold text-[#505868] px-4 py-2 rounded-lg border-none bg-transparent cursor-pointer hover:text-[#2d3142]">{N.login}</button></Link>
          <Link href="/signup"><button className="text-xs lg:text-sm font-bold text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#23ab7e,#1a8a64)", boxShadow: "0 4px 16px rgba(35,171,126,.3)" }}>{N.signUp}</button></Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 lg:pt-28 px-5 sm:px-8 lg:px-14 pb-14 lg:pb-20" style={{ background: "linear-gradient(170deg,#f0fdf8 0%,#fff 25%,#f5f0ff 60%,#fef5ff 100%)" }}>
        {/* Gradient glow background */}
        <div ref={sceneRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] lg:w-[900px] lg:h-[900px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(35,171,126,.3) 0%, rgba(0,57,134,.2) 30%, rgba(146,28,180,.1) 60%, transparent 80%)" }} />
        </div>

        {/* Floating Process Cards — LEFT side */}
        <div className="hidden lg:block absolute left-[3%] top-[12%] z-10 space-y-5" style={{ opacity: 0, animation: "nl-fade-up .8s ease forwards .3s" }}>
          {/* Card 1: Add Company */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[240px]" style={{ animation: "nl-drift-a 10s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#23ab7e] mb-2">Step 1</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "أضف شركتك" : "Add Your Company"}</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#23ab7e] to-[#1a8a64] flex items-center justify-center"><Building2 className="h-4 w-4 text-white" /></div>
              <div className="flex-1 h-2 rounded-full bg-[#e8eaef]"><div className="h-full w-[85%] rounded-full bg-[#23ab7e]" /></div>
            </div>
          </div>
          {/* Card 2: Brand Analysis */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[260px] ml-6" style={{ animation: "nl-drift-b 12s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#003986] mb-2">Step 2</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "تحليل العلامة التجارية" : "AI Brand Analysis"}</p>
            <div className="flex gap-1.5">
              {["Innovation", "Trust", "Energy"].map((t) => (
                <span key={t} className="text-[9px] font-bold bg-[#003986]/10 text-[#003986] px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          {/* Card 3: Content Plan */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[250px] ml-2" style={{ animation: "nl-drift-c 14s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#921cb4] mb-2">Step 3</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "خطة المحتوى الأسبوعية" : "Weekly Content Plan"}</p>
            <div className="flex gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu"].map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-[#8f96a3]">{d}</span>
                  <div className={`h-5 w-5 rounded-md ${i < 3 ? "bg-[#23ab7e]" : "bg-[#e8eaef]"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Process Cards — RIGHT side */}
        <div className="hidden lg:block absolute right-[3%] top-[15%] z-10 space-y-5" style={{ opacity: 0, animation: "nl-fade-up .8s ease forwards .5s" }}>
          {/* Card 4: Vision Studio */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[240px]" style={{ animation: "nl-drift-b 11s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#23ab7e] mb-2">Step 4</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "استوديو الرؤية" : "Generate Visuals"}</p>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg" style={{ background: ["linear-gradient(135deg,#23ab7e,#003986)", "linear-gradient(135deg,#921cb4,#003986)", "linear-gradient(135deg,#23ab7e,#921cb4)"][i] }} />
              ))}
            </div>
          </div>
          {/* Card 5: Hashtags */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[230px] mr-4" style={{ animation: "nl-drift-a 13s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#003986] mb-2">Step 5</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "هاشتاقات ذكية" : "Smart Hashtags"}</p>
            <div className="flex flex-wrap gap-1">
              {["#marketing", "#KSA", "#AI", "#brand"].map((h) => (
                <span key={h} className="text-[9px] font-bold bg-[#23ab7e]/10 text-[#23ab7e] px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
          </div>
          {/* Card 6: Competitor Analysis */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-xl px-5 py-4 w-[250px] mr-8" style={{ animation: "nl-drift-d 15s ease-in-out infinite" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#921cb4] mb-2">Step 6</p>
            <p className="text-sm font-bold text-[#1a1d2e] mb-1.5">{isRtl ? "تحليل المنافسين" : "Competitor Intel"}</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-white" style={{ background: ["#23ab7e", "#003986", "#921cb4"][i] }} />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#8f96a3]">3 {isRtl ? "منافسين" : "rivals"}</span>
            </div>
          </div>
        </div>

        {/* Mobile floating cards (simplified — 2 cards) */}
        <div className="lg:hidden absolute top-[8%] left-[3%] z-10" style={{ opacity: 0, animation: "nl-fade-up .6s ease forwards .3s" }}>
          <div className="rounded-xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-lg px-3 py-2.5 w-[140px]" style={{ animation: "nl-drift-a 10s ease-in-out infinite" }}>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#23ab7e]">Content Plan</p>
            <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_, i) => <div key={i} className={`h-3 w-3 rounded-sm ${i < 3 ? "bg-[#23ab7e]" : "bg-[#e8eaef]"}`} />)}</div>
          </div>
        </div>
        <div className="lg:hidden absolute top-[10%] right-[3%] z-10" style={{ opacity: 0, animation: "nl-fade-up .6s ease forwards .4s" }}>
          <div className="rounded-xl bg-white/90 backdrop-blur-md border border-[#e8eaef] shadow-lg px-3 py-2.5 w-[130px]" style={{ animation: "nl-drift-b 12s ease-in-out infinite" }}>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#921cb4]">Vision Studio</p>
            <div className="grid grid-cols-3 gap-0.5 mt-1">{[...Array(3)].map((_, i) => <div key={i} className="h-5 rounded-sm" style={{ background: ["#23ab7e", "#003986", "#921cb4"][i] }} />)}</div>
          </div>
        </div>

        {/* Center Content — Logo */}
        <div className="relative z-10 text-center w-full max-w-[1000px]">
          <div className="flex justify-center mb-4" style={{ opacity: 0, animation: "nl-fade-up .7s ease forwards .1s" }}>
            <img src="/nawaa-logo.svg" alt="Nawaa AI" className="w-auto drop-shadow-2xl" style={{ height: "clamp(400px, 35vw, 550px)" }} />
          </div>
          <p className="text-base sm:text-lg lg:text-xl font-bold text-[#505868] tracking-wide" style={{ opacity: 0, animation: "nl-fade-up .7s ease forwards .4s" }}>
            {isRtl ? "حلول تسويقية للمستقبل" : "MARKETING SOLUTIONS FOR TOMORROW"}
          </p>
        </div>
      </section>

      {/* ══════════ CASE STUDY ══════════ */}
      <section id="case" className="relative overflow-hidden py-16 sm:py-20 lg:py-28 px-0 bg-[#1a1d2e]">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 0% 100%,rgba(35,171,126,.18),transparent 60%),radial-gradient(ellipse 60% 60% at 100% 0%,rgba(0,57,134,.12),transparent 50%)" }} />
        {/* Floating cubes in dark section */}
        <div className="absolute inset-0 pointer-events-none" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          <div className="absolute top-[8%] right-[6%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-b 20s ease-in-out infinite" }}>
            <Cube3D size={55} border="rgba(35,171,126,.2)" bg="rgba(35,171,126,.05)" dur={20} />
          </div>
          <div className="absolute bottom-[12%] left-[4%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-a 18s ease-in-out infinite" }}>
            <Cube3D size={40} border="rgba(0,57,134,.2)" bg="rgba(0,57,134,.05)" dur={16} reverse />
          </div>
          <div className="absolute top-[45%] left-[50%]" style={{ transformStyle: "preserve-3d", animation: "nl-drift-d 22s ease-in-out infinite" }}>
            <Cube3D size={30} border="rgba(146,28,180,.15)" bg="rgba(146,28,180,.04)" dur={25} />
          </div>
          <Particles count={18} className="absolute inset-0" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center px-6 sm:px-10 lg:px-20">
          <div className="nl-reveal">
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#a6ffea] mb-7">
              <span className="w-10 h-0.5 rounded bg-[#a6ffea]" />
              {isRtl ? "قصة نجاح" : "Success Story"}
            </div>
            <h2 className="text-2xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-white leading-[1.1] mb-8" style={{ fontFamily: headingFont }}>
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
                  <div className="text-2xl sm:text-2xl lg:text-2xl font-black text-[#2dd4a0]">{n.v}</div>
                  <div className="text-base text-white/40 mt-2 font-medium">{n.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="nl-reveal nl-reveal-d1" style={{ perspective: "1000px" }}>
            <div className="rounded-3xl overflow-hidden nl-mock-3d" style={{ background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.12)", boxShadow: "-20px 20px 60px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.06) inset,0 0 100px rgba(35,171,126,.1)" }}>
              <div className="flex items-center gap-4 px-8 sm:px-10 py-7 sm:py-8" style={{ background: "linear-gradient(135deg,#23ab7e,#1a8a64)" }}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl sm:text-2xl">🌸</div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">Bloom Café</div>
                  <div className="text-sm sm:text-base text-white/70">Coffee &amp; Pastry · Riyadh</div>
                </div>
              </div>
              <div className="px-8 sm:px-10 py-6 sm:py-8">
                {[
                  { label: isRtl ? "المحتوى الأسبوعي" : "Weekly Content", value: "28 Posts", cls: "text-[#2dd4a0]" },
                  { label: isRtl ? "التفاعل" : "Engagement", value: "8.7%", cls: "text-[#003986]", bar: 87, bc: "#003986" },
                  { label: isRtl ? "درجة العلامة" : "Brand Score", value: "96%", cls: "text-[#921cb4]", bar: 96, bc: "#921cb4" },
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
      <section id="features" className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ background: "linear-gradient(180deg,#f7f9fb 0%,#f0f4f8 50%,#f7f9fb 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%,black,transparent)" }} />

        <div className="text-center px-5 sm:px-8 pb-10 lg:pb-14 relative z-10 nl-reveal">
          <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#23ab7e] mb-6">
            <span className="w-10 h-0.5 rounded bg-[#23ab7e]" />
            {L.featuresLabel}
          </div>
          <h2 className="text-2xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#1a1d2e] leading-tight mb-5" style={{ fontFamily: headingFont }}>
            {L.featuresTitle}
          </h2>
          <p className="text-base lg:text-base text-[#8f96a3] max-w-[650px] mx-auto">{L.featuresSub}</p>
        </div>

        <div ref={trackRef} className="nl-track flex gap-7 lg:gap-10 px-[calc(50vw-200px)] sm:px-[calc(50vw-220px)] lg:px-[calc(50vw-240px)] pb-10 overflow-x-auto overflow-y-visible snap-x snap-mandatory relative z-10" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
          {services.map((s, i) => {
            const isActive = i === activeCard;
            return (
              <div
                key={s.num}
                data-scard
                className="shrink-0 w-[320px] sm:w-[340px] lg:w-[360px] min-h-[380px] lg:min-h-[420px] snap-center relative flex flex-col select-none rounded-3xl p-6 sm:p-7 lg:p-8"
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
                <div className="absolute top-6 text-3xl lg:text-4xl font-black leading-none tracking-[-4px]" style={{ color: isActive ? "#e8ecf0" : "#f4f6f8", insetInlineEnd: 28 }}>{s.num}</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center mb-7" style={{ background: s.bg }}>
                  <s.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" style={{ color: s.color }} />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-[#1a1d2e] mb-3">{s.title}</h3>
                <p className="text-base lg:text-lg text-[#8f96a3] leading-relaxed flex-1">{s.desc}</p>
                <span className="inline-block self-start mt-6 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color }}>{s.tag}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 relative z-10 pt-6">
          <button onClick={() => goToCard(activeCard - (isRtl ? -1 : 1))} className="w-10 h-10 rounded-full border-2 border-[#d1d6df] bg-white flex items-center justify-center cursor-pointer text-[#8f96a3] hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all active:scale-95">
            {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="flex gap-2">
            {services.map((_, i) => (
              <div key={i} onClick={() => goToCard(i)} className={`h-2.5 rounded-full cursor-pointer transition-all duration-400 ${i === activeCard ? "w-8 bg-gradient-to-r from-[#23ab7e] to-[#003986]" : "w-2.5 bg-[#d1d6df] hover:bg-[#8f96a3]"}`} />
            ))}
          </div>
          <button onClick={() => goToCard(activeCard + (isRtl ? -1 : 1))} className="w-10 h-10 rounded-full border-2 border-[#d1d6df] bg-white flex items-center justify-center cursor-pointer text-[#8f96a3] hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all active:scale-95">
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS — 3D Glass ══════════ */}
      <section id="how-it-works" className="relative overflow-hidden px-5 sm:px-8 lg:px-14 py-16 sm:py-20 lg:py-24" style={{ background: "linear-gradient(170deg,#fff 0%,#f5f0ff 40%,#f0fdf8 70%,#fff 100%)" }}>
        <Particles count={15} className="absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-[1300px]">
          <div className="text-center mb-10 lg:mb-14 nl-reveal">
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[2.5px] text-[#003986] mb-6">
              <span className="w-10 h-0.5 rounded bg-[#003986]" />
              {L.howItWorksLabel}
            </div>
            <h2 className="text-2xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#1a1d2e] leading-tight" style={{ fontFamily: headingFont }}>
              {L.howItWorksTitle}
            </h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {/* Animated connecting line */}
            <div className="absolute top-[80px] lg:top-[90px] hidden sm:block h-1.5 rounded-full overflow-hidden" style={{ left: "18%", right: "18%" }}>
              <div className="h-full w-full rounded-full" style={{ background: "linear-gradient(90deg,#23ab7e,#003986,#921cb4)", backgroundSize: "200% 100%", animation: "nl-aurora 4s ease infinite" }} />
            </div>

            {[
              { step: "1", icon: Building2, title: L.addCompany, desc: L.addCompanyDesc },
              { step: "2", icon: Sparkles, title: L.generatePlan, desc: L.generatePlanDesc },
              { step: "3", icon: Download, title: L.downloadPost, desc: L.downloadPostDesc },
            ].map((s, i) => (
              <div key={s.step} className={`nl-reveal ${i > 0 ? `nl-reveal-d${i}` : ""} relative text-center`}>
                <div className="nl-step-glass rounded-3xl p-5 sm:p-6 lg:p-7" style={{ boxShadow: `0 12px 40px ${stepColors[i]}15, 0 4px 12px rgba(0,0,0,.04)` }}>
                  {/* Glowing number circle */}
                  <div className="relative mx-auto mb-8 w-12 h-12 lg:w-14 lg:h-14">
                    <div className="absolute inset-0 rounded-full" style={{ background: stepColors[i], opacity: 0.15, animation: "nl-glow-breathe 3s ease-in-out infinite", animationDelay: `${i * 0.5}s` }} />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${stepColors[i]},${stepColors[i]}dd)`, boxShadow: `0 10px 40px ${stepColors[i]}40` }}>
                      <s.icon className="w-7 h-7 lg:w-9 lg:h-9 text-white" />
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full" style={{ border: `2.5px solid ${stepColors[i]}`, animation: "nl-pulse-ring 2.5s ease-in-out infinite", animationDelay: `${i * 0.8}s` }} />
                  </div>
                  <span className="inline-block text-2xl lg:text-3xl font-black mb-4" style={{ color: stepColors[i] }}>{s.step}</span>
                  <h3 className="text-lg lg:text-xl font-bold text-[#1a1d2e] mb-4">{s.title}</h3>
                  <p className="text-base lg:text-lg text-[#8f96a3] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORMS ══════════ */}
      <section id="platforms" className="px-5 sm:px-8 lg:px-14 py-14 sm:py-18 lg:py-20 bg-[#1a1d2e] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(35,171,126,.1),transparent 70%)" }} />
        <Particles count={14} className="absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-[1100px] relative z-10">
          <h2 className="text-center text-2xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-white mb-8 lg:mb-10 nl-reveal" style={{ fontFamily: headingFont }}>
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
      <section className="px-5 sm:px-8 lg:px-14 py-14 sm:py-18 lg:py-20 relative overflow-hidden" style={{ background: "linear-gradient(170deg,#f0fdf8,#fff,#f5f0ff)" }}>
        <div className="mx-auto max-w-[1100px]">
          <div className="nl-reveal relative overflow-hidden rounded-[32px] lg:rounded-[40px] p-8 sm:p-10 lg:p-14 text-center nl-aurora-bg" style={{ boxShadow: "0 30px 80px rgba(35,171,126,.25),0 0 120px rgba(0,57,134,.1)" }}>
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

            <h2 className="relative text-2xl sm:text-2xl lg:text-2xl xl:text-3xl font-black text-white mb-6 lg:mb-8" style={{ fontFamily: headingFont }}>
              {L.ctaTitle}
            </h2>
            <p className="relative text-white/80 text-base lg:text-lg mb-6 lg:mb-8 max-w-[700px] mx-auto">{L.ctaSub}</p>

            <Link href="/signup">
              <button className="relative text-sm lg:text-base font-bold text-[#1a8a64] bg-white px-8 lg:px-12 py-3 lg:py-3.5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,.2)] active:scale-[0.98]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,.15)" }}>
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
      <footer className="relative overflow-hidden bg-[#1a1d2e] py-10 px-5 sm:px-8 lg:py-14 lg:px-14 pb-8">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#23ab7e,#003986,#921cb4,#23ab7e)", backgroundSize: "300% 100%", animation: "nl-footer-line 6s linear infinite" }} />
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center no-underline mb-3">
                <img src="/nawaa-logo-dark.svg" alt="Nawaa AI" className="h-48 w-auto" />
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
