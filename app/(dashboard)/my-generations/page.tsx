"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ImageIcon,
  Trash2,
  Download,
  Maximize2,
  X,
  Sparkles,
  Loader2,
  Calendar,
  Building2,
  FileText,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

/* ---------- Types ---------- */
type GenerationRow = {
  id: string;
  image_urls: string[] | null;
  day_label: string | null;
  prompt_used: string | null;
  company_id: string | null;
  plan_id: string | null;
  created_at: string;
};

type CompanyRow = {
  id: string;
  name: string;
  logo_url: string | null;
};

type PlanRow = {
  id: string;
  title: string;
};

/* ---------- Accent gradient palette cycling per card ---------- */
const cardAccents = [
  "from-[#23ab7e] via-[#8054b8] to-[#2DD17A]",
  "from-[#8054b8] via-[#A78BFA] to-[#C4B5FD]",
  "from-[#1E6DB8] via-[#3B9AE8] to-[#70C0F5]",
  "from-[#7B3FA0] via-[#A855F7] to-[#D09CF7]",
];

const cardBorderHover = [
  "hover:border-[#8054b8]",
  "hover:border-[#8054b8]",
  "hover:border-[#3B9AE8]",
  "hover:border-[#A855F7]",
];

/* ---------- Component ---------- */
export default function MyGenerationsPage() {
  const supabase = createClient();
  const { locale, user } = useAppStore();

  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  /* ---------- i18n labels ---------- */
  const isAr = locale === "ar";
  const t = {
    galleryLabel: isAr ? "معرض الصور" : "Gallery",
    title: isAr ? "معرض الصور" : "My Generations",
    subtitle: isAr
      ? "جميع الصور المولّدة بالذكاء الاصطناعي — مجمّعة حسب الشركة"
      : "All your AI-generated images — grouped by company",
    noGenerations: isAr ? "لا توجد صور بعد" : "No generations yet",
    noGenerationsSub: isAr
      ? "ابدأ بإنشاء صور من استوديو الرؤية"
      : "Start creating images from Vision Studio",
    download: isAr ? "تنزيل" : "Download",
    delete: isAr ? "حذف" : "Delete",
    fullScreen: isAr ? "عرض كامل" : "Full screen",
    all: isAr ? "الكل" : "All",
    yes: isAr ? "نعم" : "Yes",
    cancel: isAr ? "إلغاء" : "Cancel",
    openStudio: isAr ? "افتح استوديو الرؤية" : "Open Vision Studio",
    images: isAr ? "صور" : "images",
    plan: isAr ? "الخطة" : "Plan",
    noCompany: isAr ? "بدون شركة" : "No Company",
    generationsFor: isAr ? "الصور لـ" : "Generations for",
    totalImages: isAr ? "إجمالي الصور" : "Total Images",
    failedLoad: isAr ? "فشل تحميل الصور" : "Failed to load generations",
    failedDelete: isAr ? "فشل الحذف" : "Failed to delete",
    deleted: isAr ? "تم الحذف" : "Deleted successfully",
    filterBy: isAr ? "تصفية حسب الشركة" : "Filter by Company",
  };

  /* ---------- Fetch data ---------- */
  const fetchData = useCallback(async () => {
    if (!user) return;

    const [genRes, compRes, planRes] = await Promise.all([
      supabase
        .from("generated_images")
        .select("id, image_urls, day_label, prompt_used, company_id, plan_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("companies")
        .select("id, name, logo_url")
        .eq("user_id", user.id),
      supabase
        .from("content_plans")
        .select("id, title")
        .eq("user_id", user.id),
    ]);

    if (genRes.error) {
      toast.error(t.failedLoad);
      console.error(genRes.error);
    } else {
      setGenerations((genRes.data as GenerationRow[]) ?? []);
    }

    if (!compRes.error) setCompanies((compRes.data as CompanyRow[]) ?? []);
    if (!planRes.error) setPlans((planRes.data as PlanRow[]) ?? []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- Lookup maps ---------- */
  const companyMap = useMemo(() => {
    const m = new Map<string, CompanyRow>();
    companies.forEach((c) => m.set(c.id, c));
    return m;
  }, [companies]);

  const planMap = useMemo(() => {
    const m = new Map<string, PlanRow>();
    plans.forEach((p) => m.set(p.id, p));
    return m;
  }, [plans]);

  /* ---------- Company counts for filter badges ---------- */
  const companyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    generations.forEach((g) => {
      const key = g.company_id ?? "__none__";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [generations]);

  /* ---------- Filtered generations ---------- */
  const filteredGenerations = useMemo(() => {
    if (activeFilter === "all") return generations;
    if (activeFilter === "__none__")
      return generations.filter((g) => !g.company_id);
    return generations.filter((g) => g.company_id === activeFilter);
  }, [generations, activeFilter]);

  /* ---------- Total image count ---------- */
  const totalImages = generations.reduce(
    (sum, g) => sum + (g.image_urls?.length ?? 0),
    0
  );

  /* ---------- Actions ---------- */
  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    setDeletingId(id);
    const { error } = await supabase.from("generated_images").delete().eq("id", id);
    if (error) {
      toast.error(t.failedDelete);
    } else {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success(t.deleted);
    }
    setDeletingId(null);
  }

  function handleDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function formatCreatedAt(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#fafbfd] p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#23ab7e] via-[#23ab7e] to-[#8054b8] p-8 sm:p-10 lg:p-14">
            <div className="space-y-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/20">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
              <div className="relative h-12 w-80 overflow-hidden rounded-xl bg-white/20">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
              <div className="relative h-8 w-[28rem] overflow-hidden rounded-xl bg-white/15">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_0.3s] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>
            </div>
          </div>

          {/* Filter skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative h-12 w-36 overflow-hidden rounded-2xl bg-white border-2 border-[#e8eaef]"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#8054b8]/10 to-transparent" />
              </div>
            ))}
          </div>

          {/* Card skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white"
              >
                <div className="relative h-1.5 overflow-hidden bg-gradient-to-r from-[#e8eaef] via-[#A8D5B8] to-[#e8eaef]">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
                <div className="p-5 space-y-4">
                  {/* Badges skeleton */}
                  <div className="flex gap-2">
                    <div className="relative h-8 w-28 overflow-hidden rounded-full bg-[#e8eaef]/40">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#8054b8]/10 to-transparent" />
                    </div>
                    <div className="relative h-8 w-24 overflow-hidden rounded-full bg-[#e8eaef]/40">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#8054b8]/10 to-transparent" />
                    </div>
                  </div>
                  {/* Date skeleton */}
                  <div className="relative h-6 w-48 overflow-hidden rounded-lg bg-[#e8eaef]/30">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_0.2s] bg-gradient-to-r from-transparent via-[#8054b8]/10 to-transparent" />
                  </div>
                  {/* Title skeleton */}
                  <div className="relative h-8 w-40 overflow-hidden rounded-lg bg-[#e8eaef]/30">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_0.3s] bg-gradient-to-r from-transparent via-[#8054b8]/10 to-transparent" />
                  </div>
                  {/* Image grid skeleton */}
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="relative aspect-square overflow-hidden rounded-2xl bg-[#e8eaef]/25"
                      >
                        <div
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#8054b8]/8 to-transparent"
                          style={{ animation: `shimmer 2s infinite ${j * 0.15}s` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#fafbfd]">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ===== PAGE HEADER BANNER ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#23ab7e] via-[#23ab7e] to-[#8054b8] p-8 sm:p-10 lg:p-14">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
          <div
            className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <ImageIcon className="h-6 w-6 text-[#a6ffea]" />
              </div>
              <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">
                {t.galleryLabel}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">
              {t.subtitle}
            </p>

            {/* Stats row */}
            {generations.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-3">
                  <ImageIcon className="h-5 w-5 text-[#a6ffea]" />
                  <span className="text-lg font-bold text-white">
                    {totalImages}
                  </span>
                  <span className="text-base font-medium text-[#a6ffea]/70">
                    {t.images}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-3">
                  <Building2 className="h-5 w-5 text-[#a6ffea]" />
                  <span className="text-lg font-bold text-white">
                    {companies.length}
                  </span>
                  <span className="text-base font-medium text-[#a6ffea]/70">
                    {isAr ? "شركات" : "companies"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-3">
                  <Sparkles className="h-5 w-5 text-[#a6ffea]" />
                  <span className="text-lg font-bold text-white">
                    {generations.length}
                  </span>
                  <span className="text-base font-medium text-[#a6ffea]/70">
                    {isAr ? "مجموعات" : "generations"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8eaef] bg-white py-28">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#23ab7e]/15 via-[#8054b8]/10 to-[#8054b8]/15">
                <ImageIcon className="h-16 w-16 text-[#8054b8]" />
              </div>
              <div className="absolute -right-2 -top-2">
                <Sparkles className="h-7 w-7 text-[#8054b8]" />
              </div>
              <div className="absolute -bottom-1 -left-3">
                <Sparkles className="h-5 w-5 text-[#8054b8]" />
              </div>
            </div>

            <p className="mt-8 text-2xl sm:text-3xl font-black text-[#1a1d2e]">
              {t.noGenerations}
            </p>
            <p className="mt-2 text-lg text-[#8f96a3]/70">{t.noGenerationsSub}</p>
            <a
              href="/vision-studio"
              className="mt-8 inline-flex h-14 items-center rounded-2xl bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] px-10 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#8054b8]/25"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              {t.openStudio}
            </a>
          </div>
        ) : (
          <>
            {/* ===== FILTER BAR ===== */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#8054b8]" />
                <span className="text-lg font-bold text-[#1a1d2e]">{t.filterBy}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* All button */}
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-all duration-300",
                    activeFilter === "all"
                      ? "border-[#8054b8] bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#8054b8]/20"
                      : "border-[#e8eaef] bg-white text-[#1a1d2e] hover:border-[#8054b8]/40 hover:bg-[#f4f6f8]"
                  )}
                >
                  {t.all}
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                      activeFilter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-[#e8eaef] text-[#1a1d2e]"
                    )}
                  >
                    {generations.length}
                  </span>
                </button>

                {/* Per-company buttons */}
                {companies.map((company) => {
                  const count = companyCounts.get(company.id) ?? 0;
                  if (count === 0) return null;
                  const isActive = activeFilter === company.id;
                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => setActiveFilter(company.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-all duration-300",
                        isActive
                          ? "border-[#8054b8] bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#8054b8]/20"
                          : "border-[#e8eaef] bg-white text-[#1a1d2e] hover:border-[#8054b8]/40 hover:bg-[#f4f6f8]"
                      )}
                    >
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className={cn("h-4 w-4", isActive ? "text-white" : "text-[#8054b8]")} />
                      )}
                      {company.name}
                      <span
                        className={cn(
                          "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#e8eaef] text-[#1a1d2e]"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {/* Uncategorized button */}
                {(companyCounts.get("__none__") ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("__none__")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-all duration-300",
                      activeFilter === "__none__"
                        ? "border-[#8054b8] bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#8054b8]/20"
                        : "border-[#e8eaef] bg-white text-[#1a1d2e] hover:border-[#8054b8]/40 hover:bg-[#f4f6f8]"
                    )}
                  >
                    {t.noCompany}
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                        activeFilter === "__none__"
                          ? "bg-white/20 text-white"
                          : "bg-[#e8eaef] text-[#1a1d2e]"
                      )}
                    >
                      {companyCounts.get("__none__") ?? 0}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* ===== SECTION HEADER (showing current filter) ===== */}
            {activeFilter !== "all" && (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">
                  {t.generationsFor}{" "}
                  <span className="text-[#8054b8]">
                    {activeFilter === "__none__"
                      ? t.noCompany
                      : companyMap.get(activeFilter)?.name ?? ""}
                  </span>
                </h2>
                <span className="text-lg font-bold text-[#8f96a3]/60">
                  ({filteredGenerations.length})
                </span>
              </div>
            )}

            {/* ===== GENERATION CARDS GRID ===== */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGenerations.map((gen, idx) => {
                const accentIdx = idx % 4;
                const company = gen.company_id
                  ? companyMap.get(gen.company_id)
                  : null;
                const plan = gen.plan_id ? planMap.get(gen.plan_id) : null;

                return (
                  <div key={gen.id}>
                    <Card
                      className={cn(
                        "group relative overflow-hidden border-2 border-[#e8eaef] bg-white rounded-2xl transition-all duration-500",
                        "hover:-translate-y-1.5 hover:shadow-lg",
                        cardBorderHover[accentIdx]
                      )}
                    >
                      {/* Gradient accent bar at top */}
                      <div
                        className={cn(
                          "h-1.5 w-full bg-gradient-to-r",
                          cardAccents[accentIdx]
                        )}
                      />

                      <CardHeader className="p-5 pb-3">
                        <div className="space-y-3">
                          {/* Top row: badges + delete */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap gap-2 min-w-0 flex-1">
                              {/* Company badge */}
                              {company ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1.5 text-sm font-bold text-[#1a1d2e]">
                                  {company.logo_url ? (
                                    <img
                                      src={company.logo_url}
                                      alt=""
                                      className="h-4 w-4 rounded-full object-cover"
                                    />
                                  ) : (
                                    <Building2 className="h-3.5 w-3.5 text-[#8054b8]" />
                                  )}
                                  {company.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-500">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {t.noCompany}
                                </span>
                              )}

                              {/* Plan badge */}
                              {plan && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6f8] border border-[#c4a8e8] px-3 py-1.5 text-sm font-bold text-violet-700">
                                  <FileText className="h-3.5 w-3.5" />
                                  {plan.title.length > 25
                                    ? plan.title.slice(0, 25) + "..."
                                    : plan.title}
                                </span>
                              )}
                            </div>

                            {/* Delete button */}
                            <div className="shrink-0">
                              {confirmDeleteId === gen.id ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    disabled={deletingId === gen.id}
                                    onClick={() => handleDelete(gen.id)}
                                    className="h-9 px-3 text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-sm transition-all"
                                  >
                                    {deletingId === gen.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      t.yes
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="h-9 px-3 text-sm font-bold border-2 border-[#e8eaef] text-[#1a1d2e] hover:bg-[#f4f6f8] hover:border-[#8054b8]/40 rounded-xl transition-all"
                                  >
                                    {t.cancel}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={deletingId === gen.id}
                                  onClick={() => setConfirmDeleteId(gen.id)}
                                  className="h-9 w-9 shrink-0 rounded-xl bg-red-50 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30"
                                  title={t.delete}
                                >
                                  {deletingId === gen.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Date badge */}
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8eaef] bg-[#f4f6f8] px-3 py-1.5">
                            <Calendar className="h-4 w-4 text-[#8054b8]" />
                            <span className="text-base font-medium text-[#8f96a3]">
                              {formatCreatedAt(gen.created_at)}
                            </span>
                          </div>

                          {/* Day label */}
                          {gen.day_label && (
                            <p className="text-2xl font-extrabold text-[#1a1d2e] truncate">
                              {gen.day_label}
                            </p>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-0">
                        {/* 2x2 image grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {(gen.image_urls ?? []).map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="group/img relative aspect-square overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] transition-all duration-300 hover:border-[#8054b8]/50"
                            >
                              <img
                                src={url}
                                alt={`${gen.day_label || "Generation"} - ${imgIdx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement("div");
                                    fallback.className =
                                      "absolute inset-0 flex items-center justify-center bg-[#f4f6f8]";
                                    fallback.innerHTML =
                                      '<p class="text-[#8f96a3] text-sm text-center px-2">Failed to load</p>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                              {/* Gradient hover overlay */}
                              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-t from-[#1a1d2e]/70 via-[#23ab7e]/40 to-transparent opacity-0 transition-all duration-300 group-hover/img:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => setLightboxUrl(url)}
                                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/90 text-[#1a1d2e] shadow-lg transition-colors hover:bg-white"
                                  aria-label={t.fullScreen}
                                  title={t.fullScreen}
                                >
                                  <Maximize2 className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(url)}
                                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] text-white shadow-lg transition-shadow hover:shadow-[#8054b8]/40"
                                  aria-label={t.download}
                                  title={t.download}
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Empty filtered state */}
            {filteredGenerations.length === 0 && generations.length > 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8eaef] bg-white py-20">
                <ImageIcon className="h-16 w-16 text-[#e8eaef]" />
                <p className="mt-4 text-2xl font-bold text-[#1a1d2e]">
                  {isAr ? "لا توجد صور لهذه الشركة" : "No generations for this company"}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="mt-4 text-lg font-bold text-[#8054b8] hover:underline"
                >
                  {isAr ? "عرض الكل" : "Show all"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== LIGHTBOX OVERLAY ===== */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1d2e]/90 via-black/85 to-[#2d3142]/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="Generated image — full view"
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close lightbox"
              className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-transparent bg-white text-[#1a1d2e] shadow-xl transition-colors hover:bg-[#f4f6f8]"
              style={{
                backgroundClip: "padding-box",
                borderImage: "linear-gradient(135deg, #23ab7e, #8054b8) 1",
                borderImageSlice: 1,
              }}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightboxUrl);
              }}
              className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] px-7 py-4 text-lg font-bold text-white shadow-xl transition-shadow hover:shadow-2xl hover:shadow-[#8054b8]/30"
            >
              <Download className="h-6 w-6" />
              {t.download}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
