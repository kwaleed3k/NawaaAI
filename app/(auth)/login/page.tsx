"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Sparkles, Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";

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

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const quotes = locale === "ar" ? QUOTES_AR : QUOTES_EN;
    const timer = setInterval(() => setQuoteIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(timer);
  }, [locale]);

  const t = messages[locale].auth;
  const isRtl = locale === "ar";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const quotes = locale === "ar" ? QUOTES_AR : QUOTES_EN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t.signInSuccess);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <div className="flex min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex"
        style={{ background: "linear-gradient(160deg, #006C35 0%, #004D26 60%, #003318 100%)" }}
      >
        {/* Subtle ambient glow — no floating items */}
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#00A352]/15 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#7C3AED]/10 blur-[120px]" />

        {/* Top — Logo */}
        <div className="relative z-10 px-14 pt-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-4xl font-extrabold text-white font-['Cairo']">{t.brandName}</span>
              <span className="text-4xl font-extrabold text-[#7C3AED]"> AI</span>
            </div>
          </motion.div>
        </div>

        {/* Center — Quote */}
        <div className="relative z-10 flex-1 flex items-center px-14 xl:px-20">
          <div className="w-full max-w-lg">
            <div className="mb-8 h-1 w-16 rounded-full bg-[#7C3AED]/60" />
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-3xl xl:text-4xl font-bold text-white leading-snug tracking-tight">
                  &ldquo;{quotes[quoteIdx].text}&rdquo;
                </p>
                <p className="mt-6 text-lg text-white/50 font-medium">
                  — {quotes[quoteIdx].author}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-10 flex gap-2">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  aria-label={`Quote ${i + 1}`}
                  className="relative flex items-center justify-center h-11 w-11 -m-4"
                >
                  <span className={`block rounded-full transition-all duration-300 ${i === quoteIdx ? "w-8 h-2.5 bg-[#7C3AED]" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/30"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom — Tagline */}
        <div className="relative z-10 px-14 pb-10 xl:px-20">
          <div className="flex items-center gap-3 text-white/30">
            <div className="h-px flex-1 bg-white/10" />
            <p className="text-sm font-medium whitespace-nowrap">{messages[locale].landing.footerTagline}</p>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col justify-center bg-[#F8FBF8] px-8 py-16 lg:px-16 xl:px-24">
        {/* Top bar */}
        <div className="absolute start-6 top-6 lg:start-10 lg:top-10 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 py-3 text-lg font-bold text-[#004D26] hover:bg-[#F0F7F2] hover:border-[#00A352] hover:shadow-lg transition-all"
          >
            <BackArrow className="h-5 w-5" />
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
        </div>
        <div className="absolute end-6 top-6 lg:end-10 lg:top-10 z-10">
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 py-3 text-lg font-bold text-[#2D5A3D] transition-all hover:bg-[#F0F7F2] hover:border-[#00A352] hover:shadow-lg"
          >
            {locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
          </button>
        </div>

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-4 lg:hidden">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-[#004D26] font-['Cairo']">
            {t.brandName} <span className="text-[#00A352]">AI</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#004D26] font-['Cairo']">{t.welcomeBack}</h1>
            <p className="mt-2 text-lg text-[#5A8A6A]">{t.signInContinue}</p>
          </div>

          {/* Google button first — cleaner flow */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-14 text-lg font-bold rounded-2xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] transition-all hover:border-[#00A352] hover:bg-[#F0F7F2] hover:shadow-lg"
          >
            <svg className="h-6 w-6 me-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t.continueGoogle}
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[#D4EBD9]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FBF8] px-4 text-sm font-semibold text-[#5A8A6A] uppercase tracking-wider">{t.or}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-bold text-[#004D26] mb-1.5 block">{t.email}</Label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-[#5A8A6A]/60 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`h-13 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] placeholder:text-[#5A8A6A]/40 text-base font-medium transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.06)] ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"}`}
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold text-[#004D26] mb-1.5 block">{t.password}</Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-[#5A8A6A]/60 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`h-13 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] text-base font-medium transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.06)] ${isRtl ? "pr-12 pl-12" : "pl-12 pr-12"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute top-1/2 -translate-y-1/2 text-[#5A8A6A]/60 hover:text-[#006C35] transition-colors p-1 ${isRtl ? "left-3" : "right-3"}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-extrabold rounded-xl text-white bg-[#006C35] hover:bg-[#005A2C] shadow-lg shadow-[#006C35]/20 transition-all"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                t.signIn
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-base text-[#5A8A6A]">
            {t.noAccount}{" "}
            <Link href="/signup" className="text-[#006C35] font-bold hover:underline transition-colors">
              {t.signUp}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
