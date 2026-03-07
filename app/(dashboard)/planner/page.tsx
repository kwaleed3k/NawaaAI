"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "bg-pink-500/15 text-pink-600 border-pink-400/40" },
  { id: "tiktok", label: "TikTok", color: "bg-zinc-200/60 text-zinc-700 border-zinc-400/40" },
  { id: "x", label: "X", color: "bg-zinc-200/60 text-zinc-700 border-zinc-400/40" },
  { id: "snapchat", label: "Snapchat", color: "bg-yellow-400/15 text-yellow-700 border-yellow-400/40" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-500/15 text-blue-600 border-blue-400/40" },
  { id: "youtube", label: "YouTube", color: "bg-red-500/15 text-red-600 border-red-400/40" },
  { id: "whatsapp", label: "WhatsApp", color: "bg-green-500/15 text-green-700 border-green-400/40" },
];

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

  if (loadingCompanies) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-xl bg-[#D4EBD9]/50" />
        <Skeleton className="h-80 rounded-2xl bg-white border-2 border-[#D4EBD9]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">{tp.pageTitle}</h1>
        <p className="mt-2 text-lg text-[#5A8A6A]">{tp.pageSub}</p>
      </div>

      {/* ── Premium Loading Overlay ── */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FBF8]/95 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl mx-auto px-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-3xl border-2 border-[#D4EBD9] bg-white p-10 shadow-2xl"
              >
                {/* Main spinning logo */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="h-32 w-32 rounded-full border-4 border-dashed border-[#D4EBD9]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_0_40px_rgba(0,108,53,0.3)]"
                      >
                        <Sparkles className="h-10 w-10 text-white" />
                      </motion.div>
                    </div>
                    {/* Orbiting icons */}
                    {[Calendar, Target, TrendingUp, Globe].map((Icon, i) => (
                      <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
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
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Loading message */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="text-center text-2xl font-bold text-[#004D26] font-['Cairo'] mb-3"
                  >
                    {loadingMessages[loadingMsgIndex]}
                  </motion.p>
                </AnimatePresence>

                <p className="text-center text-base text-[#5A8A6A] mb-8">
                  {locale === "ar" ? "نبني لك خطة محتوى احترافية" : "Building your professional content plan"}
                </p>

                {/* Progress bar */}
                <div className="h-3 rounded-full bg-[#F0F7F2] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]"
                    initial={{ width: "0%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 25, ease: "easeInOut" }}
                  />
                </div>

                {/* Bottom floating elements */}
                <div className="mt-8 flex justify-center gap-4">
                  {["\uD83D\uDCCA", "\uD83D\uDCF1", "\uD83C\uDFAF", "\u2728", "\uD83D\uDE80"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
                      className="text-2xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!plan ? (
        /* ── Setup Card ── */
        <Card className="glass rounded-2xl border-2 border-[#D4EBD9] bg-white">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl text-[#004D26]">{tp.setup}</CardTitle>
            <p className="text-lg text-[#5A8A6A]">{tp.setupSub}</p>
          </CardHeader>
          <CardContent className="space-y-7 p-8 pt-0">
            {/* Company Select */}
            <div>
              <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tp.company}</label>
              <div className="relative">
                <select
                  value={selectedCompany?.id ?? ""}
                  onChange={(e) => {
                    const c = companies.find((x) => x.id === e.target.value);
                    if (c) setSelectedCompany(c);
                  }}
                  className="w-full appearance-none rounded-xl border-2 border-[#D4EBD9] bg-white px-5 py-3.5 pr-12 text-base text-[#0A1F0F] outline-none transition-colors focus:border-[#006C35] focus:ring-1 focus:ring-[#006C35]/30"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="h-5 w-5 text-[#5A8A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Platform Buttons */}
            <div>
              <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tp.platforms}</label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "rounded-xl px-6 py-3 text-base font-medium border transition-all",
                      platforms.includes(p.id) ? p.color : "bg-[#F0F7F2] text-[#5A8A6A] border-transparent hover:border-[#D4EBD9]"
                    )}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPlatforms(platforms.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id))}
                className="mt-3 text-sm font-medium text-[#00A352] hover:underline"
              >
                {platforms.length === PLATFORMS.length ? tp.clearAll : tp.selectAll}
              </button>
            </div>

            {/* Week Start */}
            <div>
              <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tp.weekStart}</label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="rounded-xl border-2 border-[#D4EBD9] bg-white px-5 py-3.5 text-base text-[#0A1F0F] outline-none transition-colors focus:border-[#006C35] focus:ring-1 focus:ring-[#006C35]/30"
              />
            </div>

            {/* Language Toggle */}
            <div>
              <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tp.generateIn}</label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={outputLanguage === "en" ? "default" : "outline"}
                  className={cn(
                    "h-12 px-6 rounded-xl text-base font-medium",
                    outputLanguage === "en" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md" : "border-2 border-[#D4EBD9] text-[#2D5A3D] hover:border-[#006C35]"
                  )}
                  onClick={() => setOutputLanguage("en")}
                >
                  {tp.english}
                </Button>
                <Button
                  type="button"
                  variant={outputLanguage === "ar" ? "default" : "outline"}
                  className={cn(
                    "h-12 px-6 rounded-xl text-base font-medium",
                    outputLanguage === "ar" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md" : "border-2 border-[#D4EBD9] text-[#2D5A3D] hover:border-[#006C35]"
                  )}
                  onClick={() => setOutputLanguage("ar")}
                >
                  {tp.arabic}
                </Button>
              </div>
            </div>

            {/* Special Focus */}
            <div>
              <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tp.specialFocus}</label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={tp.focusPlaceholder}
                className="min-h-[100px] rounded-xl border-2 border-[#D4EBD9] bg-white text-base text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35]"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#004D26] hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] h-16 rounded-xl text-xl font-bold transition-shadow shadow-md"
            >
              <Sparkles className="mr-2.5 h-6 w-6" />
              {tp.generatePlan}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-3xl font-bold text-[#004D26]">
                {outputLanguage === "ar" ? (plan.weekThemeAr || plan.weekTheme) : (plan.weekTheme || plan.weekThemeAr)}
              </h2>
              <p className="mt-1 text-base text-[#5A8A6A]">
                {weekStart && plan.days?.[0]?.date
                  ? `${format(parseISO(plan.days[0].date), "MMM d")} – ${format(parseISO(plan.days[6]?.date ?? weekStart), "MMM d, yyyy")}`
                  : weekStart}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-14 rounded-xl border-2 border-[#D4EBD9] text-base text-[#2D5A3D] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors px-5"
                onClick={() => setRefineOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {tp.refineAI}
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-xl border-2 border-[#D4EBD9] text-base text-[#2D5A3D] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors px-5"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {tp.savePlan}
              </Button>
              <Button
                className="h-14 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-base text-white hover:shadow-[0_0_25px_rgba(0,163,82,0.3)] transition-shadow shadow-md px-5"
                onClick={handleExportPDF}
              >
                <Download className="mr-2 h-5 w-5" />
                {tp.exportPDF}
              </Button>
            </div>
          </div>

          {/* Day Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {plan.days?.map((day, i) => {
              const platformStyle = PLATFORMS.find((p) => p.id === day.platform)?.color ?? "bg-[#F0F7F2]";
              return (
                <motion.div
                  key={day.dayIndex}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="glass rounded-2xl border-2 border-[#D4EBD9] bg-white p-6 transition-colors hover:border-[#006C35]/30"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-[#004D26]">{day.dayAr || day.dayEn}</span>
                    <span className="text-sm text-[#5A8A6A]">{day.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("inline-block rounded-lg px-3 py-1 text-sm font-medium", platformStyle)}>
                      {day.platform}
                    </span>
                    <span className="text-sm text-[#5A8A6A]">{day.contentType}</span>
                  </div>
                  <p className="text-lg font-semibold text-[#0A1F0F] leading-snug">{outputLanguage === "ar" ? (day.topicAr || day.topic) : (day.topic || day.topicAr)}</p>
                  <p className="mt-2 line-clamp-4 text-base text-[#2D5A3D] leading-relaxed">
                    {outputLanguage === "ar" ? (day.captionAr || day.caption) : (day.caption || day.captionAr)}
                  </p>
                  {/* Hashtag Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {day.hashtags?.slice(0, 3).map((tag, tagIdx) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: tagIdx * 0.03, type: "spring" }}
                        className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1.5 text-sm font-medium text-[#006C35]"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-base text-[#5A8A6A]">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold text-[#006C35]">{day.postingTime}</span>
                  </div>
                  {day.postingTimeReason && (
                    <p className="mt-1 text-sm text-[#5A8A6A] italic">{day.postingTimeReason}</p>
                  )}
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
                      "mt-4 w-full h-12 rounded-xl border-2 text-base font-medium flex items-center justify-center gap-2 transition-all",
                      completedDays.has(day.dayIndex)
                        ? "border-[#006C35] bg-[#006C35]/10 text-[#006C35]"
                        : "border-[#D4EBD9] bg-white text-[#5A8A6A] hover:border-[#006C35]/40"
                    )}
                  >
                    {completedDays.has(day.dayIndex) ? (
                      <CheckCircle2 className="h-5 w-5 text-[#006C35]" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                    {completedDays.has(day.dayIndex)
                      ? (locale === "ar" ? "تم" : "Done")
                      : (locale === "ar" ? "تحديد كمنجز" : "Mark as done")}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="h-14 rounded-xl border-2 border-[#D4EBD9] text-base text-[#5A8A6A] hover:text-[#004D26] hover:border-[#006C35] px-6"
            onClick={() => setPlan(null)}
          >
            {tp.generateNew}
          </Button>
        </>
      )}

      {/* Refine Dialog */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="glass-strong border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#004D26]">{tp.refineAI}</DialogTitle>
          </DialogHeader>
          <p className="text-base text-[#5A8A6A]">{tp.refineTell}</p>
          <Textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            className="min-h-[120px] rounded-xl border-2 border-[#D4EBD9] bg-white text-base text-[#0A1F0F] focus:border-[#006C35]"
            placeholder={tp.refinePlaceholder}
          />
          <Button
            className="h-14 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-base text-white hover:shadow-[0_0_25px_rgba(0,163,82,0.3)] transition-shadow shadow-md"
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
