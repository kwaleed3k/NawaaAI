"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Image as ImageIcon,
  Globe,
  Plus,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/GlowCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

/* Company type imported from @/lib/store */

type ContentPlan = {
  id: string;
  title: string | null;
  week_start: string;
  plan_data: { days?: Array<{ dayAr?: string; dayEn?: string; platform?: string; topic?: string; topicAr?: string }> };
};

type GeneratedImage = {
  id: string;
  image_urls: string[] | null;
  company_id: string | null;
  created_at: string;
};

/* ---------- Platform visual config ---------- */
const PLATFORM_CONFIG: Record<string, { emoji: string; gradient: string; text: string }> = {
  instagram: { emoji: "\ud83d\udcf8", gradient: "from-pink-500 to-rose-500", text: "text-pink-600" },
  tiktok: { emoji: "\ud83c\udfb5", gradient: "from-slate-800 to-cyan-500", text: "text-slate-700" },
  x: { emoji: "\u2716\ufe0f", gradient: "from-slate-700 to-slate-900", text: "text-slate-700" },
  snapchat: { emoji: "\ud83d\udc7b", gradient: "from-yellow-400 to-amber-400", text: "text-yellow-700" },
  linkedin: { emoji: "\ud83d\udcbc", gradient: "from-blue-500 to-blue-700", text: "text-blue-600" },
  youtube: { emoji: "\ud83c\udfac", gradient: "from-red-500 to-red-700", text: "text-red-600" },
  whatsapp: { emoji: "\ud83d\udcac", gradient: "from-green-500 to-emerald-600", text: "text-green-700" },
};

/* ---------- Animation variants ---------- */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

const floatingVariant = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ---------- Floating sparkle/particle component ---------- */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 3,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.id % 3 === 0 ? "#C9A84C" : p.id % 3 === 1 ? "#00A352" : "#3B82F6"}, transparent)`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestPlan, setLatestPlan] = useState<ContentPlan | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [stats, setStats] = useState({
    companies: 0,
    plans: 0,
    images: 0,
    platforms: 0,
  });

  const t = messages[locale].dashboard;

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        setLoading(false);
        return;
      }
      const [companiesRes, plansRes, imagesRes, plansCountRes, imagesCountRes] = await Promise.all([
        supabase.from("companies").select("*").eq("user_id", u.id).order("created_at", { ascending: false }),
        supabase.from("content_plans").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("generated_images").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("content_plans").select("id", { count: "exact", head: true }).eq("user_id", u.id),
        supabase.from("generated_images").select("id", { count: "exact", head: true }).eq("user_id", u.id),
      ]);
      const comps = (companiesRes.data || []) as Company[];
      setCompanies(comps);
      if (comps.length && !selectedCompany) setSelectedCompany(comps[0]);
      const plans = plansRes.data as ContentPlan[] | null;
      setLatestPlan(plans?.[0] || null);
      setRecentImages((imagesRes.data || []) as GeneratedImage[]);
      const platformSet = new Set<string>();
      comps.forEach((c) => (c.platforms || []).forEach((p) => platformSet.add(p)));
      setStats({
        companies: comps.length,
        plans: plansCountRes.count ?? 0,
        images: imagesCountRes.count ?? 0,
        platforms: platformSet.size,
      });
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-8 w-full min-h-screen p-6" style={{ backgroundColor: "#F8FBF8" }}>
        <Skeleton className="h-40 w-full rounded-2xl" style={{ backgroundColor: "#D4EBD9" }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" style={{ backgroundColor: "#F0F7F2", border: "2px solid #D4EBD9" }} />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" style={{ backgroundColor: "#F0F7F2", border: "2px solid #D4EBD9" }} />
        <Skeleton className="h-64 rounded-2xl" style={{ backgroundColor: "#F0F7F2", border: "2px solid #D4EBD9" }} />
      </div>
    );
  }

  /* ---------- Stat card config ---------- */
  const statItems = [
    {
      label: t.totalCompanies,
      value: stats.companies,
      icon: Building2,
      gradient: "from-[#006C35] to-[#00A352]",
      iconBg: "bg-green-100",
      iconColor: "text-[#006C35]",
      glowColor: "green" as const,
      shadowColor: "rgba(0,163,82,0.25)",
      ringColor: "ring-green-200",
    },
    {
      label: t.plansGenerated,
      value: stats.plans,
      icon: Calendar,
      gradient: "from-[#C9A84C] to-[#E8D5A0]",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A84C]",
      glowColor: "gold" as const,
      shadowColor: "rgba(201,168,76,0.25)",
      ringColor: "ring-amber-200",
    },
    {
      label: t.imagesCreated,
      value: stats.images,
      icon: ImageIcon,
      gradient: "from-[#3B82F6] to-[#6366F1]",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      glowColor: "green" as const,
      shadowColor: "rgba(59,130,246,0.25)",
      ringColor: "ring-blue-200",
    },
    {
      label: t.platformsActive,
      value: stats.platforms,
      icon: Globe,
      gradient: "from-[#8B5CF6] to-[#A855F7]",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      glowColor: "gold" as const,
      shadowColor: "rgba(139,92,246,0.25)",
      ringColor: "ring-purple-200",
    },
  ];

  /* ---------- Quick action cards ---------- */
  const quickActions = [
    {
      href: "/companies",
      icon: Building2,
      title: t.addNewCompany,
      description: locale === "ar" ? "اضف شركة جديدة وحلل هويتها" : "Add a new brand and analyze its identity",
      gradient: "from-[#006C35] to-[#00A352]",
      shadow: "hover:shadow-[0_8px_30px_rgba(0,163,82,0.35)]",
    },
    {
      href: "/planner",
      icon: Calendar,
      title: t.generateThisWeek,
      description: locale === "ar" ? "خطة محتوى اسبوعية مخصصة بالذكاء الاصطناعي" : "AI-powered custom weekly content plan",
      gradient: "from-[#C9A84C] to-[#B8942F]",
      shadow: "hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)]",
    },
    {
      href: "/vision-studio",
      icon: Sparkles,
      title: t.createVisual,
      description: locale === "ar" ? "صور احترافية مولدة بالذكاء الاصطناعي" : "Professional AI-generated branded visuals",
      gradient: "from-[#8B5CF6] to-[#6D28D9]",
      shadow: "hover:shadow-[0_8px_30px_rgba(139,92,246,0.35)]",
    },
  ];

  /* ---------- Helper: get platform config ---------- */
  function getPlatformConfig(platform?: string) {
    if (!platform) return { emoji: "\ud83d\udce2", gradient: "from-gray-400 to-gray-500", text: "text-gray-600" };
    const key = platform.toLowerCase().trim();
    return PLATFORM_CONFIG[key] || { emoji: "\ud83d\udce2", gradient: "from-gray-400 to-gray-500", text: "text-gray-600" };
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 w-full pb-12"
      style={{ backgroundColor: "#F8FBF8" }}
    >
      {/* ================= HERO WELCOME SECTION ================= */}
      <motion.div variants={item}>
        <div
          className="relative overflow-hidden rounded-2xl border-2 p-8 md:p-10 lg:p-12"
          style={{
            borderColor: "#D4EBD9",
            background: "linear-gradient(135deg, #006C35 0%, #00A352 40%, #C9A84C 100%)",
          }}
        >
          {/* Animated background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Floating sparkle particles */}
          <FloatingParticles />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-yellow-200" />
              <span className="text-lg font-medium text-white/90">
                {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"} AI
              </span>
            </motion.div>

            <h1 className="font-cairo text-4xl font-extrabold text-white md:text-5xl lg:text-6xl drop-shadow-lg">
              {t.greeting}, {displayName} {"\ud83d\udc4b"}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-xl md:text-2xl font-medium text-white/80"
            >
              {formatDate(new Date())}
            </motion.p>

            {/* Decorative floating elements */}
            <motion.div
              variants={floatingVariant}
              animate="animate"
              className="absolute -top-2 right-8 hidden text-6xl opacity-20 md:block"
            >
              {"\u2728"}
            </motion.div>
            <motion.div
              variants={floatingVariant}
              animate="animate"
              style={{ animationDelay: "1s" }}
              className="absolute bottom-4 right-24 hidden text-4xl opacity-15 md:block"
            >
              {"\ud83c\udf1f"}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ================= STAT CARDS ================= */}
      <motion.div variants={item} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {statItems.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + idx * 0.1, type: "spring", stiffness: 120 }}
            whileHover={{ y: -6, scale: 1.03 }}
          >
            <GlowCard glowColor={s.glowColor} className="!bg-white !border-2 !border-[#D4EBD9] !rounded-2xl">
              <CardContent className="flex flex-col items-center gap-4 p-7 text-center">
                {/* Gradient icon circle with bounce */}
                <motion.div
                  className={cn(
                    "flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                    s.gradient
                  )}
                  style={{ height: 72, width: 72, boxShadow: `0 8px 24px ${s.shadowColor}` }}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <s.icon className="h-9 w-9 text-white" />
                </motion.div>

                {/* Big animated number */}
                <AnimatedCounter
                  end={s.value}
                  duration={1800}
                  className="text-5xl font-extrabold tracking-tight"
                  suffix=""
                />

                <p className="text-lg font-semibold" style={{ color: "#5A8A6A" }}>
                  {s.label}
                </p>
              </CardContent>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= LATEST PLAN -- Calendar-style ================= */}
      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-2 bg-white shadow-sm" style={{ borderColor: "#D4EBD9" }}>
          <CardHeader className="flex flex-row items-center justify-between p-7">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352]"
                style={{ boxShadow: "0 4px 16px rgba(0,163,82,0.25)" }}
              >
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold" style={{ color: "#004D26" }}>
                {t.latestPlan}
              </CardTitle>
            </div>
            {latestPlan && (
              <Link
                href="/my-plans"
                className="group flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-lg font-semibold transition-all duration-300 hover:bg-[#006C35] hover:text-white"
                style={{ borderColor: "#D4EBD9", color: "#004D26" }}
              >
                {t.viewFullPlan}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </CardHeader>

          <CardContent className="p-7 pt-0">
            {days.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {days.map((d, i) => {
                  const pc = getPlatformConfig(d.platform);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 120 }}
                      whileHover={{ y: -6, scale: 1.05 }}
                      className="group relative overflow-hidden rounded-2xl border-2 p-5 text-center transition-all duration-300 hover:shadow-lg"
                      style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF" }}
                    >
                      {/* Platform gradient top accent bar */}
                      <div
                        className={cn(
                          "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r transition-all duration-300 group-hover:h-2",
                          pc.gradient
                        )}
                      />

                      {/* Day name */}
                      <p className="mt-2 text-xl font-bold" style={{ color: "#004D26" }}>
                        {locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}
                      </p>

                      {/* Platform emoji */}
                      <motion.div
                        className="my-3 text-3xl"
                        whileHover={{ scale: 1.3, rotate: [0, -15, 15, 0] }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {pc.emoji}
                      </motion.div>

                      {/* Topic */}
                      <p className="text-lg font-semibold leading-snug" style={{ color: "#0A1F0F" }}>
                        {locale === "ar" ? d.topicAr : d.topic || d.topicAr}
                      </p>

                      {/* Platform badge */}
                      <span
                        className={cn(
                          "mt-3 inline-block rounded-xl bg-gradient-to-r px-3 py-1.5 text-sm font-bold text-white",
                          pc.gradient
                        )}
                      >
                        {d.platform}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4 text-5xl"
                >
                  {"\ud83d\udcc5"}
                </motion.div>
                <p className="text-xl font-medium" style={{ color: "#5A8A6A" }}>
                  {t.noPlansYet}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ================= QUICK ACTIONS ================= */}
      <motion.div variants={item}>
        <h2 className="mb-6 font-cairo text-3xl font-extrabold" style={{ color: "#004D26" }}>
          {t.quickActions}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1, type: "spring" }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link href={action.href} className="block">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-500",
                    action.shadow
                  )}
                  style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF" }}
                >
                  {/* Background gradient accent on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-5",
                      action.gradient
                    )}
                  />

                  {/* Icon circle */}
                  <motion.div
                    className={cn(
                      "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                      action.gradient
                    )}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    <action.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: "#004D26" }}>
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-lg" style={{ color: "#5A8A6A" }}>
                    {action.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-5 flex items-center gap-2 text-lg font-semibold" style={{ color: "#006C35" }}>
                    <span>{locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646" : "Get started"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================= COMPANIES CAROUSEL ================= */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cairo text-3xl font-extrabold" style={{ color: "#004D26" }}>
            {t.yourCompanies}
          </h2>
          <Link
            href="/companies"
            className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-[#00A352]"
            style={{ color: "#006C35" }}
          >
            {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-nawaa">
          {companies.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="min-w-[300px] shrink-0"
            >
              <div
                className="relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:shadow-xl"
                style={{
                  borderColor: "#D4EBD9",
                  borderImage: `linear-gradient(135deg, ${c.brand_colors?.[0] || "#006C35"}, ${c.brand_colors?.[1] || "#C9A84C"}) 1`,
                }}
              >
                {/* Brand color accent bar */}
                <div
                  className="h-2 w-full"
                  style={{
                    background: `linear-gradient(to right, ${c.brand_colors?.[0] || "#006C35"}, ${c.brand_colors?.[1] || "#00A352"})`,
                  }}
                />

                <Link href="/companies" className="flex flex-col p-7">
                  {/* Logo/Avatar */}
                  <div
                    className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold text-white overflow-hidden shadow-lg"
                    style={{
                      backgroundColor: c.brand_colors?.[0] || "#006C35",
                      boxShadow: `0 8px 24px ${c.brand_colors?.[0] || "#006C35"}40`,
                    }}
                  >
                    {c.logo_url ? (
                      <img src={c.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      c.name?.charAt(0) || "?"
                    )}
                  </div>

                  {/* Name */}
                  <p className="truncate text-center text-xl font-bold" style={{ color: "#004D26" }}>
                    {c.name}
                  </p>
                  {c.name_ar && (
                    <p className="truncate text-center text-lg mt-1 font-medium" style={{ color: "#5A8A6A" }}>
                      {c.name_ar}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {/* Industry badge */}
                    {c.industry && (
                      <span
                        className="rounded-xl px-4 py-1.5 text-base font-semibold"
                        style={{ backgroundColor: "#F0F7F2", color: "#006C35", border: "1px solid #D4EBD9" }}
                      >
                        {c.industry}
                      </span>
                    )}

                    {/* Platform count badge */}
                    {c.platforms && c.platforms.length > 0 && (
                      <span
                        className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-base font-semibold"
                        style={{ backgroundColor: "#FDF8EB", color: "#C9A84C", border: "1px solid #E8D5A0" }}
                      >
                        <Globe className="h-4 w-4" />
                        {c.platforms.length}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Add company card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: companies.length * 0.08 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="min-w-[300px] shrink-0"
          >
            <Link
              href="/companies"
              className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300 hover:border-[#006C35] hover:bg-[#F0F7F2] hover:shadow-lg"
              style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF" }}
            >
              <motion.div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35]/10 to-[#00A352]/10"
                whileHover={{ scale: 1.15, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Plus className="h-10 w-10" style={{ color: "#006C35" }} />
              </motion.div>
              <span className="text-xl font-bold" style={{ color: "#004D26" }}>
                {t.addCompany}
              </span>
              <span className="mt-1 text-lg" style={{ color: "#5A8A6A" }}>
                {locale === "ar" ? "\u0627\u0636\u0641 \u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629" : "Add your brand"}
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ================= RECENT IMAGES -- Masonry-style ================= */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7]"
              style={{ boxShadow: "0 4px 16px rgba(139,92,246,0.25)" }}
            >
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-cairo text-3xl font-extrabold" style={{ color: "#004D26" }}>
              {t.recentImages}
            </h2>
          </div>
          {recentImages.length > 0 && (
            <Link
              href="/my-generations"
              className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-[#8B5CF6]"
              style={{ color: "#8B5CF6" }}
            >
              {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>

        {recentImages.length > 0 ? (
          <div className="columns-2 gap-5 sm:columns-3 md:columns-4 w-full">
            {recentImages
              .flatMap((img) =>
                (img.image_urls || []).map((url, idx) => ({
                  url,
                  key: `${img.id}-${idx}`,
                }))
              )
              .slice(0, 12)
              .map((imageItem, idx) => (
                <motion.div
                  key={imageItem.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06, type: "spring" }}
                  whileHover={{ scale: 1.03 }}
                  className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-300 hover:shadow-xl"
                  style={{ borderColor: "#D4EBD9" }}
                >
                  {imageItem.url ? (
                    <>
                      <img
                        src={imageItem.url}
                        alt=""
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold shadow-lg"
                          style={{ color: "#004D26" }}
                        >
                          <Eye className="h-5 w-5" />
                          <span className="text-lg">{locale === "ar" ? "\u0639\u0631\u0636" : "View"}</span>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex aspect-square items-center justify-center"
                      style={{ backgroundColor: "#F0F7F2" }}
                    >
                      <ImageIcon className="h-12 w-12" style={{ color: "#5A8A6A" }} />
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center rounded-2xl border-2 py-16 text-center"
            style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF" }}
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 text-5xl"
            >
              {"\ud83c\udfa8"}
            </motion.div>
            <p className="text-xl font-medium" style={{ color: "#5A8A6A" }}>
              {t.noImagesYet}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
