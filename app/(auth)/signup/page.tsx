"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Sparkles, Eye, EyeOff, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = messages[locale].auth;
  const isRtl = locale === "ar";

  const passwordChecks = [
    { label: t.minChars, valid: password.length >= 6 },
    { label: t.passwordsMatch, valid: password.length > 0 && password === confirm },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error(t.passwordsDontMatch); return; }
    if (!terms) { toast.error(t.acceptTerms); return; }
    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(t.signUpSuccess);
    router.push("/companies");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setLoading(false); toast.error(error.message); }
  }

  return (
    <div className="flex min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left panel - branding */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden lg:flex" style={{ background: "linear-gradient(135deg, #006C35, #004D26)" }}>
        <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[#00A352]/20 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-[#C9A84C]/15 blur-[80px]" />
        <motion.div className="absolute top-[12%] right-[18%] h-20 w-20 rounded-xl border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />

        <div className="relative z-10 px-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <span className="text-5xl font-bold text-white">{t.brandName}</span>
              <span className="text-5xl font-bold text-white/80"> AI</span>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-8 max-w-md text-xl text-white/80 leading-relaxed">
            {messages[locale].auth.joinNawaa}
          </motion.p>

          {/* Feature highlights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }} className="mt-12 space-y-5">
            {[
              t.featureAnalysis,
              t.featureContent,
              t.featureVisual,
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl text-white/90">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="relative flex flex-1 flex-col justify-center bg-[#F8FBF8] px-8 py-12 lg:px-20">
        <div className="absolute end-6 top-6 lg:end-10 lg:top-10 z-10">
          <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="rounded-xl border-2 border-[#D4EBD9] px-5 py-2.5 text-base font-medium text-[#2D5A3D] transition-all hover:bg-[#F0F7F2] hover:border-[#00A352]">
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>

        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#004D26]">{t.brandName} <span className="text-[#00A352]">AI</span></span>
        </div>

        <motion.div initial={{ opacity: 0, x: isRtl ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-lg">
          <div className="rounded-3xl bg-white border-2 border-[#D4EBD9] p-12 shadow-[0_8px_40px_rgba(0,108,53,0.06)]">
            <h1 className="text-4xl font-bold text-[#004D26]">{t.joinNawaa}</h1>
            <p className="mt-3 text-lg text-[#5A8A6A]">{t.createAccount}</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <Label className="text-base font-semibold text-[#0A1F0F]">{t.fullName}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-2.5 h-14 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 text-base focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.1)]" placeholder={t.namePlaceholder} />
              </div>
              <div>
                <Label className="text-base font-semibold text-[#0A1F0F]">{t.email}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2.5 h-14 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 text-base focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.1)]" placeholder="you@company.com" />
              </div>
              <div>
                <Label className="text-base font-semibold text-[#0A1F0F]">{t.password}</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-2.5 h-14 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] text-base focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.1)] pe-12" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 mt-1 text-[#5A8A6A] hover:text-[#006C35]">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold text-[#0A1F0F]">{t.confirmPassword}</Label>
                <Input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-2.5 h-14 rounded-xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] text-base focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.1)]" placeholder="••••••••" />
              </div>

              {password.length > 0 && (
                <div className="space-y-2">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${check.valid ? "bg-[#006C35]" : "bg-[#D4EBD9]"} transition-colors`}>
                        {check.valid && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${check.valid ? "text-[#006C35]" : "text-[#5A8A6A]"}`}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-3 text-base text-[#5A8A6A] cursor-pointer">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${terms ? "border-[#006C35] bg-[#006C35]" : "border-[#D4EBD9] bg-white"}`}>
                  {terms && <Check className="h-4 w-4 text-white" />}
                </div>
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="sr-only" />
                {t.agreeTerms}
              </label>
              <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold rounded-xl text-white" style={{ backgroundColor: "#006C35", boxShadow: "0 8px 24px rgba(0,108,53,0.3)" }}>
                {loading ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : t.signUp}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-[#D4EBD9]" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-5 text-base text-[#5A8A6A]">{t.or}</span></div>
            </div>

            <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full h-14 text-lg rounded-xl border-2 border-[#D4EBD9] text-[#0A1F0F] hover:border-[#00A352] hover:bg-[#F0F7F2]">
              <svg className="h-6 w-6 me-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t.continueGoogle}
            </Button>
            <p className="mt-10 text-center text-lg text-[#5A8A6A]">
              {t.hasAccount}{" "}
              <Link href="/login" className="text-[#006C35] font-bold hover:underline">{t.signIn}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
