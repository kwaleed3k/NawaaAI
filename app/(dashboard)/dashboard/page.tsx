"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

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

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf8", tiktok: "\ud83c\udfb5", x: "\u2716\ufe0f",
  snapchat: "\ud83d\udc7b", linkedin: "\ud83d\udcbc", youtube: "\ud83c\udfac", whatsapp: "\ud83d\udcac",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "bg-pink-500", tiktok: "bg-slate-800", x: "bg-slate-700",
  snapchat: "bg-yellow-400", linkedin: "bg-blue-600", youtube: "bg-red-600", whatsapp: "bg-green-600",
};

export default function DashboardPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestPlan, setLatestPlan] = useState<ContentPlan | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [stats, setStats] = useState({ companies: 0, plans: 0, images: 0, platforms: 0 });

  const t = messages[locale].dashboard;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    (async () => {
      const uid = user.id;
      const [companiesRes, plansRes, imagesRes, plansCountRes, allImagesRes] = await Promise.all([
        supabase.from("companies").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("content_plans").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
        supabase.from("generated_images").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
        supabase.from("content_plans").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("generated_images").select("image_urls").eq("user_id", uid),
      ]);
      const comps = (companiesRes.data || []) as Company[];
      setCompanies(comps);
      if (comps.length && !selectedCompany) setSelectedCompany(comps[0]);
      setLatestPlan((plansRes.data as ContentPlan[] | null)?.[0] || null);
      setRecentImages((imagesRes.data || []) as GeneratedImage[]);
      const platformSet = new Set<string>();
      comps.forEach((c) => (c.platforms || []).forEach((p) => platformSet.add(p)));
      const totalImages = (allImagesRes.data || []).reduce((sum: number, row: { image_urls: string[] | null }) => sum + (row.image_urls?.length ?? 0), 0);
      setStats({ companies: comps.length, plans: plansCountRes.count ?? 0, images: totalImages, platforms: platformSet.size });
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl bg-[#D4EBD9]/50" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-[#F0F7F2] border border-[#D4EBD9]" />)}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: t.totalCompanies, value: stats.companies, icon: Building2, color: "text-[#006C35]", bg: "bg-[#F0F7F2]" },
    { label: t.plansGenerated, value: stats.plans, icon: Calendar, color: "text-[#C9A84C]", bg: "bg-[#FDF8EB]" },
    { label: t.imagesCreated, value: stats.images, icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t.platformsActive, value: stats.platforms, icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const quickActions = [
    { href: "/companies", icon: Building2, title: t.addNewCompany, desc: locale === "ar" ? "اضف شركة جديدة وحلل هويتها" : "Add a new brand and analyze its identity", color: "bg-[#006C35]" },
    { href: "/planner", icon: Calendar, title: t.generateThisWeek, desc: locale === "ar" ? "خطة محتوى اسبوعية مخصصة بالذكاء الاصطناعي" : "AI-powered weekly content plan", color: "bg-[#C9A84C]" },
    { href: "/vision-studio", icon: Sparkles, title: t.createVisual, desc: locale === "ar" ? "صور احترافية مولدة بالذكاء الاصطناعي" : "Professional AI-generated visuals", color: "bg-[#8B5CF6]" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-2xl bg-[#006C35] p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-medium text-white/70 mb-1">{locale === "ar" ? "نواة" : "Nawaa"} AI</p>
        <h1 className="font-['Cairo'] text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
          {t.greeting}, {displayName} {"\ud83d\udc4b"}
        </h1>
        <p className="mt-2 text-lg text-white/70">{formatDate(new Date())}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statItems.map(s => (
          <div key={s.label} className="rounded-xl border border-[#D4EBD9] bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#0A1F0F]">{s.value.toLocaleString()}</p>
            <p className="text-sm text-[#5A8A6A] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Plan */}
      <div className="rounded-xl border border-[#D4EBD9] bg-white overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#D4EBD9]">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#006C35]" />
            <h2 className="text-xl font-bold text-[#004D26]">{t.latestPlan}</h2>
          </div>
          {latestPlan && (
            <Link href="/my-plans" className="flex items-center gap-1 text-sm font-semibold text-[#006C35] hover:underline">
              {t.viewFullPlan} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="p-5">
          {days.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {days.map((d, i) => {
                const key = d.platform?.toLowerCase().trim() ?? "";
                return (
                  <div key={i} className="rounded-xl border border-[#D4EBD9] p-4 text-center hover:border-[#006C35]/40 transition-colors">
                    <div className={`mx-auto mb-2 h-1 w-10 rounded-full ${PLATFORM_COLOR[key] || "bg-gray-300"}`} />
                    <p className="text-sm font-bold text-[#004D26]">{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                    <p className="my-2 text-2xl">{PLATFORM_EMOJI[key] || "\ud83d\udce2"}</p>
                    <p className="text-xs text-[#2D5A3D] leading-snug line-clamp-2">{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                    <span className="mt-2 inline-block rounded-lg bg-[#F0F7F2] px-2 py-0.5 text-xs font-medium text-[#006C35] capitalize">{d.platform}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-4xl mb-2">{"\ud83d\udcc5"}</p>
              <p className="text-[#5A8A6A]">{t.noPlansYet}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-[#004D26]">{t.quickActions}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} className="group rounded-xl border border-[#D4EBD9] bg-white p-6 hover:border-[#006C35]/40 transition-colors">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${a.color} text-white`}>
                <a.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#004D26] mb-1">{a.title}</h3>
              <p className="text-sm text-[#5A8A6A]">{a.desc}</p>
              <p className="mt-3 text-sm font-semibold text-[#006C35] flex items-center gap-1">
                {locale === "ar" ? "ابدأ الآن" : "Get started"} <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#004D26]">{t.yourCompanies}</h2>
          <Link href="/companies" className="text-sm font-semibold text-[#006C35] hover:underline flex items-center gap-1">
            {locale === "ar" ? "عرض الكل" : "View all"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {companies.map(c => (
            <Link key={c.id} href="/companies" className="min-w-[220px] shrink-0 rounded-xl border border-[#D4EBD9] bg-white p-5 text-center hover:border-[#006C35]/40 transition-colors">
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white overflow-hidden"
                style={{ backgroundColor: c.brand_colors?.[0] || "#006C35" }}
              >
                {c.logo_url ? <img src={c.logo_url} alt="" className="h-full w-full object-cover" /> : c.name?.charAt(0) || "?"}
              </div>
              <p className="font-bold text-[#004D26] truncate">{c.name}</p>
              {c.industry && <span className="mt-2 inline-block rounded-lg bg-[#F0F7F2] px-2 py-0.5 text-xs text-[#006C35]">{c.industry}</span>}
            </Link>
          ))}
          <Link href="/companies" className="min-w-[220px] shrink-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D4EBD9] p-5 hover:border-[#006C35] hover:bg-[#F0F7F2] transition-colors">
            <Plus className="h-8 w-8 text-[#006C35] mb-2" />
            <span className="font-bold text-[#004D26]">{t.addCompany}</span>
          </Link>
        </div>
      </div>

      {/* Recent Images */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#004D26]">{t.recentImages}</h2>
          {recentImages.length > 0 && (
            <Link href="/my-generations" className="text-sm font-semibold text-[#8B5CF6] hover:underline flex items-center gap-1">
              {locale === "ar" ? "عرض الكل" : "View all"} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentImages.filter(img => img.image_urls?.[0]).slice(0, 5).map(img => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[#D4EBD9]">
                <img src={img.image_urls![0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#004D26] flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {locale === "ar" ? "عرض" : "View"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#D4EBD9] bg-white py-12 text-center">
            <p className="text-4xl mb-2">{"\ud83c\udfa8"}</p>
            <p className="text-[#5A8A6A]">{t.noImagesYet}</p>
          </div>
        )}
      </div>
    </div>
  );
}
