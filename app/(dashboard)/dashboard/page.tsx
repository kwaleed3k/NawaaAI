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
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/GlowCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

type Company = {
  id: string;
  name: string;
  name_ar: string | null;
  industry: string | null;
  logo_url: string | null;
  brand_colors: string[] | null;
  platforms: string[] | null;
};

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

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
      const [companiesRes, plansRes, imagesRes] = await Promise.all([
        supabase.from("companies").select("*").eq("user_id", u.id).order("created_at", { ascending: false }),
        supabase.from("content_plans").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("generated_images").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(4),
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
        plans: plansRes.count ?? (plans?.length ? 1 : 0),
        images: imagesRes.data?.length ?? 0,
        platforms: platformSet.size,
      });
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  if (loading) {
    return (
      <div className="space-y-8 w-full" style={{ backgroundColor: "#F8FBF8" }}>
        <Skeleton className="h-14 w-96 rounded-xl" style={{ backgroundColor: "#D4EBD9" }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" style={{ backgroundColor: "#F0F7F2", border: "2px solid #D4EBD9" }} />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" style={{ backgroundColor: "#F0F7F2", border: "2px solid #D4EBD9" }} />
      </div>
    );
  }

  const statItems = [
    { label: t.totalCompanies, value: stats.companies, icon: Building2, color: "text-[#006C35]", bgGrad: "bg-gradient-to-br from-[#006C35]/15 to-[#00A352]/10", glowColor: "green" as const },
    { label: t.plansGenerated, value: stats.plans, icon: Calendar, color: "text-[#C9A84C]", bgGrad: "bg-gradient-to-br from-[#C9A84C]/15 to-[#E8D5A0]/10", glowColor: "gold" as const },
    { label: t.imagesCreated, value: stats.images, icon: ImageIcon, color: "text-[#006C35]", bgGrad: "bg-gradient-to-br from-[#006C35]/15 to-[#00A352]/10", glowColor: "green" as const },
    { label: t.platformsActive, value: stats.platforms, icon: Globe, color: "text-[#C9A84C]", bgGrad: "bg-gradient-to-br from-[#C9A84C]/15 to-[#E8D5A0]/10", glowColor: "gold" as const },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 w-full"
      style={{ backgroundColor: "#F8FBF8" }}
    >
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="font-cairo text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: "#004D26" }}>
          {t.greeting}, {displayName} {"\ud83d\udc4b"}
        </h1>
        <p className="mt-3 text-xl" style={{ color: "#5A8A6A" }}>
          {formatDate(new Date())} — {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"} AI
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {statItems.map((s) => (
          <GlowCard key={s.label} glowColor={s.glowColor} className="!bg-white !border-2 !border-[#D4EBD9]">
            <CardContent className="flex items-center gap-5 p-6">
              <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", s.bgGrad)}>
                <s.icon className={cn("h-8 w-8", s.color)} />
              </div>
              <div>
                <AnimatedCounter
                  end={s.value}
                  duration={1500}
                  className="text-4xl font-bold text-[#0A1F0F]"
                />
                <p className="text-lg mt-1" style={{ color: "#5A8A6A" }}>{s.label}</p>
              </div>
            </CardContent>
          </GlowCard>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5 w-full">
        {/* Latest Plan */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-6">
              <CardTitle className="text-2xl font-bold" style={{ color: "#004D26" }}>{t.latestPlan}</CardTitle>
              {latestPlan && (
                <Button asChild variant="outline" className="h-10 rounded-xl border-2 border-[#D4EBD9] text-base hover:bg-[#F0F7F2]" style={{ color: "#004D26" }}>
                  <Link href="/my-plans">
                    {t.viewFullPlan}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {days.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                  {days.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="rounded-xl border-2 border-[#D4EBD9] p-4 text-center transition-colors hover:border-[#006C35]/40 hover:bg-[#F0F7F2]"
                      style={{ backgroundColor: "#FFFFFF" }}
                    >
                      <p className="text-sm font-medium" style={{ color: "#5A8A6A" }}>{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                      <p className="truncate text-base font-semibold mt-1.5" style={{ color: "#004D26" }}>{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                      <span className="mt-2 inline-block rounded-lg px-3 py-1 text-sm font-medium" style={{ backgroundColor: "rgba(0,108,53,0.1)", color: "#006C35" }}>
                        {d.platform}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-base" style={{ color: "#5A8A6A" }}>
                  {t.noPlansYet}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold" style={{ color: "#004D26" }}>{t.quickActions}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 pt-0">
              <Button asChild className="h-14 justify-start gap-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] hover:shadow-[0_4px_20px_rgba(0,163,82,0.35)] transition-shadow">
                <Link href="/companies">
                  <Building2 className="h-6 w-6" />
                  {t.addNewCompany}
                </Link>
              </Button>
              <Button asChild className="h-14 justify-start gap-4 text-base font-semibold rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#0A1F0F] hover:shadow-[0_4px_20px_rgba(201,168,76,0.35)] transition-shadow">
                <Link href="/planner">
                  <Calendar className="h-6 w-6" />
                  {t.generateThisWeek}
                </Link>
              </Button>
              <Button asChild className="h-14 justify-start gap-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#00A352] to-[#006C35] hover:shadow-[0_4px_20px_rgba(0,163,82,0.35)] transition-shadow">
                <Link href="/vision-studio">
                  <Sparkles className="h-6 w-6" />
                  {t.createVisual}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Companies */}
      <motion.div variants={item}>
        <h2 className="mb-5 font-cairo text-3xl font-bold" style={{ color: "#004D26" }}>{t.yourCompanies}</h2>
        <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-nawaa">
          {companies.map((c) => (
            <GlowCard
              key={c.id}
              glowColor="green"
              className="min-w-[260px] shrink-0 !bg-white !border-2 !border-[#D4EBD9]"
            >
              <Link
                href="/companies"
                className="flex flex-col p-6"
              >
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold text-white overflow-hidden transition-shadow group-hover:shadow-[0_0_20px_rgba(0,108,53,0.3)]"
                  style={{
                    backgroundColor: c.brand_colors?.[0] || "#006C35",
                  }}
                >
                  {c.logo_url ? (
                    <img src={c.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    c.name?.charAt(0) || "?"
                  )}
                </div>
                <p className="truncate text-center text-lg font-semibold" style={{ color: "#004D26" }}>{c.name}</p>
                {c.name_ar && (
                  <p className="truncate text-center text-base mt-1" style={{ color: "#5A8A6A" }}>{c.name_ar}</p>
                )}
                {c.industry && (
                  <span className="mt-2 inline-block self-center rounded-xl px-4 py-2 text-base font-medium" style={{ backgroundColor: "#F0F7F2", color: "#2D5A3D" }}>
                    {c.industry}
                  </span>
                )}
              </Link>
            </GlowCard>
          ))}
          <Link
            href="/companies"
            className="flex min-w-[260px] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 hover:border-[#006C35] hover:bg-[#F0F7F2]"
            style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF", color: "#5A8A6A" }}
          >
            <Plus className="mb-3 h-12 w-12" />
            <span className="text-lg font-semibold">{t.addCompany}</span>
          </Link>
        </div>
      </motion.div>

      {/* Recent Images */}
      <motion.div variants={item}>
        <h2 className="mb-5 font-cairo text-3xl font-bold" style={{ color: "#004D26" }}>{t.recentImages}</h2>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 w-full">
            {recentImages.flatMap((img) => (img.image_urls || []).map((url, idx) => ({ url, key: `${img.id}-${idx}` }))).slice(0, 12).map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group aspect-square overflow-hidden rounded-2xl border-2"
                style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF" }}
              >
                {item.url ? (
                  <img src={item.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ color: "#5A8A6A" }}>
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 py-12 text-center text-base" style={{ borderColor: "#D4EBD9", backgroundColor: "#FFFFFF", color: "#5A8A6A" }}>
            {t.noImagesYet}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
