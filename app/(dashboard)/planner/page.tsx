"use client";

import { useEffect, useState } from "react";
import { Calendar, Sparkles, Save, Download, Loader2, Clock, CheckCircle2, Circle, Globe, Zap, ArrowRight, LayoutGrid, ChevronDown, Wand2, RotateCcw, FileText, Hash, MessageSquare, Lightbulb, Image } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, nextSaturday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
const loadExportPlanToPDF = () => import("@/lib/export-plan-pdf").then(m => m.exportPlanToPDF);
import toast from "react-hot-toast";

/* ── Platform SVG Icons ── */
function InstagramIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>);
}
function TikTokIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z"/></svg>);
}
function XIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
}
function SnapchatIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M21.79755,16.98718c-2.86621-.47223-4.15094-3.40149-4.204-3.52588l-.00544-.01172a1.07048,1.07048,0,0,1-.10223-.89758c.19251-.45361.82935-.6557,1.25134-.78967.10535-.03339.205-.065.28315-.096.76275-.30127.91784-.61316.91406-.8219a.66226.66226,0,0,0-.50134-.54358l-.00568-.00213a.9462.9462,0,0,0-.35632-.06824.7546.7546,0,0,0-.31287.06207,2.54,2.54,0,0,1-.95526.26612.82134.82134,0,0,1-.52954-.17725c.00915-.16992.02-.34522.0318-.53046l.004-.0653a10.10231,10.10231,0,0,0-.24091-4.03449,5.2482,5.2482,0,0,0-4.87311-3.1394q-.20114.0021-.4024.00378A5.23959,5.23959,0,0,0,6.92853,5.75293,10.08988,10.08988,0,0,0,6.68726,9.784q.01941.29872.036.59771a.8483.8483,0,0,1-.5838.17841,2.45322,2.45322,0,0,1-1.014-.26776.57538.57538,0,0,0-.2453-.04895.83387.83387,0,0,0-.81061.53265c-.08191.43061.5329.74256.90668.8902.079.03137.17822.0628.28308.096.42169.13385,1.05908.33606,1.25152.78985a1.07171,1.07171,0,0,1-.10223.89783l-.00537.01154a7.02828,7.02828,0,0,1-1.06915,1.66211,5.21488,5.21488,0,0,1-3.13483,1.86389.23978.23978,0,0,0-.20044.25006.38046.38046,0,0,0,.031.12964c.17578.41113,1.05822.75061,2.55182.981.13964.02161.19873.24927.28027.6222.03259.14929.06634.30426.1134.46423a.29261.29261,0,0,0,.31922.22876,2.48528,2.48528,0,0,0,.42492-.06091,5.52912,5.52912,0,0,1,1.12036-.12677,4.95367,4.95367,0,0,1,.8078.0683,3.87725,3.87725,0,0,1,1.535.78417,4.443,4.443,0,0,0,2.6897,1.06006c.03375,0,.06744-.00122.10009-.004.04114.00195.09522.004.15192.004a4.44795,4.44795,0,0,0,2.69122-1.06079,3.87269,3.87269,0,0,1,1.53351-.78332,4.97275,4.97275,0,0,1,.808-.0683,5.59252,5.59252,0,0,1,1.12037.11871,2.39142,2.39142,0,0,0,.425.05371h.02338a.279.279,0,0,0,.29547-.221c.04645-.15784.08045-.308.11389-.46131.08081-.371.1399-.59759.28009-.61926,1.494-.23078,2.37641-.56976,2.551-.97858a.38487.38487,0,0,0,.03174-.13086A.24.24,0,0,0,21.79755,16.98718Z"/></svg>);
}
function LinkedInIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#E1306C", gradient: "from-[#F77737] via-[#E1306C] to-[#C13584]", pillBg: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, color: "#010101", gradient: "from-[#010101] via-[#25F4EE] to-[#FE2C55]", pillBg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "x", label: "X", Icon: XIcon, color: "#14171A", gradient: "from-[#14171A] to-[#657786]", pillBg: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "snapchat", label: "Snapchat", Icon: SnapchatIcon, color: "#FFFC00", gradient: "from-[#FFFC00] to-[#FFE600]", pillBg: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, color: "#0077B5", gradient: "from-[#0077B5] to-[#00A0DC]", pillBg: "bg-blue-50 text-blue-700 border-blue-200" },
];

type PlanDay = { dayIndex: number; dayEn: string; dayAr: string; date: string; platform: string; contentType: string; topic: string; topicAr?: string; caption: string; captionAr?: string; hashtags: string[]; postingTime: string; postingTimeReason?: string; contentTips?: string; imagePromptHint?: string };
type Plan = { weekTheme: string; weekThemeAr: string; days: PlanDay[]; weeklyStrategy?: string; expectedEngagement?: string };

const HASHTAG_COLORS = [
  "bg-[#23ab7e]/10 text-[#1a8a64] border border-[#23ab7e]/20",
  "bg-[#8054b8]/10 text-[#6d3fa0] border border-[#8054b8]/20",
  "bg-[#e67af3]/10 text-[#c054d4] border border-[#e67af3]/20",
  "bg-[#2dd4a0]/10 text-[#1a8a64] border border-[#2dd4a0]/20",
  "bg-[#c4a8e8]/15 text-[#6d3fa0] border border-[#c4a8e8]/30",
  "bg-[#f5c6fa]/15 text-[#c054d4] border border-[#f5c6fa]/30",
  "bg-[#a6ffea]/15 text-[#1a8a64] border border-[#a6ffea]/30",
];

const DAY_COLORS = ["#23ab7e", "#8054b8", "#e67af3", "#2dd4a0", "#c4a8e8", "#f5c6fa", "#a6ffea"];

export default function PlannerPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany, locale, user } = useAppStore();
  const tp = messages[locale].planner;
  const loadingMessages = [tp.loading1, tp.loading2, tp.loading3, tp.loading4, tp.loading5];
  const isRtl = locale === "ar";

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
  const [exporting, setExporting] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => { setWeekStart(format(nextSaturday(new Date()), "yyyy-MM-dd")); }, []);
  useEffect(() => { if (!user) { setLoadingCompanies(false); return; } (async () => { const { data } = await supabase.from("companies").select("*").eq("user_id", user.id).order("created_at", { ascending: false }); setCompanies((data as Company[]) ?? []); if (data?.length && !selectedCompany) setSelectedCompany(data[0] as Company); setLoadingCompanies(false); })(); }, [user, selectedCompany, setSelectedCompany]);
  useEffect(() => { if (!generating) return; const t = setInterval(() => setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length), 2500); return () => clearInterval(t); }, [generating, loadingMessages.length]);

  function togglePlatform(id: string) { setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); }

  async function handleGenerate() {
    if (!selectedCompany) { toast.error("Select a company first"); return; }
    setGenerating(true); setPlan(null);
    try {
      const companySlim = { name: selectedCompany.name, name_ar: selectedCompany.name_ar, industry: selectedCompany.industry, description: (selectedCompany.description || "").slice(0, 1500), brand_colors: selectedCompany.brand_colors };
      const ba = selectedCompany.brand_analysis as Record<string, unknown> | undefined;
      const brandAnalysisSlim = ba ? { brandPersonality: (ba.brandPersonality as Record<string, unknown>)?.summary ?? "", contentPillars: Array.isArray(ba.contentPillars) ? (ba.contentPillars as Array<Record<string, unknown>>).map((p) => p.name) : [], toneGuide: (ba.toneGuide as Record<string, unknown>)?.doUse ?? [], vision2030Alignment: ba.vision2030Alignment ?? "" } : undefined;
      const res = await fetch("/api/generate-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: companySlim, platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id), weekStart, userPrompt: userPrompt.trim() || undefined, brandAnalysis: brandAnalysisSlim, outputLanguage }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate plan");
      setPlan(json.plan); toast.success("Plan generated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to generate plan"); }
    setGenerating(false);
  }

  async function handleSave() {
    if (!plan || !selectedCompany) return;
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("content_plans").insert({ user_id: user.id, company_id: selectedCompany.id, title: `${plan.weekTheme} — ${weekStart}`, week_start: weekStart, platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id), prompt: userPrompt.trim() || null, plan_data: plan });
    if (error) toast.error(locale === "ar" ? "فشل حفظ الخطة" : "Failed to save plan"); else toast.success("Plan saved");
    setSaving(false);
  }

  async function handleExportPDF() { if (!plan || !selectedCompany || exporting) return; setExporting(true); try { const fn = await loadExportPlanToPDF(); await fn(plan, selectedCompany, "en"); toast.success("PDF downloaded"); } catch (e) { toast.error(e instanceof Error ? e.message : "Export failed"); } setExporting(false); }
  function getPlatformConfig(id: string) { return PLATFORMS.find((p) => p.id === id); }

  if (loadingCompanies) return (<div dir={isRtl ? "rtl" : "ltr"} className="space-y-6"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10 pb-16">

      {/* ═══════ HERO BANNER ═══════ */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">{tp.pageTitle}</h1>
              <p className="mt-2 text-lg text-white/60">{tp.pageSub}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Zap, label: "AI", color: "bg-white/15 text-[#a6ffea] border-white/20" },
                { icon: LayoutGrid, label: isRtl ? "7 أيام" : "7 Days", color: "bg-white/15 text-white/80 border-white/20" },
                { icon: Globe, label: isRtl ? "5 منصات" : "5 Platforms", color: "bg-white/15 text-white/80 border-white/20" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold backdrop-blur-sm ${s.color}`}>
                  <s.icon className="h-4 w-4" />{s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ LOADING OVERLAY ═══════ */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-md mx-auto px-6 text-center">
            <div className="relative mb-8">
              <div className="absolute -inset-6 rounded-3xl nl-aurora-bg opacity-20 animate-pulse" />
              <div className="relative flex h-24 w-24 mx-auto items-center justify-center rounded-3xl nl-aurora-bg" style={{ boxShadow: "0 12px 40px rgba(35,171,126,0.3)" }}>
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            </div>
            <p key={loadingMsgIndex} className="text-xl font-bold text-[#2d3142] mb-2 transition-opacity">{loadingMessages[loadingMsgIndex]}</p>
            <p className="text-base text-[#8f96a3] mb-8">{isRtl ? "نبني لك خطة محتوى احترافية" : "Building your professional content plan"}</p>
            <div className="h-2 rounded-full bg-[#e8eaef] overflow-hidden">
              <div className="h-full rounded-full animate-shimmer" style={{ width: "70%", background: "linear-gradient(90deg, #23ab7e, #8054b8, #e67af3)" }} />
            </div>
          </div>
        </div>
      )}

      {!plan ? (
        /* ═══════ SETUP FORM — Glass Card ═══════ */
        <div className="space-y-8">

          {/* ── Step 1: Company ── */}
          <div className="rounded-3xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 8px 32px rgba(35,171,126,0.04)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] text-white text-base font-bold shadow-lg">1</div>
              <div>
                <h3 className="text-xl font-bold text-[#2d3142]">{tp.company}</h3>
                <p className="text-base text-[#8f96a3]">{isRtl ? "اختر العلامة التجارية" : "Choose your brand"}</p>
              </div>
            </div>
            <select value={selectedCompany?.id ?? ""} onChange={(e) => { const c = companies.find((x) => x.id === e.target.value); if (c) setSelectedCompany(c); }} className="w-full appearance-none rounded-2xl border-2 border-[#e8eaef] bg-white px-6 h-12 sm:h-14 lg:h-16 text-lg font-medium text-[#2d3142] outline-none transition-all focus:border-[#23ab7e] focus:shadow-[0_0_0_4px_rgba(35,171,126,0.1)] cursor-pointer">
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* ── Step 2: Platforms ── */}
          <div className="rounded-3xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 8px 32px rgba(128,84,184,0.04)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#e67af3] text-white text-base font-bold shadow-lg">2</div>
                <div>
                  <h3 className="text-xl font-bold text-[#2d3142]">{tp.platforms}</h3>
                  <p className="text-base text-[#8f96a3]">{isRtl ? "اختر المنصات" : "Select platforms"}</p>
                </div>
              </div>
              <button type="button" onClick={() => setPlatforms(platforms.length === PLATFORMS.length ? [] : PLATFORMS.map(p => p.id))} className="text-base font-bold text-[#8054b8] hover:text-[#6d3fa0] transition-colors bg-transparent border-none cursor-pointer px-4 py-2 rounded-xl hover:bg-[#8054b8]/5">
                {platforms.length === PLATFORMS.length ? (isRtl ? "مسح الكل" : "Clear All") : (isRtl ? "تحديد الكل" : "Select All")}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {PLATFORMS.map((p) => {
                const selected = platforms.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} className={cn("relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer", selected ? "border-[#23ab7e] bg-gradient-to-br from-[#23ab7e]/5 to-[#8054b8]/5 shadow-[0_4px_20px_rgba(35,171,126,0.12)]" : "border-[#e8eaef] bg-white hover:border-[#c4a8e8] hover:shadow-md")}>
                    {selected && <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#23ab7e] flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", selected ? `bg-gradient-to-br ${p.gradient}` : "bg-[#f4f6f8]")}>
                      <span style={!selected ? { color: p.color } : undefined}><p.Icon className={cn("h-7 w-7", selected ? "text-white" : "")} /></span>
                    </div>
                    <span className={cn("text-base font-bold", selected ? "text-[#2d3142]" : "text-[#8f96a3]")}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step 3 & 4: Week + Language ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2dd4a0] to-[#23ab7e] text-white text-sm font-bold shadow-md">3</div>
                <h3 className="text-lg font-bold text-[#2d3142]">{tp.weekStart}</h3>
              </div>
              <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="w-full rounded-2xl border-2 border-[#e8eaef] bg-white px-6 h-12 sm:h-14 lg:h-16 text-lg font-medium text-[#2d3142] outline-none transition-all focus:border-[#23ab7e] focus:shadow-[0_0_0_4px_rgba(35,171,126,0.1)]" />
            </div>
            <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c4a8e8] to-[#8054b8] text-white text-sm font-bold shadow-md">4</div>
                <h3 className="text-lg font-bold text-[#2d3142]">{tp.generateIn}</h3>
              </div>
              <div className="flex gap-3">
                {[{ val: "en" as const, flag: "🇺🇸", label: "English" }, { val: "ar" as const, flag: "🇸🇦", label: "العربية" }].map((l) => (
                  <button key={l.val} type="button" onClick={() => setOutputLanguage(l.val)} className={cn("flex-1 h-12 sm:h-14 lg:h-16 rounded-2xl border-2 text-lg font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer", outputLanguage === l.val ? "border-[#23ab7e] bg-[#23ab7e] text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)]" : "border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#c4a8e8]")}>
                    <span className="text-xl">{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Step 5: Special focus ── */}
          <div className="rounded-3xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 4px 16px rgba(230,122,243,0.03)" }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#e67af3] to-[#f5c6fa] text-white text-base font-bold shadow-lg">5</div>
              <div>
                <h3 className="text-xl font-bold text-[#2d3142]">{tp.specialFocus}</h3>
                <p className="text-base text-[#8f96a3]">{isRtl ? "اختياري — وجّه الذكاء الاصطناعي" : "Optional — guide the AI output"}</p>
              </div>
            </div>
            <Textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} placeholder={tp.focusPlaceholder} className="min-h-[80px] sm:min-h-[120px] rounded-2xl border-2 border-[#e8eaef] bg-white text-lg text-[#2d3142] placeholder:text-[#8f96a3] focus:border-[#e67af3] focus:ring-0 focus:shadow-[0_0_0_4px_rgba(230,122,243,0.1)] transition-all resize-none p-5" />
          </div>

          {/* ── Generate Button ── */}
          <button onClick={handleGenerate} disabled={generating} className="relative w-full h-14 sm:h-16 lg:h-20 rounded-3xl border-none text-lg sm:text-xl lg:text-2xl font-black text-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(35,171,126,0.4)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden" style={{ background: "linear-gradient(135deg, #23ab7e, #1a8a64, #8054b8)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 8px 32px rgba(35,171,126,0.3), 0 4px 12px rgba(128,84,184,0.15)" }}>
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
            <span className="relative flex items-center justify-center gap-4">
              <Sparkles className="h-7 w-7" />
              {tp.generatePlan}
              <ArrowRight className={cn("h-6 w-6", isRtl && "rotate-180")} />
            </span>
          </button>
        </div>

      ) : (
        /* ═══════ GENERATED PLAN ═══════ */
        <div className="space-y-8">

          {/* Week Theme + Progress */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid #e8eaef", boxShadow: "0 8px 32px rgba(35,171,126,0.04)" }}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #23ab7e, #8054b8, #e67af3)" }} />
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex-1">
                <span className="text-sm font-bold text-[#8054b8] tracking-widest uppercase">{isRtl ? "موضوع الأسبوع" : "Week Theme"}</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#2d3142] leading-tight">{outputLanguage === "ar" ? (plan.weekThemeAr || plan.weekTheme) : (plan.weekTheme || plan.weekThemeAr)}</h2>
                <div className="mt-4 flex items-center gap-2.5 text-[#8f96a3]">
                  <Calendar className="h-5 w-5 text-[#23ab7e]" />
                  <span className="text-lg font-medium">{weekStart && plan.days?.[0]?.date ? `${format(parseISO(plan.days[0].date), "MMM d")} – ${format(parseISO(plan.days[6]?.date ?? weekStart), "MMM d, yyyy")}` : weekStart}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaef" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#prog)" strokeWidth="3" strokeDasharray={`${(completedDays.size / 7) * 100}, 100`} strokeLinecap="round" />
                    <defs><linearGradient id="prog" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#23ab7e" /><stop offset="100%" stopColor="#8054b8" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-[#2d3142]">{completedDays.size}/7</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#8f96a3]">{isRtl ? "مكتمل" : "Done"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {[
              { onClick: () => setRefineOpen(true), icon: Wand2, label: tp.refineAI, bg: "from-[#8054b8] to-[#6d3fa0]", shadow: "rgba(128,84,184,0.25)" },
              { onClick: handleSave, icon: saving ? Loader2 : Save, label: tp.savePlan, bg: "from-[#23ab7e] to-[#1a8a64]", shadow: "rgba(35,171,126,0.25)", disabled: saving, spin: saving },
              { onClick: handleExportPDF, icon: exporting ? Loader2 : Download, label: tp.exportPDF, bg: "from-[#e67af3] to-[#c054d4]", shadow: "rgba(230,122,243,0.25)", disabled: exporting, spin: exporting },
              { onClick: () => setPlan(null), icon: RotateCcw, label: tp.generateNew, bg: "from-[#505868] to-[#8f96a3]", shadow: "rgba(0,0,0,0.1)" },
            ].map((btn) => (
              <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled} className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r ${btn.bg} text-white font-bold text-base transition-all hover:-translate-y-0.5 disabled:opacity-50`} style={{ boxShadow: `0 4px 16px ${btn.shadow}` }}>
                <btn.icon className={cn("h-5 w-5", btn.spin && "animate-spin")} />
                {btn.label}
              </button>
            ))}
          </div>

          {/* Day Cards */}
          <div className="space-y-5">
            {plan.days?.map((day, idx) => {
              const pCfg = getPlatformConfig(day.platform);
              const PIcon = pCfg?.Icon;
              const done = completedDays.has(day.dayIndex);
              const open = expandedDay === day.dayIndex;
              const clr = DAY_COLORS[idx % DAY_COLORS.length];

              return (
                <div key={day.dayIndex} className={cn("group rounded-2xl transition-all duration-300 overflow-hidden", done ? "shadow-[0_0_0_2px_#23ab7e40]" : "hover:shadow-lg")} style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: `1px solid ${open ? clr + "40" : "#e8eaef"}` }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${clr}, transparent)` }} />

                  <button type="button" onClick={() => setExpandedDay(open ? null : day.dayIndex)} className="w-full flex items-center gap-4 p-5 sm:p-6 text-left cursor-pointer bg-transparent border-none">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white font-black text-xl shadow-lg" style={{ background: clr, boxShadow: `0 6px 20px ${clr}30` }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-bold text-[#2d3142]">{outputLanguage === "ar" ? (day.dayAr || day.dayEn) : (day.dayEn || day.dayAr)}</span>
                        <span className="text-sm font-medium text-[#8f96a3] bg-[#f4f6f8] px-3 py-1 rounded-lg">{day.date}</span>
                      </div>
                      <p className="mt-1 text-base font-semibold text-[#505868] truncate">{outputLanguage === "ar" ? (day.topicAr || day.topic) : (day.topic || day.topicAr)}</p>
                    </div>
                    {PIcon && <div className={cn("hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 border text-sm font-bold", pCfg?.pillBg)}><PIcon className="h-4 w-4" />{pCfg?.label}</div>}
                    <div className="hidden md:flex items-center gap-2 text-sm font-bold rounded-xl px-4 py-2.5 border border-[#e8eaef] bg-[#f4f6f8]" style={{ color: clr }}>
                      <Clock className="h-4 w-4" />{day.postingTime}
                    </div>
                    <div className="flex items-center gap-2">
                      {done && <CheckCircle2 className="h-5 w-5 text-[#23ab7e]" />}
                      <ChevronDown className={cn("h-5 w-5 text-[#8f96a3] transition-transform duration-300", open && "rotate-180")} />
                    </div>
                  </button>

                  {open && (
                    <div className="px-5 sm:px-6 pb-6 border-t border-[#e8eaef]/50" style={{ animation: "nl-fade-up 0.3s ease" }}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                        <div className="lg:col-span-2 space-y-5">
                          <div className="flex items-center gap-3 sm:hidden flex-wrap">
                            {PIcon && <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold", pCfg?.pillBg)}><PIcon className="h-4 w-4" />{pCfg?.label}</div>}
                            <div className="flex items-center gap-2 text-sm font-bold rounded-xl px-3 py-2 border border-[#e8eaef] bg-[#f4f6f8]" style={{ color: clr }}><Clock className="h-4 w-4" />{day.postingTime}</div>
                          </div>
                          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#8f96a3]" /><span className="text-base font-semibold text-[#505868]">{day.contentType}</span></div>
                          <div className="rounded-2xl p-6" style={{ background: `${clr}08`, border: `1px solid ${clr}15` }}>
                            <div className="flex items-center gap-2 mb-3"><MessageSquare className="h-5 w-5" style={{ color: clr }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: clr }}>{isRtl ? "الكابشن" : "Caption"}</span></div>
                            <p className="text-lg text-[#2d3142] leading-relaxed whitespace-pre-wrap">{outputLanguage === "ar" ? (day.captionAr || day.caption) : (day.caption || day.captionAr)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3"><Hash className="h-5 w-5" style={{ color: clr }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: clr }}>{isRtl ? "الهاشتاقات" : "Hashtags"}</span></div>
                            <div className="flex flex-wrap gap-2">{day.hashtags?.map((tag, ti) => <span key={tag} className={cn("rounded-xl px-3.5 py-2 text-sm font-bold cursor-default transition-transform hover:scale-105", HASHTAG_COLORS[ti % HASHTAG_COLORS.length])}>{tag}</span>)}</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-2xl p-5" style={{ background: `${clr}08`, border: `1px solid ${clr}15` }}>
                            <div className="flex items-center gap-2 mb-2"><Clock className="h-5 w-5" style={{ color: clr }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: clr }}>{isRtl ? "أفضل وقت" : "Best Time"}</span></div>
                            <p className="text-3xl font-black" style={{ color: clr }}>{day.postingTime}</p>
                            {day.postingTimeReason && <p className="mt-2 text-sm leading-relaxed" style={{ color: clr, opacity: 0.7 }}>{day.postingTimeReason}</p>}
                          </div>
                          {day.contentTips && (
                            <div className="rounded-2xl p-5 bg-[#e67af3]/5 border border-[#e67af3]/10">
                              <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-5 w-5 text-[#e67af3]" /><span className="text-xs font-bold text-[#e67af3] uppercase tracking-widest">{isRtl ? "نصائح" : "Tips"}</span></div>
                              <p className="text-sm text-[#505868] leading-relaxed">{day.contentTips}</p>
                            </div>
                          )}
                          {day.imagePromptHint && (
                            <div className="rounded-2xl p-5 bg-[#8054b8]/5 border border-[#8054b8]/10">
                              <div className="flex items-center gap-2 mb-2"><Image className="h-5 w-5 text-[#8054b8]" /><span className="text-xs font-bold text-[#8054b8] uppercase tracking-widest">{isRtl ? "فكرة الصورة" : "Image Idea"}</span></div>
                              <p className="text-sm text-[#505868] leading-relaxed">{day.imagePromptHint}</p>
                            </div>
                          )}
                          <button type="button" onClick={(e) => { e.stopPropagation(); setCompletedDays((prev) => { const n = new Set(prev); if (n.has(day.dayIndex)) n.delete(day.dayIndex); else n.add(day.dayIndex); return n; }); }} className={cn("w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2 cursor-pointer", done ? "border-[#23ab7e] bg-[#23ab7e] text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)]" : "border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#23ab7e] hover:text-[#23ab7e]")}>
                            {done ? <><CheckCircle2 className="h-5 w-5" /> {isRtl ? "تم ✨" : "Done ✨"}</> : <><Circle className="h-5 w-5" /> {isRtl ? "تحديد كمنجز" : "Mark as done"}</>}
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

      {/* ═══════ Refine Dialog ═══════ */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="border border-[#e8eaef] bg-white text-[#2d3142] sm:max-w-lg rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #8054b8, #e67af3)" }} />
          <DialogHeader className="pt-2"><DialogTitle className="text-2xl font-bold flex items-center gap-2"><Wand2 className="h-6 w-6 text-[#8054b8]" />{tp.refineAI}</DialogTitle></DialogHeader>
          <p className="text-sm text-[#8f96a3]">{tp.refineTell}</p>
          <Textarea value={refineText} onChange={(e) => setRefineText(e.target.value)} className="min-h-[120px] rounded-2xl border-2 border-[#e8eaef] bg-white text-base text-[#2d3142] focus:border-[#8054b8] focus:shadow-[0_0_0_4px_rgba(128,84,184,0.1)] transition-all resize-none" placeholder={tp.refinePlaceholder} />
          <Button className="h-14 rounded-2xl bg-gradient-to-r from-[#8054b8] to-[#e67af3] text-base font-bold text-white transition-all hover:-translate-y-0.5" style={{ boxShadow: "0 4px 16px rgba(128,84,184,0.25)" }} onClick={async () => { setRefineOpen(false); const fp = refineText.trim(); setRefineText(""); if (fp) setUserPrompt(fp); setPlan(null); setGenerating(true); try { const res = await fetch("/api/generate-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: selectedCompany, platforms: platforms.length ? platforms : PLATFORMS.map(p => p.id), weekStart, userPrompt: fp || userPrompt, outputLanguage }) }); const json = await res.json(); if (!res.ok) throw new Error(json.error); setPlan(json.plan); toast.success("Plan refined"); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } setGenerating(false); }}>
            {tp.regenerate}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
