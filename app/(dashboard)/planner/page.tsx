"use client";

import { useEffect, useState } from "react";
import { Calendar, Sparkles, Save, Download, Loader2, Clock, CheckCircle2, Circle, Target, TrendingUp, Globe, Zap, ArrowRight, LayoutGrid, ChevronDown, Wand2, RotateCcw, FileText, Eye, Hash, MessageSquare, Lightbulb, Image } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, nextSaturday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
// Dynamic import to avoid loading 150KB+ jsPDF+html2canvas eagerly
const loadExportPlanToPDF = () => import("@/lib/export-plan-pdf").then(m => m.exportPlanToPDF);
import toast from "react-hot-toast";

/* ── Platform SVG Icons ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.79755,16.98718c-2.86621-.47223-4.15094-3.40149-4.204-3.52588l-.00544-.01172a1.07048,1.07048,0,0,1-.10223-.89758c.19251-.45361.82935-.6557,1.25134-.78967.10535-.03339.205-.065.28315-.096.76275-.30127.91784-.61316.91406-.8219a.66226.66226,0,0,0-.50134-.54358l-.00568-.00213a.9462.9462,0,0,0-.35632-.06824.7546.7546,0,0,0-.31287.06207,2.54,2.54,0,0,1-.95526.26612.82134.82134,0,0,1-.52954-.17725c.00915-.16992.02-.34522.0318-.53046l.004-.0653a10.10231,10.10231,0,0,0-.24091-4.03449,5.2482,5.2482,0,0,0-4.87311-3.1394q-.20114.0021-.4024.00378A5.23959,5.23959,0,0,0,6.92853,5.75293,10.08988,10.08988,0,0,0,6.68726,9.784q.01941.29872.036.59771a.8483.8483,0,0,1-.5838.17841,2.45322,2.45322,0,0,1-1.014-.26776.57538.57538,0,0,0-.2453-.04895.83387.83387,0,0,0-.81061.53265c-.08191.43061.5329.74256.90668.8902.079.03137.17822.0628.28308.096.42169.13385,1.05908.33606,1.25152.78985a1.07171,1.07171,0,0,1-.10223.89783l-.00537.01154a7.02828,7.02828,0,0,1-1.06915,1.66211,5.21488,5.21488,0,0,1-3.13483,1.86389.23978.23978,0,0,0-.20044.25006.38046.38046,0,0,0,.031.12964c.17578.41113,1.05822.75061,2.55182.981.13964.02161.19873.24927.28027.6222.03259.14929.06634.30426.1134.46423a.29261.29261,0,0,0,.31922.22876,2.48528,2.48528,0,0,0,.42492-.06091,5.52912,5.52912,0,0,1,1.12036-.12677,4.95367,4.95367,0,0,1,.8078.0683,3.87725,3.87725,0,0,1,1.535.78417,4.443,4.443,0,0,0,2.6897,1.06006c.03375,0,.06744-.00122.10009-.004.04114.00195.09522.004.15192.004a4.44795,4.44795,0,0,0,2.69122-1.06079,3.87269,3.87269,0,0,1,1.53351-.78332,4.97275,4.97275,0,0,1,.808-.0683,5.59252,5.59252,0,0,1,1.12037.11871,2.39142,2.39142,0,0,0,.425.05371h.02338a.279.279,0,0,0,.29547-.221c.04645-.15784.08045-.308.11389-.46131.08081-.371.1399-.59759.28009-.61926,1.494-.23078,2.37641-.56976,2.551-.97858a.38487.38487,0,0,0,.03174-.13086A.24.24,0,0,0,21.79755,16.98718Z"/>
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

/* ── Platform config ── */
const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    gradient: "from-[#F77737] via-[#E1306C] to-[#C13584]",
    bg: "bg-gradient-to-br from-[#F77737] via-[#E1306C] to-[#C13584]",
    lightBg: "bg-gradient-to-br from-pink-50 to-rose-50",
    iconColor: "text-[#E1306C]",
    pillBg: "bg-pink-50 text-pink-700 border-pink-200",
    ring: "ring-pink-400/40",
    shadow: "shadow-pink-500/20",
  },
  {
    id: "tiktok",
    label: "TikTok",
    Icon: TikTokIcon,
    gradient: "from-[#25F4EE] via-[#FE2C55] to-[#010101]",
    bg: "bg-gradient-to-br from-[#010101] via-[#25F4EE] to-[#FE2C55]",
    lightBg: "bg-gradient-to-br from-slate-50 to-cyan-50",
    iconColor: "text-[#010101]",
    pillBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    ring: "ring-cyan-400/40",
    shadow: "shadow-cyan-500/20",
  },
  {
    id: "x",
    label: "X",
    Icon: XIcon,
    gradient: "from-[#14171A] to-[#657786]",
    bg: "bg-gradient-to-br from-[#14171A] to-[#657786]",
    lightBg: "bg-gradient-to-br from-slate-50 to-gray-100",
    iconColor: "text-[#14171A]",
    pillBg: "bg-slate-100 text-slate-700 border-[#e8eaef]",
    ring: "ring-slate-400/40",
    shadow: "shadow-slate-500/20",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    Icon: SnapchatIcon,
    gradient: "from-[#FFFC00] to-[#FFE600]",
    bg: "bg-gradient-to-br from-[#FFFC00] to-[#FFE600]",
    lightBg: "bg-gradient-to-br from-yellow-50 to-[#f4f6f8]",
    iconColor: "text-[#333333]",
    pillBg: "bg-yellow-50 text-amber-700 border-yellow-200",
    ring: "ring-yellow-400/40",
    shadow: "shadow-yellow-500/20",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    Icon: LinkedInIcon,
    gradient: "from-[#0077B5] to-[#00A0DC]",
    bg: "bg-gradient-to-br from-[#0077B5] to-[#00A0DC]",
    lightBg: "bg-gradient-to-br from-blue-50 to-sky-50",
    iconColor: "text-[#0077B5]",
    pillBg: "bg-blue-50 text-blue-700 border-blue-200",
    ring: "ring-blue-400/40",
    shadow: "shadow-[#8054b8]/20",
  },
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
  "bg-[#e8eaef]/80 text-violet-700 border border-[#c4a8e8]/60",
  "bg-pink-100/80 text-pink-700 border border-pink-200/60",
  "bg-blue-100/80 text-blue-700 border border-blue-200/60",
  "bg-white/80 text-[#1a8a64] border border-[#a6ffea]/60",
  "bg-[#e8eaef]/80 text-amber-700 border border-[#f5c6fa]/60",
  "bg-cyan-100/80 text-cyan-700 border border-cyan-200/60",
  "bg-rose-100/80 text-rose-700 border border-rose-200/60",
];

/* ── Day colors for the generated plan cards ── */
const DAY_THEMES = [
  { accent: "from-[#8054b8] to-[#6d3fa0]", light: "bg-[#f4f6f8]", text: "text-violet-700", border: "border-[#c4a8e8]", badge: "bg-[#e8eaef] text-violet-700" },
  { accent: "from-[#8054b8] to-indigo-600", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  { accent: "from-[#23ab7e] to-teal-600", light: "bg-[#f4f6f8]", text: "text-[#1a8a64]", border: "border-[#a6ffea]", badge: "bg-white text-[#1a8a64]" },
  { accent: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
  { accent: "from-[#e67af3] to-orange-600", light: "bg-[#f4f6f8]", text: "text-amber-700", border: "border-[#f5c6fa]", badge: "bg-[#e8eaef] text-amber-700" },
  { accent: "from-cyan-500 to-sky-600", light: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  { accent: "from-fuchsia-500 to-[#6d3fa0]", light: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-700" },
];

export default function PlannerPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany, locale, user } = useAppStore();
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
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    const sat = nextSaturday(new Date());
    setWeekStart(format(sat, "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    if (!user) { setLoadingCompanies(false); return; }
    (async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCompanies((data as Company[]) ?? []);
      if (data?.length && !selectedCompany) setSelectedCompany(data[0] as Company);
      setLoadingCompanies(false);
    })();
  }, [user, selectedCompany, setSelectedCompany]);

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
      const companySlim = {
        name: selectedCompany.name,
        name_ar: selectedCompany.name_ar,
        industry: selectedCompany.industry,
        description: (selectedCompany.description || "").slice(0, 1500),
        brand_colors: selectedCompany.brand_colors,
      };
      const ba = selectedCompany.brand_analysis as Record<string, unknown> | undefined;
      const brandAnalysisSlim = ba ? {
        brandPersonality: (ba.brandPersonality as Record<string, unknown>)?.summary ?? "",
        contentPillars: Array.isArray(ba.contentPillars) ? (ba.contentPillars as Array<Record<string, unknown>>).map((p) => p.name) : [],
        toneGuide: (ba.toneGuide as Record<string, unknown>)?.doUse ?? [],
        vision2030Alignment: ba.vision2030Alignment ?? "",
      } : undefined;

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companySlim,
          platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
          weekStart,
          userPrompt: userPrompt.trim() || undefined,
          brandAnalysis: brandAnalysisSlim,
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
    if (error) { console.error("Save plan error:", error); toast.error(locale === "ar" ? "فشل حفظ الخطة" : "Failed to save plan"); }
    else toast.success("Plan saved");
    setSaving(false);
  }

  function handleExportPDF() {
    if (!plan || !selectedCompany) return;
    loadExportPlanToPDF().then(fn => fn(plan, selectedCompany, outputLanguage)).then(
      () => toast.success("PDF downloaded"),
      (e) => toast.error(e instanceof Error ? e.message : "Export failed")
    );
  }

  if (loadingCompanies) {
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-6 p-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  function getPlatformConfig(id: string) {
    return PLATFORMS.find((p) => p.id === id);
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8 pb-12">

      {/* ===== PAGE HEADER ===== */}
      <div className="rounded-xl border border-[#e8eaef] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#23ab7e]/10">
            <Calendar className="h-5 w-5 text-[#23ab7e]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1a1d2e]">{tp.pageTitle}</h1>
            <p className="mt-0.5 text-sm text-[#9ca3b0]">{tp.pageSub}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {[
              { icon: Zap, label: locale === "ar" ? "AI" : "AI", color: "text-[#23ab7e] border-[#e8eaef]" },
              { icon: LayoutGrid, label: locale === "ar" ? "7 \u0623\u064a\u0627\u0645" : "7 Days", color: "text-[#2d3142] border-[#e8eaef]" },
              { icon: Globe, label: locale === "ar" ? "5 \u0645\u0646\u0635\u0627\u062a" : "5 Platforms", color: "text-[#2d3142] border-[#e8eaef]" },
            ].map((stat) => (
              <div key={stat.label} className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", stat.color)}>
                <stat.icon className="h-3.5 w-3.5" />
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ Loading Overlay ═══════════════ */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-auto px-6">
            <div className="rounded-xl bg-white border border-[#e8eaef] p-8 shadow-md text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#23ab7e]/10">
                  <Loader2 className="h-7 w-7 text-[#23ab7e] animate-spin" />
                </div>
              </div>
              <p key={loadingMsgIndex} className="text-base font-semibold text-[#1a1d2e] mb-1">
                {loadingMessages[loadingMsgIndex]}
              </p>
              <p className="text-sm text-[#9ca3b0] mb-6">
                {locale === "ar" ? "\u0646\u0628\u0646\u064a \u0644\u0643 \u062e\u0637\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629" : "Building your professional content plan"}
              </p>
              <div className="h-1 rounded-full bg-[#f4f5f7] overflow-hidden">
                <div className="h-full rounded-full bg-[#23ab7e] animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {!plan ? (
        /* ══════════════════════════════════════════════════ */
        /* ===== SETUP — Modern stepped form layout ===== */
        /* ══════════════════════════════════════════════════ */
        <div className="space-y-6">

          {/* ── Step 1: Company Selection ── */}
          <div className="rounded-xl bg-white border border-[#e8eaef] shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-6 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23ab7e]/10 text-[#23ab7e] text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1a1d2e]">{tp.company}</h3>
                <p className="text-sm text-[#9ca3b0]">{locale === "ar" ? "اختر العلامة التجارية" : "Choose your brand"}</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="relative">
                <select
                  value={selectedCompany?.id ?? ""}
                  onChange={(e) => {
                    const c = companies.find((x) => x.id === e.target.value);
                    if (c) setSelectedCompany(c);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#e8eaef] bg-slate-50/50 px-3 h-10 pr-10 text-sm font-medium text-[#1a1d2e] outline-none transition-all focus:border-[#c4a8e8] focus:ring-2 focus:ring-[#8054b8]/20 hover:border-slate-300 cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* ── Step 2: Platform Selection ── */}
          <div className="rounded-xl bg-white border border-[#e8eaef] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23ab7e]/10 text-[#23ab7e] text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1a1d2e]">{tp.platforms}</h3>
                  <p className="text-sm text-[#9ca3b0]">{locale === "ar" ? "اختر المنصات المستهدفة" : "Pick target platforms"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlatforms(platforms.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id))}
                className="text-sm font-bold text-[#6d3fa0] hover:text-violet-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#f4f6f8]"
              >
                {platforms.length === PLATFORMS.length ? tp.clearAll : tp.selectAll}
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PLATFORMS.map((p) => {
                  const selected = platforms.includes(p.id);
                  const Icon = p.Icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-200 cursor-pointer group border",
                        selected
                          ? "bg-[#23ab7e] border-[#23ab7e] text-white shadow-sm"
                          : "bg-white border-[#e8eaef] hover:border-[#23ab7e]/40 hover:shadow-sm"
                      )}
                    >
                      {selected && (
                        <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                          <CheckCircle2 className="h-4 w-4 text-[#23ab7e]" />
                        </div>
                      )}
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                        selected
                          ? "bg-white/20"
                          : `${p.lightBg}`
                      )}>
                        <Icon className={cn(
                          "h-6 w-6 transition-colors",
                          selected ? "text-white" : p.iconColor
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        selected ? "text-white" : "text-[#2d3142]"
                      )}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Step 3: Settings (side-by-side) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Week Start */}
            <div className="rounded-xl bg-white border border-[#e8eaef] shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23ab7e]/10 text-[#23ab7e] text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1a1d2e]">{tp.weekStart}</h3>
                  <p className="text-sm text-[#9ca3b0]">{locale === "ar" ? "بداية الأسبوع" : "Start date"}</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="w-full rounded-xl border border-[#e8eaef] bg-slate-50/50 px-3 h-10 text-sm font-medium text-[#1a1d2e] outline-none transition-all focus:border-[#c4a8e8] focus:ring-2 focus:ring-[#8054b8]/20 hover:border-slate-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Language */}
            <div className="rounded-xl bg-white border border-[#e8eaef] shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23ab7e]/10 text-[#23ab7e] text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1a1d2e]">{tp.generateIn}</h3>
                  <p className="text-sm text-[#9ca3b0]">{locale === "ar" ? "لغة المحتوى" : "Content language"}</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex gap-2">
                  {[
                    { code: "en" as const, label: tp.english, flag: "🇺🇸" },
                    { code: "ar" as const, label: tp.arabic, flag: "🇸🇦" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setOutputLanguage(lang.code)}
                      className={cn(
                        "flex-1 h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
                        outputLanguage === lang.code
                          ? "bg-[#23ab7e] text-white shadow-sm"
                          : "bg-white border border-[#e8eaef] text-[#2d3142] hover:bg-[#f4f5f7]"
                      )}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 5: Special Focus ── */}
          <div className="rounded-xl bg-white border border-[#e8eaef] shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-6 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23ab7e]/10 text-[#23ab7e] text-sm font-bold">
                5
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1a1d2e]">{tp.specialFocus}</h3>
                <p className="text-sm text-[#9ca3b0]">{locale === "ar" ? "اختياري — وجّه الذكاء الاصطناعي" : "Optional — guide the AI"}</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={tp.focusPlaceholder}
                className="min-h-[100px] rounded-lg border border-[#e8eaef] bg-white text-sm text-[#2d3142] placeholder:text-[#9ca3b0] focus:border-[#23ab7e] focus:ring-2 focus:ring-[#23ab7e]/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* ── Generate Button — big and vibrant ── */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-11 rounded-lg bg-[#23ab7e] hover:bg-[#1a8a64] text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {tp.generatePlan}
            <ArrowRight className={cn("h-4 w-4", locale === "ar" ? "mr-2 rotate-180" : "ml-2")} />
          </Button>
        </div>

      ) : (
        /* ══════════════════════════════════════════════════ */
        /* ===== GENERATED PLAN — Timeline-style view ===== */
        /* ══════════════════════════════════════════════════ */
        <div className="space-y-8">

          {/* ── Week Theme Banner ── */}
          <div className="rounded-xl border border-[#e8eaef] bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <span className="text-xs font-medium text-[#9ca3b0] tracking-widest uppercase">
                  {locale === "ar" ? "\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" : "Week Theme"}
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#1a1d2e] leading-tight">
                  {outputLanguage === "ar" ? (plan.weekThemeAr || plan.weekTheme) : (plan.weekTheme || plan.weekThemeAr)}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-[#9ca3b0]">
                  <Calendar className="h-4 w-4 text-[#23ab7e]" />
                  <span className="text-sm font-medium">
                      {weekStart && plan.days?.[0]?.date
                        ? `${format(parseISO(plan.days[0].date), "MMM d")} – ${format(parseISO(plan.days[6]?.date ?? weekStart), "MMM d, yyyy")}`
                        : weekStart}
                    </span>
                  </div>
                </div>

                {/* Progress ring */}
              <div className="flex flex-col items-center gap-1">
                <div className="relative h-16 w-16">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaef" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#23ab7e" strokeWidth="3" strokeDasharray={`${(completedDays.size / 7) * 100}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#1a1d2e]">{completedDays.size}/7</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#9ca3b0]">{locale === "ar" ? "\u0645\u0643\u062a\u0645\u0644" : "Done"}</span>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setRefineOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#6d3fa0] to-[#6d3fa0] text-white font-bold text-base shadow-md shadow-[#8054b8]/20 hover:shadow-sm hover:shadow-[#8054b8]/30 transition-all"
            >
              <Wand2 className="h-5 w-5" />
              {tp.refineAI}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1a8a64] to-teal-600 text-white font-bold text-base shadow-md shadow-[#23ab7e]/20 hover:shadow-sm hover:shadow-[#23ab7e]/30 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {tp.savePlan}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#6d3fa0] to-indigo-600 text-white font-bold text-base shadow-md shadow-[#8054b8]/20 hover:shadow-sm hover:shadow-[#8054b8]/30 transition-all"
            >
              <Download className="h-5 w-5" />
              {tp.exportPDF}
            </button>
            <button
              onClick={() => setPlan(null)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-base hover:bg-slate-200 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
              {tp.generateNew}
            </button>
          </div>

          {/* ── Day Cards — Modern expandable timeline ── */}
          <div className="space-y-4">
            {plan.days?.map((day, idx) => {
              const platformCfg = getPlatformConfig(day.platform);
              const PlatformIcon = platformCfg?.Icon;
              const isCompleted = completedDays.has(day.dayIndex);
              const isExpanded = expandedDay === day.dayIndex;
              const theme = DAY_THEMES[idx % DAY_THEMES.length];

              return (
                <div
                  key={day.dayIndex}
                  className={cn(
                    "group rounded-xl bg-white border transition-all duration-300 overflow-hidden",
                    isCompleted
                      ? "border-[#a6ffea] bg-[#f4f6f8]/30"
                      : "border-[#e8eaef] hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  {/* Top accent bar */}
                  <div className={cn("h-1 w-full bg-gradient-to-r", theme.accent)} />

                  {/* Card header — always visible */}
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : day.dayIndex)}
                    className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                  >
                    {/* Day number circle */}
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold text-xl shadow-md",
                      theme.accent
                    )}>
                      {idx + 1}
                    </div>

                    {/* Day info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-bold text-slate-900">
                          {outputLanguage === "ar" ? (day.dayAr || day.dayEn) : (day.dayEn || day.dayAr)}
                        </span>
                        <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                          {day.date}
                        </span>
                      </div>
                      <p className="mt-1 text-base font-semibold text-slate-700 truncate">
                        {outputLanguage === "ar" ? (day.topicAr || day.topic) : (day.topic || day.topicAr)}
                      </p>
                    </div>

                    {/* Platform badge */}
                    {PlatformIcon && (
                      <div className={cn(
                        "hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold",
                        platformCfg?.pillBg ?? "bg-slate-50 text-slate-600 border-[#e8eaef]"
                      )}>
                        <PlatformIcon className="h-4 w-4" />
                        {day.platform}
                      </div>
                    )}

                    {/* Posting time */}
                    <div className="hidden md:flex items-center gap-1.5 text-sm font-bold text-[#6d3fa0] bg-[#f4f6f8] px-3 py-2 rounded-xl border border-[#e8eaef]">
                      <Clock className="h-4 w-4" />
                      {day.postingTime}
                    </div>

                    {/* Status + expand */}
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                          <CheckCircle2 className="h-4 w-4 text-[#1a8a64]" />
                        </div>
                      )}
                      <ChevronDown className={cn(
                        "h-5 w-5 text-slate-400 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-0 border-t border-[#e8eaef] animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">

                        {/* Left — Caption */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Mobile-only platform + time */}
                          <div className="flex items-center gap-3 sm:hidden flex-wrap">
                            {PlatformIcon && (
                              <div className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold",
                                platformCfg?.pillBg ?? "bg-slate-50 text-slate-600 border-[#e8eaef]"
                              )}>
                                <PlatformIcon className="h-4 w-4" />
                                {day.platform}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm font-bold text-[#6d3fa0] bg-[#f4f6f8] px-3 py-2 rounded-xl border border-[#e8eaef]">
                              <Clock className="h-4 w-4" />
                              {day.postingTime}
                            </div>
                          </div>

                          {/* Content type */}
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <span className="text-base font-semibold text-slate-500">{day.contentType}</span>
                          </div>

                          {/* Caption */}
                          <div className="rounded-xl bg-slate-50 border border-[#e8eaef] p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-5 w-5 text-[#8054b8]" />
                              <span className="text-sm font-bold text-[#6d3fa0] uppercase tracking-wider">{locale === "ar" ? "الكابشن" : "Caption"}</span>
                            </div>
                            <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {outputLanguage === "ar" ? (day.captionAr || day.caption) : (day.caption || day.captionAr)}
                            </p>
                          </div>

                          {/* Hashtags */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="h-5 w-5 text-[#8054b8]" />
                              <span className="text-sm font-bold text-[#6d3fa0] uppercase tracking-wider">{locale === "ar" ? "الهاشتاقات" : "Hashtags"}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {day.hashtags?.map((tag, tagIdx) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    "rounded-lg px-3 py-1.5 text-sm font-bold cursor-default",
                                    HASHTAG_COLORS[tagIdx % HASHTAG_COLORS.length]
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right — Meta info */}
                        <div className="space-y-4">
                          {/* Posting time detail */}
                          <div className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-[#8054b8]" />
                              <span className="text-sm font-bold text-[#6d3fa0] uppercase tracking-wider">{locale === "ar" ? "أفضل وقت" : "Best Time"}</span>
                            </div>
                            <p className="text-3xl font-bold text-violet-700">{day.postingTime}</p>
                            {day.postingTimeReason && (
                              <p className="mt-2 text-sm text-[#8054b8] leading-relaxed">{day.postingTimeReason}</p>
                            )}
                          </div>

                          {/* Content tips */}
                          {day.contentTips && (
                            <div className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="h-5 w-5 text-[#e67af3]" />
                                <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">{locale === "ar" ? "نصائح" : "Tips"}</span>
                              </div>
                              <p className="text-base text-amber-700 leading-relaxed">{day.contentTips}</p>
                            </div>
                          )}

                          {/* Image prompt hint */}
                          {day.imagePromptHint && (
                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="h-5 w-5 text-[#8054b8]" />
                                <span className="text-sm font-bold text-[#6d3fa0] uppercase tracking-wider">{locale === "ar" ? "فكرة الصورة" : "Image Idea"}</span>
                              </div>
                              <p className="text-base text-blue-700 leading-relaxed">{day.imagePromptHint}</p>
                            </div>
                          )}

                          {/* Mark as done */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompletedDays((prev) => {
                                const next = new Set(prev);
                                if (next.has(day.dayIndex)) next.delete(day.dayIndex);
                                else next.add(day.dayIndex);
                                return next;
                              });
                            }}
                            className={cn(
                              "w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 border",
                              isCompleted
                                ? "border-[#a6ffea] bg-gradient-to-r from-[#23ab7e] to-[#23ab7e] text-white shadow-sm shadow-[#23ab7e]/20"
                                : "border-[#e8eaef] bg-white text-slate-500 hover:border-[#a6ffea] hover:bg-[#f4f6f8] hover:text-[#1a8a64]"
                            )}
                          >
                            {isCompleted ? (
                              <><CheckCircle2 className="h-4 w-4" /> {locale === "ar" ? "تم ✨" : "Done ✨"}</>
                            ) : (
                              <><Circle className="h-4 w-4" /> {locale === "ar" ? "تحديد كمنجز" : "Mark as done"}</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ Refine Dialog ═══════════════ */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="border border-[#e8eaef] bg-white text-slate-900 sm:max-w-lg rounded-xl overflow-hidden shadow-md">
          <div className="h-1 w-full bg-gradient-to-r from-[#8054b8] via-[#8054b8] to-fuchsia-500" />
          <DialogHeader className="pt-2">
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-[#8054b8]" />
              {tp.refineAI}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#9ca3b0]">{tp.refineTell}</p>
          <Textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            className="min-h-[100px] rounded-xl border border-[#e8eaef] bg-slate-50/50 text-lg text-slate-900 focus:border-[#c4a8e8] focus:ring-2 focus:ring-[#8054b8]/20 transition-all resize-none"
            placeholder={tp.refinePlaceholder}
          />
          <Button
            className="h-12 rounded-xl bg-gradient-to-r from-[#6d3fa0] to-[#6d3fa0] text-base font-bold text-white shadow-md shadow-[#8054b8]/20 transition-all hover:shadow-sm hover:shadow-[#8054b8]/30"
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
