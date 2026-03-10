"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Brain,
  Calendar,
  Sparkles,
  Globe,
  Target,
  Download,
  Building2,
  Play,
  Image as ImageIcon,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { AnimatedCounter } from "@/components/AnimatedCounter";

/* ───── Islamic 8-pointed star SVG ───── */
function IslamicStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 0L117.6 65.5L175.7 24.3L134.5 82.4L200 100L134.5 117.6L175.7 175.7L117.6 134.5L100 200L82.4 134.5L24.3 175.7L65.5 117.6L0 100L65.5 82.4L24.3 24.3L82.4 65.5L100 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ───── Fake Dashboard Preview Card ───── */
function DashboardPreview({ isRtl }: { isRtl: boolean }) {
  const days = [
    {
      day: isRtl ? "السبت" : "Sat",
      platform: "Instagram",
      color: "#E1306C",
      topic: isRtl ? "قصة العلامة" : "Brand Story",
    },
    {
      day: isRtl ? "الأحد" : "Sun",
      platform: "TikTok",
      color: "#000000",
      topic: isRtl ? "وراء الكواليس" : "Behind Scenes",
    },
    {
      day: isRtl ? "الإثنين" : "Mon",
      platform: "X",
      color: "#1DA1F2",
      topic: isRtl ? "نصيحة الأسبوع" : "Weekly Tip",
    },
  ];

  return (
    <div
      className="animate-float-card rounded-3xl bg-white p-6 border border-[#D4EBD9]"
      style={{
        boxShadow:
          "0 20px 80px rgba(0,163,82,0.18), 0 8px 32px rgba(0,0,0,0.06)",
      }}
    >
      {/* Mini header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#D4EBD9]">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
        <div>
          <p className="text-base font-semibold text-[#0A1F0F]">
            Almarai | المراعي
          </p>
          <p className="text-xs text-[#5A8A6A]">Food & Beverage</p>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
          style={{ marginInlineStart: "auto", backgroundColor: "#006C35" }}
        >
          AI Ready
        </div>
      </div>

      {/* Week label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#004D26]">
          {isRtl ? "خطة المحتوى — الأسبوع 11" : "Content Plan — Week 11"}
        </p>
        <div className="flex gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-[#00A352]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#006C35]" />
        </div>
      </div>

      {/* 3-day grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {days.map((d) => (
          <div
            key={d.day}
            className="rounded-xl bg-[#F0F7F2] p-3 border border-[#D4EBD9]"
          >
            <p className="text-xs font-bold text-[#004D26] mb-1">
              {d.day}
            </p>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white mb-1.5"
              style={{ backgroundColor: d.color }}
            >
              {d.platform}
            </span>
            <p className="text-[11px] text-[#5A8A6A] leading-tight">
              {d.topic}
            </p>
          </div>
        ))}
      </div>

      {/* Mini image placeholder */}
      <div className="rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] p-3.5 flex items-center gap-2.5">
        <ImageIcon className="h-6 w-6 text-white/80" />
        <div>
          <p className="text-xs font-semibold text-white">
            {isRtl ? "صورة مُولّدة بالذكاء" : "AI Generated Visual"}
          </p>
          <p className="text-[10px] text-white/70">1080 × 1080 · Instagram</p>
        </div>
      </div>
    </div>
  );
}

/* ───── Feature Card — larger icons & type ───── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="landing-card p-10 group"
    >
      <div
        className="h-24 w-24 rounded-3xl flex items-center justify-center mb-8"
        style={{
          background: "linear-gradient(135deg, #006C35, #00A352)",
          boxShadow: "0 8px 24px rgba(0,108,53,0.3)",
        }}
      >
        <Icon className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-[#0A1F0F] mb-2">{title}</h3>
      <p className="text-lg text-[#5A8A6A] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const { locale, setLocale } = useAppStore();

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("nawaa-locale")
        : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const L = messages[locale].landing;
  const N = messages[locale].nav;
  const isRtl = locale === "ar";

  const featureItems = [
    { icon: Brain, title: L.feature1Title, desc: L.feature1Desc },
    { icon: Calendar, title: L.feature2Title, desc: L.feature2Desc },
    { icon: Sparkles, title: L.feature3Title, desc: L.feature3Desc },
    { icon: Globe, title: L.feature4Title, desc: L.feature4Desc },
    { icon: Target, title: L.feature5Title, desc: L.feature5Desc },
    { icon: Download, title: L.feature6Title, desc: L.feature6Desc },
  ];

  return (
    <div className="landing-light min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Background Blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div
          className="absolute -top-[100px] -left-[100px] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,163,82,0.12), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute -top-[50px] -right-[50px] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,76,0.10), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,108,53,0.05), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* ── Islamic Star Decoration ── */}
      <IslamicStar className="pointer-events-none fixed top-8 right-8 w-[200px] h-[200px] text-[#006C35] opacity-[0.06] -z-10" />

      {/* ═══════════════════════════════════
           NAVBAR
         ═══════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full"
      >
        <div className="mx-3 mt-3 sm:mx-6 sm:mt-4">
          <div className="landing-glass-nav rounded-2xl">
            <div className="mx-auto flex h-20 sm:h-24 max-w-[100rem] w-full items-center justify-between px-4 sm:px-8">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center shadow-[0_4px_16px_rgba(0,108,53,0.3)]">
                  <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-[#004D26]">
                  {isRtl ? "نواة" : "Nawaa"}{" "}
                  <span className="text-[#00A352]">AI</span>
                </span>
              </Link>

              <nav className="hidden items-center gap-10 md:flex">
                {[
                  { href: "#features", label: N.features },
                  {
                    href: "#how-it-works",
                    label: L.howItWorks,
                  },
                  { href: "#pricing", label: N.pricing },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-[#2D5A3D] hover:text-[#006C35] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                  className="rounded-xl border border-[#D4EBD9] px-3 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg font-medium text-[#2D5A3D] hover:bg-[#F0F7F2] transition-colors"
                >
                  {locale === "ar" ? "EN" : "عر"}
                </button>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="text-[#2D5A3D] hover:text-[#006C35] hover:bg-[#F0F7F2] text-lg"
                  >
                    {N.login}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="rounded-xl font-semibold text-white text-base sm:text-lg h-10 sm:h-14 px-5 sm:px-8"
                    style={{
                      backgroundColor: "#006C35",
                      boxShadow: "0 4px 16px rgba(0,108,53,0.3)",
                    }}
                  >
                    {N.signUp}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ═══════════════════════════════════
           HERO SECTION
         ═══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-10 pt-36 pb-32">
        <div className="mx-auto max-w-[100rem] w-full">
          {/* Badge — full width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center lg:text-start"
          >
            <span className="pill-badge bg-[#006C35] text-white text-lg px-6 py-2.5">
              {L.heroBadge}
            </span>
          </motion.div>

          {/* Headline — full width, massive text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 leading-[1.05] text-center lg:text-start w-full"
            style={{
              fontFamily: "var(--font-cairo)",
              fontSize: "clamp(36px, 7vw, 128px)",
              fontWeight: 900,
            }}
          >
            <span className="block text-[#004D26]">{L.heroLine1}</span>
            <span className="block bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#7C3AED] bg-clip-text text-transparent">{L.heroLine2}</span>
          </motion.h1>

          {/* Content row: subtitle + CTA on left, preview on right */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mt-10">
            <div className="flex-1 lg:max-w-[55%]">
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-2xl lg:text-3xl text-[#2D5A3D] max-w-2xl leading-relaxed font-medium"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                {L.heroSub}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-16 rounded-2xl px-10 sm:px-14 text-xl sm:text-2xl font-extrabold text-white transition-all overflow-hidden"
                    style={{
                      backgroundColor: "#006C35",
                      boxShadow: "0 8px 40px rgba(0,108,53,0.4)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
                    {L.startFreeBilingual}
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-16 rounded-2xl px-8 text-xl font-bold text-[#006C35] border-2 border-[#D4EBD9] hover:border-[#00A352] hover:bg-[#F0F7F2] transition-all flex items-center gap-3"
                >
                  <Play className="h-8 w-8 fill-[#006C35]" />
                  {L.watchDemo}
                </motion.button>
              </motion.div>

              {/* Trust Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-14 grid grid-cols-1 sm:flex sm:items-center sm:flex-wrap gap-6 sm:gap-8"
              >
                {[
                  { value: 500, suffix: "+", label: L.statBrands, Icon: Building2 },
                  { value: 50, suffix: "K+", label: L.statPosts, Icon: FileText },
                  { value: 10, suffix: "x", label: L.statFaster, Icon: Zap },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    {i > 0 && (
                      <div className="h-14 w-px bg-[#D4EBD9] hidden sm:block" />
                    )}
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #006C35, #00A352)",
                        boxShadow: "0 8px 24px rgba(0,108,53,0.3)",
                      }}
                    >
                      <stat.Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#006C35] leading-none">
                        <AnimatedCounter
                          end={stat.value}
                          suffix={stat.suffix}
                          duration={2000}
                        />
                      </p>
                      <p className="text-lg text-[#5A8A6A] mt-1 font-semibold">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right side — preview */}
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex-1 lg:max-w-[45%] w-full"
            >
              <DashboardPreview isRtl={isRtl} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           FEATURES SECTION
         ═══════════════════════════════════ */}
      <section
        id="features"
        className="px-4 sm:px-6 lg:px-10 py-32"
        style={{ backgroundColor: "#F0F7F2" }}
      >
        <div className="mx-auto max-w-[100rem] w-full">
          {/* Section header */}
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pill-badge bg-[#7C3AED] text-white inline-flex"
            >
              {L.featuresLabel}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#004D26] leading-tight"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              {L.featuresTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-[#5A8A6A] text-xl max-w-2xl mx-auto"
            >
              {L.featuresSub}
            </motion.p>
          </div>

          {/* 3x2 Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           HOW IT WORKS
         ═══════════════════════════════════ */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-10 py-32">
        <div className="mx-auto max-w-[100rem] w-full">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pill-badge bg-[#006C35] text-white inline-flex"
            >
              {L.howItWorksLabel}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#004D26] leading-tight"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              {L.howItWorksTitle}
            </motion.h2>
          </div>

          <div className="relative grid gap-12 sm:grid-cols-3">
            {/* Connecting line */}
            <div
              className="absolute top-9 hidden h-[3px] sm:block bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent"
              style={{ left: "16%", right: "16%" }}
            />

            {[
              {
                step: "1",
                icon: Building2,
                title: L.addCompany,
                desc: L.addCompanyDesc,
              },
              {
                step: "2",
                icon: Sparkles,
                title: L.generatePlan,
                desc: L.generatePlanDesc,
              },
              {
                step: "3",
                icon: Download,
                title: L.downloadPost,
                desc: L.downloadPostDesc,
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="step-circle mx-auto mb-6">
                  <s.icon className="h-12 w-12 text-white" />
                </div>
                <span className="inline-block text-3xl font-extrabold text-[#006C35] mb-2">{s.step}</span>
                <h3 className="text-2xl font-bold text-[#0A1F0F] mb-2">
                  {s.title}
                </h3>
                <p className="text-lg text-[#5A8A6A] leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           PLATFORMS — larger pills
         ═══════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-10 py-20" style={{ backgroundColor: "#F0F7F2" }}>
        <div className="mx-auto max-w-[100rem] w-full text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2D5A3D] mb-10">
            {L.platformTitle}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Instagram",
              "TikTok",
              "Snapchat",
              "X (Twitter)",
              "LinkedIn",
              "YouTube",
            ].map((p) => (
              <motion.span
                key={p}
                whileHover={{ scale: 1.08 }}
                className="rounded-full border-2 border-[#D4EBD9] bg-white px-8 py-4 text-lg font-semibold text-[#2D5A3D] cursor-default hover:border-[#00A352] hover:shadow-md transition-all"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           PRICING
         ═══════════════════════════════════ */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-10 py-32">
        <div className="mx-auto max-w-[100rem] w-full">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pill-badge bg-[#7C3AED] text-white inline-flex"
            >
              {L.pricingLabel}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#004D26] leading-tight"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              {L.pricingTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-[#5A8A6A] text-lg"
            >
              {L.pricingSub}
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: L.freeName,
                price: L.freePrice,
                desc: L.freeDesc,
                cta: L.freeCta,
                highlight: false,
              },
              {
                name: L.proName,
                price: L.proPrice,
                desc: L.proDesc,
                cta: L.proCta,
                highlight: true,
                badge: L.proPopular,
              },
              {
                name: L.agencyName,
                price: L.agencyPrice,
                desc: L.agencyDesc,
                cta: L.agencyCta,
                highlight: false,
              },
            ].map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative overflow-hidden rounded-3xl border-2 p-10 bg-white transition-shadow ${
                  tier.highlight
                    ? "border-[#006C35] shadow-[0_12px_48px_rgba(0,108,53,0.15)]"
                    : "border-[#D4EBD9] hover:border-[#00A352] hover:shadow-lg"
                }`}
              >
                {tier.highlight && tier.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span className="rounded-b-xl bg-[#006C35] px-5 py-1.5 text-xs font-bold text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className={tier.highlight ? "pt-4" : ""}>
                  <h3 className="text-3xl font-bold text-[#0A1F0F]">
                    {tier.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-6xl font-extrabold text-[#006C35]">
                      {tier.price}
                    </span>
                    {tier.price !== "0" && (
                      <span className="text-base text-[#5A8A6A]">
                        {L.perMonth}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-lg text-[#5A8A6A] leading-relaxed">
                    {tier.desc}
                  </p>
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mt-8 w-full h-16 rounded-xl text-lg font-bold transition-all ${
                        tier.highlight
                          ? "bg-[#006C35] text-white shadow-[0_8px_24px_rgba(0,108,53,0.3)] hover:shadow-[0_12px_32px_rgba(0,108,53,0.4)]"
                          : "bg-[#F0F7F2] text-[#006C35] border-2 border-[#D4EBD9] hover:bg-[#006C35] hover:text-white"
                      }`}
                    >
                      {tier.cta}
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           CTA BANNER
         ═══════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-10 py-20">
        <div className="mx-auto max-w-[100rem] w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #006C35, #004D26)",
              boxShadow: "0 20px 60px rgba(0,108,53,0.3)",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-20 -right-20 h-[200px] w-[200px] rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, #00A352, transparent)",
              }}
            />
            <div
              className="absolute -bottom-16 -left-16 h-[160px] w-[160px] rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, #7C3AED, transparent)",
              }}
            />

            <h2
              className="relative text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              {L.ctaTitle}
            </h2>
            <p className="relative text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              {L.ctaSub}
            </p>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-16 rounded-[14px] px-14 text-xl font-bold text-[#006C35] bg-white transition-all"
                style={{
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                {L.ctaButton}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           FOOTER
         ═══════════════════════════════════ */}
      <footer className="border-t border-[#D4EBD9] px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-[100rem] w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center shadow-[0_4px_16px_rgba(0,108,53,0.25)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#004D26]">
                {isRtl ? "نواة" : "Nawaa"} AI
              </span>
            </div>

            <p className="text-lg text-[#5A8A6A] text-center">
              {L.footerBuilt}
            </p>

            <div className="flex gap-8">
              <Link
                href="/login"
                className="text-lg font-medium text-[#5A8A6A] hover:text-[#006C35] transition-colors"
              >
                {N.login}
              </Link>
              <Link
                href="/signup"
                className="text-lg font-medium text-[#5A8A6A] hover:text-[#006C35] transition-colors"
              >
                {N.signUp}
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#5A8A6A]">{L.footerTagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
