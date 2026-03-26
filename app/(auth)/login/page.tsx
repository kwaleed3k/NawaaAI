"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Mail, Lock } from "lucide-react";

const QUOTES_EN = [
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { text: "Content is king, but distribution is queen.", author: "Jonathan Perelman" },
  { text: "Your brand is a story unfolding across all customer touch points.", author: "Jonah Sachs" },
  { text: "Marketing is no longer about the stuff that you make, but about the stories you tell.", author: "Seth Godin" },
  { text: "Good marketing makes the company look smart. Great marketing makes the customer feel smart.", author: "Joe Chernov" },
];
const QUOTES_AR = [
  { text: "أفضل التسويق هو الذي لا يبدو تسويقاً.", author: "توم فيشبرن" },
  { text: "المحتوى ملك، لكن التوزيع ملكة.", author: "جوناثان بيرلمان" },
  { text: "علامتك التجارية قصة تتكشف عبر كل نقطة تواصل مع العميل.", author: "جونا ساكس" },
  { text: "التسويق لم يعد عن المنتجات، بل عن القصص التي ترويها.", author: "سيث غودين" },
  { text: "التسويق الجيد يجعل الشركة تبدو ذكية. التسويق الرائع يجعل العميل يشعر بذكائه.", author: "جو تشيرنوف" },
];

/* 3D Cube */
function Cube({ size, border, bg, dur, reverse, className }: { size: number; border: string; bg: string; dur: number; reverse?: boolean; className?: string }) {
  const h = size / 2;
  const f: React.CSSProperties = { position: "absolute", width: size, height: size, borderRadius: "25%", border: `2px solid ${border}`, background: bg };
  return (
    <div className={className} style={{ transformStyle: "preserve-3d" }}>
      <div className="nl-cube" style={{ width: size, height: size, animation: `nl-spin ${dur}s linear infinite ${reverse ? "reverse" : ""}` }}>
        <div style={{ ...f, transform: `translateZ(${h}px)` }} />
        <div style={{ ...f, transform: `translateZ(${-h}px) rotateY(180deg)` }} />
        <div style={{ ...f, transform: `translateX(${-h}px) rotateY(-90deg)` }} />
        <div style={{ ...f, transform: `translateX(${h}px) rotateY(90deg)` }} />
        <div style={{ ...f, transform: `translateY(${-h}px) rotateX(90deg)` }} />
        <div style={{ ...f, transform: `translateY(${h}px) rotateX(-90deg)` }} />
      </div>
    </div>
  );
}

/* Floating dots — uses deterministic values from index to avoid hydration mismatch */
function Dots({ count, className }: { count: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = (i * 7 + 13) % 100;
        const seed2 = (i * 11 + 37) % 100;
        return (
          <div key={i} className="absolute rounded-full" style={{
            width: 2 + (seed % 5), height: 2 + (seed2 % 5),
            top: `${(seed * 1.01) % 100}%`, left: `${(seed2 * 1.03) % 100}%`,
            background: ["#a6ffea", "#e67af3", "#c4a8e8", "#23ab7e", "#f5c6fa"][i % 5],
            opacity: 0.2 + (seed % 30) / 100,
            animation: `nl-float-particle ${8 + (seed % 10)}s ease-in-out infinite`,
            animationDelay: `${(seed2 % 50) / 10}s`,
          }} />
        );
      })}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [qVis, setQVis] = useState(true);

  useEffect(() => {
    const s = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (s === "en" || s === "ar") setLocale(s);
  }, [setLocale]);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; }, [locale]);
  useEffect(() => {
    const q = locale === "ar" ? QUOTES_AR : QUOTES_EN;
    const t = setInterval(() => { setQVis(false); setTimeout(() => { setQuoteIdx((i) => (i + 1) % q.length); setQVis(true); }, 350); }, 6000);
    return () => clearInterval(t);
  }, [locale]);

  const t = messages[locale].auth;
  const isRtl = locale === "ar";
  const quotes = locale === "ar" ? QUOTES_AR : QUOTES_EN;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const hFont = isRtl ? "var(--font-cairo),'IBM Plex Sans Arabic',sans-serif" : "'Playfair Display','Outfit',sans-serif";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const r = await signIn(email, password); setLoading(false);
    if (r.error) { toast.error(r.error); return; }
    toast.success(t.signInSuccess); router.push("/dashboard"); router.refresh();
  }
  async function handleGoogle() {
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setLoading(false); toast.error(error.message); }
  }

  const inputCls = `w-full py-2.5 px-4 rounded-2xl border-2 border-[#e8eaef] bg-white/80 backdrop-blur-sm text-base text-[#2d3142] outline-none transition-all placeholder:text-[#9ca3b0] placeholder:font-light focus:border-[#23ab7e] focus:shadow-[0_0_0_4px_rgba(35,171,126,0.12)] focus:bg-white`;

  return (
    <div className="flex h-screen overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>

      {/* ═══════ LEFT — 3D Brand Panel ═══════ */}
      <div className="relative hidden lg:flex lg:w-[48%] flex-col justify-between overflow-hidden p-6 xl:p-7" style={{ background: "linear-gradient(165deg, #1a8a64 0%, #23ab7e 30%, #2ec48e 50%, #8054b8 80%, #a45dd4 100%)" }}>
        {/* Overlays */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(230,122,243,0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(166,255,234,0.25), transparent 60%)" }} />

        {/* 3D Cubes */}
        <Cube size={50} border="rgba(166,255,234,.25)" bg="rgba(166,255,234,.06)" dur={16} className="absolute top-[8%] left-[8%] z-[2]" />
        <Cube size={35} border="rgba(230,122,243,.25)" bg="rgba(230,122,243,.06)" dur={22} reverse className="absolute top-[20%] right-[12%] z-[2]" />
        <Cube size={28} border="rgba(196,168,232,.2)" bg="rgba(196,168,232,.05)" dur={18} className="absolute bottom-[25%] left-[15%] z-[2]" />
        <Cube size={40} border="rgba(255,255,255,.15)" bg="rgba(255,255,255,.03)" dur={25} reverse className="absolute bottom-[12%] right-[8%] z-[2]" />

        {/* 3D Ring */}
        <div className="absolute top-[35%] right-[20%] w-[100px] h-[100px] rounded-full z-[2]" style={{ border: "2px solid rgba(166,255,234,.2)", transformStyle: "preserve-3d", animation: "nl-ring-rotate 14s linear infinite" }}>
          <div className="absolute inset-3 rounded-full" style={{ border: "1.5px solid rgba(230,122,243,.15)" }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute w-[300px] h-[300px] rounded-full -top-16 -left-20 z-0 blur-[80px] bg-[rgba(166,255,234,0.3)]" style={{ animation: "nl-drift-a 12s ease-in-out infinite" }} />
        <div className="absolute w-[250px] h-[250px] rounded-full bottom-[10%] -right-10 z-0 blur-[80px] bg-[rgba(230,122,243,0.25)]" style={{ animation: "nl-drift-b 12s ease-in-out infinite" }} />
        <div className="absolute w-[200px] h-[200px] rounded-full top-[40%] left-[30%] z-0 blur-[80px] bg-[rgba(128,84,184,0.2)]" style={{ animation: "nl-drift-c 12s ease-in-out infinite" }} />

        {/* Particles */}
        <Dots count={25} className="absolute inset-0 z-[2]" />

        {/* Orbiting dot */}
        <div className="absolute top-[50%] left-[50%] z-[2]" style={{ animation: "nl-orbit-lg 20s linear infinite" }}>
          <div className="w-2 h-2 rounded-full bg-[#a6ffea] opacity-50" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[.18] backdrop-blur-sm flex items-center justify-center border border-white/25">
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2.5" fill="#a6ffea"/><circle cx="24" cy="16" r="2.5" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="text-[28px] font-bold text-white tracking-tight">{isRtl ? "نواة" : "Nawaa"} <span className="bg-gradient-to-r from-[#a6ffea] to-[#f5c6fa] bg-clip-text text-transparent">AI</span></div>
        </div>

        {/* Quote */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-6">
          <div className="rounded-2xl p-6 max-w-[440px] transition-all duration-350" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", opacity: qVis ? 1 : 0, transform: qVis ? "translateY(0)" : "translateY(15px)" }}>
            <div className="text-[60px] leading-[0.6] text-[rgba(166,255,234,0.5)] mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>&ldquo;</div>
            <p className="text-lg font-bold leading-[1.4] text-white mb-4" style={{ fontFamily: hFont }}>{quotes[quoteIdx].text}</p>
            <p className="text-base text-white/65 tracking-wide">— <strong className="text-white/90 font-semibold">{quotes[quoteIdx].author}</strong></p>
          </div>
          <div className="flex gap-3 mt-5">
            {quotes.map((_, i) => (
              <button key={i} onClick={() => { setQVis(false); setTimeout(() => { setQuoteIdx(i); setQVis(true); }, 300); }} className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${i === quoteIdx ? "w-10 bg-gradient-to-r from-[#a6ffea] to-[#f5c6fa]" : "w-3 bg-white/25 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-base text-white/45 uppercase tracking-[1.5px]">{messages[locale].landing.footerTagline}</div>
      </div>

      {/* ═══════ RIGHT — Form Panel ═══════ */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(170deg, #ffffff 0%, #f7f9fb 40%, #f0fdf8 70%, #f5f0ff 100%)" }}>
        {/* Background 3D elements */}
        <div className="absolute inset-0 pointer-events-none" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          <Cube size={30} border="rgba(35,171,126,.1)" bg="rgba(35,171,126,.02)" dur={20} className="absolute top-[10%] right-[8%]" />
          <Cube size={22} border="rgba(128,84,184,.1)" bg="rgba(128,84,184,.02)" dur={26} reverse className="absolute bottom-[15%] left-[5%]" />
          <div className="absolute top-[25%] left-[10%] w-[80px] h-[80px] rounded-full" style={{ border: "1.5px solid rgba(35,171,126,.08)", transformStyle: "preserve-3d", animation: "nl-ring-rotate-2 20s linear infinite" }} />
          <Dots count={12} className="absolute inset-0" />
          {/* Gradient spheres */}
          <div className="hidden sm:block absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(166,255,234,0.12), transparent 70%)" }} />
          <div className="hidden sm:block absolute -bottom-16 -left-16 w-[250px] h-[250px] rounded-full" style={{ background: "radial-gradient(circle, rgba(128,84,184,0.08), transparent 70%)" }} />
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-12 z-10">
          <Link href="/" className="flex items-center gap-2.5 text-base font-medium text-[#5a6275] no-underline px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#e8eaef] hover:bg-white hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all">
            <BackArrow className="w-5 h-5" />{isRtl ? "الرئيسية" : "Home"}
          </Link>
        </div>
        <div className="absolute top-4 right-4 sm:top-8 sm:right-12 z-10">
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-base font-medium text-[#5a6275] px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#e8eaef] cursor-pointer hover:bg-white hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all">{locale === "ar" ? "English" : "العربية"}</button>
        </div>

        {/* Mobile logo */}
        <div className="absolute top-16 left-4 sm:top-20 sm:left-12 flex items-center gap-3 lg:hidden">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#23ab7e,#8054b8)" }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5"><path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2" fill="#a6ffea"/><circle cx="24" cy="16" r="2" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className="text-base font-extrabold text-[#1a1d2e]">{isRtl ? "نواة" : "Nawaa"} <span className="text-[#23ab7e]">AI</span></span>
        </div>

        {/* Form card with glassmorphism */}
        <div
          className="w-full max-w-full sm:max-w-[440px] relative z-10 mt-16 lg:mt-0 mx-4 sm:mx-12 rounded-2xl sm:rounded-2xl p-5 sm:p-6 lg:p-8"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(24px) saturate(1.5)",
            WebkitBackdropFilter: "blur(24px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 8px 32px rgba(35,171,126,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
            animation: "nl-fade-up .7s ease forwards",
          }}
        >
          {/* Tab switcher */}
          <div className="flex bg-[#f4f6f8]/80 rounded-2xl p-[5px] mb-5">
            <div className="flex-1 py-2.5 px-4 text-center text-sm font-semibold text-[#2d3142] bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-default">{isRtl ? "تسجيل الدخول" : "Sign In"}</div>
            <Link href="/signup" className="flex-1 py-2.5 px-4 text-center text-sm font-semibold text-[#9ca3b0] no-underline rounded-2xl hover:text-[#5a6275] transition-colors">{isRtl ? "إنشاء حساب" : "Create Account"}</Link>
          </div>

          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1d2e] tracking-tight mb-2" style={{ fontFamily: hFont }}>{t.welcomeBack}</h1>
            <p className="text-base text-[#9ca3b0]">{t.signInContinue}</p>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-2xl border-2 border-[#e8eaef] bg-white/80 backdrop-blur-sm text-sm font-semibold text-[#2d3142] cursor-pointer transition-all hover:border-[#23ab7e] hover:shadow-[0_4px_20px_rgba(35,171,126,0.1)] hover:-translate-y-px disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t.continueGoogle}
          </button>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-[#e8eaef]" /><span className="text-sm font-medium text-[#9ca3b0] uppercase tracking-wider">{t.or}</span><div className="flex-1 h-px bg-[#e8eaef]" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-base font-semibold text-[#2d3142] mb-2">{t.email}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-5" : "left-5"}`} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className={`${inputCls} ${isRtl ? "pr-13 pl-5" : "pl-13 pr-5"}`} />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-base font-semibold text-[#2d3142] mb-2">{t.password}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-5" : "left-5"}`} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={isRtl ? "كلمة المرور" : "Enter your password"} className={`${inputCls} ${isRtl ? "pr-13 pl-13" : "pl-13 pr-13"}`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#9ca3b0] hover:text-[#5a6275] transition-colors p-1 ${isRtl ? "left-4" : "right-4"}`}>{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-base text-[#5a6275]"><input type="checkbox" className="w-5 h-5 rounded accent-[#23ab7e]" />{isRtl ? "تذكرني" : "Remember me"}</label>
              <a href="#" className="text-base font-medium text-[#8054b8] no-underline hover:text-[#e67af3] transition-colors">{isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}</a>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-2xl border-none text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(35,171,126,0.35)] disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #23ab7e 0%, #1e9670 40%, #8054b8 100%)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 6px 24px rgba(35,171,126,0.3), 0 3px 10px rgba(128,84,184,0.15)" }}>
              {loading ? (isRtl ? "جارٍ التسجيل..." : "Signing in...") : t.signIn}
            </button>
          </form>

          <p className="text-center mt-5 text-base text-[#9ca3b0]">{t.noAccount} <Link href="/signup" className="text-[#23ab7e] font-semibold no-underline hover:text-[#8054b8] transition-colors">{isRtl ? "أنشئ حساب" : "Create one"}</Link></p>
        </div>
      </div>
    </div>
  );
}
