"use client";

import { useEffect, useState } from "react";
import {
  Swords, Clock, Trash2, Loader2, Sparkles, Eye, X, Download,
  ChevronUp, Target, BarChart3, Shield, TrendingUp, AlertTriangle,
  Calendar, Rocket, Star, Building2, Package, Users, DollarSign,
  Layers, Globe, Crosshair,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
const loadExportCompetitorPdf = () => import("@/lib/export-competitor-pdf").then(m => m.exportCompetitorPdf);

/* ── Types ── */

interface Competitor { name: string; handle: string; platform: string; websiteUrl: string; }
interface StrategyAction { action: string; priority: string; impact: string; kpi?: string; }
interface CompetitorResult {
  name: string; handle: string; platform: string; postingFrequency: string;
  contentTypes: string[]; captionStyle: string; hashtagStrategy: string;
  engagementLevel: string; visualStyle: string; strengths: string[];
  weakPoints: string[]; threatLevel: number; overallScore: number; keyInsight: string;
  stealThisMove?: string;
  companyOverview?: string; productsAndServices?: string; targetMarket?: string;
  brandPositioning?: string; websiteAnalysis?: string; digitalPresence?: string;
  pricingStrategy?: string; customerReviews?: string; technologyStack?: string;
}
interface IndustryAnalysis {
  marketOverview: string; competitiveLandscape: string; consumerTrends: string; futureOutlook: string;
}
interface AnalysisData {
  executiveSummary: string;
  brandAssessment: { strengths: string[]; weaknesses: string[]; opportunities?: string[]; threats?: string[]; overallScore: number; marketPosition?: string; };
  competitors: CompetitorResult[];
  comparisonMatrix: { categories: string[]; yourBrand: number[]; competitors: Record<string, number[]>; };
  winningStrategy: { immediate: StrategyAction[]; shortTerm: StrategyAction[]; longTerm: StrategyAction[]; contentGaps: string[]; differentiators: string[]; quickWins?: string[]; };
  saudiMarketInsights: { trendAlignment: string; vision2030Relevance: string; culturalFit: string; localOpportunities?: string; ramadanStrategy?: string; };
  industryAnalysis?: IndustryAnalysis;
}
interface SavedAnalysis {
  id: string; user_id: string; company_id: string; competitors: Competitor[];
  analysis_data: AnalysisData; output_language: string; created_at: string;
}
interface CompanyInfo { id: string; name: string; name_ar: string | null; logo_url: string | null; brand_colors: string[] | null; }

/* ── Score Circle ── */
function ScoreCircle({ score, size = 64 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#23ab7e" : score >= 40 ? "#F59E0B" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="26" fill="none" stroke="#E8F0EA" strokeWidth="5" />
      <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 30 30)" className="transition-all duration-700" />
      <text x="30" y="34" textAnchor="middle" style={{ fontSize: "16px", fontWeight: 800, fill: "#2d3142" }}>{score}</text>
    </svg>
  );
}

function ThreatBadge({ level }: { level: number }) {
  const cfg = level >= 7 ? { bg: "bg-red-100 text-red-700 border-red-200", label: "HIGH" } : level >= 4 ? { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "MED" } : { bg: "bg-green-100 text-[#23ab7e] border-[#e8eaef]", label: "LOW" };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-black border ${cfg.bg}`}><AlertTriangle className="h-3 w-3" />{cfg.label}</span>;
}

const ACCENT_COLORS = [
  "from-[#23ab7e] via-[#8054b8] to-[#8054b8]",
  "from-[#8054b8] via-[#A78BFA] to-[#8054b8]",
  "from-[#8054b8] via-indigo-500 to-[#8054b8]",
  "from-[#8054b8] via-fuchsia-500 to-pink-500",
];

export default function MyCompetitorsPage() {
  const supabase = createClient();
  const { locale, user } = useAppStore();
  const isAr = locale === "ar";

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  async function loadData() {
    if (!user) { setLoading(false); return; }
    try {
      const [analysesRes, companiesRes] = await Promise.all([
        supabase.from("competitor_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("companies").select("id, name, name_ar, logo_url, brand_colors").eq("user_id", user.id),
      ]);
      setAnalyses((analysesRes.data as SavedAnalysis[]) ?? []);
      setCompanies((companiesRes.data as CompanyInfo[]) ?? []);
    } catch { /* table may not exist yet */ }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setDeletingId(null); return; }
    const { error } = await supabase.from("competitor_analyses").delete().eq("id", id).eq("user_id", u.id);
    if (error) {
      toast.error(isAr ? "فشل الحذف" : "Failed to delete");
    } else {
      toast.success(isAr ? "تم الحذف" : "Deleted");
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  function handleExportPdf(analysis: SavedAnalysis) {
    const company = companies.find((c) => c.id === analysis.company_id);
    const companyName = company ? (isAr && company.name_ar ? company.name_ar : company.name) : "Analysis";
    loadExportCompetitorPdf().then(fn => fn(analysis.analysis_data, companyName, analysis.competitors, (analysis.output_language || locale) as "en" | "ar"));
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e8eaef] via-[#E8F5EC] to-[#e8eaef] p-8">
          <Skeleton className="h-10 w-80 rounded-xl bg-white/50" />
          <Skeleton className="mt-3 h-6 w-60 rounded-lg bg-white/30" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-[#e8eaef] bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#e8eaef] via-[#E8F5EC] to-[#e8eaef]" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-full rounded-lg bg-[#e8eaef]/40" />
                <Skeleton className="h-5 w-3/4 rounded-lg bg-[#e8eaef]/30" />
                <Skeleton className="h-12 w-full rounded-xl bg-[#e8eaef]/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (analyses.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl nl-aurora-bg p-8 md:p-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-sm">
            {isAr ? "تحليلاتي التنافسية" : "My Competitor Analyses"}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-white/80 text-xl sm:text-2xl">
            <Swords className="h-5 w-5" />
            <span>{isAr ? "عرض وإدارة جميع تحليلات المنافسين المحفوظة" : "View and manage all your saved competitor analyses"}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] py-24 px-6">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#23ab7e] via-[#8054b8] to-[#8054b8] shadow-lg">
              <Swords className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-8 text-2xl font-bold text-[#1a1d2e]">{isAr ? "لا توجد تحليلات محفوظة بعد" : "No saved analyses yet"}</p>
          <p className="mt-3 text-lg text-[#8f96a3] max-w-md text-center leading-relaxed">
            {isAr ? "انتقل إلى تحليل المنافسين لإنشاء وحفظ أول تحليل" : "Go to Competitor Analysis to create and save your first analysis"}
          </p>
          <a href="/competitor-analysis" className="mt-8 inline-flex h-14 items-center justify-center gap-3 px-10 text-lg font-bold rounded-2xl nl-aurora-bg text-white hover:shadow-md transition-all duration-300 shadow-lg hover:scale-[1.02]">
            <Swords className="h-6 w-6" />
            {isAr ? "اذهب إلى تحليل المنافسين" : "Go to Competitor Analysis"}
          </a>
        </div>
      </div>
    );
  }

  /* ── Main view ── */
  const expandedAnalysis = analyses.find((a) => a.id === expandedId);

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Swords className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">{isAr ? "تحليلاتي" : "My Analyses"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {isAr ? "تحليلات المنافسين المحفوظة" : "Saved Competitor Analyses"}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">
            {isAr ? "راجع وقارن تحليلاتك السابقة" : "Review and compare your previous analyses"}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis, i) => {
          const isExpanded = expandedId === analysis.id;
          const company = companies.find((c) => c.id === analysis.company_id);
          const accentIdx = i % ACCENT_COLORS.length;
          const competitorNames = analysis.competitors?.map((c) => c.name).join(", ") || "—";
          const data = analysis.analysis_data;
          const brandScore = data?.brandAssessment?.overallScore ?? 0;

          return (
            <div key={analysis.id} className={cn("group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:shadow-lg", isExpanded ? "border-[#23ab7e]/50 shadow-lg" : "border-[#e8eaef] hover:border-[#23ab7e]/40")}>
              <div className={cn("h-2 bg-gradient-to-r", ACCENT_COLORS[accentIdx])} />
              <div className="p-6">
                {/* Company */}
                {company && (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden border-2 border-[#e8eaef] shadow-sm" style={{ backgroundColor: company.brand_colors?.[0] || "#f4f6f8" }}>
                      {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xl font-extrabold text-white drop-shadow-sm">{company.name?.charAt(0) || "?"}</span>}
                    </div>
                    <span className="text-lg font-bold text-[#1a1d2e]">{isAr ? company.name_ar || company.name : company.name}</span>
                  </div>
                )}

                {/* Competitors */}
                <h3 className="text-2xl font-extrabold text-[#1a1d2e] leading-snug line-clamp-2">
                  {isAr ? "vs " : "vs "}{competitorNames}
                </h3>

                {/* Score + Competitor count */}
                <div className="mt-3 flex items-center gap-4">
                  <ScoreCircle score={brandScore} size={56} />
                  <div>
                    <p className="text-lg font-bold text-[#8f96a3]">{isAr ? "نتيجة علامتك" : "Your Brand Score"}</p>
                    <p className="text-lg font-bold text-[#2d3142]">{data?.competitors?.length ?? 0} {isAr ? "منافسين" : "competitors"}</p>
                  </div>
                </div>

                {/* Competitor threat pills */}
                {data?.competitors && data.competitors.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.competitors.map((c) => (
                      <div key={c.name} className="flex items-center gap-1.5 rounded-xl bg-[#fafbfd] border border-[#e8eaef] px-3 py-1.5">
                        <span className="text-base font-bold text-[#2d3142]">{c.name}</span>
                        <ThreatBadge level={c.threatLevel} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Language + Date */}
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1 text-base text-[#8f96a3]">
                    {analysis.output_language === "ar" ? "العربية" : "English"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6f8] border border-[#e8eaef] px-3 py-1 text-base text-[#8f96a3]">
                    <Clock className="h-3.5 w-3.5" />
                    {(() => { try { return format(parseISO(analysis.created_at), "MMM d, yyyy"); } catch { return analysis.created_at; } })()}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <Button onClick={() => setExpandedId(isExpanded ? null : analysis.id)} className={cn("flex-1 h-12 rounded-xl text-lg font-bold transition-all", isExpanded ? "bg-[#23ab7e] text-white hover:bg-[#23ab7e]/90" : "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white hover:shadow-sm shadow-md hover:scale-[1.02]")}>
                    {isExpanded ? <><ChevronUp className="mr-2 h-5 w-5" />{isAr ? "إخفاء" : "Collapse"}</> : <><Eye className="mr-2 h-5 w-5" />{isAr ? "عرض التحليل" : "View Analysis"}</>}
                  </Button>
                  <Button onClick={() => handleExportPdf(analysis)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#e8eaef] text-[#23ab7e] hover:bg-[#f4f6f8]">
                    <Download className="h-5 w-5" />
                  </Button>
                  {confirmDeleteId === analysis.id ? (
                    <div className="flex gap-1.5">
                      <Button onClick={() => handleDelete(analysis.id)} disabled={deletingId === analysis.id} className="h-12 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 text-lg font-bold">
                        {deletingId === analysis.id ? <Loader2 className="h-5 w-5 animate-spin" /> : isAr ? "تأكيد" : "Yes"}
                      </Button>
                      <Button onClick={() => setConfirmDeleteId(null)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#e8eaef] text-[#8f96a3]">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setConfirmDeleteId(analysis.id)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#e8eaef] text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Expanded Analysis Detail ── */}
      {expandedAnalysis && expandedAnalysis.analysis_data && (() => {
        const data = expandedAnalysis.analysis_data;
        const company = companies.find((c) => c.id === expandedAnalysis.company_id);
        const companyName = company ? (isAr && company.name_ar ? company.name_ar : company.name) : "";
        return (
          <div className="rounded-2xl border-2 border-[#23ab7e]/20 bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden nl-aurora-bg px-6 py-6 lg:px-8 lg:py-8">
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                      <Swords className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-sm">
                        {isAr ? "تحليل المنافسين" : "Competitor Analysis"} — {companyName}
                      </h2>
                      <p className="text-lg text-white/80">
                        vs {expandedAnalysis.competitors.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setExpandedId(null)} className="h-12 px-5 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 text-lg font-bold">
                  <ChevronUp className="mr-2 h-5 w-5" /> {isAr ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              {/* Executive Summary */}
              <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142] mb-4"><Target className="h-6 w-6 text-[#23ab7e]" />{isAr ? "الملخص التنفيذي" : "Executive Summary"}</h3>
                <p className="text-lg leading-8 text-[#505868] whitespace-pre-line">{data.executiveSummary}</p>
              </div>

              {/* Brand Assessment */}
              <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142]"><Shield className="h-6 w-6 text-[#23ab7e]" />{isAr ? "تقييم علامتك" : "Brand Assessment"}</h3>
                  <ScoreCircle score={data.brandAssessment.overallScore} size={72} />
                </div>
                {data.brandAssessment.marketPosition && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border border-[#e8eaef] mb-5">
                    <p className="text-lg text-[#505868] leading-7">{data.brandAssessment.marketPosition}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-green-50/50 border border-green-200">
                    <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" />{isAr ? "نقاط القوة" : "Strengths"}</h4>
                    <ul className="space-y-2">{data.brandAssessment.strengths.map((s, i) => <li key={i} className="text-lg text-[#505868] leading-7">+ {s}</li>)}</ul>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
                    <h4 className="font-black text-lg text-red-600 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{isAr ? "نقاط الضعف" : "Weaknesses"}</h4>
                    <ul className="space-y-2">{data.brandAssessment.weaknesses.map((w, i) => <li key={i} className="text-lg text-[#505868] leading-7">- {w}</li>)}</ul>
                  </div>
                </div>
              </div>

              {/* Competitor Cards */}
              <div>
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142] mb-5"><Swords className="h-6 w-6 text-[#23ab7e]" />{isAr ? "ملفات المنافسين" : "Competitor Profiles"}</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {data.competitors.map((comp, i) => (
                    <div key={i} className="rounded-2xl border-2 border-[#e8eaef] bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <ScoreCircle score={comp.overallScore} size={52} />
                          <div>
                            <h4 className="font-black text-xl text-[#2d3142]">{comp.name}</h4>
                            <p className="text-base text-[#8f96a3]">{comp.handle} · {comp.platform}</p>
                          </div>
                        </div>
                        <ThreatBadge level={comp.threatLevel} />
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border border-[#e8eaef] mb-4">
                        <p className="text-sm font-black text-[#23ab7e] uppercase tracking-wider mb-1">{isAr ? "الرؤية الرئيسية" : "KEY INSIGHT"}</p>
                        <p className="text-base text-[#2d3142] leading-6">{comp.keyInsight}</p>
                      </div>
                      {comp.stealThisMove && (
                        <div className="p-4 rounded-xl bg-[#8054b8]/5 border border-[#8054b8]/20 mb-4">
                          <p className="text-sm font-black text-[#8054b8] uppercase tracking-wider mb-1 flex items-center gap-1"><Star className="h-3 w-3" />{isAr ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</p>
                          <p className="text-base text-[#2d3142] leading-6">{comp.stealThisMove}</p>
                        </div>
                      )}
                      {/* Business Intelligence */}
                      {(comp.companyOverview || comp.productsAndServices || comp.websiteAnalysis) && (
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          {[
                            { value: comp.companyOverview, label: isAr ? "نظرة عامة" : "Overview", Icon: Building2 },
                            { value: comp.productsAndServices, label: isAr ? "المنتجات" : "Products", Icon: Package },
                            { value: comp.targetMarket, label: isAr ? "السوق المستهدف" : "Target Market", Icon: Users },
                            { value: comp.brandPositioning, label: isAr ? "التموضع" : "Positioning", Icon: Crosshair },
                            { value: comp.websiteAnalysis, label: isAr ? "الموقع" : "Website", Icon: Globe },
                            { value: comp.digitalPresence, label: isAr ? "الحضور الرقمي" : "Digital Presence", Icon: Eye },
                            { value: comp.pricingStrategy, label: isAr ? "التسعير" : "Pricing", Icon: DollarSign },
                            { value: comp.customerReviews, label: isAr ? "المراجعات" : "Reviews", Icon: Star },
                            { value: comp.technologyStack, label: isAr ? "التقنية" : "Tech Stack", Icon: Layers },
                          ].filter(item => item.value).map((item) => (
                            <div key={item.label} className="p-3 rounded-lg bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-sm font-black text-[#23ab7e] mb-1 flex items-center gap-1"><item.Icon className="h-3 w-3" />{item.label}</p>
                              <p className="text-base text-[#505868] leading-6">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-green-50/50 border border-green-200">
                          <p className="text-sm font-black text-[#23ab7e] mb-1">{isAr ? "القوة" : "Strengths"}</p>
                          {comp.strengths.slice(0, 3).map((s, j) => <p key={j} className="text-base text-[#505868] leading-5">+ {s}</p>)}
                        </div>
                        <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                          <p className="text-sm font-black text-red-600 mb-1">{isAr ? "الضعف" : "Weak Points"}</p>
                          {comp.weakPoints.slice(0, 3).map((w, j) => <p key={j} className="text-base text-[#505868] leading-5">- {w}</p>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Matrix */}
              {data.comparisonMatrix && (
                <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142] mb-5"><BarChart3 className="h-6 w-6 text-[#23ab7e]" />{isAr ? "مصفوفة المقارنة" : "Comparison Matrix"}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#e8eaef]">
                          <th className="text-start py-3 px-3 font-black text-base text-[#8f96a3]">{isAr ? "الفئة" : "Category"}</th>
                          <th className="text-start py-3 px-3 font-black text-base text-[#23ab7e]">{isAr ? "علامتك" : "Your Brand"}</th>
                          {Object.keys(data.comparisonMatrix.competitors).map((n) => <th key={n} className="text-start py-3 px-3 font-black text-base text-[#2d3142]">{n}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {data.comparisonMatrix.categories.map((cat, idx) => (
                          <tr key={cat} className="border-b border-[#e8eaef]/50">
                            <td className="py-3 px-3 font-bold text-base text-[#8f96a3]">{cat}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 bg-[#E8F0EA] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#23ab7e]" style={{ width: `${data.comparisonMatrix.yourBrand[idx]}%` }} /></div>
                                <span className="text-base font-bold w-8 text-right">{data.comparisonMatrix.yourBrand[idx]}</span>
                              </div>
                            </td>
                            {Object.entries(data.comparisonMatrix.competitors).map(([n, scores]) => {
                              const s = scores[idx];
                              const c = s >= 70 ? "#23ab7e" : s >= 40 ? "#F59E0B" : "#ef4444";
                              return (
                                <td key={n} className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2.5 bg-[#E8F0EA] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s}%`, backgroundColor: c }} /></div>
                                    <span className="text-base font-bold w-8 text-right">{s}</span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Strategy Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-xl font-black text-[#2d3142] mb-4"><Rocket className="h-5 w-5 text-red-500" />{isAr ? "إجراءات فورية" : "Immediate Actions"}</h3>
                  <div className="space-y-3">
                    {data.winningStrategy.immediate.slice(0, 3).map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                        <p className="text-lg text-[#2d3142] leading-6">{a.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-xl font-black text-[#2d3142] mb-4"><Calendar className="h-5 w-5 text-[#8054b8]" />{isAr ? "إجراءات قصيرة المدى" : "Short-Term Actions"}</h3>
                  <div className="space-y-3">
                    {data.winningStrategy.shortTerm.slice(0, 3).map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-yellow-50/30 border border-yellow-100">
                        <p className="text-lg text-[#2d3142] leading-6">{a.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Gaps + Differentiators */}
              {(data.winningStrategy.contentGaps?.length > 0 || data.winningStrategy.differentiators?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {data.winningStrategy.contentGaps?.length > 0 && (
                    <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                      <h3 className="flex items-center gap-3 text-xl font-black text-[#2d3142] mb-4"><Sparkles className="h-5 w-5 text-[#8054b8]" />{isAr ? "فجوات المحتوى" : "Content Gaps"}</h3>
                      <div className="space-y-2">{data.winningStrategy.contentGaps.map((g, i) => <p key={i} className="text-lg text-[#505868] leading-6 flex items-start gap-2"><span className="text-[#8054b8] mt-0.5">•</span>{g}</p>)}</div>
                    </div>
                  )}
                  {data.winningStrategy.differentiators?.length > 0 && (
                    <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                      <h3 className="flex items-center gap-3 text-xl font-black text-[#2d3142] mb-4"><Shield className="h-5 w-5 text-[#23ab7e]" />{isAr ? "عوامل التميز" : "Differentiators"}</h3>
                      <div className="space-y-2">{data.winningStrategy.differentiators.map((d, i) => <p key={i} className="text-lg text-[#505868] leading-6 flex items-start gap-2"><span className="text-[#23ab7e] mt-0.5">•</span>{d}</p>)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Saudi Market */}
              <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142] mb-5"><Building2 className="h-6 w-6 text-[#23ab7e]" />{isAr ? "رؤى السوق السعودي" : "Saudi Market Insights"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                    <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "التوافق مع الاتجاهات" : "Trend Alignment"}</h4>
                    <p className="text-base text-[#505868] leading-6">{data.saudiMarketInsights.trendAlignment}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                    <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "صلة برؤية 2030" : "Vision 2030"}</h4>
                    <p className="text-base text-[#505868] leading-6">{data.saudiMarketInsights.vision2030Relevance}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                    <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "التوافق الثقافي" : "Cultural Fit"}</h4>
                    <p className="text-base text-[#505868] leading-6">{data.saudiMarketInsights.culturalFit}</p>
                  </div>
                  {data.saudiMarketInsights.ramadanStrategy && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border border-[#8054b8]/20">
                      <h4 className="font-black text-base text-[#8054b8] mb-1 flex items-center gap-1"><Star className="h-3 w-3" />{isAr ? "استراتيجية رمضان" : "Ramadan Strategy"}</h4>
                      <p className="text-base text-[#505868] leading-6">{data.saudiMarketInsights.ramadanStrategy}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Industry Analysis */}
              {data.industryAnalysis && (
                <div className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-2xl font-black text-[#2d3142] mb-5"><TrendingUp className="h-6 w-6 text-[#23ab7e]" />{isAr ? "تحليل الصناعة" : "Industry Analysis"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "نظرة عامة على السوق" : "Market Overview"}</h4>
                      <p className="text-base text-[#505868] leading-6">{data.industryAnalysis.marketOverview}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "المشهد التنافسي" : "Competitive Landscape"}</h4>
                      <p className="text-base text-[#505868] leading-6">{data.industryAnalysis.competitiveLandscape}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "اتجاهات المستهلكين" : "Consumer Trends"}</h4>
                      <p className="text-base text-[#505868] leading-6">{data.industryAnalysis.consumerTrends}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-base text-[#23ab7e] mb-1">{isAr ? "التوقعات المستقبلية" : "Future Outlook"}</h4>
                      <p className="text-base text-[#505868] leading-6">{data.industryAnalysis.futureOutlook}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
