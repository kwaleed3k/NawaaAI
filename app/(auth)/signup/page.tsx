"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Mail, Lock, User, Check } from "lucide-react";

const QUOTES_EN = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't find customers for your products. Find products for your customers.", author: "Seth Godin" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek" },
  { text: "Your brand is what other people say about you when you're not in the room.", author: "Jeff Bezos" },
  { text: "Make it simple. Make it memorable. Make it inviting to look at.", author: "Leo Burnett" },
];
const QUOTES_AR = [
  { text: "أفضل وقت لزراعة شجرة كان قبل عشرين سنة. ثاني أفضل وقت هو الآن.", author: "مثل صيني" },
  { text: "لا تبحث عن عملاء لمنتجاتك. ابحث عن منتجات لعملائك.", author: "سيث غودين" },
  { text: "الناس لا يشترون ما تفعله، بل يشترون لماذا تفعله.", author: "سايمون سينك" },
  { text: "علامتك التجارية هي ما يقوله الناس عنك عندما لا تكون في الغرفة.", author: "جيف بيزوس" },
  { text: "اجعله بسيطاً. اجعله لا يُنسى. اجعله جذاباً للنظر.", author: "ليو بيرنت" },
];

function getStrength(v: string) { let s = 0; if (v.length >= 6) s++; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/[0-9]/.test(v) || /[^A-Za-z0-9]/.test(v)) s++; return s; }
const sColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#23ab7e"];

/* 3D Cube */
function Cube({ size, border, bg, dur, reverse, className }: { size: number; border: string; bg: string; dur: number; reverse?: boolean; className?: string }) {
  const h = size / 2;
  const f: React.CSSProperties = { position: "absolute", width: size, height: size, borderRadius: "25%", border: `2px solid ${border}`, background: bg };
  return (
    <div className={className} style={{ transformStyle: "preserve-3d" }}>
      <div className="nl-cube" style={{ width: size, height: size, animation: `nl-spin ${dur}s linear infinite ${reverse ? "reverse" : ""}` }}>
        <div style={{ ...f, transform: `translateZ(${h}px)` }} /><div style={{ ...f, transform: `translateZ(${-h}px) rotateY(180deg)` }} />
        <div style={{ ...f, transform: `translateX(${-h}px) rotateY(-90deg)` }} /><div style={{ ...f, transform: `translateX(${h}px) rotateY(90deg)` }} />
        <div style={{ ...f, transform: `translateY(${-h}px) rotateX(90deg)` }} /><div style={{ ...f, transform: `translateY(${h}px) rotateX(-90deg)` }} />
      </div>
    </div>
  );
}
function Dots({ count, className }: { count: number; className?: string }) {
  return (<div className={className}>{Array.from({ length: count }).map((_, i) => {
    const s = (i * 7 + 13) % 100, s2 = (i * 11 + 37) % 100;
    return <div key={i} className="absolute rounded-full" style={{ width: 2 + (s % 5), height: 2 + (s2 % 5), top: `${(s * 1.01) % 100}%`, left: `${(s2 * 1.03) % 100}%`, background: ["#a6ffea", "#e67af3", "#c4a8e8", "#23ab7e", "#f5c6fa"][i % 5], opacity: 0.2 + (s % 30) / 100, animation: `nl-float-particle ${8 + (s % 10)}s ease-in-out infinite`, animationDelay: `${(s2 % 50) / 10}s` }} />;
  })}</div>);
}

export default function SignupPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [qVis, setQVis] = useState(true);

  useEffect(() => { const s = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null; if (s === "en" || s === "ar") setLocale(s); }, [setLocale]);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; }, [locale]);
  useEffect(() => { const q = locale === "ar" ? QUOTES_AR : QUOTES_EN; const t = setInterval(() => { setQVis(false); setTimeout(() => { setQuoteIdx((i) => (i + 1) % q.length); setQVis(true); }, 350); }, 6000); return () => clearInterval(t); }, [locale]);

  const t = messages[locale].auth;
  const isRtl = locale === "ar";
  const quotes = locale === "ar" ? QUOTES_AR : QUOTES_EN;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const hFont = isRtl ? "var(--font-cairo),'IBM Plex Sans Arabic',sans-serif" : "'Playfair Display','Outfit',sans-serif";
  const strength = getStrength(password);
  const pwMatch = confirm.length > 0 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error(t.passwordsDontMatch); return; }
    if (!terms) { toast.error(t.acceptTerms); return; }
    setLoading(true); const r = await signUp(email, password, fullName); setLoading(false);
    if (r.error) { toast.error(r.error); return; }
    toast.success(t.signUpSuccess); router.push("/companies"); router.refresh();
  }
  async function handleGoogle() {
    setLoading(true); const sb = createClient();
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setLoading(false); toast.error(error.message); }
  }

  const inputCls = `w-full py-2 px-3 rounded-2xl border-2 border-[#e8eaef] bg-white/80 backdrop-blur-sm text-sm text-[#2d3142] outline-none transition-all placeholder:text-[#9ca3b0] placeholder:font-light focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.12)] focus:bg-white`;

  return (
    <div className="flex h-screen overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>

      {/* ═══════ LEFT — 3D Brand Panel ═══════ */}
      <div className="relative hidden lg:flex lg:w-[48%] flex-col justify-between overflow-hidden p-6 xl:p-7" style={{ background: "linear-gradient(165deg, #1a8a64 0%, #23ab7e 25%, #8054b8 60%, #a45dd4 85%, #e67af3 100%)" }}>
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(230,122,243,0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(166,255,234,0.25), transparent 60%)" }} />

        <Cube size={34} border="rgba(166,255,234,.25)" bg="rgba(166,255,234,.06)" dur={16} className="absolute top-[6%] left-[10%] z-[2]" />
        <Cube size={24} border="rgba(230,122,243,.25)" bg="rgba(230,122,243,.06)" dur={22} reverse className="absolute top-[18%] right-[10%] z-[2]" />
        <Cube size={19} border="rgba(196,168,232,.2)" bg="rgba(196,168,232,.05)" dur={18} className="absolute bottom-[22%] left-[18%] z-[2]" />
        <Cube size={28} border="rgba(255,255,255,.15)" bg="rgba(255,255,255,.03)" dur={25} reverse className="absolute bottom-[10%] right-[12%] z-[2]" />
        <Cube size={15} border="rgba(35,171,126,.2)" bg="rgba(35,171,126,.04)" dur={30} className="absolute top-[50%] right-[30%] z-[2]" />

        <div className="absolute top-[32%] right-[18%] w-[70px] h-[70px] rounded-full z-[2]" style={{ border: "2px solid rgba(166,255,234,.2)", transformStyle: "preserve-3d", animation: "nl-ring-rotate 14s linear infinite" }}><div className="absolute inset-3 rounded-full" style={{ border: "1.5px solid rgba(230,122,243,.15)" }} /></div>
        <div className="absolute bottom-[35%] left-[8%] w-[60px] h-[60px] rounded-full z-[2]" style={{ border: "1.5px solid rgba(196,168,232,.15)", transformStyle: "preserve-3d", animation: "nl-ring-rotate-2 18s linear infinite" }} />

        <div className="absolute w-[200px] h-[200px] rounded-full -top-16 -left-20 z-0 blur-[80px] bg-[rgba(166,255,234,0.3)]" style={{ animation: "nl-drift-a 12s ease-in-out infinite" }} />
        <div className="absolute w-[180px] h-[180px] rounded-full bottom-[10%] -right-10 z-0 blur-[80px] bg-[rgba(230,122,243,0.25)]" style={{ animation: "nl-drift-b 12s ease-in-out infinite" }} />
        <div className="absolute w-[140px] h-[140px] rounded-full top-[40%] left-[30%] z-0 blur-[80px] bg-[rgba(128,84,184,0.2)]" style={{ animation: "nl-drift-c 12s ease-in-out infinite" }} />

        <Dots count={30} className="absolute inset-0 z-[2]" />
        <div className="absolute top-[45%] left-[45%] z-[2]" style={{ animation: "nl-orbit 16s linear infinite" }}><div className="w-2.5 h-2.5 rounded-full bg-[#a6ffea] opacity-40" /></div>
        <div className="absolute top-[60%] left-[25%] z-[2]" style={{ animation: "nl-orbit-lg 22s linear infinite reverse" }}><div className="w-2 h-2 rounded-full bg-[#f5c6fa] opacity-35" /></div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/[.18] backdrop-blur-sm flex items-center justify-center border border-white/25">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5"><path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2.5" fill="#a6ffea"/><circle cx="24" cy="16" r="2.5" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{isRtl ? "نواة" : "Nawaa"} <span className="bg-gradient-to-r from-[#a6ffea] to-[#f5c6fa] bg-clip-text text-transparent">AI</span></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-5">
          <div className="rounded-2xl p-6 max-w-[440px] transition-all duration-350" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", opacity: qVis ? 1 : 0, transform: qVis ? "translateY(0)" : "translateY(15px)" }}>
            <div className="text-[36px] leading-[0.6] text-[rgba(166,255,234,0.5)] mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>&ldquo;</div>
            <p className="text-base font-bold leading-[1.4] text-white mb-4" style={{ fontFamily: hFont }}>{quotes[quoteIdx].text}</p>
            <p className="text-base text-white/65 tracking-wide">— <strong className="text-white/90 font-semibold">{quotes[quoteIdx].author}</strong></p>
          </div>
          <div className="flex gap-3 mt-5">
            {quotes.map((_, i) => (<button key={i} onClick={() => { setQVis(false); setTimeout(() => { setQuoteIdx(i); setQVis(true); }, 300); }} className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${i === quoteIdx ? "w-10 bg-gradient-to-r from-[#a6ffea] to-[#f5c6fa]" : "w-3 bg-white/25 hover:bg-white/40"}`} />))}
          </div>
        </div>

        <div className="relative z-10 text-base text-white/45 uppercase tracking-[1.5px]">{messages[locale].landing.footerTagline}</div>
      </div>

      {/* ═══════ RIGHT — Form Panel ═══════ */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(170deg, #ffffff 0%, #f7f9fb 40%, #f0fdf8 70%, #f5f0ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          <Cube size={19} border="rgba(35,171,126,.1)" bg="rgba(35,171,126,.02)" dur={20} className="absolute top-[8%] right-[6%]" />
          <Cube size={14} border="rgba(128,84,184,.1)" bg="rgba(128,84,184,.02)" dur={26} reverse className="absolute bottom-[12%] left-[4%]" />
          <Cube size={11} border="rgba(230,122,243,.08)" bg="rgba(230,122,243,.02)" dur={22} className="absolute top-[60%] right-[15%]" />
          <div className="absolute top-[20%] left-[8%] w-[70px] h-[70px] rounded-full" style={{ border: "1.5px solid rgba(35,171,126,.08)", transformStyle: "preserve-3d", animation: "nl-ring-rotate-2 20s linear infinite" }} />
          <Dots count={15} className="absolute inset-0" />
          <div className="hidden sm:block absolute -top-16 -right-16 w-[180px] h-[180px] rounded-full" style={{ background: "radial-gradient(circle, rgba(166,255,234,0.1), transparent 70%)" }} />
          <div className="hidden sm:block absolute -bottom-12 -left-12 w-[140px] h-[140px] rounded-full" style={{ background: "radial-gradient(circle, rgba(128,84,184,0.07), transparent 70%)" }} />
        </div>

        <div className="absolute top-4 left-4 sm:top-7 sm:left-10 z-10">
          <Link href="/" className="flex items-center gap-2.5 text-base font-medium text-[#5a6275] no-underline px-5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#e8eaef] hover:bg-white hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all"><BackArrow className="w-5 h-5" />{isRtl ? "الرئيسية" : "Home"}</Link>
        </div>
        <div className="absolute top-4 right-4 sm:top-7 sm:right-10 z-10">
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-base font-medium text-[#5a6275] px-5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#e8eaef] cursor-pointer hover:bg-white hover:border-[#23ab7e] hover:text-[#23ab7e] transition-all">{locale === "ar" ? "English" : "العربية"}</button>
        </div>

        <div className="absolute top-16 left-4 sm:top-[72px] sm:left-10 flex items-center gap-3 lg:hidden">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#23ab7e,#8054b8)" }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5"><path d="M16 4C16 4 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="8" r="2" fill="#a6ffea"/><circle cx="24" cy="16" r="2" fill="#e67af3"/><path d="M14 14L18 18M18 14L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className="text-sm font-extrabold text-[#1a1d2e]">{isRtl ? "نواة" : "Nawaa"} <span className="text-[#23ab7e]">AI</span></span>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-full sm:max-w-[380px] relative z-10 mt-14 lg:mt-0 mx-4 sm:mx-10 rounded-xl sm:rounded-xl p-4 sm:p-5 lg:p-6"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(24px) saturate(1.5)",
            WebkitBackdropFilter: "blur(24px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 8px 32px rgba(35,171,126,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
            animation: "nl-fade-up .7s ease forwards",
          }}
        >
          <div className="flex bg-[#f4f6f8]/80 rounded-xl p-[5px] mb-4">
            <Link href="/login" className="flex-1 py-2 px-3 text-center text-xs font-semibold text-[#9ca3b0] no-underline rounded-xl hover:text-[#5a6275] transition-colors">{isRtl ? "تسجيل الدخول" : "Sign In"}</Link>
            <div className="flex-1 py-2 px-3 text-center text-xs font-semibold text-[#2d3142] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-default">{isRtl ? "إنشاء حساب" : "Create Account"}</div>
          </div>

          <div className="mb-4">
            <h1 className="text-sm sm:text-base font-extrabold text-[#1a1d2e] tracking-tight mb-2" style={{ fontFamily: hFont }}>{t.joinNawaa}</h1>
            <p className="text-xs text-[#9ca3b0]">{t.createAccount}</p>
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2 rounded-xl border border-[#e8eaef] bg-white/80 backdrop-blur-sm text-xs font-semibold text-[#2d3142] cursor-pointer transition-all hover:border-[#23ab7e] hover:shadow-[0_4px_20px_rgba(35,171,126,0.1)] hover:-translate-y-px disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t.continueGoogle}
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#e8eaef]" /><span className="text-sm font-medium text-[#9ca3b0] uppercase tracking-wider">{t.or}</span><div className="flex-1 h-px bg-[#e8eaef]" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#2d3142] mb-1.5">{t.fullName}</label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-4" : "left-4"}`} />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder={t.namePlaceholder} className={`${inputCls} ${isRtl ? "pr-11 pl-4" : "pl-11 pr-4"}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2d3142] mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className={`${inputCls} ${isRtl ? "pr-11 pl-4" : "pl-11 pr-4"}`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#2d3142] mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={isRtl ? "كلمة مرور قوية" : "Strong password"} className={`${inputCls} ${isRtl ? "pr-11 pl-11" : "pl-9 pr-9"}`} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#9ca3b0] hover:text-[#5a6275] transition-colors p-0.5 ${isRtl ? "left-2.5" : "right-2.5"}`}>{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2d3142] mb-1.5">{t.confirmPassword}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3b0] pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder={isRtl ? "تأكيد" : "Confirm"} className={`${inputCls} ${isRtl ? "pr-11 pl-4" : "pl-11 pr-4"} ${confirm.length > 0 ? (pwMatch ? "!border-[#23ab7e]" : "!border-[#ef4444]") : ""}`} />
                </div>
              </div>
            </div>

            {/* Indicators row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mb-4">
              {password.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 w-20">{[1,2,3,4].map((i) => <div key={i} className="flex-1 h-1 rounded-sm" style={{ background: i <= strength ? sColors[strength] : "#e8eaef", transition: "background .3s" }} />)}</div>
                  <span className="flex items-center gap-1 text-[11px]">{password.length >= 6 ? <Check className="w-3 h-3 text-[#23ab7e]" /> : <span className="w-3 h-3 rounded-full border border-[#e8eaef] inline-block" />}<span className={password.length >= 6 ? "text-[#23ab7e]" : "text-[#9ca3b0]"}>{t.minChars}</span></span>
                </div>
              )}
              {confirm.length > 0 && (
                <span className="flex items-center gap-1 text-[11px]">{pwMatch ? <Check className="w-3 h-3 text-[#23ab7e]" /> : <span className="w-3 h-3 rounded-full border border-[#ef4444] inline-block" />}<span className={pwMatch ? "text-[#23ab7e]" : "text-[#ef4444]"}>{pwMatch ? t.passwordsMatch : t.passwordsDontMatch}</span></span>
              )}
            </div>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="w-4 h-4 rounded accent-[#23ab7e]" />
              <span className="text-sm text-[#5a6275]">{t.agreeTerms}</span>
            </label>

            <button type="submit" disabled={loading} className="w-full py-2 rounded-xl border-none text-xs font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(35,171,126,0.35)] disabled:opacity-50" style={{ background: "linear-gradient(135deg, #23ab7e 0%, #1e9670 40%, #8054b8 100%)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 4px 20px rgba(35,171,126,0.3), 0 2px 8px rgba(128,84,184,0.15)" }}>
              {loading ? (isRtl ? "جارٍ الإنشاء..." : "Creating...") : t.signUp}
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-[#9ca3b0]">{t.hasAccount} <Link href="/login" className="text-[#23ab7e] font-semibold no-underline hover:text-[#8054b8] transition-colors">{isRtl ? "سجل دخول" : "Sign in"}</Link></p>
          <p className="text-center mt-2 text-[11px] text-[#9ca3b0]">{isRtl ? "بإنشاء حساب، أنت توافق على " : "By creating an account, you agree to our "}<a href="#" className="text-[#5a6275] underline underline-offset-2">{isRtl ? "شروط الخدمة" : "Terms"}</a>{isRtl ? " و" : " & "}<a href="#" className="text-[#5a6275] underline underline-offset-2">{isRtl ? "الخصوصية" : "Privacy"}</a></p>
        </div>
      </div>
    </div>
  );
}
