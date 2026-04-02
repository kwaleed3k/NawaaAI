"use client";

import { useEffect, useState } from "react";
/* framer-motion removed – using plain HTML + CSS transitions */
import {
  FolderOpen,
  Calendar,
  Clock,
  ChevronUp,
  Trash2,
  Loader2,
  Sparkles,
  Eye,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

/* ── Types ── */

type PlanDay = {
  dayIndex: number;
  dayEn: string;
  dayAr: string;
  date: string;
  platform: string;
  contentType: string;
  topic: string;
  topicAr?: string;
  caption: string;
  captionAr?: string;
  hashtags: string[];
  postingTime: string;
  postingTimeReason?: string;
  contentTips?: string;
};

type ContentPlanRow = {
  id: string;
  title: string | null;
  week_start: string;
  platforms: string[] | null;
  created_at: string;
  company_id: string | null;
  plan_data: {
    weekTheme?: string;
    weekThemeAr?: string;
    days?: PlanDay[];
    weeklyStrategy?: string;
  };
};

type CompanyInfo = {
  id: string;
  name: string;
  name_ar: string | null;
  logo_url: string | null;
  brand_colors: string[] | null;
};

/* ── Platform emojis ── */

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\uD83D\uDCF8",
  tiktok: "\uD83C\uDFB5",
  x: "\uD835\uDD4F",
  snapchat: "\uD83D\uDC7B",
  linkedin: "\uD83D\uDCBC",
  youtube: "\uD83C\uDFAC",
  whatsapp: "\uD83D\uDCAC",
};

/* ── Platform gradient backgrounds for badges ── */

const PLATFORM_BADGE_STYLES: Record<string, string> = {
  instagram:
    "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400/40",
  tiktok:
    "bg-gradient-to-r from-slate-800 to-cyan-500 text-white border-cyan-400/40",
  x: "bg-gradient-to-r from-slate-700 to-slate-900 text-white border-slate-400/40",
  snapchat:
    "bg-gradient-to-r from-yellow-400 to-[#e67af3] text-yellow-900 border-yellow-400/40",
  linkedin:
    "bg-gradient-to-r from-[#8054b8] to-blue-700 text-white border-blue-400/40",
  youtube:
    "bg-gradient-to-r from-red-500 to-red-700 text-white border-red-400/40",
  whatsapp:
    "bg-gradient-to-r from-[#23ab7e] to-[#1a8a64] text-white border-[#2dd4a0]/40",
};

/* ── Platform top-bar colors for day cards ── */

const PLATFORM_BAR_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-rose-500",
  tiktok: "from-slate-800 to-cyan-500",
  x: "from-slate-700 to-slate-900",
  snapchat: "from-yellow-400 to-[#e67af3]",
  linkedin: "from-[#8054b8] to-blue-700",
  youtube: "from-red-500 to-red-700",
  whatsapp: "from-[#23ab7e] to-[#1a8a64]",
};

/* ── Card accent bar rotation ── */

const CARD_ACCENT_COLORS = [
  "from-[#23ab7e] via-[#8054b8] to-[#8054b8]",
  "from-[#8054b8] via-[#A78BFA] to-[#8054b8]",
  "from-[#8054b8] via-indigo-500 to-[#8054b8]",
  "from-[#8054b8] via-fuchsia-500 to-pink-500",
];

/* ── Hashtag pill color rotation ── */

const HASHTAG_PILL_COLORS = [
  "bg-pink-100 text-pink-700 border border-pink-200",
  "bg-blue-100 text-blue-700 border border-blue-200",
  "bg-[#e8eaef] text-amber-700 border border-[#f5c6fa]",
  "bg-white text-[#1a8a64] border border-[#a6ffea]",
  "bg-purple-100 text-purple-700 border border-purple-200",
  "bg-cyan-100 text-cyan-700 border border-cyan-200",
  "bg-orange-100 text-orange-700 border border-orange-200",
];

/* ── Card shadow glow rotation ── */

const CARD_GLOW_COLORS = [
  "hover:shadow-lg",
  "hover:shadow-lg",
  "hover:shadow-lg",
  "hover:shadow-lg",
];

/* ── Helpers ── */

function formatWeekRange(weekStart: string): string {
  try {
    const start = parseISO(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  } catch {
    return weekStart;
  }
}

/* ── Stagger animation variants ── */


/* ── Component ── */

export default function MyPlansPage() {
  const supabase = createClient();
  const { locale, user } = useAppStore();
  const isAr = locale === "ar";

  const [plans, setPlans] = useState<ContentPlanRow[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadPlans();
    else setLoading(false);
  }, [user]);

  async function loadPlans() {
    if (!user) { setLoading(false); return; }
    const [plansRes, companiesRes] = await Promise.all([
      supabase
        .from("content_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("companies")
        .select("id, name, name_ar, logo_url, brand_colors")
        .eq("user_id", user.id),
    ]);
    if (plansRes.error) {
      toast.error(plansRes.error.message);
      setPlans([]);
    } else {
      setPlans((plansRes.data as ContentPlanRow[]) ?? []);
    }
    setCompanies((companiesRes.data as CompanyInfo[]) ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDeletingId(null);
      return;
    }
    // Delete linked generated images first to avoid foreign key constraint
    await supabase.from("generated_images").delete().eq("plan_id", id);

    const { error } = await supabase
      .from("content_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      console.error("Delete plan error:", error);
      toast.error(isAr ? "فشل حذف الخطة، حاول مرة أخرى" : "Failed to delete plan, please try again");
    } else {
      toast.success(isAr ? "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062E\u0637\u0629" : "Plan deleted");
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (expandedPlanId === id) setExpandedPlanId(null);
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  function toggleExpand(id: string) {
    setExpandedPlanId((prev) => (prev === id ? null : id));
  }

  /* ── Loading skeleton ── */

  if (loading) {
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8">
        {/* Skeleton banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e8eaef] via-[#E8F5EC] to-[#e8eaef] p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          <Skeleton className="h-10 w-80 rounded-xl bg-white/50" />
          <Skeleton className="mt-3 h-6 w-60 rounded-lg bg-white/30" />
        </div>

        {/* Skeleton cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border-2 border-[#e8eaef] bg-white"
            >
              {/* Accent bar skeleton */}
              <div className="h-2 bg-gradient-to-r from-[#e8eaef] via-[#E8F5EC] to-[#e8eaef]">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-xl bg-[#e8eaef]/50" />
                  <Skeleton className="h-5 w-32 rounded-lg bg-[#e8eaef]/40" />
                </div>
                <Skeleton className="h-6 w-full rounded-lg bg-[#e8eaef]/40" />
                <Skeleton className="h-5 w-3/4 rounded-lg bg-[#e8eaef]/30" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-xl bg-[#e8eaef]/30" />
                  <Skeleton className="h-8 w-20 rounded-xl bg-[#e8eaef]/30" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl bg-[#e8eaef]/20" />
                  <Skeleton className="h-8 w-8 rounded-xl bg-[#e8eaef]/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ── */

  if (plans.length === 0) {
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8">
        {/* ===== PAGE HEADER BANNER ===== */}
        <div className="relative overflow-hidden rounded-[2rem] nl-aurora-bg">
          <div className="absolute -top-20 -right-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#6d3fa0]/30 to-fuchsia-600/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-28 h-28 rounded-full bg-gradient-to-tr from-[#6d3fa0]/20 to-cyan-500/10 blur-3xl" />
          <div className="relative z-10 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#8054b8] shadow-lg shadow-[#8054b8]/25">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-2xl font-black text-white leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-white via-[#c4a8e8] to-blue-200 bg-clip-text text-transparent">
                    {isAr ? "خطط المحتوى المحفوظة" : "Saved Content Plans"}
                  </span>
                </h1>
                <p className="mt-1 text-sm sm:text-sm text-slate-400">
                  {isAr ? "إدارة ومراجعة جميع خططك" : "Manage and review all your plans"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state card */}
        <div className="relative overflow-hidden rounded-xl py-24 px-8" style={{ background: "linear-gradient(170deg, #ffffff 0%, #f7f9fb 40%, #f0fdf8 70%, #f5f0ff 100%)", border: "1.5px solid #e8eaef" }}>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-[28px] opacity-20" style={{ background: "linear-gradient(135deg, #8054b8, #23ab7e)", animation: "nl-glow-breathe 3s ease-in-out infinite" }} />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[24px] shadow-xl" style={{ background: "linear-gradient(135deg, #8054b8, #23ab7e)", boxShadow: "0 12px 40px rgba(128,84,184,0.3)" }}>
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-3 -right-3" style={{ animation: "nl-pulse-dot 2s ease infinite" }}>
                <div className="w-8 h-8 rounded-xl bg-[#23ab7e] flex items-center justify-center shadow-lg"><Sparkles className="h-4 w-4 text-white" /></div>
              </div>
            </div>
            <h2 className="text-sm sm:text-xl font-black text-[#2d3142] text-center">{isAr ? "لا توجد خطط محفوظة بعد" : "No saved plans yet"}</h2>
            <p className="mt-3 text-sm text-[#8f96a3] max-w-md text-center leading-relaxed">{isAr ? "انتقل إلى مخطط المحتوى لإنشاء وحفظ أول خطة لك" : "Go to the Content Planner to create and save your first plan"}</p>
            <a href="/planner" className="relative mt-10 h-16 px-12 text-xl font-black rounded-xl text-white border-none cursor-pointer transition-all hover:-translate-y-1 overflow-hidden inline-flex items-center gap-3" style={{ background: "linear-gradient(135deg, #8054b8, #23ab7e)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 8px 32px rgba(128,84,184,0.3)" }}>
              <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
              <Calendar className="h-6 w-6 relative z-10" />
              <span className="relative z-10">{isAr ? "اذهب إلى المخطط" : "Go to Planner"}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main view ── */

  const expandedPlan = plans.find((p) => p.id === expandedPlanId);

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8">
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-xl nl-aurora-bg p-4 sm:p-5 lg:p-6">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-2xl font-black text-white leading-tight">
              {isAr ? "خطط المحتوى المحفوظة" : "Saved Content Plans"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {isAr ? "إدارة ومراجعة جميع خططك" : "Manage and review all your plans"}
            </p>
          </div>
          {plans.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
              <FolderOpen className="h-5 w-5 text-[#a6ffea]" />
              <span className="text-xl font-black text-white">{plans.length}</span>
              <span className="text-sm text-white/60">{isAr ? "خطط" : "Plans"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan Cards Grid ── */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan, i) => {
          const isExpanded = expandedPlanId === plan.id;
          const dayCount = plan.plan_data?.days?.length ?? 0;
          const uniquePlatforms = [
            ...new Set(
              plan.platforms ??
                plan.plan_data?.days?.map((d) => d.platform) ??
                []
            ),
          ];

          const company = companies.find((c) => c.id === plan.company_id);
          const accentIdx = i % CARD_ACCENT_COLORS.length;
          const glowClass = CARD_GLOW_COLORS[accentIdx];

          return (
            <div
              key={plan.id}
              className={cn(
                "group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1",
                isExpanded
                  ? "shadow-[0_12px_40px_rgba(35,171,126,0.1)]"
                  : "hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              )}
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: isExpanded ? "2px solid rgba(35,171,126,0.3)" : "1.5px solid #e8eaef" }}
            >
              {/* Gradient top accent bar */}
              <div
                className={cn(
                  "h-1.5 bg-gradient-to-r",
                  CARD_ACCENT_COLORS[accentIdx]
                )}
              />

              <div className="p-6">
                {/* Company logo badge */}
                {company && (
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl overflow-hidden border-2 border-[#e8eaef] shadow-sm"
                      style={{
                        backgroundColor:
                          company.brand_colors?.[0] || "#f4f6f8",
                      }}
                    >
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-extrabold text-white drop-shadow-sm">
                          {company.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#1a1d2e]">
                      {isAr
                        ? company.name_ar || company.name
                        : company.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-['Cairo'] text-xl font-extrabold text-[#1a1d2e] leading-snug line-clamp-2">
                  {plan.title ??
                    (isAr
                      ? plan.plan_data?.weekThemeAr ?? plan.plan_data?.weekTheme
                      : plan.plan_data?.weekTheme ??
                        plan.plan_data?.weekThemeAr) ??
                    (isAr
                      ? "\u062E\u0637\u0629 \u0628\u062F\u0648\u0646 \u0639\u0646\u0648\u0627\u0646"
                      : "Untitled Plan")}
                </h3>

                {/* Date range with icon badge */}
                <div className="mt-3 flex items-center gap-2.5 text-sm text-[#2d3142]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#23ab7e] to-[#8054b8]">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">
                    {formatWeekRange(plan.week_start)}
                  </span>
                </div>

                {/* Day count with icon badge */}
                <div className="mt-2 flex items-center gap-2.5 text-sm text-[#2d3142]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8054b8] to-[#A78BFA]">
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">
                    {isAr
                      ? `${dayCount} ${dayCount === 1 ? "\u064A\u0648\u0645" : "\u0623\u064A\u0627\u0645"}`
                      : `${dayCount} day${dayCount !== 1 ? "s" : ""}`}
                  </span>
                </div>

                {/* Platform badges with emojis + gradient backgrounds */}
                {uniquePlatforms.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {uniquePlatforms.map((p) => (
                      <span
                        key={p}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold shadow-sm",
                          PLATFORM_BADGE_STYLES[p.toLowerCase()] ??
                            "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white border-[#e8eaef]"
                        )}
                      >
                        <span className="text-sm">
                          {PLATFORM_EMOJI[p.toLowerCase()] ?? p.charAt(0).toUpperCase()}
                        </span>
                        <span className="capitalize">{p}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Created date pill */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1 text-sm text-[#8f96a3]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {isAr ? "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638: " : "Saved: "}
                    {(() => {
                      try {
                        return format(parseISO(plan.created_at), "MMM d, yyyy");
                      } catch {
                        return plan.created_at;
                      }
                    })()}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-5 flex gap-2">
                  <Button
                    onClick={() => toggleExpand(plan.id)}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-sm font-bold transition-all duration-300",
                      isExpanded
                        ? "bg-[#23ab7e] text-white hover:bg-[#23ab7e]/90"
                        : "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white hover:shadow-sm shadow-md hover:scale-[1.02]"
                    )}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-2 h-5 w-5" />
                        {isAr ? "\u0625\u062E\u0641\u0627\u0621" : "Collapse"}
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-5 w-5" />
                        {isAr ? "\u0639\u0631\u0636 \u0627\u0644\u062E\u0637\u0629" : "View Plan"}
                      </>
                    )}
                  </Button>

                  {/* Delete button */}
                  {confirmDeleteId === plan.id ? (
                    <div className="flex gap-1.5">
                      <Button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                        className="h-9 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-bold shadow-md hover:shadow-sm"
                      >
                        {deletingId === plan.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isAr ? (
                          "\u062A\u0623\u0643\u064A\u062F"
                        ) : (
                          "Yes"
                        )}
                      </Button>
                      <Button
                        onClick={() => setConfirmDeleteId(null)}
                        variant="outline"
                        className="h-9 px-4 rounded-xl border-2 border-[#e8eaef] text-[#8f96a3] text-sm hover:bg-[#f4f6f8]"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setConfirmDeleteId(plan.id)}
                      variant="outline"
                      className="h-9 px-4 rounded-xl border-2 border-[#e8eaef] text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 hover:shadow-sm transition-all duration-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Expanded Plan Detail View ── */}
      {expandedPlan && (
        <div className="overflow-hidden">
            <div className="rounded-xl border-2 border-[#23ab7e]/20 bg-[#fafbfd] overflow-hidden">
              {/* ── Gradient header bar ── */}
              <div className="relative overflow-hidden nl-aurora-bg px-6 py-6 lg:px-8 lg:py-8">
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-['Cairo'] text-sm sm:text-xl font-extrabold text-white drop-shadow-sm">
                          {isAr
                            ? expandedPlan.plan_data?.weekThemeAr ??
                              expandedPlan.plan_data?.weekTheme
                            : expandedPlan.plan_data?.weekTheme ??
                              expandedPlan.plan_data?.weekThemeAr ??
                              (isAr ? "\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Week Theme")}
                        </h2>
                        <p className="text-sm text-white/80">
                          {formatWeekRange(expandedPlan.week_start)}
                        </p>
                      </div>
                    </div>

                    {/* Weekly strategy */}
                    {expandedPlan.plan_data?.weeklyStrategy && (
                      <div className="mt-5 max-w-2xl rounded-xl bg-white/15 border border-white/25 p-4">
                        <p className="text-sm font-bold uppercase tracking-wider text-white/90 mb-1.5">
                          {isAr ? "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Weekly Strategy"}
                        </p>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {expandedPlan.plan_data.weeklyStrategy}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setExpandedPlanId(null)}
                    className="h-9 px-5 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all text-sm font-bold"
                  >
                    <ChevronUp className="mr-2 h-5 w-5" />
                    {isAr ? "\u0625\u063A\u0644\u0627\u0642" : "Close"}
                  </Button>
                </div>
              </div>

              {/* ── Day cards grid ── */}
              <div className="p-4 lg:p-8">
                <div
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {expandedPlan.plan_data?.days?.map((day, i) => {
                    const platformKey = day.platform?.toLowerCase() ?? "";
                    const barGradient =
                      PLATFORM_BAR_COLORS[platformKey] ??
                      "from-[#23ab7e] to-[#8054b8]";
                    const emoji = PLATFORM_EMOJI[platformKey] ?? day.platform?.charAt(0)?.toUpperCase() ?? "?";

                    return (
                      <div
                        key={day.dayIndex}
                        className="group/day overflow-hidden rounded-xl border-2 border-[#e8eaef] bg-white transition-all duration-300 hover:border-[#23ab7e]/30 hover:shadow-md"
                      >
                        {/* Platform-colored top bar */}
                        <div
                          className={cn(
                            "h-2 bg-gradient-to-r",
                            barGradient
                          )}
                        />

                        <div className="p-5">
                          {/* Day header */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-[#1a1d2e]">
                              {isAr
                                ? day.dayAr || day.dayEn
                                : day.dayEn || day.dayAr}
                            </span>
                            <span className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1 text-sm font-medium text-[#8f96a3]">
                              {day.date}
                            </span>
                          </div>

                          {/* Platform + content type */}
                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold shadow-sm",
                                PLATFORM_BADGE_STYLES[platformKey] ??
                                  "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white border-[#e8eaef]"
                              )}
                            >
                              <span className="text-sm">{emoji}</span>
                              <span className="capitalize">{day.platform}</span>
                            </span>
                            <span className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1.5 text-sm font-medium text-[#505868]">
                              {day.contentType}
                            </span>
                          </div>

                          {/* Topic */}
                          <p className="text-xl font-bold text-[#2d3142] leading-snug">
                            {isAr
                              ? day.topicAr || day.topic
                              : day.topic || day.topicAr}
                          </p>

                          {/* Caption */}
                          <p className="mt-2.5 text-sm text-[#505868] leading-relaxed line-clamp-4">
                            {isAr
                              ? day.captionAr || day.caption
                              : day.caption || day.captionAr}
                          </p>

                          {/* Hashtags — colorful cycling pills */}
                          {day.hashtags && day.hashtags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {day.hashtags.slice(0, 5).map((tag, tagIdx) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    "rounded-xl px-3 py-1 text-sm font-semibold",
                                    HASHTAG_PILL_COLORS[
                                      tagIdx % HASHTAG_PILL_COLORS.length
                                    ]
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                              {day.hashtags.length > 5 && (
                                <span className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1 text-sm font-medium text-[#8f96a3]">
                                  +{day.hashtags.length - 5}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Posting time — gold-tinted box */}
                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#8054b8]/10 border border-[#8054b8]/25 px-3 py-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-[#8054b8] to-[#A78BFA]">
                              <Clock className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-[#8054b8]">
                              {day.postingTime}
                            </span>
                          </div>
                          {day.postingTimeReason && (
                            <p className="mt-1.5 text-sm text-[#8f96a3] italic leading-snug px-1">
                              {day.postingTimeReason}
                            </p>
                          )}

                          {/* Content tips — gradient-bordered callout */}
                          {day.contentTips && (
                            <div className="mt-4 relative rounded-xl overflow-hidden">
                              {/* Gradient border effect */}
                              <div className="absolute inset-0 rounded-xl nl-aurora-bg p-[2px]">
                                <div className="h-full w-full rounded-[10px] bg-white" />
                              </div>
                              <div className="relative p-3.5">
                                <p className="text-sm font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5">
                                  <Sparkles className="h-4 w-4 text-[#8054b8]" />
                                  {isAr ? "\u0646\u0635\u0627\u0626\u062D" : "Tips"}
                                </p>
                                <p className="text-sm text-[#505868] leading-relaxed">
                                  {day.contentTips}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
