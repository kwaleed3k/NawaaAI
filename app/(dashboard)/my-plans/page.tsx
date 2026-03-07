"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    "bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 border-yellow-400/40",
  linkedin:
    "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-400/40",
  youtube:
    "bg-gradient-to-r from-red-500 to-red-700 text-white border-red-400/40",
  whatsapp:
    "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400/40",
};

/* ── Platform top-bar colors for day cards ── */

const PLATFORM_BAR_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-rose-500",
  tiktok: "from-slate-800 to-cyan-500",
  x: "from-slate-700 to-slate-900",
  snapchat: "from-yellow-400 to-amber-400",
  linkedin: "from-blue-500 to-blue-700",
  youtube: "from-red-500 to-red-700",
  whatsapp: "from-green-500 to-emerald-600",
};

/* ── Card accent bar rotation ── */

const CARD_ACCENT_COLORS = [
  "from-[#006C35] via-[#00A352] to-[#C9A84C]",
  "from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C]",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
];

/* ── Hashtag pill color rotation ── */

const HASHTAG_PILL_COLORS = [
  "bg-pink-100 text-pink-700 border border-pink-200",
  "bg-blue-100 text-blue-700 border border-blue-200",
  "bg-amber-100 text-amber-700 border border-amber-200",
  "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "bg-purple-100 text-purple-700 border border-purple-200",
  "bg-cyan-100 text-cyan-700 border border-cyan-200",
  "bg-orange-100 text-orange-700 border border-orange-200",
];

/* ── Card shadow glow rotation ── */

const CARD_GLOW_COLORS = [
  "hover:shadow-[0_8px_40px_rgba(0,108,53,0.18)]",
  "hover:shadow-[0_8px_40px_rgba(201,168,76,0.18)]",
  "hover:shadow-[0_8px_40px_rgba(99,102,241,0.18)]",
  "hover:shadow-[0_8px_40px_rgba(168,85,247,0.18)]",
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/* ── Component ── */

export default function MyPlansPage() {
  const supabase = createClient();
  const { locale } = useAppStore();
  const isAr = locale === "ar";

  const [plans, setPlans] = useState<ContentPlanRow[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
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
    const { error } = await supabase
      .from("content_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
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
      <div className="space-y-8">
        {/* Skeleton banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D4EBD9] via-[#E8F5EC] to-[#D4EBD9] p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          <Skeleton className="h-10 w-80 rounded-xl bg-white/50" />
          <Skeleton className="mt-3 h-6 w-60 rounded-lg bg-white/30" />
        </div>

        {/* Skeleton cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-white"
            >
              {/* Accent bar skeleton */}
              <div className="h-2 bg-gradient-to-r from-[#D4EBD9] via-[#E8F5EC] to-[#D4EBD9]">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl bg-[#D4EBD9]/50" />
                  <Skeleton className="h-5 w-32 rounded-lg bg-[#D4EBD9]/40" />
                </div>
                <Skeleton className="h-6 w-full rounded-lg bg-[#D4EBD9]/40" />
                <Skeleton className="h-5 w-3/4 rounded-lg bg-[#D4EBD9]/30" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-xl bg-[#D4EBD9]/30" />
                  <Skeleton className="h-8 w-20 rounded-xl bg-[#D4EBD9]/30" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1 rounded-xl bg-[#D4EBD9]/20" />
                  <Skeleton className="h-12 w-12 rounded-xl bg-[#D4EBD9]/20" />
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
      <div className="space-y-8">
        {/* Gradient banner header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
          <div className="relative">
            <h1 className="font-['Cairo'] text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
              {isAr ? "\u062E\u0637\u0637\u064A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629" : "My Saved Plans"}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-white/80 text-lg">
              <FolderOpen className="h-5 w-5" />
              <span>
                {isAr
                  ? "\u0639\u0631\u0636 \u0648\u0625\u062F\u0627\u0631\u0629 \u062C\u0645\u064A\u0639 \u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629"
                  : "View and manage all your saved content plans"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Empty state card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] py-24 px-6"
        >
          {/* Floating animated icon */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35] via-[#00A352] to-[#C9A84C] shadow-[0_8px_40px_rgba(0,108,53,0.25)]"
            >
              <FolderOpen className="h-14 w-14 text-white" />
            </motion.div>

            {/* Pulsing sparkles */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-1 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00A352] to-[#006C35] shadow-md"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          </div>

          <p className="mt-8 text-2xl font-bold text-[#004D26]">
            {isAr
              ? "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u0637\u0637 \u0645\u062D\u0641\u0648\u0638\u0629 \u0628\u0639\u062F"
              : "No saved plans yet"}
          </p>
          <p className="mt-3 text-lg text-[#5A8A6A] max-w-md text-center leading-relaxed">
            {isAr
              ? "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0645\u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0644\u0625\u0646\u0634\u0627\u0621 \u0648\u062D\u0641\u0638 \u0623\u0648\u0644 \u062E\u0637\u0629 \u0644\u0643"
              : "Go to the Content Planner to create and save your first plan"}
          </p>
          <a
            href="/planner"
            className="mt-8 inline-flex h-14 items-center justify-center gap-3 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] text-white hover:shadow-[0_0_30px_rgba(0,108,53,0.35)] transition-all duration-300 shadow-lg hover:scale-[1.02]"
          >
            <Calendar className="h-6 w-6" />
            {isAr
              ? "\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u062E\u0637\u0637"
              : "Go to Planner"}
          </a>
        </motion.div>
      </div>
    );
  }

  /* ── Main view ── */

  const expandedPlan = plans.find((p) => p.id === expandedPlanId);

  return (
    <div className="space-y-8">
      {/* ── Gradient Banner Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10"
      >
        {/* Decorative dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cairo'] text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
              {isAr ? "\u062E\u0637\u0637\u064A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629" : "My Saved Plans"}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-white/80 text-lg">
              <Sparkles className="h-5 w-5" />
              <span>
                {isAr
                  ? "\u0639\u0631\u0636 \u0648\u0625\u062F\u0627\u0631\u0629 \u062C\u0645\u064A\u0639 \u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629"
                  : "View and manage all your saved content plans"}
              </span>
            </div>
          </div>

          {/* Count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-3"
          >
            <FolderOpen className="h-6 w-6 text-white" />
            <span className="text-2xl font-extrabold text-white">{plans.length}</span>
            <span className="text-lg text-white/80 font-medium">
              {isAr
                ? plans.length === 1
                  ? "\u062E\u0637\u0629"
                  : "\u062E\u0637\u0637"
                : plans.length === 1
                  ? "plan"
                  : "plans"}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Plan Cards Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              layout
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300",
                glowClass,
                isExpanded
                  ? "border-[#006C35]/50 shadow-[0_8px_40px_rgba(0,108,53,0.15)]"
                  : "border-[#D4EBD9] hover:border-[#006C35]/40"
              )}
            >
              {/* Gradient top accent bar */}
              <div
                className={cn(
                  "h-2 bg-gradient-to-r",
                  CARD_ACCENT_COLORS[accentIdx]
                )}
              />

              <div className="p-6">
                {/* Company logo badge */}
                {company && (
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden border-2 border-[#D4EBD9] shadow-sm"
                      style={{
                        backgroundColor:
                          company.brand_colors?.[0] || "#F0F7F2",
                      }}
                    >
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-extrabold text-white drop-shadow-sm">
                          {company.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-[#004D26]">
                      {isAr
                        ? company.name_ar || company.name
                        : company.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-['Cairo'] text-xl font-bold text-[#004D26] leading-snug line-clamp-2">
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
                <div className="mt-3 flex items-center gap-2.5 text-lg text-[#0A1F0F]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#006C35] to-[#00A352]">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">
                    {formatWeekRange(plan.week_start)}
                  </span>
                </div>

                {/* Day count with icon badge */}
                <div className="mt-2 flex items-center gap-2.5 text-lg text-[#0A1F0F]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0]">
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
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold shadow-sm",
                          PLATFORM_BADGE_STYLES[p.toLowerCase()] ??
                            "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white border-[#D4EBD9]"
                        )}
                      >
                        <span className="text-base">
                          {PLATFORM_EMOJI[p.toLowerCase()] ?? p.charAt(0).toUpperCase()}
                        </span>
                        <span className="capitalize">{p}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Created date pill */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1 text-sm text-[#5A8A6A]">
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
                      "flex-1 h-12 rounded-xl text-base font-bold transition-all duration-300",
                      isExpanded
                        ? "bg-[#006C35] text-white hover:bg-[#006C35]/90"
                        : "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white hover:shadow-[0_0_25px_rgba(0,163,82,0.3)] shadow-md hover:scale-[1.02]"
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
                        className="h-12 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 text-base font-bold shadow-md hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
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
                        className="h-12 px-4 rounded-xl border-2 border-[#D4EBD9] text-[#5A8A6A] text-base hover:bg-[#F0F7F2]"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setConfirmDeleteId(plan.id)}
                      variant="outline"
                      className="h-12 px-4 rounded-xl border-2 border-[#D4EBD9] text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all duration-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Expanded Plan Detail View ── */}
      <AnimatePresence>
        {expandedPlan && (
          <motion.div
            key={expandedPlan.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border-2 border-[#006C35]/20 bg-[#F8FBF8] overflow-hidden">
              {/* ── Gradient header bar ── */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-6 py-6 lg:px-8 lg:py-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-white drop-shadow-sm">
                          {isAr
                            ? expandedPlan.plan_data?.weekThemeAr ??
                              expandedPlan.plan_data?.weekTheme
                            : expandedPlan.plan_data?.weekTheme ??
                              expandedPlan.plan_data?.weekThemeAr ??
                              (isAr ? "\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Week Theme")}
                        </h2>
                        <p className="text-lg text-white/80">
                          {formatWeekRange(expandedPlan.week_start)}
                        </p>
                      </div>
                    </div>

                    {/* Weekly strategy */}
                    {expandedPlan.plan_data?.weeklyStrategy && (
                      <div className="mt-5 max-w-2xl rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 p-4">
                        <p className="text-sm font-bold uppercase tracking-wider text-white/90 mb-1.5">
                          {isAr ? "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Weekly Strategy"}
                        </p>
                        <p className="text-lg text-white/90 leading-relaxed">
                          {expandedPlan.plan_data.weeklyStrategy}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setExpandedPlanId(null)}
                    className="h-12 px-5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all text-base font-bold"
                  >
                    <ChevronUp className="mr-2 h-5 w-5" />
                    {isAr ? "\u0625\u063A\u0644\u0627\u0642" : "Close"}
                  </Button>
                </div>
              </div>

              {/* ── Day cards grid ── */}
              <div className="p-6 lg:p-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {expandedPlan.plan_data?.days?.map((day, i) => {
                    const platformKey = day.platform?.toLowerCase() ?? "";
                    const barGradient =
                      PLATFORM_BAR_COLORS[platformKey] ??
                      "from-[#006C35] to-[#00A352]";
                    const emoji = PLATFORM_EMOJI[platformKey] ?? day.platform?.charAt(0)?.toUpperCase() ?? "?";

                    return (
                      <motion.div
                        key={day.dayIndex}
                        variants={cardVariants}
                        whileHover={{
                          y: -6,
                          transition: { duration: 0.25 },
                        }}
                        className="group/day overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-white transition-all duration-300 hover:border-[#006C35]/30 hover:shadow-[0_8px_30px_rgba(0,108,53,0.12)]"
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
                            <span className="text-xl font-bold text-[#004D26]">
                              {isAr
                                ? day.dayAr || day.dayEn
                                : day.dayEn || day.dayAr}
                            </span>
                            <span className="rounded-xl bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1 text-sm font-medium text-[#5A8A6A]">
                              {day.date}
                            </span>
                          </div>

                          {/* Platform + content type */}
                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold shadow-sm",
                                PLATFORM_BADGE_STYLES[platformKey] ??
                                  "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white border-[#D4EBD9]"
                              )}
                            >
                              <span className="text-base">{emoji}</span>
                              <span className="capitalize">{day.platform}</span>
                            </span>
                            <span className="rounded-xl bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1.5 text-sm font-medium text-[#2D5A3D]">
                              {day.contentType}
                            </span>
                          </div>

                          {/* Topic */}
                          <p className="text-lg font-bold text-[#0A1F0F] leading-snug">
                            {isAr
                              ? day.topicAr || day.topic
                              : day.topic || day.topicAr}
                          </p>

                          {/* Caption */}
                          <p className="mt-2.5 text-base text-[#2D5A3D] leading-relaxed line-clamp-4">
                            {isAr
                              ? day.captionAr || day.caption
                              : day.caption || day.captionAr}
                          </p>

                          {/* Hashtags — colorful cycling pills */}
                          {day.hashtags && day.hashtags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {day.hashtags.slice(0, 5).map((tag, tagIdx) => (
                                <motion.span
                                  key={tag}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: tagIdx * 0.04,
                                    type: "spring",
                                  }}
                                  className={cn(
                                    "rounded-xl px-3 py-1 text-sm font-semibold",
                                    HASHTAG_PILL_COLORS[
                                      tagIdx % HASHTAG_PILL_COLORS.length
                                    ]
                                  )}
                                >
                                  {tag}
                                </motion.span>
                              ))}
                              {day.hashtags.length > 5 && (
                                <span className="rounded-xl bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1 text-sm font-medium text-[#5A8A6A]">
                                  +{day.hashtags.length - 5}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Posting time — gold-tinted box */}
                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 px-3 py-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0]">
                              <Clock className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-[#C9A84C]">
                              {day.postingTime}
                            </span>
                          </div>
                          {day.postingTimeReason && (
                            <p className="mt-1.5 text-sm text-[#5A8A6A] italic leading-snug px-1">
                              {day.postingTimeReason}
                            </p>
                          )}

                          {/* Content tips — gradient-bordered callout */}
                          {day.contentTips && (
                            <div className="mt-4 relative rounded-xl overflow-hidden">
                              {/* Gradient border effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-[2px]">
                                <div className="h-full w-full rounded-[10px] bg-white" />
                              </div>
                              <div className="relative p-3.5">
                                <p className="text-sm font-bold text-[#006C35] mb-1 flex items-center gap-1.5">
                                  <Sparkles className="h-4 w-4 text-[#C9A84C]" />
                                  {isAr ? "\u0646\u0635\u0627\u0626\u062D" : "Tips"}
                                </p>
                                <p className="text-base text-[#2D5A3D] leading-relaxed">
                                  {day.contentTips}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
