"use client";

import { useEffect, useState } from "react";
/* motion removed – using plain HTML + CSS transitions */
import { Building2, Plus, Pencil, Trash2, Upload, Loader2, Sparkles, FileText, Clock, Target, Megaphone, Users, Zap, Shield, Flame, Crown, BadgeCheck, Palette, Eye, X, Globe, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { cn, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { messages } from "@/lib/i18n";

const INDUSTRIES = [
  { en: "Food & Beverage", ar: "أغذية ومشروبات" },
  { en: "Restaurant & Cafe", ar: "مطاعم وكافيهات" },
  { en: "Fashion & Apparel", ar: "أزياء وملابس" },
  { en: "Beauty & Cosmetics", ar: "تجميل ومستحضرات" },
  { en: "Real Estate", ar: "عقارات" },
  { en: "Technology", ar: "تقنية" },
  { en: "Healthcare", ar: "رعاية صحية" },
  { en: "Education & Training", ar: "تعليم وتدريب" },
  { en: "Retail & E-commerce", ar: "تجزئة وتجارة إلكترونية" },
  { en: "Finance & Banking", ar: "مالية وبنوك" },
  { en: "Tourism & Hospitality", ar: "سياحة وضيافة" },
  { en: "Fitness & Wellness", ar: "لياقة وصحة" },
  { en: "Automotive", ar: "سيارات" },
  { en: "Construction & Engineering", ar: "مقاولات وهندسة" },
  { en: "Media & Entertainment", ar: "إعلام وترفيه" },
  { en: "Legal & Consulting", ar: "قانون واستشارات" },
  { en: "Logistics & Delivery", ar: "لوجستيات وتوصيل" },
  { en: "Agriculture", ar: "زراعة" },
  { en: "Non-profit & Government", ar: "غير ربحي وحكومي" },
  { en: "Other", ar: "أخرى" },
];

const TONES = [
  "Professional",
  "Playful",
  "Luxurious",
  "Inspirational",
  "Educational",
  "Bold",
];

const PLATFORMS = [
  "Instagram",
  "X (Twitter)",
  "TikTok",
  "Snapchat",
  "LinkedIn",
];

const FALLBACK_COLORS = ["#23ab7e", "#8054b8", "#8054b8", "#0B1A0F", "#D0EBDA"];

/* ── Platform config with rich visual data (matches planner/hashtags) ── */
const PLATFORM_CARDS: Record<string, { emoji: string; selectedBg: string; selectedBorder: string; unselectedBg: string; color: string }> = {
  "Instagram":    { emoji: "\uD83D\uDCF8", selectedBg: "bg-gradient-to-br from-pink-500 to-rose-500", selectedBorder: "border-pink-400", unselectedBg: "bg-pink-50", color: "text-pink-600" },
  "X (Twitter)":  { emoji: "\uD835\uDD4F", selectedBg: "bg-gradient-to-br from-slate-700 to-slate-900", selectedBorder: "border-slate-400", unselectedBg: "bg-slate-50", color: "text-slate-700" },
  "TikTok":       { emoji: "\uD83C\uDFB5", selectedBg: "bg-gradient-to-br from-slate-800 to-cyan-500", selectedBorder: "border-cyan-400", unselectedBg: "bg-slate-50", color: "text-slate-700" },
  "Snapchat":     { emoji: "\uD83D\uDC7B", selectedBg: "bg-gradient-to-br from-yellow-400 to-[#e67af3]", selectedBorder: "border-yellow-400", unselectedBg: "bg-yellow-50", color: "text-yellow-700" },
  "LinkedIn":     { emoji: "\uD83D\uDCBC", selectedBg: "bg-gradient-to-br from-[#8054b8] to-blue-700", selectedBorder: "border-blue-400", unselectedBg: "bg-blue-50", color: "text-[#6d3fa0]" },
};

/* ── Card accent gradient rotation ── */
const CARD_GRADIENTS = [
  "from-[#23ab7e] via-[#8054b8] to-[#8054b8]",
  "from-[#8054b8] via-[#A78BFA] to-[#23ab7e]",
  "from-rose-500 via-pink-500 to-[#8054b8]",
  "from-[#8054b8] via-indigo-500 to-[#8054b8]",
  "from-[#e67af3] via-[#f5c6fa] to-red-500",
  "from-[#23ab7e] via-[#23ab7e] to-cyan-500",
];

/* ── Tag emoji prefixes and colors ── */
const TAG_STYLES = {
  industry:  { emoji: "\uD83C\uDFED", bg: "bg-[#23ab7e]/10", border: "border-[#23ab7e]/25", text: "text-[#23ab7e]" },
  tone:      { emoji: "\uD83C\uDFA8", bg: "bg-[#8054b8]/10", border: "border-[#8054b8]/25", text: "text-[#8054b8]" },
  audience:  { emoji: "\uD83C\uDFAF", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/25", text: "text-[#3B82F6]" },
  platform:  { emoji: "\uD83D\uDCF1", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/25", text: "text-[#A855F7]" },
  website:   { emoji: "\uD83C\uDF10", bg: "bg-[#F97316]/10", border: "border-[#F97316]/25", text: "text-[#F97316]" },
};

/* ─────────── Brand Analysis Visual Display ─────────── */

function BrandAnalysisDisplay({ data, locale }: { data: Record<string, unknown>; locale: "en" | "ar" }) {
  const tc = messages[locale].companies;

  const bp = data.brandPersonality as {
    innovation?: number; trust?: number; energy?: number;
    elegance?: number; boldness?: number; summary?: string;
  } | undefined;

  const pillars = data.contentPillars as Array<{
    name: string; nameAr?: string; description: string; percentage: number;
  }> | undefined;

  const audience = data.audienceInsights as {
    primaryAge?: string; interests?: string[];
    saudiSpecific?: string; bestPostingTimes?: Array<{ day: string; time: string; reason: string }>;
  } | undefined;

  const mix = data.contentMix as Record<string, number> | undefined;

  const platform = data.platformStrategy as {
    primary?: string; secondary?: string; rationale?: string;
  } | undefined;

  const tone = data.toneGuide as {
    doUse?: string[]; avoid?: string[]; exampleCaption?: string;
  } | undefined;

  const vision = data.vision2030Alignment as string | undefined;

  const personalityDimensions = bp ? [
    { key: "innovation", label: "Innovation", icon: <Zap className="h-5 w-5" />, value: bp.innovation ?? 0 },
    { key: "trust", label: "Trust", icon: <Shield className="h-5 w-5" />, value: bp.trust ?? 0 },
    { key: "energy", label: "Energy", icon: <Flame className="h-5 w-5" />, value: bp.energy ?? 0 },
    { key: "elegance", label: "Elegance", icon: <Crown className="h-5 w-5" />, value: bp.elegance ?? 0 },
    { key: "boldness", label: "Boldness", icon: <BadgeCheck className="h-5 w-5" />, value: bp.boldness ?? 0 },
  ] : [];

  const mixColors: Record<string, string> = {
    educational: "#23ab7e",
    promotional: "#8054b8",
    engagement: "#8054b8",
    storytelling: "#3B82F6",
    entertainment: "#A855F7",
  };

  const mixTotal = mix ? Object.values(mix).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mt-4 space-y-4">
      {/* Brand Personality */}
      {bp && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Sparkles className="h-5 w-5 text-[#8054b8]" />
            {tc.brandPersonality}
          </h4>
          <div className="space-y-3">
            {personalityDimensions.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-[#8f96a3]">{d.icon}</span>
                <span className="w-24 text-sm text-[#1a1d2e]">{d.label}</span>
                <div className="flex-1 h-3 rounded-full bg-[#f4f6f8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#23ab7e] to-[#8054b8] transition-all duration-700"
                    style={{ width: `${d.value}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium text-[#8054b8]">{d.value}</span>
              </div>
            ))}
          </div>
          {bp.summary && (
            <p className="mt-3 text-sm text-[#8f96a3] italic border-t border-[#e8eaef] pt-2">{bp.summary}</p>
          )}
        </div>
      )}

      {/* Content Pillars */}
      {pillars && pillars.length > 0 && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Target className="h-5 w-5 text-[#8054b8]" />
            {tc.contentPillars}
          </h4>
          <div className="grid gap-2">
            {pillars.map((p, i) => (
              <div key={i} className="rounded-xl bg-[#fafbfd] border border-[#e8eaef] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#1a1d2e]">
                    {p.name}{p.nameAr ? ` — ${p.nameAr}` : ""}
                  </span>
                  <span className="text-sm font-bold text-[#8054b8]">{p.percentage}%</span>
                </div>
                <p className="text-sm text-[#8f96a3] mb-2">{p.description}</p>
                <div className="h-3 rounded-full bg-[#f4f6f8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8054b8] to-[#A78BFA] transition-all duration-700"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Insights */}
      {audience && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Users className="h-5 w-5 text-[#8054b8]" />
            {tc.audienceInsights}
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {audience.primaryAge && (
              <span className="rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-4 py-2 text-sm font-medium text-white">
                {tc.age}: {audience.primaryAge}
              </span>
            )}
            {audience.interests?.map((interest, i) => (
              <span key={i} className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] px-4 py-2 text-sm text-[#1a1d2e]">
                {interest}
              </span>
            ))}
          </div>
          {audience.saudiSpecific && (
            <div className="rounded-xl bg-[#fafbfd] border-2 border-[#8054b8]/30 p-4 mb-3">
              <p className="text-sm text-[#8054b8] font-semibold mb-1">{"\u{1F1F8}\u{1F1E6}"} {tc.saudiInsight}</p>
              <p className="text-sm text-[#2d3142]">{audience.saudiSpecific}</p>
            </div>
          )}
          {audience.bestPostingTimes && audience.bestPostingTimes.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {audience.bestPostingTimes.map((t, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-[#fafbfd] border border-[#e8eaef] p-4">
                  <Clock className="h-5 w-5 text-[#8054b8] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#1a1d2e]">{t.day} · {t.time}</p>
                    <p className="text-sm text-[#8f96a3]">{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Mix */}
      {mix && mixTotal > 0 && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Megaphone className="h-5 w-5 text-[#8054b8]" />
            {tc.contentMix}
          </h4>
          {/* Stacked bar */}
          <div className="h-4 rounded-full overflow-hidden flex mb-3">
            {Object.entries(mix).map(([key, val]) => (
              <div
                key={key}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                style={{ backgroundColor: mixColors[key] || "#8f96a3", width: `${(val / mixTotal) * 100}%` }}
                title={`${key}: ${val}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(mix).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mixColors[key] || "#8f96a3" }} />
                <span className="text-sm text-[#1a1d2e] capitalize">{key}</span>
                <span className="text-sm font-medium text-[#8054b8]">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Strategy */}
      {platform && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Target className="h-5 w-5 text-[#8054b8]" />
            {tc.platformStrategy}
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {platform.primary && (
              <span className="rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-4 py-2 text-sm font-semibold text-white">
                ★ {platform.primary}
              </span>
            )}
            {platform.secondary && (
              <span className="rounded-xl bg-[#f4f6f8] border border-[#e8eaef] px-4 py-2 text-sm font-medium text-[#1a1d2e]">
                {platform.secondary}
              </span>
            )}
          </div>
          {platform.rationale && (
            <p className="text-sm text-[#8f96a3] italic">{platform.rationale}</p>
          )}
        </div>
      )}

      {/* Tone Guide */}
      {tone && (
        <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-[#1a1d2e]">
            <Megaphone className="h-5 w-5 text-[#8054b8]" />
            {tc.toneGuide}
          </h4>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[140px]">
              <p className="text-sm font-medium text-[#23ab7e] mb-1.5">{"\u2713"} {tc.doUse}</p>
              <div className="flex flex-wrap gap-1">
                {tone.doUse?.map((t, i) => (
                  <span key={i} className="rounded-xl bg-[#23ab7e]/10 border border-[#23ab7e]/30 px-3 py-1.5 text-sm text-[#23ab7e]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-sm font-medium text-red-600 mb-1.5">{"\u2717"} {tc.avoid}</p>
              <div className="flex flex-wrap gap-1">
                {tone.avoid?.map((t, i) => (
                  <span key={i} className="rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-sm text-red-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {tone.exampleCaption && (
            <div className="rounded-xl bg-[#fafbfd] border-l-4 border-[#8054b8] p-4">
              <p className="text-sm text-[#8f96a3] mb-1">{tc.exampleCaption}</p>
              <p className="text-xl text-[#2d3142] italic">&ldquo;{tone.exampleCaption}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Vision 2030 Alignment */}
      {vision && (
        <div className="rounded-xl border-2 border-[#8054b8]/40 bg-gradient-to-br from-[#fafbfd] to-white p-4">
          <h4 className="mb-2 flex items-center gap-2 text-xl font-extrabold text-[#8054b8]">
            {"\u{1F3DB}\uFE0F"} {tc.vision2030}
          </h4>
          <p className="text-sm text-[#2d3142]">{vision}</p>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  const supabase = createClient();
  const { setSelectedCompany, locale, user } = useAppStore();
  const tc = messages[locale].companies;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeSteps, setAnalyzeSteps] = useState<{ step: string; message: string; details?: Record<string, unknown> }[]>([]);
  const [scrapingWebsite, setScrapingWebsite] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ step: number; label: string } | null>(null);
  const [extractedPdfText, setExtractedPdfText] = useState<string | null>(null);
  const [brandAnalysis, setBrandAnalysis] = useState<Record<string, unknown> | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    name_ar: "",
    industry: "",
    website: "",
    description: "",
    logo_url: "",
    brand_colors: [] as string[],
    tone: "",
    target_audience: "",
    unique_value: "",
    competitors: "",
    platforms: [] as string[],
  });

  useEffect(() => {
    if (user) loadCompanies();
    else setLoading(false);
  }, [user]);

  async function loadCompanies() {
    if (!user) return;
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Load companies error:", error);
      toast.error(locale === "ar" ? "فشل تحميل الشركات" : "Failed to load companies");
      setCompanies([]);
    } else {
      setCompanies((data as Company[]) ?? []);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm({
      name: "",
      name_ar: "",
      industry: "",
      website: "",
      description: "",
      logo_url: "",
      brand_colors: [...FALLBACK_COLORS],
      tone: "",
      target_audience: "",
      unique_value: "",
      competitors: "",
      platforms: [],
    });
    setBrandAnalysis(null);
    setShowCustomIndustry(false);
    setExtractedPdfText(null);
    setPdfProgress(null);
    setFormOpen(true);
  }

  function openEdit(c: Company) {
    setEditingId(c.id);
    const isKnownIndustry = INDUSTRIES.some((ind) => ind.en === (c.industry ?? ""));
    setShowCustomIndustry(!!(c.industry && !isKnownIndustry));
    setForm({
      name: c.name ?? "",
      name_ar: c.name_ar ?? "",
      industry: c.industry ?? "",
      website: c.website ?? "",
      description: c.description ?? "",
      logo_url: c.logo_url ?? "",
      brand_colors: c.brand_colors?.length ? c.brand_colors : [...FALLBACK_COLORS],
      tone: c.tone ?? "",
      target_audience: c.target_audience ?? "",
      unique_value: c.unique_value ?? "",
      competitors: c.competitors ?? "",
      platforms: c.platforms ?? [],
    });
    setBrandAnalysis(c.brand_analysis ?? null);
    setExtractedPdfText(null);
    setPdfProgress(null);
    setFormOpen(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    toast.loading("Uploading logo...", { id: "logo-upload" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.url) setForm((f) => ({ ...f, logo_url: json.url }));
      if (json.colors?.length) setForm((f) => ({ ...f, brand_colors: json.colors.slice(0, 5) }));
      toast.success("Logo uploaded & colors extracted!", { id: "logo-upload" });
    } catch (err) {
      console.error("Logo upload error:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: "logo-upload" });
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset any previous extraction display
    setExtractedPdfText(null);
    setUploadingPdf(true);

    const stepsEn = [
      "Uploading PDF...",
      "Reading document pages...",
      "Extracting company information...",
      "Finalizing profile...",
    ];
    const stepsAr = [
      "جاري رفع الملف...",
      "جاري قراءة صفحات المستند...",
      "جاري استخراج معلومات الشركة...",
      "جاري إنهاء الملف التعريفي...",
    ];
    const steps = locale === "ar" ? stepsAr : stepsEn;

    setPdfProgress({ step: 0, label: steps[0] });

    try {
      // Simulate progress while the request is in flight
      const progressTimer = setInterval(() => {
        setPdfProgress((prev) => {
          if (!prev || prev.step >= steps.length - 1) return prev;
          const next = prev.step + 1;
          return { step: next, label: steps[next] };
        });
      }, 2500);

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const json = await res.json();

      clearInterval(progressTimer);

      if (!res.ok) throw new Error(json.error || "PDF extraction failed");
      if (json.text) {
        setPdfProgress({ step: steps.length - 1, label: steps[steps.length - 1] });
        setForm((f) => ({ ...f, description: json.text }));
        setExtractedPdfText(json.text);
        toast.success(locale === "ar" ? "تم استخراج الملف التعريفي!" : "Company profile extracted!", { id: "pdf-upload" });
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      toast.error(err instanceof Error ? err.message : "PDF extraction failed", { id: "pdf-upload" });
    } finally {
      setUploadingPdf(false);
      // Keep progress visible briefly then clear
      setTimeout(() => setPdfProgress(null), 1500);
    }
  }

  async function handleScrapeWebsite() {
    const url = form.website.trim();
    if (!url) { toast.error(locale === "ar" ? "أدخل رابط الموقع أولاً" : "Enter a website URL first"); return; }
    setScrapingWebsite(true);
    toast.loading(locale === "ar" ? "جارٍ استخراج بيانات الموقع..." : "Scraping website...", { id: "scrape" });
    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scraping failed");
      const parts: string[] = [];
      if (json.title) parts.push(json.title);
      if (json.metaDescription) parts.push(json.metaDescription);
      if (json.text) parts.push(json.text);
      const scraped = parts.join("\n\n");
      if (!scraped) throw new Error("No content found on website");
      setForm((f) => ({
        ...f,
        description: f.description ? f.description + "\n\n--- Website Content ---\n" + scraped : scraped,
      }));
      if (json.cssColors?.length) {
        setForm((f) => ({
          ...f,
          brand_colors: [...new Set([...f.brand_colors, ...json.cssColors])].slice(0, 5),
        }));
      }
      toast.success(
        locale === "ar"
          ? `تم استخراج ${scraped.length} حرف + ${json.cssColors?.length || 0} ألوان`
          : `Scraped ${scraped.length} chars + ${json.cssColors?.length || 0} colors`,
        { id: "scrape" }
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scraping failed", { id: "scrape" });
    } finally {
      setScrapingWebsite(false);
    }
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function saveCompany() {
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      industry: form.industry || null,
      website: form.website.trim() || null,
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
      brand_colors: form.brand_colors.length ? form.brand_colors : FALLBACK_COLORS,
      tone: form.tone || null,
      target_audience: form.target_audience.trim() || null,
      unique_value: form.unique_value.trim() || null,
      competitors: form.competitors.trim() || null,
      platforms: form.platforms,
    };
    if (editingId) {
      const { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", user.id);
      if (error) { console.error("Update company error:", error); toast.error(locale === "ar" ? "فشل حفظ الشركة" : "Failed to save company"); }
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    } else {
      const { error } = await supabase.from("companies").insert(payload);
      if (error) { console.error("Insert company error:", error); toast.error(locale === "ar" ? "فشل حفظ الشركة" : "Failed to save company"); }
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    }
    setSaving(false);
  }

  function getAnalysisCount(): number {
    if (!editingId) return 0;
    const company = companies.find((c) => c.id === editingId);
    return company?.analysis_count ?? 0;
  }

  async function runAnalyze() {
    if (!form.name.trim()) {
      toast.error("Save company first or enter a name");
      return;
    }
    const currentCount = getAnalysisCount();
    if (currentCount >= 3) {
      toast.error(tc.analysisLimit || "Analysis limit reached (3/3)");
      return;
    }
    setAnalyzing(true);
    setBrandAnalysis(null);
    setAnalyzeSteps([]);
    try {
      const res = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: form.name,
            name_ar: form.name_ar,
            industry: form.industry,
            description: form.description,
            website: form.website,
            target_audience: form.target_audience,
            tone: form.tone,
            platforms: form.platforms,
            competitors: form.competitors,
            unique_value: form.unique_value,
          },
          outputLanguage,
        }),
      });

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let analysisResult: Record<string, unknown> | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataMatch = line.match(/^data:\s*(.+)$/m);
          if (!dataMatch) continue;
          try {
            const event = JSON.parse(dataMatch[1]);
            if (event.type === "step") {
              setAnalyzeSteps((prev) => [...prev, { step: event.step, message: event.message, details: event.details }]);
            } else if (event.type === "done") {
              analysisResult = event.analysis;
            } else if (event.type === "error") {
              throw new Error(event.error);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") throw parseErr;
          }
        }
      }

      if (!analysisResult) throw new Error("No analysis result received");
      setBrandAnalysis(analysisResult);
      const analysis = analysisResult;
      if (!form.target_audience.trim() && analysis.suggestedTargetAudience) {
        setForm((f) => ({ ...f, target_audience: analysis.suggestedTargetAudience as string }));
      }
      if (!form.unique_value.trim() && analysis.suggestedUniqueValue) {
        setForm((f) => ({ ...f, unique_value: analysis.suggestedUniqueValue as string }));
      }
      const newCount = currentCount + 1;
      if (editingId) {
        await supabase.from("companies").update({ brand_analysis: analysisResult, analysis_count: newCount }).eq("id", editingId);
        setCompanies((prev) => prev.map((c) => c.id === editingId ? { ...c, brand_analysis: analysisResult, analysis_count: newCount } : c));
        setViewingCompany((prev) => prev && prev.id === editingId ? { ...prev, brand_analysis: analysisResult, analysis_count: newCount } : prev);
      }
      toast.success(`Brand DNA ready (${newCount}/3 ${tc.analysisRemaining || "analyses used"})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    }
    setAnalyzing(false);
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Delete related records in correct order (respect foreign keys)
    // 1. Get plan IDs so we can delete images linked via plan_id
    const { data: plans } = await supabase.from("content_plans").select("id").eq("company_id", id);
    const planIds = plans?.map((p) => p.id) ?? [];
    // 2. Delete generated_images (references both company_id and plan_id)
    await supabase.from("generated_images").delete().eq("company_id", id);
    if (planIds.length > 0) {
      await supabase.from("generated_images").delete().in("plan_id", planIds);
    }
    // 3. Now safe to delete content_plans and competitor_analyses
    await supabase.from("content_plans").delete().eq("company_id", id);
    await supabase.from("competitor_analyses").delete().eq("company_id", id).eq("user_id", user.id);
    // 4. Finally delete the company
    const { error } = await supabase.from("companies").delete().eq("id", id).eq("user_id", user.id);
    if (error) { console.error("Delete company error:", error); toast.error(locale === "ar" ? "فشل حذف الشركة" : "Failed to delete company"); }
    else { toast.success(tc.deleted || "Company deleted"); loadCompanies(); }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-6">
        <div className="h-40 animate-shimmer rounded-xl bg-gradient-to-r from-[#e8eaef]/50 via-[#f4f6f8] to-[#e8eaef]/50 border-2 border-[#e8eaef]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-shimmer rounded-xl bg-gradient-to-br from-[#f4f6f8] to-white border-2 border-[#e8eaef]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-10">
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-xl nl-aurora-bg p-4 sm:p-5 lg:p-6">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-[30%] left-[40%] w-28 h-28 bg-[#a6ffea]/8 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-black text-white leading-tight">{tc.pageTitle}</h1>
              <p className="mt-2 text-sm text-white/60">
                {locale === "ar" ? "بناء الهوية التجارية المتميزة بالذكاء الاصطناعي" : "Build & analyze your brand identity with AI"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {companies.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
                  <Building2 className="h-5 w-5 text-[#a6ffea]" />
                  <span className="text-xl font-black text-white">{companies.length}</span>
                  <span className="text-sm text-white/60">{locale === "ar" ? "شركات" : "Brands"}</span>
                </div>
              )}
              <button
                onClick={openAdd}
                className="relative h-10 px-8 text-sm font-bold rounded-xl bg-white text-[#23ab7e] border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(35,171,126,.08) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
                <span className="relative flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {tc.addCompany}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {companies.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-[#e8eaef] py-24 px-8" style={{ background: "linear-gradient(170deg, #ffffff 0%, #f7f9fb 40%, #f0fdf8 70%, #f5f0ff 100%)" }}>
          {/* Background decorations */}
          <div className="absolute top-[10%] right-[8%] w-[100px] h-[100px] rounded-full" style={{ border: "1.5px solid rgba(35,171,126,.08)", animation: "nl-ring-rotate-2 20s linear infinite" }} />
          <div className="absolute bottom-[15%] left-[5%] w-[60px] h-[60px] rounded-full" style={{ background: "radial-gradient(circle, rgba(128,84,184,0.08), transparent 70%)" }} />
          <div className="absolute top-[20%] left-[15%] w-[80px] h-[80px] rounded-full" style={{ background: "radial-gradient(circle, rgba(35,171,126,0.06), transparent 70%)" }} />

          <div className="relative z-10 flex flex-col items-center">
            {/* Icon with glow */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-[28px] opacity-20" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", animation: "nl-glow-breathe 3s ease-in-out infinite" }} />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[24px] shadow-xl" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", boxShadow: "0 12px 40px rgba(35,171,126,0.3)" }}>
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-3 -right-3" style={{ animation: "nl-pulse-dot 2s ease infinite" }}>
                <div className="w-8 h-8 rounded-xl bg-[#8054b8] flex items-center justify-center shadow-lg"><Sparkles className="h-4 w-4 text-white" /></div>
              </div>
            </div>

            <h2 className="text-sm sm:text-xl font-black text-[#2d3142] text-center">{tc.noCompanies}</h2>
            <p className="mt-3 text-sm sm:text-sm text-[#8f96a3] text-center max-w-lg">{tc.addFirst}</p>

            {/* Benefit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-2xl w-full">
              {[
                { icon: Sparkles, title: locale === "ar" ? "تحليل الهوية" : "Brand DNA", desc: locale === "ar" ? "الذكاء الاصطناعي يحلل علامتك" : "AI analyzes your brand", color: "#23ab7e" },
                { icon: FileText, title: locale === "ar" ? "خطط المحتوى" : "Content Plans", desc: locale === "ar" ? "7 أيام محتوى جاهز" : "7 days of ready content", color: "#8054b8" },
                { icon: Palette, title: locale === "ar" ? "مرئيات AI" : "AI Visuals", desc: locale === "ar" ? "صور احترافية فورية" : "Instant pro images", color: "#e67af3" },
              ].map((b) => (
                <div key={b.title} className="rounded-xl p-3 text-center transition-all hover:-translate-y-1" style={{ background: `${b.color}08`, border: `1.5px solid ${b.color}18` }}>
                  <div className="w-12 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${b.color}15` }}>
                    <b.icon className="w-6 h-6" style={{ color: b.color }} />
                  </div>
                  <p className="text-sm font-bold text-[#2d3142]">{b.title}</p>
                  <p className="text-sm text-[#8f96a3] mt-1">{b.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={openAdd}
              className="relative mt-10 h-16 px-12 text-xl font-black rounded-xl text-white border-none cursor-pointer transition-all hover:-translate-y-1 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #23ab7e, #1a8a64, #8054b8)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 8px 32px rgba(35,171,126,0.3)" }}
            >
              <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
              <span className="relative flex items-center gap-3"><Plus className="h-6 w-6" />{tc.addCompany}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ===== COMPANY CARDS GRID ===== */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => {
            const keywords: { label: string; type: keyof typeof TAG_STYLES }[] = [];
            if (c.industry) keywords.push({ label: locale === "ar" ? (INDUSTRIES.find((ind) => ind.en === c.industry)?.ar ?? c.industry) : c.industry, type: "industry" });
            if (c.tone) keywords.push({ label: c.tone, type: "tone" });
            (c.platforms || []).slice(0, 2).forEach((p) => keywords.push({ label: p, type: "platform" }));

            const accent = ["#23ab7e", "#8054b8", "#e67af3", "#2dd4a0", "#c4a8e8", "#f5c6fa"][i % 6];
            const hasAnalysis = c.brand_analysis && Object.keys(c.brand_analysis).length > 0;

            return (
              <div key={c.id} className="group transition-all duration-300 hover:-translate-y-2">
                <div className="relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "1.5px solid #e8eaef" }}>
                  {/* Accent bar */}
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40)` }} />

                  <div className="p-7">
                    {/* Logo + Name + AI Badge */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="rounded-xl p-[2.5px] shadow-lg" style={{ background: `linear-gradient(135deg, ${accent}, #8054b8)` }}>
                          <div className="flex h-8 w-8 items-center justify-center rounded-[13px] text-sm font-black text-white" style={{ backgroundColor: c.brand_colors?.[0] ?? accent }}>
                            {c.logo_url ? (
                              <img src={c.logo_url} alt={c.name || ""} className="h-full w-full rounded-[13px] object-cover" />
                            ) : (
                              <span className="text-2xl">{c.name?.charAt(0) ?? "?"}</span>
                            )}
                          </div>
                        </div>
                        {hasAnalysis && (
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#23ab7e] flex items-center justify-center shadow-md" style={{ animation: "nl-pulse-dot 3s ease infinite" }}>
                            <BadgeCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-extrabold text-[#2d3142] truncate leading-tight">{c.name}</h3>
                        {c.name_ar && <p className="text-sm text-[#8f96a3] mt-0.5 truncate">{c.name_ar}</p>}
                        {c.industry && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}20` }}>
                            {locale === "ar" ? (INDUSTRIES.find((ind) => ind.en === c.industry)?.ar ?? c.industry) : c.industry}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {c.description && (
                      <p className="mt-4 text-sm text-[#8f96a3] line-clamp-2 leading-relaxed">{c.description}</p>
                    )}

                    {/* Tags */}
                    {keywords.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {keywords.slice(0, 4).map((kw, ki) => {
                          const s = TAG_STYLES[kw.type];
                          return (
                            <span key={ki} className={cn("rounded-lg border px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1", s.bg, s.border, s.text)}>
                              {kw.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Colors + AI badge row */}
                    <div className="mt-4 flex items-center justify-between">
                      {c.brand_colors?.length ? (
                        <div className="flex gap-1.5">
                          {c.brand_colors.slice(0, 5).map((hex, idx) => (
                            <div key={idx} className="h-6 w-6 rounded-lg border-2 border-white shadow-sm ring-1 ring-[#e8eaef]/50" style={{ backgroundColor: hex }} />
                          ))}
                        </div>
                      ) : <div />}
                      {hasAnalysis && (
                        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold" style={{ background: "#8054b815", color: "#8054b8", border: "1px solid #8054b825" }}>
                          <Sparkles className="h-3 w-3" />AI
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2">
                      <button onClick={() => setViewingCompany(c)} className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer border-none" style={{ background: `linear-gradient(135deg, ${accent}, #8054b8)`, boxShadow: `0 4px 12px ${accent}25` }}>
                        <Eye className="h-4 w-4" />{tc.viewDetails || (locale === "ar" ? "عرض" : "View")}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="h-11 w-11 rounded-xl flex items-center justify-center border-2 border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#8054b8] hover:text-[#8054b8] transition-all cursor-pointer">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {confirmDeleteId === c.id ? (
                        <div className="flex gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="h-11 px-3 rounded-xl bg-red-500 text-white text-sm font-bold border-none cursor-pointer hover:bg-red-600 transition-colors">{locale === "ar" ? "حذف" : "Yes"}</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="h-11 px-3 rounded-xl border-2 border-[#e8eaef] bg-white text-[#8f96a3] text-sm font-bold cursor-pointer hover:border-[#e8eaef] transition-colors">{locale === "ar" ? "لا" : "No"}</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(c.id); }} className="h-11 w-11 rounded-xl flex items-center justify-center border-2 border-[#e8eaef] bg-white text-[#8f96a3] hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ===== ADD COMPANY CARD ===== */}
          <div className="group cursor-pointer transition-all duration-300 hover:-translate-y-2" onClick={openAdd}>
            <div className="relative flex h-full min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e8eaef] overflow-hidden transition-all duration-300 hover:border-[#23ab7e] hover:shadow-[0_20px_60px_rgba(35,171,126,0.08)]" style={{ background: "linear-gradient(170deg, #fafbfd, #f0fdf8, #f5f0ff)" }}>
              <div className="relative">
                <div className="absolute -inset-3 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)" }} />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-shadow" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)" }}>
                  <Plus className="h-10 w-10 text-white" />
                </div>
              </div>
              <p className="mt-5 text-xl font-bold text-[#2d3142]">{tc.addCompany}</p>
              <p className="mt-1 text-sm text-[#8f96a3]">{locale === "ar" ? "أضف علامتك التجارية" : "Add your brand"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD/EDIT DIALOG ===== */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) loadCompanies(); }}>
        <DialogContent className="max-w-[95vw] lg:max-w-[85vw] max-h-[95vh] overflow-y-auto bg-white border-2 border-[#e8eaef] text-[#2d3142] scrollbar-nawaa p-0">
          {/* Gradient header bar */}
          <div className="sticky top-0 z-10 nl-aurora-bg px-4 sm:px-8 py-5 sm:py-7 rounded-t-lg overflow-hidden">
            {/* Decorative shapes */}
            <div className="flex items-center gap-4 relative z-10">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 border border-white/30"
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="font-['Cairo'] text-sm sm:text-xl font-black text-white drop-shadow-lg">
                    {editingId ? tc.editCompany : tc.addCompany}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/80 text-sm sm:text-sm mt-1 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
                  Premium Brand Builder
                  <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-6 space-y-0">
            {/* ─── Section 1: Basic Info ─── */}
            <section
              className="rounded-xl bg-white p-4 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-sm sm:text-xl font-black text-[#1a1d2e]">{tc.basicInfo}</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.nameEn} {tc.required}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-11 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm px-4 transition-all"
                    placeholder={tc.namePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.nameAr}</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    className="h-11 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm px-4 transition-all"
                    placeholder={tc.nameArPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.industry}</Label>
                  <Select
                    value={INDUSTRIES.some((ind) => ind.en === form.industry) ? form.industry : form.industry ? "Other" : ""}
                    onValueChange={(v) => {
                      if (v === "Other") {
                        setForm((f) => ({ ...f, industry: "" }));
                        setShowCustomIndustry(true);
                      } else {
                        setForm((f) => ({ ...f, industry: v ?? "" }));
                        setShowCustomIndustry(false);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] focus:border-[#23ab7e] rounded-xl text-sm px-4">
                      <SelectValue placeholder={tc.selectIndustry} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#e8eaef] rounded-xl max-h-80">
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.en} value={ind.en} className="text-[#2d3142] text-sm py-2 rounded-xl">
                          {locale === "ar" ? ind.ar : ind.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showCustomIndustry && (
                    <Input
                      value={form.industry}
                      onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                      placeholder={locale === "ar" ? "اكتب مجال شركتك..." : "Type your industry..."}
                      className="mt-3 h-11 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm px-4 transition-all"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.website}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.website}
                      onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                      className="h-11 flex-1 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm px-4 transition-all"
                      placeholder="https://"
                    />
                    <Button
                      type="button"
                      onClick={handleScrapeWebsite}
                      disabled={scrapingWebsite || !form.website.trim()}
                      className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#1a8a64] text-white text-xs font-bold hover:shadow-md transition-all disabled:opacity-50 shrink-0"
                    >
                      {scrapingWebsite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                      <span className="ml-1.5">{locale === "ar" ? "استخراج" : "Scrape"}</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.description}</Label>

                {/* PDF Extraction Progress Overlay */}
                {uploadingPdf && pdfProgress && (
                  <div className="mb-4 rounded-2xl border-2 border-[#8054b8]/30 bg-gradient-to-br from-[#f8f5ff] to-[#f0ebff] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex h-10 w-10 items-center justify-center">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] animate-pulse" />
                        <FileText className="relative h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1d2e]">
                          {locale === "ar" ? "جاري تحليل المستند" : "Analyzing Document"}
                        </p>
                        <p className="text-xs text-[#8f96a3]">
                          {locale === "ar" ? "يرجى الانتظار، قد يستغرق ذلك بضع ثوانٍ..." : "Please wait, this may take a moment..."}
                        </p>
                      </div>
                    </div>
                    {/* Progress steps */}
                    <div className="space-y-3">
                      {(locale === "ar"
                        ? ["جاري رفع الملف...", "جاري قراءة صفحات المستند...", "جاري استخراج معلومات الشركة...", "جاري إنهاء الملف التعريفي..."]
                        : ["Uploading PDF...", "Reading document pages...", "Extracting company information...", "Finalizing profile..."]
                      ).map((stepLabel, i) => {
                        const isComplete = pdfProgress.step > i;
                        const isCurrent = pdfProgress.step === i;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                              isComplete && "bg-gradient-to-br from-[#23ab7e] to-[#1a8a64] text-white shadow-md",
                              isCurrent && "bg-gradient-to-br from-[#8054b8] to-[#A78BFA] text-white shadow-md shadow-[#8054b8]/30 animate-pulse",
                              !isComplete && !isCurrent && "bg-[#e8eaef] text-[#8f96a3]"
                            )}>
                              {isComplete ? "\u2713" : i + 1}
                            </div>
                            <span className={cn(
                              "text-sm font-medium transition-all duration-300",
                              isComplete && "text-[#23ab7e]",
                              isCurrent && "text-[#8054b8] font-bold",
                              !isComplete && !isCurrent && "text-[#8f96a3]"
                            )}>
                              {stepLabel}
                            </span>
                            {isCurrent && <Loader2 className="h-4 w-4 text-[#8054b8] animate-spin" />}
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-2 rounded-full bg-[#e8eaef] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8054b8] via-[#A78BFA] to-[#23ab7e] transition-all duration-700 ease-out"
                        style={{ width: `${((pdfProgress.step + 1) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Extracted PDF Content — Beautiful Display */}
                {extractedPdfText && !uploadingPdf && (
                  <div className="mb-4 rounded-2xl border-2 border-[#23ab7e]/25 bg-gradient-to-br from-[#f0fdf7] to-[#ecfdf3] overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#23ab7e] to-[#1a8a64]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">
                          {locale === "ar" ? "الملف التعريفي المستخرج" : "Extracted Company Profile"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExtractedPdfText(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="p-5 max-h-[400px] overflow-y-auto">
                      {extractedPdfText.split("\n\n").map((paragraph, i) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        // Detect section headers (lines starting with ** or # or ALL CAPS short lines or lines ending with :)
                        const isHeader = /^(\*\*|#{1,3}\s)/.test(trimmed) || (/^[A-Z\u0600-\u06FF\s]{3,60}:?$/.test(trimmed) && trimmed.length < 80) || trimmed.endsWith(":");
                        if (isHeader) {
                          const cleanHeader = trimmed.replace(/^#+\s*/, "").replace(/^\*\*|\*\*$/g, "").replace(/:$/, "");
                          return (
                            <div key={i} className="flex items-center gap-2 mt-4 mb-2 first:mt-0">
                              <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#23ab7e] to-[#8054b8]" />
                              <h4 className="text-sm font-black text-[#1a1d2e]">{cleanHeader}</h4>
                            </div>
                          );
                        }
                        // Render bullet points nicely
                        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("\u2022")) {
                          const bullets = trimmed.split("\n").filter(Boolean);
                          return (
                            <div key={i} className="space-y-1.5 mb-3">
                              {bullets.map((bullet, j) => (
                                <div key={j} className="flex items-start gap-2.5 pl-2">
                                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#23ab7e]" />
                                  <p className="text-sm text-[#2d3142] leading-relaxed">{bullet.replace(/^[-*\u2022]\s*/, "")}</p>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <p key={i} className="text-sm text-[#2d3142] leading-relaxed mb-3">{trimmed}</p>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 border-t border-[#23ab7e]/15 bg-[#f0fdf7]/50">
                      <span className="text-xs font-medium text-[#23ab7e]">
                        {locale === "ar" ? "تم الاستخراج بالذكاء الاصطناعي" : "AI-extracted from your PDF"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExtractedPdfText(null)}
                        className="text-xs font-bold text-[#8054b8] hover:text-[#6d3fa0] transition-colors"
                      >
                        {locale === "ar" ? "إخفاء المعاينة" : "Hide preview"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative rounded-xl border-2 border-[#e8eaef] bg-[#fafbfd] focus-within:border-[#23ab7e] focus-within:bg-white transition-all overflow-hidden">
                  <Textarea
                    value={form.description}
                    onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); }}
                    className="border-0 bg-transparent text-[#2d3142] placeholder:text-[#8f96a3]/50 rounded-xl text-sm p-4 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={Math.min(Math.max(5, Math.ceil(form.description.length / 80)), 15)}
                    placeholder={locale === "ar" ? "اكتب وصف شركتك أو ارفع ملف PDF للملف التعريفي..." : "Describe your company, paste a full company profile, or upload a PDF..."}
                  />
                  {/* Bottom bar: char count + PDF upload */}
                  <div className="flex items-center justify-between px-5 py-3 bg-[#f4f6f8]/60 border-t border-[#e8eaef]/50">
                    <div className="flex items-center gap-3">
                      <label className={cn("cursor-pointer flex items-center gap-2 bg-white border-2 border-[#e8eaef] rounded-xl px-4 py-2 hover:border-[#23ab7e] hover:shadow-md transition-all", uploadingPdf && "pointer-events-none opacity-50")}>
                        <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                        {uploadingPdf ? (
                          <Loader2 className="h-5 w-5 text-[#8054b8] animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5 text-[#23ab7e]" />
                        )}
                        <span className="text-sm font-bold text-[#23ab7e]">
                          {uploadingPdf ? (locale === "ar" ? "جاري الاستخراج..." : "Extracting...") : (locale === "ar" ? "رفع ملف PDF" : "Upload PDF")}
                        </span>
                      </label>
                      {!uploadingPdf && form.description.length > 500 && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#8054b8]">
                          <FileText className="h-4 w-4" />
                          {locale === "ar" ? "ملف تعريفي شامل" : "Rich profile"}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      form.description.length > 5000 ? "text-[#8054b8]" : "text-[#8f96a3]/60"
                    )}>
                      {form.description.length.toLocaleString()} {locale === "ar" ? "حرف" : "chars"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#8054b8]/40 to-transparent" />

            {/* ─── Section 2: Brand Identity ─── */}
            <section
              className="rounded-xl bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8] p-4 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg">
                  <Palette className="h-6 w-6 text-[#2d3142]" />
                </div>
                <h3 className="font-['Cairo'] text-sm sm:text-xl font-black text-[#1a1d2e]">{tc.brandIdentity}</h3>
              </div>

              {/* Logo upload */}
              <div className="mb-6">
                <Label className="text-sm font-bold text-[#1a1d2e] mb-3 block">{tc.logo}</Label>
                <div className="flex items-center gap-5">
                  {uploadingLogo ? (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border-3 border-dashed border-[#8054b8] bg-white shadow-inner">
                      <Loader2 className="h-8 w-8 text-[#8054b8] animate-spin" />
                    </div>
                  ) : form.logo_url ? (
                    <div
                      className="relative"
                    >
                      <div className="rounded-xl p-[3px] bg-gradient-to-br from-[#23ab7e] via-[#8054b8] to-[#8054b8]">
                        <img src={form.logo_url} alt="Company logo" className="h-24 w-24 rounded-[14px] object-cover max-w-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border-3 border-dashed border-[#e8eaef] bg-white shadow-inner hover:border-[#8054b8] transition-colors">
                      <Upload className="h-8 w-8 text-[#8f96a3]" />
                    </div>
                  )}
                  <label className={cn("cursor-pointer bg-white border-2 border-[#e8eaef] rounded-xl px-6 py-4 hover:border-[#23ab7e] hover:shadow-lg transition-all group/upload", uploadingLogo && "pointer-events-none opacity-50")}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                    <span className="text-sm font-bold text-[#23ab7e] group-hover/upload:text-[#8054b8] transition-colors">
                      {uploadingLogo ? tc.uploadingLogo : tc.uploadLogo}
                    </span>
                  </label>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="mb-6">
                <Label className="text-sm font-bold text-[#1a1d2e] mb-3 block">Brand Colors</Label>
                <div className="flex flex-wrap gap-3">
                  {form.brand_colors.map((hex, idx) => (
                    <div
                      key={idx}
                      className="h-8 w-8 rounded-xl border-2 border-white cursor-pointer shadow-md ring-2 ring-[#e8eaef] hover:ring-[#8054b8] transition-all"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.tone}</Label>
                <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v ?? "" }))}>
                  <SelectTrigger className="h-10 border-2 border-[#e8eaef] bg-white text-[#2d3142] focus:border-[#23ab7e] rounded-xl text-sm px-5">
                    <SelectValue placeholder={tc.selectTone} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#e8eaef] rounded-xl">
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t} className="text-[#2d3142] text-sm py-2 rounded-xl">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#23ab7e]/30 to-transparent" />

            {/* ─── Section 3: Marketing ─── */}
            <section
              className="rounded-xl bg-white p-4 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-sm sm:text-xl font-black text-[#1a1d2e]">{tc.marketing}</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.targetAudience}</Label>
                  <Textarea
                    value={form.target_audience}
                    onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                    className="border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm p-4 transition-all"
                    rows={3}
                    placeholder={tc.targetPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.uniqueValue}</Label>
                  <Textarea
                    value={form.unique_value}
                    onChange={(e) => setForm((f) => ({ ...f, unique_value: e.target.value }))}
                    className="border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm p-4 transition-all"
                    rows={3}
                    placeholder={tc.uniquePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-2 block">{tc.competitors}</Label>
                  <Input
                    value={form.competitors}
                    onChange={(e) => setForm((f) => ({ ...f, competitors: e.target.value }))}
                    className="h-11 border-2 border-[#e8eaef] bg-[#fafbfd] text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:bg-white rounded-xl text-sm px-4 transition-all"
                  />
                </div>

                {/* Platform selector as emoji cards */}
                <div>
                  <Label className="text-sm font-bold text-[#1a1d2e] mb-3 block">{tc.platforms}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PLATFORMS.map((p) => {
                      const config = PLATFORM_CARDS[p];
                      const isSelected = form.platforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePlatform(p)}
                          className={cn(
                            "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all duration-300 shadow-sm overflow-hidden",
                            isSelected
                              ? cn(config?.selectedBg ?? "bg-gradient-to-br from-[#23ab7e] to-[#8054b8]", config?.selectedBorder ?? "border-[#23ab7e]", "text-white shadow-lg")
                              : cn(config?.unselectedBg ?? "bg-[#fafbfd]", "border-[#e8eaef]", config?.color ?? "text-[#8f96a3]", "hover:border-[#23ab7e] hover:shadow-md")
                          )}
                        >
                          <span className="text-3xl">{config?.emoji ?? "\uD83D\uDCF1"}</span>
                          <span className={cn("text-sm font-extrabold", isSelected ? "text-white" : "")}>{p}</span>
                          {isSelected && (
                            <div
                              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30"
                            >
                              <span className="text-sm text-white font-bold">{"\u2713"}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#8054b8]/40 to-transparent" />

            {/* ─── Section 4: AI Analysis ─── */}
            <section
              className="rounded-xl bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8] p-4 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg"
                >
                  <Sparkles className="h-6 w-6 text-[#2d3142]" />
                </div>
                <h3 className="font-['Cairo'] text-sm sm:text-xl font-black text-[#1a1d2e]">{tc.analyzeAI}</h3>
              </div>
              <div className="mb-5 flex items-center gap-4">
                <Label className="text-sm font-bold text-[#1a1d2e]">{tc.generateIn}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "en" ? "default" : "outline"}
                    className={cn(
                      "h-9 rounded-xl text-sm px-6 font-bold transition-all",
                      outputLanguage === "en"
                        ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg"
                        : "border-2 border-[#e8eaef] text-[#8f96a3] bg-white hover:border-[#23ab7e] hover:shadow-md"
                    )}
                    onClick={() => setOutputLanguage("en")}
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "ar" ? "default" : "outline"}
                    className={cn(
                      "h-9 rounded-xl text-sm px-6 font-bold transition-all",
                      outputLanguage === "ar"
                        ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg"
                        : "border-2 border-[#e8eaef] text-[#8f96a3] bg-white hover:border-[#23ab7e] hover:shadow-md"
                    )}
                    onClick={() => setOutputLanguage("ar")}
                  >
                    {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
                  </Button>
                </div>
              </div>
              {/* Analysis count indicator */}
              {editingId && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-3 w-10 rounded-full transition-all",
                          i < getAnalysisCount()
                            ? "bg-gradient-to-r from-[#8054b8] to-[#A78BFA]"
                            : "bg-[#e8eaef]"
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    getAnalysisCount() >= 3 ? "text-red-500" : "text-[#8f96a3]"
                  )}>
                    {getAnalysisCount()}/3
                    {getAnalysisCount() >= 3
                      ? ` — ${tc.analysisLimit || "Limit reached"}`
                      : ` ${tc.analysisRemaining || "analyses remaining"}`
                    }
                  </span>
                </div>
              )}
              <div>
                <Button
                  type="button"
                  onClick={runAnalyze}
                  disabled={analyzing || getAnalysisCount() >= 3}
                  className={cn(
                    "relative h-16 text-xl px-10 rounded-xl font-extrabold transition-all shadow-xl overflow-hidden",
                    getAnalysisCount() >= 3
                      ? "bg-[#e8eaef] text-[#8f96a3] cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-[#8054b8] via-[#A78BFA] to-[#8054b8] text-[#2d3142] hover:shadow-md"
                  )}
                >
                  {/* Shimmer effect */}
                  {getAnalysisCount() < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                  )}
                  {analyzing ? (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  ) : getAnalysisCount() >= 3 ? (
                    <AlertCircle className="mr-3 h-5 w-5" />
                  ) : (
                    <Sparkles className="mr-3 h-5 w-5" />
                  )}
                  {getAnalysisCount() >= 3 ? (tc.analysisLimit || "Limit Reached") : tc.analyzeAI}
                </Button>
              </div>
              {/* Live analysis progress */}
              {analyzing && analyzeSteps.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#e8eaef] bg-[#fafbfd] p-4 space-y-2">
                  <p className="text-xs font-bold text-[#505868] uppercase tracking-wider mb-2">{locale === "ar" ? "تقدم التحليل" : "Analysis Progress"}</p>
                  {analyzeSteps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={cn(
                        "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold",
                        s.step === "scrape_failed" ? "bg-amber-400" : "bg-[#23ab7e]"
                      )}>✓</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2d3142]">{s.message}</p>
                        {s.details && (() => {
                          const d = s.details as Record<string, string | number | string[]>;
                          return (
                          <div className="mt-1 text-[10px] text-[#8f96a3] space-y-0.5">
                            {d.title ? <p>{"Title: "}<span className="text-[#505868] font-medium">{String(d.title).slice(0, 80)}</span></p> : null}
                            {d.metaDescription ? <p>{"Description: "}<span className="text-[#505868]">{String(d.metaDescription)}</span></p> : null}
                            {Number(d.colorsFound) > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span>{"Brand colors: "}</span>
                                {(d.cssColors as string[])?.map((c, ci) => (
                                  <span key={ci} className="inline-flex items-center gap-0.5">
                                    <span className="h-3 w-3 rounded-sm border border-black/10" style={{ background: c }} />
                                    <span className="text-[#505868]">{c}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            {d.contentLength ? <p>{"Content extracted: "}<span className="text-[#505868] font-medium">{String(d.contentLength)} characters</span></p> : null}
                          </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                  {analyzing && (
                    <div className="flex items-center gap-2 pt-1">
                      <Loader2 className="h-3 w-3 animate-spin text-[#8054b8]" />
                      <span className="text-xs text-[#8054b8] font-medium">{analyzeSteps[analyzeSteps.length - 1]?.message || "Processing..."}</span>
                    </div>
                  )}
                </div>
              )}
              {brandAnalysis && <BrandAnalysisDisplay data={brandAnalysis} locale={locale} />}
            </section>

            {/* ─── Footer Actions ─── */}
            <div className="sticky bottom-0 bg-white/90 border-t-2 border-[#e8eaef] rounded-b-lg -mx-8 px-8 py-5 flex justify-end gap-4 mt-4 ">
              <div>
                <Button
                  variant="outline"
                  className="h-10 px-8 text-sm font-bold rounded-xl border-2 border-[#e8eaef] text-[#505868] hover:bg-[#f4f6f8] hover:border-[#8054b8]/40 transition-all"
                  onClick={() => setFormOpen(false)}
                >
                  {tc.cancel}
                </Button>
              </div>
              <div>
                <Button
                  onClick={saveCompany}
                  disabled={saving}
                  className="h-10 px-12 text-sm font-extrabold rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-xl hover:shadow-md transition-all"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : tc.save}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== COMPANY DETAIL VIEW DIALOG ===== */}
      <Dialog open={!!viewingCompany} onOpenChange={(open) => !open && setViewingCompany(null)}>
        <DialogContent className="max-w-[95vw] lg:max-w-[80vw] max-h-[95vh] overflow-y-auto bg-white border-2 border-[#e8eaef] text-[#2d3142] scrollbar-nawaa p-0">
          {viewingCompany && (() => {
            const vc = viewingCompany;
            const analysisCount = vc.analysis_count ?? 0;
            const hasAnalysis = !!vc.brand_analysis && Object.keys(vc.brand_analysis).length > 0;

            return (
              <>
                {/* Header with gradient + company logo */}
                <div className="relative nl-aurora-bg px-4 sm:px-8 py-6 sm:py-10 overflow-hidden">

                  {/* Close button */}
                  <button
                    onClick={() => setViewingCompany(null)}
                    aria-label="Close company details"
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="relative z-10 flex items-center gap-4 sm:gap-4 flex-wrap">
                    {/* Logo */}
                    <div
                    >
                      <div className="rounded-xl p-[3px] bg-white/30 shadow-2xl">
                        <div
                          className="flex h-24 w-24 md:h-28 md:w-28 shrink-0 items-center justify-center rounded-[14px] text-4xl font-extrabold text-white"
                          style={{ backgroundColor: vc.brand_colors?.[0] ?? "#23ab7e" }}
                        >
                          {vc.logo_url ? (
                            <img src={vc.logo_url} alt={vc.name || "Company logo"} className="h-full w-full rounded-[14px] object-cover max-w-full" />
                          ) : (
                            vc.name?.charAt(0) ?? "?"
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2
                        className="font-['Cairo'] text-sm sm:text-sm md:text-xl font-extrabold text-white drop-shadow-lg"
                      >
                        {vc.name}
                      </h2>
                      {vc.name_ar && (
                        <p className="mt-1 text-xl text-white/80 font-medium">{vc.name_ar}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {vc.industry && (
                          <span className="rounded-xl bg-white/20 border border-white/30 px-4 py-1.5 text-sm font-semibold text-white">
                            {TAG_STYLES.industry.emoji} {locale === "ar" ? (INDUSTRIES.find((ind) => ind.en === vc.industry)?.ar ?? vc.industry) : vc.industry}
                          </span>
                        )}
                        {vc.tone && (
                          <span className="rounded-xl bg-white/20 border border-white/30 px-4 py-1.5 text-sm font-semibold text-white">
                            {TAG_STYLES.tone.emoji} {vc.tone}
                          </span>
                        )}
                        {vc.website && (
                          <span className="rounded-xl bg-white/20 border border-white/30 px-4 py-1.5 text-sm font-semibold text-white flex items-center gap-1.5">
                            <Globe className="h-4 w-4" /> {vc.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-8">
                  {/* Company Info Grid */}
                  <div
                    className="grid gap-4 md:grid-cols-2"
                  >
                    {/* Description */}
                    {vc.description && (
                      <div className="md:col-span-2 rounded-xl border-2 border-[#e8eaef] bg-[#fafbfd] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e]">
                            <FileText className="h-5 w-5 text-[#8054b8]" />
                            {tc.description}
                          </h4>
                          <span className="text-sm font-medium text-[#8f96a3]/60">{vc.description.length.toLocaleString()} {locale === "ar" ? "حرف" : "chars"}</span>
                        </div>
                        <div className={cn(
                          "text-sm text-[#2d3142] leading-relaxed whitespace-pre-wrap",
                          vc.description.length > 600 ? "max-h-[300px] overflow-y-auto scrollbar-nawaa pr-2" : ""
                        )}>
                          {vc.description}
                        </div>
                      </div>
                    )}

                    {/* Target Audience */}
                    {vc.target_audience && (
                      <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e] mb-3">
                          <Users className="h-5 w-5 text-[#3B82F6]" />
                          {tc.targetAudience}
                        </h4>
                        <p className="text-sm text-[#8f96a3] leading-relaxed">{vc.target_audience}</p>
                      </div>
                    )}

                    {/* Unique Value */}
                    {vc.unique_value && (
                      <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e] mb-3">
                          <Sparkles className="h-5 w-5 text-[#8054b8]" />
                          {tc.uniqueValue}
                        </h4>
                        <p className="text-sm text-[#8f96a3] leading-relaxed">{vc.unique_value}</p>
                      </div>
                    )}

                    {/* Competitors */}
                    {vc.competitors && (
                      <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e] mb-3">
                          <Target className="h-5 w-5 text-[#F97316]" />
                          {tc.competitors}
                        </h4>
                        <p className="text-sm text-[#8f96a3]">{vc.competitors}</p>
                      </div>
                    )}

                    {/* Platforms */}
                    {vc.platforms && vc.platforms.length > 0 && (
                      <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e] mb-3">
                          <Megaphone className="h-5 w-5 text-[#A855F7]" />
                          {tc.platforms}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {vc.platforms.map((p) => {
                            const config = PLATFORM_CARDS[p];
                            return (
                              <span key={p} className={cn("rounded-xl px-4 py-2 text-sm font-bold text-white", config?.selectedBg ?? "bg-[#23ab7e]")}>
                                {config?.emoji ?? "\uD83D\uDCF1"} {p}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Brand Colors */}
                    {vc.brand_colors && vc.brand_colors.length > 0 && (
                      <div className="rounded-xl border-2 border-[#e8eaef] bg-white p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d2e] mb-3">
                          <Palette className="h-5 w-5 text-[#EC4899]" />
                          {tc.brandColors || "Brand Colors"}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {vc.brand_colors.map((hex, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-xl border-2 border-white shadow-lg ring-2 ring-[#e8eaef] cursor-pointer"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-sm font-mono font-semibold text-[#8f96a3]">{hex}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradient divider */}
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#8054b8]/40 to-transparent" />

                  {/* AI Analysis Section */}
                  <div
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg"
                      >
                        <Sparkles className="h-6 w-6 text-[#2d3142]" />
                      </div>
                      <div>
                        <h3 className="font-['Cairo'] text-sm sm:text-xl font-black text-[#1a1d2e]">
                          {tc.aiAnalysis || "AI Brand Analysis"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-2.5 w-8 rounded-full transition-all",
                                  i < analysisCount
                                    ? "bg-gradient-to-r from-[#8054b8] to-[#A78BFA]"
                                    : "bg-[#e8eaef]"
                                )}
                              />
                            ))}
                          </div>
                          <span className={cn(
                            "text-sm font-semibold",
                            analysisCount >= 3 ? "text-red-500" : "text-[#8f96a3]"
                          )}>
                            {analysisCount}/3 {tc.analysisRemaining || "analyses used"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {hasAnalysis ? (
                      <BrandAnalysisDisplay data={vc.brand_analysis!} locale={locale} />
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-[#e8eaef] bg-[#fafbfd] p-10 text-center">
                        <div
                        >
                          <Sparkles className="h-8 w-8 text-[#e8eaef] mx-auto mb-4" />
                        </div>
                        <p className="text-xl font-bold text-[#8f96a3]">
                          {tc.noAnalysis || "No AI analysis yet. Edit the company to run one."}
                        </p>
                        <Button
                          className="mt-5 h-9 px-8 text-sm font-bold rounded-xl bg-gradient-to-r from-[#8054b8] to-[#A78BFA] text-[#2d3142] shadow-lg hover:shadow-md transition-all"
                          onClick={() => { setViewingCompany(null); openEdit(vc); }}
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          {tc.analyzeAI}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bottom actions */}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#e8eaef]">
                    <Button
                      variant="outline"
                      className="h-9 px-6 text-sm font-bold border-2 border-[#e8eaef] text-[#1a1d2e] hover:bg-[#f4f6f8] rounded-xl transition-all"
                      onClick={() => { setViewingCompany(null); openEdit(vc); }}
                    >
                      <Pencil className="mr-2 h-5 w-5" /> {tc.edit}
                    </Button>
                    <Button
                      className="h-9 px-8 text-sm font-bold bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white rounded-xl shadow-lg hover:shadow-sm transition-all"
                      onClick={() => setViewingCompany(null)}
                    >
                      {tc.close || "Close"}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
