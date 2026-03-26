"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Swords, Plus, Trash2, Download, Save, Loader2,
  ChevronDown, AlertTriangle, Target, TrendingUp,
  Shield, Zap, Clock, Calendar, Rocket, Lightbulb, BarChart3,
  Building2, Eye, Star, Crosshair, Globe, Sparkles, ArrowRight,
  Package, Users, DollarSign, Layers,
} from "lucide-react";
import { useAppStore, type Company } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { messages } from "@/lib/i18n";
// Dynamic import to avoid loading 150KB+ jsPDF+html2canvas eagerly
const loadExportCompetitorPdf = () => import("@/lib/export-competitor-pdf").then(m => m.exportCompetitorPdf);

interface Competitor { name: string; handle: string; platform: string; websiteUrl: string; }
interface StrategyAction { action: string; priority: string; impact: string; kpi?: string; }
interface ContentSeries { name: string; description: string; platform: string; }
interface CompetitorResult {
  name: string; handle: string; platform: string; postingFrequency: string;
  contentTypes: string[]; contentThemes?: string[]; captionStyle: string; hashtagStrategy: string;
  engagementLevel: string; visualStyle: string; audienceProfile?: string; contentCalendar?: string;
  paidStrategy?: string; strengths: string[]; weakPoints: string[]; threatLevel: number;
  overallScore: number; keyInsight: string; stealThisMove?: string;
  companyOverview?: string; productsAndServices?: string; targetMarket?: string;
  brandPositioning?: string; websiteAnalysis?: string; digitalPresence?: string;
  pricingStrategy?: string; customerReviews?: string; technologyStack?: string;
}
interface IndustryAnalysis {
  marketOverview: string; competitiveLandscape: string; consumerTrends: string; futureOutlook: string;
}
interface AnalysisData {
  executiveSummary: string;
  brandAssessment: {
    strengths: string[]; weaknesses: string[]; opportunities?: string[]; threats?: string[];
    overallScore: number; marketPosition?: string;
  };
  competitors: CompetitorResult[];
  comparisonMatrix: { categories: string[]; yourBrand: number[]; competitors: Record<string, number[]>; };
  winningStrategy: {
    immediate: StrategyAction[]; shortTerm: StrategyAction[]; longTerm: StrategyAction[];
    contentGaps: string[]; differentiators: string[]; quickWins?: string[];
    contentSeries?: ContentSeries[];
  };
  saudiMarketInsights: {
    trendAlignment: string; vision2030Relevance: string; culturalFit: string;
    localOpportunities?: string; ramadanStrategy?: string;
  };
  industryAnalysis?: IndustryAnalysis;
}
interface SavedAnalysis { id: string; company_id: string; competitors: Competitor[]; analysis_data: AnalysisData; output_language: string; created_at: string; }

const PLATFORMS = [
  { value: "instagram", label: "Instagram" }, { value: "twitter", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" }, { value: "snapchat", label: "Snapchat" },
  { value: "linkedin", label: "LinkedIn" },
];
const emptyCompetitor: Competitor = { name: "", handle: "", platform: "instagram", websiteUrl: "" };

function ScoreBar({ score, color, height = "h-3" }: { score: number; color?: string; height?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${height} bg-[#E8F0EA] rounded-full overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${score}%`, backgroundColor: color || (score >= 70 ? "#23ab7e" : score >= 40 ? "#F59E0B" : "#ef4444") }} />
      </div>
      <span className="text-base font-bold font-mono w-10 text-right text-[#2d3142]">{score}</span>
    </div>
  );
}

function ScoreCircle({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;
  const gradientId = `score-grad-${score}-${Math.random().toString(36).slice(2, 6)}`;
  const startColor = score >= 70 ? "#23ab7e" : score >= 40 ? "#F59E0B" : "#ef4444";
  const endColor = score >= 70 ? "#8054b8" : score >= 40 ? "#ef4444" : "#F59E0B";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="34" fill="none" stroke="#E8F0EA" strokeWidth="6" />
        <circle cx="40" cy="40" r="34" fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" className="transition-all duration-1000 ease-out" />
        <text x="40" y="44" textAnchor="middle" className="fill-[#2d3142] text-xl font-bold" style={{ fontSize: "20px", fontWeight: 800 }}>{score}</text>
      </svg>
      {label && <span className="text-lg font-bold text-[#8f96a3] text-center">{label}</span>}
    </div>
  );
}

function ThreatBadge({ level }: { level: number }) {
  const cfg = level >= 7 ? { bg: "bg-red-100 text-red-700 border-red-200", label: "HIGH THREAT" } : level >= 4 ? { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "MEDIUM" } : { bg: "bg-green-100 text-[#23ab7e] border-[#e8eaef]", label: "LOW" };
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border-2 ${cfg.bg}`}><AlertTriangle className="h-4 w-4" />{cfg.label} ({level}/10)</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const c: Record<string, string> = { high: "bg-red-100 text-red-700 border-red-200", medium: "bg-yellow-100 text-yellow-800 border-yellow-200", low: "bg-green-100 text-[#23ab7e] border-[#e8eaef]" };
  return <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold border-2 uppercase tracking-wide ${c[priority.toLowerCase()] || c.medium}`}>{priority}</span>;
}

function SectionCard({ children, className = "", accentColor }: { children: React.ReactNode; className?: string; accentColor?: string }) {
  return (
    <div className={`rounded-3xl border border-white/20 p-8 relative overflow-hidden ${className}`} style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
      {accentColor && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: accentColor }} />}
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, color = "text-[#23ab7e]" }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; color?: string }) {
  return <h3 className={`flex items-center gap-3 text-2xl font-extrabold text-[#2d3142] mb-5`}><Icon className={`h-6 w-6 ${color}`} />{children}</h3>;
}

export default function CompetitorAnalysisPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const t = messages[locale].competitorAnalysis;
  const isRtl = locale === "ar";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([{ ...emptyCompetitor }]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "compare" | "strategy">("overview");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">(locale as "en" | "ar");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const loadingInterval = useRef<NodeJS.Timeout | null>(null);

  const funnyMessages = locale === "ar" ? [
    "اصبر يا حبيبي... مو كل شي بالحياة يجي بسرعة نودلز 🍜",
    "قاعدين نتجسس على منافسينك... بشكل قانوني طبعاً 🕵️",
    "الذكاء الاصطناعي يشتغل... روح سوي لك قهوة ☕",
    "نحلل بياناتهم بعمق... أعمق من محادثاتك الساعة 3 الفجر 🌙",
    "مو كل شي بالحياة يخلص بثانية... إلا رصيدك 💸",
    "قاعدين نفك شفراتهم... أنت بس اقعد وتنفس 😮‍💨",
    "الصبر مفتاح الفرج... والتحليل الخرافي 🔑",
    "تحليل عميق جداً... مثل أفكارك الساعة 4 الفجر 🧠",
    "قاعدين ندمر منافسينك رقمياً... لا تقلق 💀",
    "الحين الحين... بس خلنا نخلص شغلنا أول 😤",
    "هذا التحليل بيفجر مخك... بس اصبر شوي 🤯",
    "منافسينك ما يعرفون إيش جاي عليهم 😈",
  ] : [
    "Chill... not everything in life loads faster than your TikTok feed 🍿",
    "We're stalking your competitors... legally, of course 🕵️",
    "AI is cooking... go grab a coffee, you deserve it ☕",
    "Deep-diving into their data... deeper than your 3 AM thoughts 🌙",
    "Rome wasn't built in a day, and neither is a killer analysis 🏛️",
    "Patience is a virtue... and so is destroying your competition 💅",
    "Hacking into the Matrix... just kidding, we're scraping websites 😎",
    "Your competitors have no idea what's about to hit them 😈",
    "Loading genius takes time... unlike your ex's excuses 💀",
    "We're basically doing $200K worth of consulting for you rn 💰",
    "Sit tight... the AI is having its main character moment 🎬",
    "Brewing competitive intelligence... with extra shots of espresso ☕",
    "If this was easy, everyone would do it. But here we are 👑",
    "Almost there... jk we just started. But it'll be worth it 🔥",
  ];

  useEffect(() => {
    if (loading) {
      setLoadingMsg(0);
      loadingInterval.current = setInterval(() => {
        setLoadingMsg((prev) => (prev + 1) % funnyMessages.length);
      }, 4000);
    } else {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    }
    return () => { if (loadingInterval.current) clearInterval(loadingInterval.current); };
  }, [loading, funnyMessages.length]);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("companies").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setCompanies(data); });
  }, [user?.id]);

  const loadSavedAnalyses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.from("competitor_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (data) setSavedAnalyses(data);
    } catch { /* table may not exist */ }
  }, [user?.id]);

  useEffect(() => { loadSavedAnalyses(); }, [loadSavedAnalyses]);

  const addCompetitor = () => { if (competitors.length < 5) setCompetitors([...competitors, { ...emptyCompetitor }]); };
  const removeCompetitor = (i: number) => setCompetitors(competitors.filter((_, j) => j !== i));
  const updateCompetitor = (i: number, f: keyof Competitor, v: string) => { const u = [...competitors]; u[i] = { ...u[i], [f]: v } as Competitor; setCompetitors(u); };

  const runAnalysis = async () => {
    if (!selectedCompany) { setError(t.selectCompany); return; }
    const valid = competitors.filter((c) => c.name.trim());
    if (!valid.length) { setError(locale === "ar" ? "أضف منافساً واحداً على الأقل" : "Add at least one competitor with a name"); return; }
    setLoading(true); setError(""); setAnalysisData(null);
    try {
      const res = await fetch("/api/competitor-analysis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: selectedCompany.name, companyDescription: selectedCompany.description || "", competitors: valid, outputLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysisData(data.analysis);
      setActiveTab("overview");
    } catch (err) { setError(err instanceof Error ? err.message : t.errorAnalyzing); } finally { setLoading(false); }
  };

  const saveAnalysis = async () => {
    if (!user?.id || !analysisData || !selectedCompany) return;
    setSaving(true); setSaveStatus("");
    try {
      const supabase = createClient();
      const { error: e } = await supabase.from("competitor_analyses").insert({ user_id: user.id, company_id: selectedCompany.id, competitors, analysis_data: analysisData, output_language: outputLanguage });
      if (e) throw e;
      setSaveStatus(t.saved); loadSavedAnalyses(); setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus("Error"); } finally { setSaving(false); }
  };

  const loadAnalysis = (s: SavedAnalysis) => { setCompetitors(s.competitors); setAnalysisData(s.analysis_data); setShowPrevious(false); setActiveTab("overview"); };
  const deleteAnalysis = async (id: string) => { if (!user) return; const supabase = createClient(); await supabase.from("competitor_analyses").delete().eq("id", id).eq("user_id", user.id); loadSavedAnalyses(); };
  const handleExportPdf = async () => { if (analysisData && selectedCompany) { const fn = await loadExportCompetitorPdf(); await fn(analysisData, selectedCompany.name, competitors, outputLanguage); } };

  return (
    <div className="space-y-8 w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Swords className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {t.pageTitle}
            </h1>
            <p className="mt-2 text-base text-white/60">{t.pageSub}</p>
          </div>
        </div>
      </div>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        {analysisData && (
          <>
            <button onClick={handleExportPdf} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#e8eaef] text-lg font-bold text-[#505868] hover:bg-[#f4f6f8] transition-colors">
              <Download className="h-5 w-5" /> {t.exportPdf}
            </button>
            <button onClick={saveAnalysis} disabled={saving} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-lg font-bold text-white shadow-md hover:shadow-lg transition-all">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saveStatus || t.save}
            </button>
          </>
        )}
        <button onClick={() => setShowPrevious(!showPrevious)} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#e8eaef] text-lg font-bold text-[#505868] hover:bg-[#f4f6f8] transition-colors">
          <Clock className="h-5 w-5" /> {t.loadPrevious}
          <ChevronDown className={`h-4 w-4 transition-transform ${showPrevious ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Previous Analyses */}
      {showPrevious && (
        <SectionCard>
          <h3 className="font-extrabold text-2xl text-[#2d3142] mb-4">{t.loadPrevious}</h3>
          {savedAnalyses.length === 0 ? <p className="text-lg text-[#8f96a3]">{t.noPreviousAnalyses}</p> : (
            <div className="space-y-3">{savedAnalyses.map((sa) => (
              <div key={sa.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-[#e8eaef] hover:bg-[#f4f6f8] transition-colors">
                <div><p className="text-lg font-bold text-[#2d3142]">{sa.competitors?.map((c) => c.name).join(", ")}</p><p className="text-sm text-[#8f96a3]">{new Date(sa.created_at).toLocaleDateString()}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => loadAnalysis(sa)} className="px-4 py-2 rounded-xl border-2 border-[#23ab7e] text-lg font-bold text-[#23ab7e] hover:bg-[#f4f6f8]">{t.load}</button>
                  <button onClick={() => deleteAnalysis(sa.id)} className="p-2 rounded-xl text-[#8f96a3] hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}</div>
          )}
        </SectionCard>
      )}

      {/* ═══ COMPANY SELECTOR ═══ */}
      <div className="rounded-3xl border border-white/20 p-8" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] text-white font-black text-sm">1</div>
          <Building2 className="h-6 w-6 text-[#23ab7e]" />
          <h3 className="font-extrabold text-2xl text-[#2d3142]">{locale === "ar" ? "اختر الشركة" : "Select Company"}</h3>
        </div>
        {companies.length === 0 ? (
          <p className="text-lg text-[#8f96a3]">{locale === "ar" ? "لا توجد شركات. أضف شركة أولاً." : "No companies found. Add one from Companies page."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((c) => (
              <button key={c.id} onClick={() => setSelectedCompany(c)} className={`p-5 rounded-2xl border-2 text-start transition-all ${selectedCompany?.id === c.id ? "border-[#23ab7e] bg-[#f4f6f8] shadow-[0_0_0_4px_rgba(35,171,126,0.1)]" : "border-[#e8eaef] hover:border-[#8054b8] hover:bg-[#fafbfd]"}`}>
                <p className="font-bold text-xl text-[#2d3142] truncate">{c.name}</p>
                {c.industry && <p className="text-lg text-[#8f96a3] mt-1">{c.industry}</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══ COMPETITOR INPUT ═══ */}
      <div className="rounded-3xl border border-white/20 p-8 space-y-5" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#6d3fa0] text-white font-black text-sm">2</div>
            <div>
              <h3 className="font-extrabold text-2xl text-[#2d3142]">{t.addCompetitor}</h3>
              <p className="text-lg text-[#8f96a3]">{t.maxCompetitors} · {competitors.length}/5</p>
            </div>
          </div>
          <button onClick={addCompetitor} disabled={competitors.length >= 5} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#e8eaef] text-lg font-bold text-[#23ab7e] hover:bg-[#f4f6f8] disabled:opacity-40 transition-colors">
            <Plus className="h-5 w-5" /> {t.addCompetitor}
          </button>
        </div>

        {competitors.map((comp, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_1fr_auto] gap-4 items-end p-5 rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd]">
            <div>
              <label className="text-lg font-bold text-[#8f96a3] mb-1.5 block">{t.competitorName}</label>
              <input value={comp.name} onChange={(e) => updateCompetitor(idx, "name", e.target.value)} placeholder={locale === "ar" ? "اسم المنافس" : "Competitor name"} className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-4 text-lg text-[#2d3142] focus:border-[#23ab7e] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-lg font-bold text-[#8f96a3] mb-1.5 block">{t.socialHandle}</label>
              <input value={comp.handle} onChange={(e) => updateCompetitor(idx, "handle", e.target.value)} placeholder="@handle" className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-4 text-lg text-[#2d3142] focus:border-[#23ab7e] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-lg font-bold text-[#8f96a3] mb-1.5 block">{t.platform}</label>
              <select value={comp.platform} onChange={(e) => updateCompetitor(idx, "platform", e.target.value)} className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-4 text-lg text-[#2d3142] focus:border-[#23ab7e] focus:outline-none transition-colors">
                {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-lg font-bold text-[#8f96a3] mb-1.5 block">{t.websiteUrl}</label>
              <input value={comp.websiteUrl} onChange={(e) => updateCompetitor(idx, "websiteUrl", e.target.value)} placeholder="https://..." className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-4 text-lg text-[#2d3142] focus:border-[#23ab7e] focus:outline-none transition-colors" />
            </div>
            {competitors.length > 1 && (
              <button onClick={() => removeCompetitor(idx)} className="h-14 w-14 flex items-center justify-center rounded-2xl text-[#8f96a3] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
            )}
          </div>
        ))}

        {error && <p className="text-lg text-red-600 flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" /> {error}</p>}

        {/* Language Toggle */}
        <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd]">
          <div>
            <h4 className="font-bold text-lg text-[#2d3142]">{locale === "ar" ? "لغة التحليل" : "Analysis Language"}</h4>
            <p className="text-base text-[#8f96a3]">{locale === "ar" ? "اختر لغة نتائج التحليل والتقرير" : "Choose the language for the analysis output & PDF report"}</p>
          </div>
          <div className="flex rounded-xl border-2 border-[#e8eaef] overflow-hidden">
            <button
              onClick={() => setOutputLanguage("en")}
              className={`px-6 py-3 text-lg font-bold transition-all ${outputLanguage === "en" ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white" : "bg-white text-[#8f96a3] hover:bg-[#f4f6f8]"}`}
            >
              English
            </button>
            <button
              onClick={() => setOutputLanguage("ar")}
              className={`px-6 py-3 text-lg font-bold transition-all ${outputLanguage === "ar" ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white" : "bg-white text-[#8f96a3] hover:bg-[#f4f6f8]"}`}
            >
              العربية
            </button>
          </div>
        </div>
      </div>

      {/* ═══ ANALYZE BUTTON ═══ */}
      <div className="rounded-3xl border border-white/20 p-8" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] text-white font-black text-sm">3</div>
          <h3 className="font-extrabold text-2xl text-[#2d3142]">{locale === "ar" ? "ابدأ التحليل" : "Launch Analysis"}</h3>
        </div>
        <button onClick={runAnalysis} disabled={loading} className="group relative w-full h-16 rounded-2xl bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#23ab7e] bg-[length:200%_100%] text-white text-xl font-black shadow-[0_6px_24px_rgba(35,171,126,0.3)] hover:shadow-[0_8px_32px_rgba(35,171,126,0.4)] disabled:opacity-60 transition-all flex items-center justify-center gap-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10 flex items-center gap-3">
            {loading ? <><Loader2 className="h-6 w-6 animate-spin" /> {t.analyzing}</> : <><Swords className="h-6 w-6" /> {t.analyze}</>}
          </span>
        </button>
      </div>

      {/* ═══ RESULTS ═══ */}
      {analysisData && (
        <div className="space-y-6">
          {/* Tab bar */}
          <div className="flex rounded-3xl border border-white/20 p-1.5 gap-1.5" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
            {([
              { key: "overview" as const, label: t.overview, icon: Target },
              { key: "compare" as const, label: t.compare, icon: BarChart3 },
              { key: "strategy" as const, label: t.winningStrategy, icon: Rocket },
            ]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-lg font-bold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg" : "text-[#8f96a3] hover:bg-[#f4f6f8]"}`}>
                <tab.icon className="h-5 w-5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <SectionCard accentColor="linear-gradient(90deg, #23ab7e, #8054b8)">
                <SectionTitle icon={Target}>{t.executiveSummary}</SectionTitle>
                <p className="text-lg leading-relaxed text-[#505868] whitespace-pre-line">{analysisData.executiveSummary}</p>
              </SectionCard>

              {/* Brand Assessment — SWOT style */}
              <SectionCard accentColor="linear-gradient(90deg, #23ab7e, #10b981)">
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle icon={Shield}>{t.brandAssessment}</SectionTitle>
                  <ScoreCircle score={analysisData.brandAssessment.overallScore} size={100} />
                </div>
                {analysisData.brandAssessment.marketPosition && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border border-[#e8eaef] mb-6">
                    <p className="text-lg text-[#505868] leading-relaxed font-medium">{analysisData.brandAssessment.marketPosition}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl border border-[#23ab7e]/20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(35,171,126,0.08), rgba(16,185,129,0.04))" }}>
                    <h4 className="font-bold text-xl text-[#23ab7e] mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> {t.strengths}</h4>
                    <ul className="space-y-2.5">{analysisData.brandAssessment.strengths.map((s, i) => <li key={i} className="text-lg text-[#505868] leading-relaxed flex items-start gap-2"><span className="text-[#23ab7e] font-bold text-xl mt-0.5">+</span><span>{s}</span></li>)}</ul>
                  </div>
                  <div className="p-5 rounded-2xl border border-red-200/40 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(248,113,113,0.04))" }}>
                    <h4 className="font-bold text-xl text-red-600 mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> {t.weaknesses}</h4>
                    <ul className="space-y-2.5">{analysisData.brandAssessment.weaknesses.map((w, i) => <li key={i} className="text-lg text-[#505868] leading-relaxed flex items-start gap-2"><span className="text-red-500 font-bold text-xl mt-0.5">-</span><span>{w}</span></li>)}</ul>
                  </div>
                  {analysisData.brandAssessment.opportunities && (
                    <div className="p-5 rounded-2xl border border-[#8054b8]/20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(128,84,184,0.08), rgba(167,139,250,0.04))" }}>
                      <h4 className="font-bold text-xl text-[#6d3fa0] mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5" /> {locale === "ar" ? "الفرص" : "Opportunities"}</h4>
                      <ul className="space-y-2.5">{analysisData.brandAssessment.opportunities.map((o, i) => <li key={i} className="text-lg text-[#505868] leading-relaxed flex items-start gap-2"><span className="text-[#8054b8] font-bold text-xl mt-0.5">★</span><span>{o}</span></li>)}</ul>
                    </div>
                  )}
                  {analysisData.brandAssessment.threats && (
                    <div className="p-5 rounded-2xl border border-orange-200/40 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,146,60,0.04))" }}>
                      <h4 className="font-bold text-xl text-orange-600 mb-3 flex items-center gap-2"><Crosshair className="h-5 w-5" /> {locale === "ar" ? "التهديدات" : "Threats"}</h4>
                      <ul className="space-y-2.5">{analysisData.brandAssessment.threats.map((t2, i) => <li key={i} className="text-lg text-[#505868] leading-relaxed flex items-start gap-2"><span className="text-orange-500 font-bold text-xl mt-0.5">!</span><span>{t2}</span></li>)}</ul>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Competitor Cards */}
              <div>
                <h3 className="flex items-center gap-3 text-2xl font-extrabold text-[#2d3142] mb-5"><Swords className="h-6 w-6 text-[#23ab7e]" /> {t.competitorProfiles}</h3>
                <div className="space-y-6">
                  {analysisData.competitors.map((comp, i) => (
                    <SectionCard key={i} accentColor="linear-gradient(90deg, #8054b8, #a78bfa)">
                      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <ScoreCircle score={comp.overallScore} size={72} />
                          <div>
                            <h4 className="font-bold text-xl text-[#2d3142]">{comp.name}</h4>
                            <p className="text-lg text-[#8f96a3] font-medium">{comp.handle} · {comp.platform}</p>
                          </div>
                        </div>
                        <ThreatBadge level={comp.threatLevel} />
                      </div>

                      {/* Key Insight Banner */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border-2 border-[#e8eaef] mb-6">
                        <p className="text-lg font-bold text-[#23ab7e] uppercase tracking-wider mb-1">{locale === "ar" ? "الرؤية الرئيسية" : "KEY INSIGHT"}</p>
                        <p className="text-lg text-[#2d3142] leading-7 font-medium">{comp.keyInsight}</p>
                      </div>

                      {comp.stealThisMove && (
                        <div className="p-5 rounded-2xl bg-[#8054b8]/5 border-2 border-[#8054b8]/20 mb-6">
                          <p className="text-lg font-bold text-[#8054b8] uppercase tracking-wider mb-1 flex items-center gap-2"><Star className="h-4 w-4" /> {locale === "ar" ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</p>
                          <p className="text-lg text-[#2d3142] leading-7 font-medium">{comp.stealThisMove}</p>
                        </div>
                      )}

                      {/* Business Intelligence */}
                      {(comp.companyOverview || comp.productsAndServices || comp.websiteAnalysis) && (
                        <div className="mb-6">
                          <h5 className="font-black text-xl text-[#2d3142] mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-[#23ab7e]" />
                            {locale === "ar" ? "معلومات الأعمال" : "Business Intelligence"}
                          </h5>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {comp.companyOverview && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Building2 className="h-4 w-4" />{locale === "ar" ? "نظرة عامة على الشركة" : "Company Overview"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.companyOverview}</p>
                              </div>
                            )}
                            {comp.productsAndServices && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Package className="h-4 w-4" />{locale === "ar" ? "المنتجات والخدمات" : "Products & Services"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.productsAndServices}</p>
                              </div>
                            )}
                            {comp.targetMarket && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Users className="h-4 w-4" />{locale === "ar" ? "السوق المستهدف" : "Target Market"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.targetMarket}</p>
                              </div>
                            )}
                            {comp.brandPositioning && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Crosshair className="h-4 w-4" />{locale === "ar" ? "تموضع العلامة التجارية" : "Brand Positioning"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.brandPositioning}</p>
                              </div>
                            )}
                            {comp.websiteAnalysis && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Globe className="h-4 w-4" />{locale === "ar" ? "تحليل الموقع الإلكتروني" : "Website Analysis"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.websiteAnalysis}</p>
                              </div>
                            )}
                            {comp.digitalPresence && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Eye className="h-4 w-4" />{locale === "ar" ? "الحضور الرقمي" : "Digital Presence"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.digitalPresence}</p>
                              </div>
                            )}
                            {comp.pricingStrategy && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{locale === "ar" ? "استراتيجية التسعير" : "Pricing Strategy"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.pricingStrategy}</p>
                              </div>
                            )}
                            {comp.customerReviews && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Star className="h-4 w-4" />{locale === "ar" ? "مراجعات العملاء" : "Customer Reviews"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.customerReviews}</p>
                              </div>
                            )}
                            {comp.technologyStack && (
                              <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                                <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><Layers className="h-4 w-4" />{locale === "ar" ? "البنية التقنية" : "Technology Stack"}</p>
                                <p className="text-lg text-[#505868] leading-7">{comp.technologyStack}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Marketing Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <h5 className="font-black text-xl text-[#2d3142] flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-[#23ab7e]" />
                            {locale === "ar" ? "تحليل المحتوى والتسويق" : "Content & Marketing Analysis"}
                          </h5>
                          {[
                            { label: t.postingFrequency, value: comp.postingFrequency, icon: Calendar },
                            { label: t.engagement, value: comp.engagementLevel, icon: BarChart3 },
                            { label: t.hashtagStrategy, value: comp.hashtagStrategy, icon: Target },
                            { label: t.visualBranding, value: comp.visualStyle, icon: Eye },
                          ].map((item) => (
                            <div key={item.label} className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-lg font-bold text-[#23ab7e] mb-1 flex items-center gap-1.5"><item.icon className="h-4 w-4" />{item.label}</p>
                              <p className="text-lg text-[#505868] leading-7">{item.value}</p>
                            </div>
                          ))}
                          {comp.captionStyle && (
                            <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-lg font-bold text-[#23ab7e] mb-1">{locale === "ar" ? "أسلوب الكتابة" : "Caption Style"}</p>
                              <p className="text-lg text-[#505868] leading-7">{comp.captionStyle}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {comp.audienceProfile && (
                            <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-lg font-bold text-[#23ab7e] mb-1">{locale === "ar" ? "ملف الجمهور" : "Audience Profile"}</p>
                              <p className="text-lg text-[#505868] leading-7">{comp.audienceProfile}</p>
                            </div>
                          )}
                          {comp.contentCalendar && (
                            <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-lg font-bold text-[#23ab7e] mb-1">{locale === "ar" ? "تقويم المحتوى" : "Content Calendar"}</p>
                              <p className="text-lg text-[#505868] leading-7">{comp.contentCalendar}</p>
                            </div>
                          )}
                          {comp.paidStrategy && (
                            <div className="p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                              <p className="text-lg font-bold text-[#23ab7e] mb-1">{locale === "ar" ? "الاستراتيجية المدفوعة" : "Paid Strategy"}</p>
                              <p className="text-lg text-[#505868] leading-7">{comp.paidStrategy}</p>
                            </div>
                          )}
                          <div className="p-5 rounded-xl border border-[#23ab7e]/20" style={{ background: "linear-gradient(135deg, rgba(35,171,126,0.08), rgba(16,185,129,0.04))" }}>
                            <p className="text-lg font-bold text-[#23ab7e] mb-2">{t.strengths}</p>
                            {comp.strengths.map((s, j) => <p key={j} className="text-lg text-[#505868] leading-7">+ {s}</p>)}
                          </div>
                          <div className="p-5 rounded-xl border border-red-200/40" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(248,113,113,0.04))" }}>
                            <p className="text-lg font-bold text-red-600 mb-2">{t.weaknesses}</p>
                            {comp.weakPoints.map((w, j) => <p key={j} className="text-lg text-[#505868] leading-7">- {w}</p>)}
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              </div>

              {/* Saudi Market Insights */}
              <SectionCard accentColor="linear-gradient(90deg, #0d9488, #06b6d4)">
                <SectionTitle icon={Globe}>🇸🇦 {t.saudiMarketInsights}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "trendAlignment" as const, label: t.trendAlignment, icon: TrendingUp },
                    { key: "vision2030Relevance" as const, label: t.vision2030, icon: Rocket },
                    { key: "culturalFit" as const, label: t.culturalFit, icon: Shield },
                  ].map((item) => (
                    <div key={item.key} className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><item.icon className="h-5 w-5" />{item.label}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.saudiMarketInsights[item.key]}</p>
                    </div>
                  ))}
                  {analysisData.saudiMarketInsights.localOpportunities && (
                    <div className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5" />{locale === "ar" ? "فرص محلية" : "Local Opportunities"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.saudiMarketInsights.localOpportunities}</p>
                    </div>
                  )}
                  {analysisData.saudiMarketInsights.ramadanStrategy && (
                    <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5 border-2 border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#8054b8] mb-2 flex items-center gap-2"><Star className="h-5 w-5" />{locale === "ar" ? "استراتيجية رمضان" : "Ramadan Strategy"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.saudiMarketInsights.ramadanStrategy}</p>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Industry Analysis */}
              {analysisData.industryAnalysis && (
                <SectionCard accentColor="linear-gradient(90deg, #6366f1, #8054b8)">
                  <SectionTitle icon={TrendingUp}>{locale === "ar" ? "تحليل الصناعة" : "Industry Analysis"}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5" />{locale === "ar" ? "نظرة عامة على السوق" : "Market Overview"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.industryAnalysis.marketOverview}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><Swords className="h-5 w-5" />{locale === "ar" ? "المشهد التنافسي" : "Competitive Landscape"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.industryAnalysis.competitiveLandscape}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><Users className="h-5 w-5" />{locale === "ar" ? "اتجاهات المستهلكين" : "Consumer Trends"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.industryAnalysis.consumerTrends}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#fafbfd] border border-[#e8eaef]">
                      <h4 className="font-black text-lg text-[#23ab7e] mb-2 flex items-center gap-2"><Rocket className="h-5 w-5" />{locale === "ar" ? "التوقعات المستقبلية" : "Future Outlook"}</h4>
                      <p className="text-lg text-[#505868] leading-7">{analysisData.industryAnalysis.futureOutlook}</p>
                    </div>
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* ═══ COMPARE TAB ═══ */}
          {activeTab === "compare" && (
            <div className="space-y-6">
              <SectionCard accentColor="linear-gradient(90deg, #8054b8, #ec4899)">
                <SectionTitle icon={BarChart3}>{t.comparisonMatrix}</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#e8eaef]">
                        <th className="text-start py-4 px-3 font-black text-lg text-[#8f96a3]">{t.category}</th>
                        <th className="text-start py-4 px-3 font-black text-lg text-[#23ab7e]">{t.yourBrand}</th>
                        {Object.keys(analysisData.comparisonMatrix.competitors).map((n) => <th key={n} className="text-start py-4 px-3 font-black text-lg text-[#2d3142]">{n}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.comparisonMatrix.categories.map((cat, idx) => (
                        <tr key={cat} className="border-b border-[#e8eaef]/50 hover:bg-[#fafbfd] transition-colors">
                          <td className="py-4 px-3 font-bold text-lg text-[#8f96a3]">{cat}</td>
                          <td className="py-4 px-3 min-w-0"><ScoreBar score={analysisData.comparisonMatrix.yourBrand[idx]} color="#23ab7e" /></td>
                          {Object.entries(analysisData.comparisonMatrix.competitors).map(([n, scores]) => (
                            <td key={n} className="py-4 px-3 min-w-0"><ScoreBar score={scores[idx]} /></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Score Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-2xl border-2 border-[#23ab7e] bg-[#f4f6f8] p-6 flex flex-col items-center">
                  <ScoreCircle score={analysisData.brandAssessment.overallScore} size={90} />
                  <p className="text-lg font-black text-[#23ab7e] mt-2">{t.yourBrand}</p>
                </div>
                {analysisData.competitors.map((comp) => (
                  <div key={comp.name} className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6 flex flex-col items-center">
                    <ScoreCircle score={comp.overallScore} size={90} />
                    <p className="text-lg font-black text-[#2d3142] mt-2">{comp.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ WINNING STRATEGY TAB ═══ */}
          {activeTab === "strategy" && (
            <div className="space-y-6">
              {/* Quick Wins */}
              {analysisData.winningStrategy.quickWins && analysisData.winningStrategy.quickWins.length > 0 && (
                <SectionCard accentColor="linear-gradient(90deg, #f59e0b, #ef4444)" className="bg-gradient-to-r from-[#23ab7e]/5 to-[#8054b8]/5">
                  <SectionTitle icon={Zap} color="text-[#8054b8]">{locale === "ar" ? "مكاسب سريعة — نفذها اليوم!" : "Quick Wins — Do These TODAY!"}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.winningStrategy.quickWins.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border-2 border-[#e8eaef]">
                        <div className="w-8 h-8 rounded-lg bg-[#8054b8] flex items-center justify-center shrink-0"><span className="text-white font-black text-sm">{i + 1}</span></div>
                        <p className="text-lg text-[#2d3142] leading-7">{w}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Immediate */}
              <SectionCard accentColor="linear-gradient(90deg, #ef4444, #f59e0b)">
                <SectionTitle icon={Zap} color="text-red-500">{t.immediateActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.immediate.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-red-50/50 border-2 border-red-100">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-lg text-[#2d3142] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#8f96a3] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Short-term */}
              <SectionCard accentColor="linear-gradient(90deg, #8054b8, #a78bfa)">
                <SectionTitle icon={Calendar} color="text-[#8054b8]">{t.shortTermActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.shortTerm.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-yellow-50/30 border-2 border-yellow-100">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-lg text-[#2d3142] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#8f96a3] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Long-term */}
              <SectionCard accentColor="linear-gradient(90deg, #23ab7e, #10b981)">
                <SectionTitle icon={Rocket} color="text-[#23ab7e]">{t.longTermActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.longTerm.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#f4f6f8] border-2 border-[#e8eaef]">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-lg text-[#2d3142] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#8f96a3] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Content Series */}
              {analysisData.winningStrategy.contentSeries && analysisData.winningStrategy.contentSeries.length > 0 && (
                <SectionCard accentColor="linear-gradient(90deg, #ec4899, #8054b8)">
                  <SectionTitle icon={Sparkles} color="text-[#8054b8]">{locale === "ar" ? "سلاسل محتوى مقترحة" : "Recommended Content Series"}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analysisData.winningStrategy.contentSeries.map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl border-2 border-[#8054b8]/20 bg-[#8054b8]/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-xl text-[#2d3142]">{s.name}</h4>
                          <span className="px-3 py-1 rounded-lg bg-[#23ab7e] text-white text-sm font-bold">{s.platform}</span>
                        </div>
                        <p className="text-lg text-[#505868] leading-7">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Content Gaps & Differentiators */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard>
                  <SectionTitle icon={Lightbulb} color="text-[#8054b8]">{t.contentGaps}</SectionTitle>
                  <div className="space-y-3">
                    {analysisData.winningStrategy.contentGaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                        <Lightbulb className="h-5 w-5 mt-1 shrink-0 text-[#8054b8]" />
                        <p className="text-lg text-[#505868] leading-7">{g}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
                <SectionCard>
                  <SectionTitle icon={Shield}>{t.differentiators}</SectionTitle>
                  <div className="space-y-3">
                    {analysisData.winningStrategy.differentiators.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#fafbfd] border border-[#e8eaef]">
                        <Shield className="h-5 w-5 mt-1 shrink-0 text-[#23ab7e]" />
                        <p className="text-lg text-[#505868] leading-7">{d}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state — 3D animated experience */}
      {loading && (
        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#f4f6f8] via-white to-[#fafbfd] flex flex-col items-center justify-center py-24 px-8 text-center relative overflow-hidden" style={{ backdropFilter: "blur(12px)" }}>
          {/* Floating 3D cubes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-10 h-10 rounded-lg bg-gradient-to-br from-[#23ab7e]/20 to-[#8054b8]/20 border border-[#23ab7e]/10" style={{ animation: "float-cube 6s ease-in-out infinite", transform: "rotate(45deg) perspective(200px) rotateX(20deg)" }} />
            <div className="absolute top-[20%] right-[20%] w-8 h-8 rounded-lg bg-gradient-to-br from-[#8054b8]/20 to-[#ec4899]/20 border border-[#8054b8]/10" style={{ animation: "float-cube 5s ease-in-out infinite 1s", transform: "rotate(30deg) perspective(200px) rotateY(20deg)" }} />
            <div className="absolute bottom-[25%] left-[10%] w-12 h-12 rounded-lg bg-gradient-to-br from-[#06b6d4]/20 to-[#23ab7e]/20 border border-[#06b6d4]/10" style={{ animation: "float-cube 7s ease-in-out infinite 0.5s", transform: "rotate(60deg) perspective(200px) rotateX(30deg)" }} />
            <div className="absolute bottom-[15%] right-[12%] w-6 h-6 rounded-lg bg-gradient-to-br from-[#f59e0b]/20 to-[#ef4444]/20 border border-[#f59e0b]/10" style={{ animation: "float-cube 4s ease-in-out infinite 2s", transform: "rotate(15deg) perspective(200px) rotateY(25deg)" }} />
            <div className="absolute top-[50%] left-[5%] w-7 h-7 rounded-lg bg-gradient-to-br from-[#ec4899]/20 to-[#8054b8]/20 border border-[#ec4899]/10" style={{ animation: "float-cube 5.5s ease-in-out infinite 1.5s", transform: "rotate(40deg) perspective(200px) rotateX(15deg)" }} />
            <div className="absolute top-[40%] right-[8%] w-9 h-9 rounded-lg bg-gradient-to-br from-[#23ab7e]/15 to-[#06b6d4]/15 border border-[#23ab7e]/10" style={{ animation: "float-cube 6.5s ease-in-out infinite 0.8s", transform: "rotate(55deg) perspective(200px) rotateY(30deg)" }} />
          </div>

          {/* Center circle with sparkles */}
          <div className="relative mb-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#23ab7e] to-[#8054b8] flex items-center justify-center shadow-[0_8px_40px_rgba(35,171,126,0.35)]" style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
              <Swords className="h-14 w-14 sm:h-16 sm:w-16 text-white" style={{ animation: "float-cube 3s ease-in-out infinite" }} />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center shadow-lg" style={{ animation: "orbit-sparkle 4s linear infinite" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#ec4899] to-[#8054b8] flex items-center justify-center shadow-lg" style={{ animation: "orbit-sparkle 5s linear infinite reverse" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="absolute top-1/2 -right-6 w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#23ab7e] flex items-center justify-center shadow-lg" style={{ animation: "orbit-sparkle 3.5s linear infinite 1s" }}>
              <Star className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Rotating fun quotes */}
          <p className="text-2xl md:text-3xl font-black text-[#2d3142] max-w-2xl leading-tight mb-4 transition-all duration-500" style={{ animation: "fade-text 4s ease-in-out infinite" }}>
            {funnyMessages[loadingMsg]}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#23ab7e]" />
            <p className="text-lg text-[#8f96a3] font-bold">{t.analyzing}...</p>
          </div>

          {/* Aurora progress bar */}
          <div className="mt-8 w-full max-w-md">
            <div className="h-3 bg-[#E8F0EA] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #23ab7e, #8054b8, #ec4899, #23ab7e)", backgroundSize: "300% 100%", animation: "aurora-bar 8s ease-in-out infinite, loading-bar 8s ease-in-out infinite" }} />
            </div>
          </div>
          <style>{`
            @keyframes loading-bar { 0% { width: 5%; } 50% { width: 85%; } 100% { width: 5%; } }
            @keyframes aurora-bar { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            @keyframes float-cube { 0%, 100% { transform: translateY(0px) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
            @keyframes pulse-glow { 0%, 100% { box-shadow: 0 8px 40px rgba(35,171,126,0.35); } 50% { box-shadow: 0 12px 60px rgba(128,84,184,0.45); } }
            @keyframes orbit-sparkle { 0% { transform: rotate(0deg) translateX(8px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); } }
            @keyframes fade-text { 0%, 100% { opacity: 1; } 45% { opacity: 1; } 50% { opacity: 0.6; } 55% { opacity: 1; } }
          `}</style>
        </div>
      )}

      {/* Empty state */}
      {!analysisData && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-[#e8eaef]/50 flex flex-col items-center justify-center py-20 text-center" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
          <Swords className="h-16 w-16 text-[#e8eaef] mb-5" />
          <p className="text-[#8f96a3] text-2xl font-medium">{t.noAnalysisYet}</p>
        </div>
      )}
    </div>
  );
}
