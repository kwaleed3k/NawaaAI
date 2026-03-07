"use client";

import { useEffect, useState } from "react";
/* framer-motion removed – using plain HTML + CSS transitions */
import { Calendar, Sparkles, Save, Download, Loader2, Clock, Hash, CheckCircle2, Circle, Target, TrendingUp, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, addDays, nextSaturday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { exportPlanToPDF } from "@/lib/export-plan-pdf";
import toast from "react-hot-toast";

/* ── Platform config with rich visual data ── */
const PLATFORMS = [
  { id: "instagram", label: "Instagram", emoji: "\uD83D\uDCF8", selectedBg: "bg-gradient-to-br from-pink-500 to-rose-500", selectedBorder: "border-pink-400", unselectedBg: "bg-pink-50", color: "text-pink-600", barColor: "from-pink-500 to-rose-500", pillBg: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "tiktok", label: "TikTok", emoji: "\uD83C\uDFB5", selectedBg: "bg-gradient-to-br from-slate-800 to-cyan-500", selectedBorder: "border-cyan-400", unselectedBg: "bg-slate-50", color: "text-slate-700", barColor: "from-slate-800 to-cyan-500", pillBg: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: "x", label: "X (Twitter)", emoji: "\uD835\uDD4F", selectedBg: "bg-gradient-to-br from-slate-700 to-slate-900", selectedBorder: "border-slate-400", unselectedBg: "bg-slate-50", color: "text-slate-700", barColor: "from-slate-700 to-slate-900", pillBg: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "snapchat", label: "Snapchat", emoji: "\uD83D\uDC7B", selectedBg: "bg-gradient-to-br from-yellow-400 to-amber-400", selectedBorder: "border-yellow-400", unselectedBg: "bg-yellow-50", color: "text-yellow-700", barColor: "from-yellow-400 to-amber-400", pillBg: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "linkedin", label: "LinkedIn", emoji: "\uD83D\uDCBC", selectedBg: "bg-gradient-to-br from-blue-500 to-blue-700", selectedBorder: "border-blue-400", unselectedBg: "bg-blue-50", color: "text-blue-600", barColor: "from-blue-500 to-blue-700", pillBg: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "youtube", label: "YouTube", emoji: "\uD83C\uDFAC", selectedBg: "bg-gradient-to-br from-red-500 to-red-700", selectedBorder: "border-red-400", unselectedBg: "bg-red-50", color: "text-red-600", barColor: "from-red-500 to-red-700", pillBg: "bg-red-100 text-red-700 border-red-200" },
  { id: "whatsapp", label: "WhatsApp", emoji: "\uD83D\uDCAC", selectedBg: "bg-gradient-to-br from-green-500 to-emerald-600", selectedBorder: "border-green-400", unselectedBg: "bg-green-50", color: "text-green-700", barColor: "from-green-500 to-emerald-600", pillBg: "bg-green-100 text-green-700 border-green-200" },
];

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
  imagePromptHint?: string;
};

type Plan = {
  weekTheme: string;
  weekThemeAr: string;
  days: PlanDay[];
  weeklyStrategy?: string;
  expectedEngagement?: string;
};

/* ── Hashtag color rotation ── */
const HASHTAG_COLORS = [
  "bg-pink-100 text-pink-700 border border-pink-200",
  "bg-blue-100 text-blue-700 border border-blue-200",
  "bg-amber-100 text-amber-700 border border-amber-200",
  "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "bg-purple-100 text-purple-700 border border-purple-200",
  "bg-cyan-100 text-cyan-700 border border-cyan-200",
  "bg-orange-100 text-orange-700 border border-orange-200",
];

export default function PlannerPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany, locale } = useAppStore();
  const tp = messages[locale].planner;
  const loadingMessages = [tp.loading1, tp.loading2, tp.loading3, tp.loading4, tp.loading5];

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [generating, setGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const sat = nextSaturday(new Date());
    setWeekStart(format(sat, "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCompanies((data as Company[]) ?? []);
      if (data?.length && !selectedCompany) setSelectedCompany(data[0] as Company);
      setLoadingCompanies(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(t);
  }, [generating]);

  function togglePlatform(id: string) {
    setPlatforms((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  }

  async function handleGenerate() {
    if (!selectedCompany) {
      toast.error("Select a company first");
      return;
    }
    setGenerating(true);
    setPlan(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany,
          platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
          weekStart,
          userPrompt: userPrompt.trim() || undefined,
          outputLanguage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate plan");
      setPlan(json.plan);
      toast.success("Plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate plan");
    }
    setGenerating(false);
  }

  async function handleSave() {
    if (!plan || !selectedCompany) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("content_plans").insert({
      user_id: user.id,
      company_id: selectedCompany.id,
      title: `${plan.weekTheme} — ${weekStart}`,
      week_start: weekStart,
      platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
      prompt: userPrompt.trim() || null,
      plan_data: plan,
    });
    if (error) toast.error(error.message);
    else toast.success("Plan saved");
    setSaving(false);
  }

  function handleExportPDF() {
    if (!plan || !selectedCompany) return;
    exportPlanToPDF(plan, selectedCompany, outputLanguage).then(
      () => toast.success("PDF downloaded"),
      (e) => toast.error(e instanceof Error ? e.message : "Export failed")
    );
  }

  /* ── Loading state ── */
  if (loadingCompanies) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-xl bg-[#D4EBD9]/50" />
        <Skeleton className="h-80 rounded-2xl bg-white border-2 border-[#D4EBD9]" />
      </div>
    );
  }

  /* ── Helper: get platform config by id ── */
  function getPlatformConfig(id: string) {
    return PLATFORMS.find((p) => p.id === id);
  }

  return (
    <div className="space-y-10">
      {/* ===== PAGE HEADER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10 shadow-xl"
      >
        {/* Decorative floating shapes */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="absolute top-4 right-8 flex gap-2">
          {["\u2728", "\uD83D\uDCC5", "\uD83D\uDE80"].map((em, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl"
            >
              {em}
            </span>
          ))}
        </div>
        <h1 className="font-['Cairo'] text-4xl font-extrabold text-white md:text-5xl drop-shadow-lg">
          {tp.pageTitle}
        </h1>
        <p className="mt-3 text-lg text-white/80 md:text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#E8D5A0]" />
          {tp.pageSub}
          <Sparkles className="h-5 w-5 text-[#E8D5A0]" />
        </p>
      </div>

      {/* ===== Premium Loading Overlay ===== */}
      {generating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FBF8]/95 backdrop-blur-md"
        >
          <div className="w-full max-w-2xl mx-auto px-6">
            <div
              className="rounded-3xl border-2 border-[#D4EBD9] bg-white p-10 shadow-2xl"
            >
              {/* Main spinning logo */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div
                    className="h-32 w-32 rounded-full border-4 border-dashed border-[#D4EBD9] animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_0_40px_rgba(0,108,53,0.3)]"
                    >
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  {/* Orbiting icons */}
                  {[Calendar, Target, TrendingUp, Globe].map((Icon, i) => (
                    <div
                      key={i}
                      className="absolute inset-0"
                      style={{ transformOrigin: "center center" }}
                    >
                      <div
                        className="absolute flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
                        style={{
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: i % 2 === 0 ? "#F0F7F2" : "#FFF8E7",
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: i % 2 === 0 ? "#006C35" : "#C9A84C" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loading message */}
              <p
                key={loadingMsgIndex}
                className="text-center text-2xl font-bold text-[#004D26] font-['Cairo'] mb-3"
              >
                {loadingMessages[loadingMsgIndex]}
              </p>

              <p className="text-center text-base text-[#5A8A6A] mb-8">
                {locale === "ar" ? "\u0646\u0628\u0646\u064A \u0644\u0643 \u062E\u0637\u0629 \u0645\u062D\u062A\u0648\u0649 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629" : "Building your professional content plan"}
              </p>

              {/* Progress bar */}
              <div className="h-3 rounded-full bg-[#F0F7F2] overflow-hidden">
                <div
                  className="h-full w-full rounded-full bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352] transition-all duration-700"
                />
              </div>

              {/* Bottom elements */}
              <div className="mt-8 flex justify-center gap-4">
                {["\uD83D\uDCCA", "\uD83D\uDCF1", "\uD83C\uDFAF", "\u2728", "\uD83D\uDE80"].map((emoji, i) => (
                  <span key={i} className="text-2xl">{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!plan ? (
        /* ===== SETUP CARD ===== */
        <div
        >
          <Card className="rounded-2xl border-2 border-[#D4EBD9] bg-white shadow-lg overflow-hidden">
            {/* Card top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]" />
            <CardHeader className="p-5 sm:p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-extrabold text-[#004D26] font-['Cairo']">{tp.setup}</CardTitle>
                  <p className="text-lg text-[#5A8A6A] mt-1">{tp.setupSub}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-5 sm:p-8 pt-4">
              {/* ── Section 1: Company ── */}
              <div
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <label className="text-lg font-bold text-[#004D26]">{tp.company}</label>
                </div>
                <div className="relative">
                  <select
                    value={selectedCompany?.id ?? ""}
                    onChange={(e) => {
                      const c = companies.find((x) => x.id === e.target.value);
                      if (c) setSelectedCompany(c);
                    }}
                    className="w-full appearance-none rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 h-14 pr-12 text-lg text-[#0A1F0F] outline-none transition-all focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20 hover:border-[#006C35]/40"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                    <svg className="h-5 w-5 text-[#5A8A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />

              {/* ── Section 2: Platform Cards ── */}
              <div
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <label className="text-lg font-bold text-[#004D26]">{tp.platforms}</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {PLATFORMS.map((p, i) => {
                    const selected = platforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 py-5 transition-all duration-300 cursor-pointer",
                          selected
                            ? `${p.selectedBg} ${p.selectedBorder} text-white shadow-lg shadow-black/10`
                            : `${p.unselectedBg} border-transparent ${p.color} hover:border-gray-200 grayscale-[40%] opacity-70 hover:opacity-100 hover:grayscale-0`
                        )}
                      >
                        {/* Selection checkmark */}
                        {selected && (
                          <div
                            className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                          >
                            <CheckCircle2 className="h-5 w-5 text-[#006C35]" />
                          </div>
                        )}
                        <span className="text-3xl leading-none">{p.emoji}</span>
                        <span className={cn(
                          "text-sm font-bold leading-tight text-center",
                          selected ? "text-white" : ""
                        )}>
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPlatforms(platforms.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id))}
                  className="mt-3 text-sm font-bold text-[#00A352] hover:underline transition-colors hover:text-[#006C35]"
                >
                  {platforms.length === PLATFORMS.length ? tp.clearAll : tp.selectAll}
                </button>
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />

              {/* ── Section 3: Week Start ── */}
              <div
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-sm">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <label className="text-lg font-bold text-[#004D26]">{tp.weekStart}</label>
                </div>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 h-14 text-lg text-[#0A1F0F] outline-none transition-all focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20 hover:border-[#006C35]/40"
                />
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />

              {/* ── Section 4: Language Toggle ── */}
              <div
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <label className="text-lg font-bold text-[#004D26]">{tp.generateIn}</label>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={outputLanguage === "en" ? "default" : "outline"}
                    className={cn(
                      "h-14 px-8 rounded-2xl text-lg font-bold transition-all duration-300",
                      outputLanguage === "en"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg shadow-[#006C35]/20 scale-105"
                        : "border-2 border-[#D4EBD9] text-[#2D5A3D] hover:border-[#006C35] hover:bg-[#F0F7F2]"
                    )}
                    onClick={() => setOutputLanguage("en")}
                  >
                    {tp.english}
                  </Button>
                  <Button
                    type="button"
                    variant={outputLanguage === "ar" ? "default" : "outline"}
                    className={cn(
                      "h-14 px-8 rounded-2xl text-lg font-bold transition-all duration-300",
                      outputLanguage === "ar"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg shadow-[#006C35]/20 scale-105"
                        : "border-2 border-[#D4EBD9] text-[#2D5A3D] hover:border-[#006C35] hover:bg-[#F0F7F2]"
                    )}
                    onClick={() => setOutputLanguage("ar")}
                  >
                    {tp.arabic}
                  </Button>
                </div>
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />

              {/* ── Section 5: Special Focus ── */}
              <div
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <label className="text-lg font-bold text-[#004D26]">{tp.specialFocus}</label>
                </div>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder={tp.focusPlaceholder}
                  className="min-h-[120px] rounded-2xl border-2 border-[#D4EBD9] bg-white text-lg text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20 transition-all"
                />
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

              {/* ── Generate Button ── */}
              <div
              >
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="relative w-full h-20 rounded-2xl bg-gradient-to-r from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C] text-[#004D26] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] text-2xl font-extrabold transition-all duration-500 shadow-xl border-2 border-[#C9A84C]/30 overflow-hidden group"
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  <Sparkles className="mr-3 h-7 w-7" />
                  {tp.generatePlan}
                  <Sparkles className="ml-3 h-7 w-7" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ===== GENERATED PLAN VIEW ===== */
        <>
          {/* Week Theme Banner */}
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-gradient-to-r from-[#004D26] via-[#006C35] to-[#00A352] p-8 shadow-xl"
          >
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-20 w-40 rounded-full bg-white/5 blur-xl" />
            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-extrabold text-white font-['Cairo'] drop-shadow-lg"
              >
                {outputLanguage === "ar" ? (plan.weekThemeAr || plan.weekTheme) : (plan.weekTheme || plan.weekThemeAr)}
              </h2>
              <p
                className="mt-2 text-lg text-white/70 flex items-center gap-2"
              >
                <Calendar className="h-5 w-5 text-[#E8D5A0]" />
                {weekStart && plan.days?.[0]?.date
                  ? `${format(parseISO(plan.days[0].date), "MMM d")} \u2013 ${format(parseISO(plan.days[6]?.date ?? weekStart), "MMM d, yyyy")}`
                  : weekStart}
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div
            className="flex flex-wrap gap-3"
          >
            <Button
              className="h-14 rounded-2xl border-2 border-[#C9A84C]/40 bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#004D26] text-lg font-bold hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all shadow-md px-6"
              onClick={() => setRefineOpen(true)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {tp.refineAI}
            </Button>
            <Button
              className="h-14 rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-lg font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all shadow-md px-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {tp.savePlan}
            </Button>
            <Button
              className="h-14 rounded-2xl border-2 border-blue-400/40 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all shadow-md px-6"
              onClick={handleExportPDF}
            >
              <Download className="mr-2 h-5 w-5" />
              {tp.exportPDF}
            </Button>
          </div>

          {/* Day Cards Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {plan.days?.map((day, i) => {
              const platformCfg = getPlatformConfig(day.platform);
              const isCompleted = completedDays.has(day.dayIndex);
              return (
                <div
                  key={day.dayIndex}
                  className={cn(
                    "group relative rounded-2xl border-2 bg-white overflow-hidden transition-all duration-300",
                    isCompleted
                      ? "border-[#006C35]/50 bg-[#F0FFF4]"
                      : "border-[#D4EBD9] hover:border-[#006C35]/40"
                  )}
                >
                  {/* Colored gradient top bar */}
                  <div className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    platformCfg?.barColor ?? "from-[#006C35] to-[#00A352]"
                  )} />

                  <div className="p-5">
                    {/* Header: Day name + Date badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xl font-extrabold text-[#004D26] font-['Cairo']">
                        {day.dayAr || day.dayEn}
                      </span>
                      <span className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-2.5 py-1 text-xs font-semibold text-[#5A8A6A]">
                        {day.date}
                      </span>
                    </div>

                    {/* Platform badge + content type */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold border",
                        platformCfg?.pillBg ?? "bg-[#F0F7F2] text-[#006C35] border-[#D4EBD9]"
                      )}>
                        <span className="text-base">{platformCfg?.emoji ?? "\uD83D\uDCF1"}</span>
                        {day.platform}
                      </span>
                      <span className="text-sm text-[#5A8A6A] font-medium">{day.contentType}</span>
                    </div>

                    {/* Topic */}
                    <p className="text-lg font-bold text-[#0A1F0F] leading-snug mb-2">
                      {outputLanguage === "ar" ? (day.topicAr || day.topic) : (day.topic || day.topicAr)}
                    </p>

                    {/* Caption preview */}
                    <p className="line-clamp-4 text-base text-[#2D5A3D] leading-relaxed">
                      {outputLanguage === "ar" ? (day.captionAr || day.caption) : (day.caption || day.captionAr)}
                    </p>

                    {/* Hashtags as colorful pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {day.hashtags?.slice(0, 4).map((tag, tagIdx) => (
                        <span
                          key={tag}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            HASHTAG_COLORS[tagIdx % HASHTAG_COLORS.length]
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Posting time */}
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF8E7] border border-[#E8D5A0]/50 px-3 py-2">
                      <Clock className="h-4 w-4 text-[#C9A84C]" />
                      <span className="text-base font-bold text-[#004D26]">{day.postingTime}</span>
                    </div>
                    {day.postingTimeReason && (
                      <p className="mt-1.5 text-sm text-[#5A8A6A] italic px-1">{day.postingTimeReason}</p>
                    )}

                    {/* Mark as done button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCompletedDays((prev) => {
                          const next = new Set(prev);
                          if (next.has(day.dayIndex)) next.delete(day.dayIndex);
                          else next.add(day.dayIndex);
                          return next;
                        });
                      }}
                      className={cn(
                        "mt-4 w-full h-12 rounded-2xl border-2 text-base font-bold flex items-center justify-center gap-2 transition-all duration-300",
                        isCompleted
                          ? "border-[#006C35] bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md"
                          : "border-[#D4EBD9] bg-white text-[#5A8A6A] hover:border-[#006C35]/40 hover:bg-[#F0F7F2]"
                      )}
                    >
                      {isCompleted ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          {locale === "ar" ? "\u062A\u0645 \u2728" : "Done \u2728"}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Circle className="h-5 w-5" />
                          {locale === "ar" ? "\u062A\u062D\u062F\u064A\u062F \u0643\u0645\u0646\u062C\u0632" : "Mark as done"}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Completion overlay bar */}
                  {isCompleted && (
                    <div
                      className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Generate New button */}
          <div
          >
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-2 border-[#D4EBD9] text-lg font-bold text-[#5A8A6A] hover:text-[#004D26] hover:border-[#006C35] hover:bg-[#F0F7F2] px-8 transition-all"
              onClick={() => setPlan(null)}
            >
              {tp.generateNew}
            </Button>
          </div>
        </>
      )}

      {/* ===== Refine Dialog ===== */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] sm:max-w-xl rounded-2xl overflow-hidden">
          {/* Dialog top accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C]" />
          <DialogHeader className="pt-4">
            <DialogTitle className="text-2xl font-extrabold text-[#004D26] font-['Cairo'] flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#C9A84C]" />
              {tp.refineAI}
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg text-[#5A8A6A]">{tp.refineTell}</p>
          <Textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            className="min-h-[120px] rounded-2xl border-2 border-[#D4EBD9] bg-white text-lg text-[#0A1F0F] focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20 transition-all"
            placeholder={tp.refinePlaceholder}
          />
          <Button
            className="h-14 rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-lg font-bold text-white hover:shadow-[0_0_30px_rgba(0,163,82,0.3)] transition-all shadow-lg"
            onClick={async () => {
              setRefineOpen(false);
              const focusPrompt = refineText.trim();
              setRefineText("");
              if (focusPrompt) setUserPrompt(focusPrompt);
              setPlan(null);
              setGenerating(true);
              try {
                const res = await fetch("/api/generate-plan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    company: selectedCompany,
                    platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
                    weekStart,
                    userPrompt: focusPrompt || userPrompt,
                    outputLanguage,
                  }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error);
                setPlan(json.plan);
                toast.success("Plan refined");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
              setGenerating(false);
            }}
          >
            {tp.regenerate}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
