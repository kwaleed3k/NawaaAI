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

/* ── Platform colors ── */

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/15 text-pink-600 border-pink-400/40",
  tiktok: "bg-zinc-200/60 text-zinc-700 border-zinc-400/40",
  x: "bg-zinc-200/60 text-zinc-700 border-zinc-400/40",
  snapchat: "bg-yellow-400/15 text-yellow-700 border-yellow-400/40",
  linkedin: "bg-blue-500/15 text-blue-600 border-blue-400/40",
  youtube: "bg-red-500/15 text-red-600 border-red-400/40",
  whatsapp: "bg-green-500/15 text-green-700 border-green-400/40",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  tiktok: "TT",
  x: "X",
  snapchat: "SC",
  linkedin: "LI",
  youtube: "YT",
  whatsapp: "WA",
};

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
      toast.success(isAr ? "تم حذف الخطة" : "Plan deleted");
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
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-xl bg-[#D4EBD9]/50" />
        <Skeleton className="h-6 w-60 rounded-lg bg-[#D4EBD9]/30" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6 space-y-4"
            >
              <Skeleton className="h-5 w-full rounded-lg bg-[#D4EBD9]/40" />
              <Skeleton className="h-4 w-3/4 rounded-lg bg-[#D4EBD9]/30" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-lg bg-[#D4EBD9]/30" />
                <Skeleton className="h-7 w-16 rounded-lg bg-[#D4EBD9]/30" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl bg-[#D4EBD9]/20" />
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
        <div>
          <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">
            {isAr ? "\u062E\u0637\u0637\u064A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629" : "My Saved Plans"}
          </h1>
          <p className="mt-2 text-lg text-[#5A8A6A]">
            {isAr
              ? "\u0639\u0631\u0636 \u0648\u0625\u062F\u0627\u0631\u0629 \u062C\u0645\u064A\u0639 \u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629"
              : "View and manage all your saved content plans"}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] py-20"
        >
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F0F7F2] to-white border-2 border-[#D4EBD9]">
              <FolderOpen className="h-12 w-12 text-[#5A8A6A]" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40">
              <Sparkles className="h-4 w-4 text-[#C9A84C]" />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-[#004D26]">
            {isAr
              ? "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u0637\u0637 \u0645\u062D\u0641\u0648\u0638\u0629 \u0628\u0639\u062F"
              : "No saved plans yet"}
          </p>
          <p className="mt-2 text-base text-[#5A8A6A] max-w-md text-center">
            {isAr
              ? "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0645\u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0644\u0625\u0646\u0634\u0627\u0621 \u0648\u062D\u0641\u0638 \u0623\u0648\u0644 \u062E\u0637\u0629 \u0644\u0643"
              : "Go to the Content Planner to create and save your first plan"}
          </p>
          <a
            href="/planner"
            className="mt-6 inline-flex h-14 items-center justify-center gap-2 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#004D26] hover:shadow-[0_0_25px_rgba(201,168,76,0.3)] transition-shadow shadow-md"
          >
            <Calendar className="h-5 w-5" />
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
      {/* Header */}
      <div>
        <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">
          {isAr ? "\u062E\u0637\u0637\u064A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629" : "My Saved Plans"}
        </h1>
        <p className="mt-2 text-lg text-[#5A8A6A]">
          {isAr
            ? `${plans.length} ${plans.length === 1 ? "\u062E\u0637\u0629 \u0645\u062D\u0641\u0648\u0638\u0629" : "\u062E\u0637\u0637 \u0645\u062D\u0641\u0648\u0638\u0629"}`
            : `${plans.length} saved plan${plans.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              layout
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300",
                isExpanded
                  ? "border-[#006C35]/40 shadow-[0_0_30px_rgba(0,108,53,0.1)]"
                  : "border-[#D4EBD9] hover:border-[#006C35]/30 hover:shadow-[0_4px_20px_rgba(0,108,53,0.08)]"
              )}
            >
              {/* Gradient top accent */}
              <div className="h-1.5 bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C]" />

              <div className="p-6">
                {/* Company badge */}
                {company && (
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden border-2 border-[#D4EBD9]"
                      style={{ backgroundColor: company.brand_colors?.[0] || "#F0F7F2" }}
                    >
                      {company.logo_url ? (
                        <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {company.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#2D5A3D]">
                      {isAr ? (company.name_ar || company.name) : company.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-['Cairo'] text-lg font-bold text-[#004D26] leading-snug line-clamp-2">
                  {plan.title ??
                    (isAr
                      ? plan.plan_data?.weekThemeAr ?? plan.plan_data?.weekTheme
                      : plan.plan_data?.weekTheme ?? plan.plan_data?.weekThemeAr) ??
                    (isAr ? "\u062E\u0637\u0629 \u0628\u062F\u0648\u0646 \u0639\u0646\u0648\u0627\u0646" : "Untitled Plan")}
                </h3>

                {/* Date range */}
                <div className="mt-3 flex items-center gap-2 text-sm text-[#5A8A6A]">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{formatWeekRange(plan.week_start)}</span>
                </div>

                {/* Day count */}
                <div className="mt-1.5 flex items-center gap-2 text-sm text-[#5A8A6A]">
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span>
                    {isAr
                      ? `${dayCount} ${dayCount === 1 ? "\u064A\u0648\u0645" : "\u0623\u064A\u0627\u0645"}`
                      : `${dayCount} day${dayCount !== 1 ? "s" : ""}`}
                  </span>
                </div>

                {/* Platform badges */}
                {uniquePlatforms.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {uniquePlatforms.map((p) => (
                      <span
                        key={p}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium",
                          PLATFORM_COLORS[p.toLowerCase()] ??
                            "bg-[#F0F7F2] text-[#2D5A3D] border-[#D4EBD9]"
                        )}
                      >
                        <span className="font-bold">
                          {PLATFORM_ICONS[p.toLowerCase()] ?? p.charAt(0).toUpperCase()}
                        </span>
                        <span className="capitalize">{p}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Created at */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5A8A6A]/70">
                  <Clock className="h-3 w-3" />
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
                      "flex-1 h-11 rounded-xl text-sm font-medium transition-all",
                      isExpanded
                        ? "bg-[#006C35] text-white hover:bg-[#006C35]/90"
                        : "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white hover:shadow-[0_0_20px_rgba(0,163,82,0.25)] shadow-sm"
                    )}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-1.5 h-4 w-4" />
                        {isAr ? "\u0625\u062E\u0641\u0627\u0621" : "Collapse"}
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1.5 h-4 w-4" />
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
                        className="h-11 px-3 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-medium"
                      >
                        {deletingId === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isAr ? (
                          "\u062A\u0623\u0643\u064A\u062F"
                        ) : (
                          "Yes"
                        )}
                      </Button>
                      <Button
                        onClick={() => setConfirmDeleteId(null)}
                        variant="outline"
                        className="h-11 px-3 rounded-xl border-2 border-[#D4EBD9] text-[#5A8A6A] text-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setConfirmDeleteId(plan.id)}
                      variant="outline"
                      className="h-11 px-3 rounded-xl border-2 border-[#D4EBD9] text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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
            <div className="rounded-2xl border-2 border-[#006C35]/20 bg-[#F8FBF8] p-6 lg:p-8">
              {/* Plan header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352]">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-['Cairo'] text-2xl font-bold text-[#004D26]">
                        {isAr
                          ? expandedPlan.plan_data?.weekThemeAr ??
                            expandedPlan.plan_data?.weekTheme
                          : expandedPlan.plan_data?.weekTheme ??
                            expandedPlan.plan_data?.weekThemeAr ??
                            (isAr ? "\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Week Theme")}
                      </h2>
                      <p className="text-sm text-[#5A8A6A]">
                        {formatWeekRange(expandedPlan.week_start)}
                      </p>
                    </div>
                  </div>

                  {/* Weekly strategy */}
                  {expandedPlan.plan_data?.weeklyStrategy && (
                    <div className="mt-4 max-w-2xl rounded-xl bg-white border-2 border-[#D4EBD9] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C] mb-1.5">
                        {isAr ? "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Weekly Strategy"}
                      </p>
                      <p className="text-sm text-[#2D5A3D] leading-relaxed">
                        {expandedPlan.plan_data.weeklyStrategy}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setExpandedPlanId(null)}
                  variant="outline"
                  className="h-11 px-5 rounded-xl border-2 border-[#D4EBD9] text-[#5A8A6A] hover:border-[#006C35] hover:text-[#004D26] transition-colors"
                >
                  <ChevronUp className="mr-1.5 h-4 w-4" />
                  {isAr ? "\u0625\u063A\u0644\u0627\u0642" : "Close"}
                </Button>
              </div>

              {/* Day cards grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {expandedPlan.plan_data?.days?.map((day, i) => {
                  const platformStyle =
                    PLATFORM_COLORS[day.platform?.toLowerCase()] ??
                    "bg-[#F0F7F2] text-[#2D5A3D] border-[#D4EBD9]";

                  return (
                    <motion.div
                      key={day.dayIndex}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-5 transition-colors hover:border-[#006C35]/30 hover:shadow-[0_4px_16px_rgba(0,108,53,0.08)]"
                    >
                      {/* Day header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold text-[#004D26]">
                          {isAr ? day.dayAr || day.dayEn : day.dayEn || day.dayAr}
                        </span>
                        <span className="text-xs text-[#5A8A6A] bg-[#F0F7F2] rounded-lg px-2 py-1">
                          {day.date}
                        </span>
                      </div>

                      {/* Platform + content type */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium",
                            platformStyle
                          )}
                        >
                          <span className="font-bold">
                            {PLATFORM_ICONS[day.platform?.toLowerCase()] ??
                              day.platform?.charAt(0)?.toUpperCase()}
                          </span>
                          {day.platform}
                        </span>
                        <span className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-2.5 py-1 text-xs text-[#2D5A3D]">
                          {day.contentType}
                        </span>
                      </div>

                      {/* Topic */}
                      <p className="text-base font-semibold text-[#0A1F0F] leading-snug">
                        {isAr
                          ? day.topicAr || day.topic
                          : day.topic || day.topicAr}
                      </p>

                      {/* Caption */}
                      <p className="mt-2 text-sm text-[#2D5A3D] leading-relaxed line-clamp-4">
                        {isAr
                          ? day.captionAr || day.caption
                          : day.caption || day.captionAr}
                      </p>

                      {/* Hashtags */}
                      {day.hashtags && day.hashtags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {day.hashtags.slice(0, 4).map((tag, tagIdx) => (
                            <motion.span
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: tagIdx * 0.03,
                                type: "spring",
                              }}
                              className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-2.5 py-1 text-xs font-medium text-[#006C35]"
                            >
                              {tag}
                            </motion.span>
                          ))}
                          {day.hashtags.length > 4 && (
                            <span className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-2.5 py-1 text-xs text-[#5A8A6A]">
                              +{day.hashtags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Posting time */}
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-[#5A8A6A]">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-semibold text-[#006C35]">
                          {day.postingTime}
                        </span>
                      </div>
                      {day.postingTimeReason && (
                        <p className="mt-1 text-xs text-[#5A8A6A] italic leading-snug">
                          {day.postingTimeReason}
                        </p>
                      )}

                      {/* Content tips */}
                      {day.contentTips && (
                        <div className="mt-3 rounded-lg bg-[#C9A84C]/8 border border-[#C9A84C]/25 p-2.5">
                          <p className="text-xs font-semibold text-[#C9A84C] mb-0.5">
                            {isAr ? "\u0646\u0635\u0627\u0626\u062D" : "Tips"}
                          </p>
                          <p className="text-xs text-[#2D5A3D] leading-relaxed">
                            {day.contentTips}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
