"use client";

import { useEffect, useState } from "react";
/* motion removed – using plain HTML + CSS transitions */
import { Building2, Plus, Pencil, Trash2, Upload, Loader2, Sparkles, FileText, Clock, Target, Megaphone, Users, Zap, Shield, Flame, Crown, BadgeCheck, Palette, Eye, X, Globe, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
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

const FALLBACK_COLORS = ["#006C35", "#00A352", "#C9A84C", "#0B1A0F", "#D0EBDA"];

/* ── Platform config with rich visual data (matches planner/hashtags) ── */
const PLATFORM_CARDS: Record<string, { emoji: string; selectedBg: string; selectedBorder: string; unselectedBg: string; color: string }> = {
  "Instagram":    { emoji: "\uD83D\uDCF8", selectedBg: "bg-gradient-to-br from-pink-500 to-rose-500", selectedBorder: "border-pink-400", unselectedBg: "bg-pink-50", color: "text-pink-600" },
  "X (Twitter)":  { emoji: "\uD835\uDD4F", selectedBg: "bg-gradient-to-br from-slate-700 to-slate-900", selectedBorder: "border-slate-400", unselectedBg: "bg-slate-50", color: "text-slate-700" },
  "TikTok":       { emoji: "\uD83C\uDFB5", selectedBg: "bg-gradient-to-br from-slate-800 to-cyan-500", selectedBorder: "border-cyan-400", unselectedBg: "bg-slate-50", color: "text-slate-700" },
  "Snapchat":     { emoji: "\uD83D\uDC7B", selectedBg: "bg-gradient-to-br from-yellow-400 to-amber-400", selectedBorder: "border-yellow-400", unselectedBg: "bg-yellow-50", color: "text-yellow-700" },
  "LinkedIn":     { emoji: "\uD83D\uDCBC", selectedBg: "bg-gradient-to-br from-blue-500 to-blue-700", selectedBorder: "border-blue-400", unselectedBg: "bg-blue-50", color: "text-blue-600" },
};

/* ── Card accent gradient rotation ── */
const CARD_GRADIENTS = [
  "from-[#006C35] via-[#00A352] to-[#C9A84C]",
  "from-[#C9A84C] via-[#E8D5A0] to-[#006C35]",
  "from-rose-500 via-pink-500 to-purple-500",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
];

/* ── Tag emoji prefixes and colors ── */
const TAG_STYLES = {
  industry:  { emoji: "\uD83C\uDFED", bg: "bg-[#006C35]/10", border: "border-[#006C35]/25", text: "text-[#006C35]" },
  tone:      { emoji: "\uD83C\uDFA8", bg: "bg-[#C9A84C]/10", border: "border-[#C9A84C]/25", text: "text-[#C9A84C]" },
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
    educational: "#006C35",
    promotional: "#C9A84C",
    engagement: "#00A352",
    storytelling: "#3B82F6",
    entertainment: "#A855F7",
  };

  const mixTotal = mix ? Object.values(mix).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mt-4 space-y-4">
      {/* Brand Personality */}
      {bp && (
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Sparkles className="h-5 w-5 text-[#C9A84C]" />
            {tc.brandPersonality}
          </h4>
          <div className="space-y-3">
            {personalityDimensions.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-[#5A8A6A]">{d.icon}</span>
                <span className="w-24 text-sm text-[#004D26]">{d.label}</span>
                <div className="flex-1 h-3 rounded-full bg-[#F0F7F2] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352] transition-all duration-700"
                    style={{ width: `${d.value}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium text-[#C9A84C]">{d.value}</span>
              </div>
            ))}
          </div>
          {bp.summary && (
            <p className="mt-3 text-sm text-[#5A8A6A] italic border-t border-[#D4EBD9] pt-2">{bp.summary}</p>
          )}
        </div>
      )}

      {/* Content Pillars */}
      {pillars && pillars.length > 0 && (
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Target className="h-5 w-5 text-[#C9A84C]" />
            {tc.contentPillars}
          </h4>
          <div className="grid gap-2">
            {pillars.map((p, i) => (
              <div key={i} className="rounded-xl bg-[#F8FBF8] border border-[#D4EBD9] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#004D26]">
                    {p.name}{p.nameAr ? ` — ${p.nameAr}` : ""}
                  </span>
                  <span className="text-sm font-bold text-[#C9A84C]">{p.percentage}%</span>
                </div>
                <p className="text-sm text-[#5A8A6A] mb-2">{p.description}</p>
                <div className="h-3 rounded-full bg-[#F0F7F2] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] transition-all duration-700"
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
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Users className="h-5 w-5 text-[#C9A84C]" />
            {tc.audienceInsights}
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {audience.primaryAge && (
              <span className="rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-4 py-2 text-sm font-medium text-white">
                {tc.age}: {audience.primaryAge}
              </span>
            )}
            {audience.interests?.map((interest, i) => (
              <span key={i} className="rounded-xl bg-[#F0F7F2] border border-[#D4EBD9] px-4 py-2 text-sm text-[#004D26]">
                {interest}
              </span>
            ))}
          </div>
          {audience.saudiSpecific && (
            <div className="rounded-xl bg-[#F8FBF8] border-2 border-[#C9A84C]/30 p-4 mb-3">
              <p className="text-sm text-[#C9A84C] font-semibold mb-1">{"\u{1F1F8}\u{1F1E6}"} {tc.saudiInsight}</p>
              <p className="text-sm text-[#0A1F0F]">{audience.saudiSpecific}</p>
            </div>
          )}
          {audience.bestPostingTimes && audience.bestPostingTimes.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {audience.bestPostingTimes.map((t, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9] p-4">
                  <Clock className="h-5 w-5 text-[#00A352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#004D26]">{t.day} · {t.time}</p>
                    <p className="text-sm text-[#5A8A6A]">{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Mix */}
      {mix && mixTotal > 0 && (
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Megaphone className="h-5 w-5 text-[#C9A84C]" />
            {tc.contentMix}
          </h4>
          {/* Stacked bar */}
          <div className="h-4 rounded-full overflow-hidden flex mb-3">
            {Object.entries(mix).map(([key, val]) => (
              <div
                key={key}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                style={{ backgroundColor: mixColors[key] || "#5A8A6A", width: `${(val / mixTotal) * 100}%` }}
                title={`${key}: ${val}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(mix).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mixColors[key] || "#5A8A6A" }} />
                <span className="text-sm text-[#004D26] capitalize">{key}</span>
                <span className="text-sm font-medium text-[#C9A84C]">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Strategy */}
      {platform && (
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Target className="h-5 w-5 text-[#C9A84C]" />
            {tc.platformStrategy}
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {platform.primary && (
              <span className="rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-4 py-2 text-sm font-semibold text-white">
                ★ {platform.primary}
              </span>
            )}
            {platform.secondary && (
              <span className="rounded-xl bg-[#F0F7F2] border border-[#D4EBD9] px-4 py-2 text-sm font-medium text-[#004D26]">
                {platform.secondary}
              </span>
            )}
          </div>
          {platform.rationale && (
            <p className="text-sm text-[#5A8A6A] italic">{platform.rationale}</p>
          )}
        </div>
      )}

      {/* Tone Guide */}
      {tone && (
        <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-[#004D26]">
            <Megaphone className="h-5 w-5 text-[#C9A84C]" />
            {tc.toneGuide}
          </h4>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[140px]">
              <p className="text-sm font-medium text-[#006C35] mb-1.5">{"\u2713"} {tc.doUse}</p>
              <div className="flex flex-wrap gap-1">
                {tone.doUse?.map((t, i) => (
                  <span key={i} className="rounded-xl bg-[#006C35]/10 border border-[#006C35]/30 px-3 py-1.5 text-sm text-[#006C35]">
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
            <div className="rounded-xl bg-[#F8FBF8] border-l-4 border-[#C9A84C] p-4">
              <p className="text-sm text-[#5A8A6A] mb-1">{tc.exampleCaption}</p>
              <p className="text-base text-[#0A1F0F] italic">&ldquo;{tone.exampleCaption}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Vision 2030 Alignment */}
      {vision && (
        <div className="rounded-2xl border-2 border-[#C9A84C]/40 bg-gradient-to-br from-[#F8FBF8] to-white p-6">
          <h4 className="mb-2 flex items-center gap-2 text-base font-bold text-[#C9A84C]">
            {"\u{1F3DB}\uFE0F"} {tc.vision2030}
          </h4>
          <p className="text-base text-[#0A1F0F]">{vision}</p>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  const supabase = createBrowserClient();
  const { setSelectedCompany, locale, user } = useAppStore();
  const tc = messages[locale].companies;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [brandAnalysis, setBrandAnalysis] = useState<Record<string, unknown> | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

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
    setUploadingPdf(true);
    toast.loading("Extracting text from PDF...", { id: "pdf-upload" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "PDF extraction failed");
      if (json.text) {
        setForm((f) => ({ ...f, description: json.text }));
        toast.success("Company profile extracted!", { id: "pdf-upload" });
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      toast.error(err instanceof Error ? err.message : "PDF extraction failed", { id: "pdf-upload" });
    } finally {
      setUploadingPdf(false);
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setBrandAnalysis(json.analysis);
      // Auto-fill target audience and unique value if empty
      const analysis = json.analysis as Record<string, unknown>;
      if (!form.target_audience.trim() && analysis.suggestedTargetAudience) {
        setForm((f) => ({ ...f, target_audience: analysis.suggestedTargetAudience as string }));
      }
      if (!form.unique_value.trim() && analysis.suggestedUniqueValue) {
        setForm((f) => ({ ...f, unique_value: analysis.suggestedUniqueValue as string }));
      }
      const newCount = currentCount + 1;
      // Save analysis + count to company record
      if (editingId) {
        await supabase.from("companies").update({ brand_analysis: json.analysis, analysis_count: newCount }).eq("id", editingId);
        setCompanies((prev) => prev.map((c) => c.id === editingId ? { ...c, brand_analysis: json.analysis, analysis_count: newCount } : c));
        // Also update viewingCompany if it matches, so detail view reflects the new analysis
        setViewingCompany((prev) => prev && prev.id === editingId ? { ...prev, brand_analysis: json.analysis, analysis_count: newCount } : prev);
      }
      toast.success(`Brand DNA ready (${newCount}/3 ${tc.analysisRemaining || "analyses used"})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    }
    setAnalyzing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(tc.confirmDelete || "Are you sure you want to delete this company?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("companies").delete().eq("id", id).eq("user_id", user.id);
    if (error) { console.error("Delete company error:", error); toast.error(locale === "ar" ? "فشل حذف الشركة" : "Failed to delete company"); }
    else { toast.success(tc.deleted || "Company deleted"); loadCompanies(); }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-shimmer rounded-2xl bg-gradient-to-r from-[#D4EBD9]/50 via-[#F0F7F2] to-[#D4EBD9]/50 border-2 border-[#D4EBD9]" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-shimmer rounded-2xl bg-gradient-to-br from-[#F0F7F2] to-white border-2 border-[#D4EBD9]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ===== PAGE HEADER BANNER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10 shadow-xl"
      >
        {/* Decorative shapes */}
        <div className="absolute top-4 right-8 flex gap-2">
          {["\uD83C\uDFE2", "\u2728", "\uD83D\uDE80"].map((em, i) => (
            <span key={i} className="text-2xl md:text-3xl">{em}</span>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Cairo'] text-4xl font-extrabold text-white md:text-5xl drop-shadow-lg">
              {tc.pageTitle}
            </h1>
            <p className="mt-3 text-lg text-white/80 md:text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E8D5A0]" />
              Premium Brand Builder
              <Building2 className="h-5 w-5 text-[#E8D5A0]" />
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Count badge */}
            {companies.length > 0 && (
              <div
                className="flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-3 border border-white/30"
              >
                <Building2 className="h-6 w-6 text-white" />
                <span className="text-2xl font-extrabold text-white">{companies.length}</span>
                <span className="text-lg text-white/80 font-medium">Companies</span>
              </div>
            )}

            <Button
              onClick={openAdd}
              className="h-14 px-8 text-lg font-bold rounded-2xl bg-white text-[#006C35] hover:bg-white/90 hover:shadow-md transition-all shadow-lg"
            >
              <Plus className="mr-2 h-6 w-6" />
              {tc.addCompany}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {companies.length === 0 ? (
        <div
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-[#D4EBD9] bg-gradient-to-br from-[#F8FBF8] via-white to-[#F0F7F2] py-20 px-8 overflow-hidden"
        >
          {/* Background decorative elements */}

          {/* Animated building icon */}
          <div
            className="relative mb-6"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_0_50px_rgba(0,108,53,0.25)]">
              <Building2 className="h-14 w-14 text-white" />
            </div>
            {/* Pulsing sparkles */}
            <div
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <div
              className="absolute -bottom-1 -left-3"
            >
              <Sparkles className="h-5 w-5 text-[#00A352]" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#004D26] font-['Cairo'] text-center">
            {tc.noCompanies}
          </h2>
          <p className="mt-2 text-lg text-[#5A8A6A] text-center max-w-md">
            {tc.addFirst}
          </p>

          <div>
            <Button
              onClick={openAdd}
              className="mt-8 h-16 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] text-white shadow-xl hover:shadow-md transition-all"
            >
              <Plus className="mr-3 h-7 w-7" />
              {tc.addCompany}
            </Button>
          </div>
        </div>
      ) : (
        /* ===== COMPANY CARDS GRID ===== */
        <div className="grid gap-6 sm:grid-cols-2">
          {companies.map((c, i) => {
            const keywords: { label: string; type: keyof typeof TAG_STYLES }[] = [];
            if (c.industry) keywords.push({ label: locale === "ar" ? (INDUSTRIES.find((ind) => ind.en === c.industry)?.ar ?? c.industry) : c.industry, type: "industry" });
            if (c.tone) keywords.push({ label: c.tone, type: "tone" });
            if (c.target_audience) keywords.push({ label: c.target_audience.length > 30 ? c.target_audience.slice(0, 30) + "..." : c.target_audience, type: "audience" });
            (c.platforms || []).forEach((p) => keywords.push({ label: p, type: "platform" }));
            if (c.website) keywords.push({ label: c.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), type: "website" });

            const gradientClass = CARD_GRADIENTS[i % CARD_GRADIENTS.length];

            return (
              <div
                key={c.id}
                className="group hover:-translate-y-1.5 transition-transform duration-200"
              >
                <div className="relative rounded-2xl border-2 border-[#D4EBD9] bg-white overflow-hidden shadow-lg transition-all duration-300 hover:shadow-md hover:border-[#00A352]/40">
                  {/* Top gradient accent bar */}
                  <div className={cn("h-2 w-full bg-gradient-to-r", gradientClass)} />

                  <div className="p-8">
                    {/* Logo + Name */}
                    <div className="flex items-center gap-5">
                      <div
                        className="relative"
                      >
                        <div className="rounded-2xl p-[3px] bg-gradient-to-br from-[#006C35] via-[#00A352] to-[#C9A84C] shadow-lg">
                          <div
                            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[14px] text-3xl font-extrabold text-white"
                            style={{ backgroundColor: c.brand_colors?.[0] ?? "#006C35" }}
                          >
                            {c.logo_url ? (
                              <img src={c.logo_url} alt="" className="h-full w-full rounded-[14px] object-cover" />
                            ) : (
                              c.name?.charAt(0) ?? "?"
                            )}
                          </div>
                        </div>
                        {/* Glow behind logo */}
                        <div
                          style={{ backgroundColor: c.brand_colors?.[0] ?? "#006C35" }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-['Cairo'] text-2xl font-extrabold text-[#004D26] truncate leading-tight">{c.name}</h3>
                        {c.name_ar && <p className="text-lg text-[#5A8A6A] mt-1 truncate font-medium">{c.name_ar}</p>}
                      </div>
                    </div>

                    {/* Description snippet */}
                    {c.description && (
                      <p className="mt-5 text-lg text-[#5A8A6A] line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}

                    {/* Colorful keyword tags with emoji */}
                    {keywords.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {keywords.map((kw, ki) => {
                          const style = TAG_STYLES[kw.type];
                          return (
                            <span
                              key={ki}
                              className={cn("rounded-xl border px-4 py-2 text-lg font-semibold inline-flex items-center gap-1.5", style.bg, style.border, style.text)}
                            >
                              <span className="text-base">{style.emoji}</span>
                              {kw.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Brand color swatches + AI badge */}
                    <div className="mt-5 flex items-center justify-between">
                      {c.brand_colors?.length ? (
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-[#5A8A6A]">Colors</span>
                          <div className="flex gap-2">
                            {c.brand_colors.slice(0, 5).map((hex, idx) => (
                              <div
                                key={idx}
                                className="h-8 w-8 rounded-xl border-2 border-white shadow-md cursor-pointer ring-1 ring-[#D4EBD9]"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </div>
                        </div>
                      ) : <div />}

                      {/* AI analysis badge */}
                      {c.brand_analysis && Object.keys(c.brand_analysis).length > 0 && (
                        <span
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C9A84C]/15 to-[#E8D5A0]/15 border border-[#C9A84C]/30 px-3 py-1.5 text-sm font-bold text-[#C9A84C]"
                        >
                          <Sparkles className="h-4 w-4" />
                          AI {locale === "ar" ? "محلل" : "Analyzed"}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <div className="flex-1">
                        <Button
                          className="h-12 w-full text-lg font-bold bg-gradient-to-r from-[#006C35] to-[#00A352] text-white hover:shadow-sm rounded-2xl transition-all shadow-md"
                          onClick={() => setViewingCompany(c)}
                        >
                          <Eye className="mr-2 h-5 w-5" /> {tc.viewDetails || "View Details"}
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          className="h-12 px-5 text-lg font-bold border-2 border-[#D4EBD9] text-[#004D26] hover:bg-[#F0F7F2] hover:border-[#00A352]/40 rounded-2xl transition-all"
                          onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </div>
                      <div>
                        <Button
                          className="h-12 px-5 text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-md hover:shadow-sm transition-all"
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ===== ADD COMPANY CARD ===== */}
          <div
            className="group cursor-pointer hover:-translate-y-1.5 transition-transform duration-200"
            onClick={openAdd}
          >
            <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-gradient-to-br from-[#F8FBF8] to-white overflow-hidden transition-all duration-300 hover:border-[#00A352] hover:bg-gradient-to-br hover:from-[#F0F7F2] hover:to-[#F8FBF8] hover:shadow-md">
              {/* Decorative gradients */}

              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg group-hover:shadow-md transition-shadow"
              >
                <Plus className="h-10 w-10 text-white" />
              </div>

              <p className="mt-5 text-xl font-extrabold text-[#004D26] font-['Cairo']">{tc.addCompany}</p>
              <p className="mt-1 text-lg text-[#5A8A6A]">Build your brand profile</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD/EDIT DIALOG ===== */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) loadCompanies(); }}>
        <DialogContent className="max-w-[95vw] lg:max-w-[85vw] max-h-[95vh] overflow-y-auto bg-white border-2 border-[#D4EBD9] text-[#0A1F0F] scrollbar-nawaa p-0">
          {/* Gradient header bar */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-4 sm:px-8 py-5 sm:py-7 rounded-t-lg overflow-hidden">
            {/* Decorative shapes */}
            <div className="flex items-center gap-4 relative z-10">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 border border-white/30"
              >
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="font-['Cairo'] text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                    {editingId ? tc.editCompany : tc.addCompany}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/80 text-lg mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#E8D5A0]" />
                  Premium Brand Builder
                  <Sparkles className="h-4 w-4 text-[#E8D5A0]" />
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-6 space-y-0">
            {/* ─── Section 1: Basic Info ─── */}
            <section
              className="rounded-2xl bg-white p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-[#004D26]">{tc.basicInfo}</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.nameEn} {tc.required}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg px-5 transition-all"
                    placeholder={tc.namePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.nameAr}</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg px-5 transition-all"
                    placeholder={tc.nameArPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.industry}</Label>
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
                    <SelectTrigger className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] focus:border-[#006C35] rounded-2xl text-lg px-5">
                      <SelectValue placeholder={tc.selectIndustry} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#D4EBD9] rounded-xl max-h-80">
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.en} value={ind.en} className="text-[#0A1F0F] text-lg py-3 rounded-xl">
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
                      className="mt-3 h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg px-5 transition-all"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.website}</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg px-5 transition-all"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.description}</Label>
                <div className="relative rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] focus-within:border-[#006C35] focus-within:bg-white transition-all overflow-hidden">
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="border-0 bg-transparent text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 rounded-2xl text-lg p-5 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={Math.min(Math.max(5, Math.ceil(form.description.length / 80)), 15)}
                    placeholder={locale === "ar" ? "اكتب وصف شركتك أو ارفع ملف PDF للملف التعريفي..." : "Describe your company, paste a full company profile, or upload a PDF..."}
                  />
                  {/* Bottom bar: char count + PDF upload */}
                  <div className="flex items-center justify-between px-5 py-3 bg-[#F0F7F2]/60 border-t border-[#D4EBD9]/50">
                    <div className="flex items-center gap-3">
                      <label className={cn("cursor-pointer flex items-center gap-2 bg-white border-2 border-[#D4EBD9] rounded-xl px-4 py-2 hover:border-[#006C35] hover:shadow-md transition-all", uploadingPdf && "pointer-events-none opacity-50")}>
                        <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                        {uploadingPdf ? (
                          <Loader2 className="h-5 w-5 text-[#C9A84C] animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5 text-[#006C35]" />
                        )}
                        <span className="text-sm font-bold text-[#006C35]">
                          {uploadingPdf ? (locale === "ar" ? "جاري الاستخراج..." : "Extracting...") : (locale === "ar" ? "رفع ملف PDF" : "Upload PDF")}
                        </span>
                      </label>
                      {form.description.length > 500 && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#00A352]">
                          <FileText className="h-4 w-4" />
                          {locale === "ar" ? "ملف تعريفي شامل" : "Rich profile"}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      form.description.length > 5000 ? "text-[#C9A84C]" : "text-[#5A8A6A]/60"
                    )}>
                      {form.description.length.toLocaleString()} {locale === "ar" ? "حرف" : "chars"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

            {/* ─── Section 2: Brand Identity ─── */}
            <section
              className="rounded-2xl bg-gradient-to-br from-[#F8FBF8] to-[#F0F7F2] p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg">
                  <Palette className="h-6 w-6 text-[#0A1F0F]" />
                </div>
                <h3 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-[#004D26]">{tc.brandIdentity}</h3>
              </div>

              {/* Logo upload */}
              <div className="mb-6">
                <Label className="text-lg font-bold text-[#004D26] mb-3 block">{tc.logo}</Label>
                <div className="flex items-center gap-5">
                  {uploadingLogo ? (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-dashed border-[#C9A84C] bg-white shadow-inner">
                      <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
                    </div>
                  ) : form.logo_url ? (
                    <div
                      className="relative"
                    >
                      <div className="rounded-2xl p-[3px] bg-gradient-to-br from-[#006C35] via-[#00A352] to-[#C9A84C]">
                        <img src={form.logo_url} alt="" className="h-24 w-24 rounded-[14px] object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-dashed border-[#D4EBD9] bg-white shadow-inner hover:border-[#00A352] transition-colors">
                      <Upload className="h-8 w-8 text-[#5A8A6A]" />
                    </div>
                  )}
                  <label className={cn("cursor-pointer bg-white border-2 border-[#D4EBD9] rounded-2xl px-6 py-4 hover:border-[#006C35] hover:shadow-lg transition-all group/upload", uploadingLogo && "pointer-events-none opacity-50")}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                    <span className="text-lg font-bold text-[#006C35] group-hover/upload:text-[#00A352] transition-colors">
                      {uploadingLogo ? tc.uploadingLogo : tc.uploadLogo}
                    </span>
                  </label>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="mb-6">
                <Label className="text-lg font-bold text-[#004D26] mb-3 block">Brand Colors</Label>
                <div className="flex flex-wrap gap-3">
                  {form.brand_colors.map((hex, idx) => (
                    <div
                      key={idx}
                      className="h-12 w-12 rounded-2xl border-2 border-white cursor-pointer shadow-md ring-2 ring-[#D4EBD9] hover:ring-[#00A352] transition-all"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.tone}</Label>
                <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v ?? "" }))}>
                  <SelectTrigger className="h-14 border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] focus:border-[#006C35] rounded-2xl text-lg px-5">
                    <SelectValue placeholder={tc.selectTone} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#D4EBD9] rounded-xl">
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t} className="text-[#0A1F0F] text-lg py-3 rounded-xl">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#006C35]/30 to-transparent" />

            {/* ─── Section 3: Marketing ─── */}
            <section
              className="rounded-2xl bg-white p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-[#004D26]">{tc.marketing}</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.targetAudience}</Label>
                  <Textarea
                    value={form.target_audience}
                    onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                    className="border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg p-5 transition-all"
                    rows={3}
                    placeholder={tc.targetPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.uniqueValue}</Label>
                  <Textarea
                    value={form.unique_value}
                    onChange={(e) => setForm((f) => ({ ...f, unique_value: e.target.value }))}
                    className="border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg p-5 transition-all"
                    rows={3}
                    placeholder={tc.uniquePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{tc.competitors}</Label>
                  <Input
                    value={form.competitors}
                    onChange={(e) => setForm((f) => ({ ...f, competitors: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-2xl text-lg px-5 transition-all"
                  />
                </div>

                {/* Platform selector as emoji cards */}
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-3 block">{tc.platforms}</Label>
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
                            "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-lg font-bold transition-all duration-300 shadow-sm overflow-hidden",
                            isSelected
                              ? cn(config?.selectedBg ?? "bg-gradient-to-br from-[#006C35] to-[#00A352]", config?.selectedBorder ?? "border-[#006C35]", "text-white shadow-lg")
                              : cn(config?.unselectedBg ?? "bg-[#F8FBF8]", "border-[#D4EBD9]", config?.color ?? "text-[#5A8A6A]", "hover:border-[#006C35] hover:shadow-md")
                          )}
                        >
                          <span className="text-3xl">{config?.emoji ?? "\uD83D\uDCF1"}</span>
                          <span className={cn("text-lg font-extrabold", isSelected ? "text-white" : "")}>{p}</span>
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
            <div className="my-3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

            {/* ─── Section 4: AI Analysis ─── */}
            <section
              className="rounded-2xl bg-gradient-to-br from-[#F8FBF8] to-[#F0F7F2] p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg"
                >
                  <Sparkles className="h-6 w-6 text-[#0A1F0F]" />
                </div>
                <h3 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-[#004D26]">{tc.analyzeAI}</h3>
              </div>
              <div className="mb-5 flex items-center gap-4">
                <Label className="text-lg font-bold text-[#004D26]">{tc.generateIn}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "en" ? "default" : "outline"}
                    className={cn(
                      "h-12 rounded-2xl text-lg px-6 font-bold transition-all",
                      outputLanguage === "en"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg"
                        : "border-2 border-[#D4EBD9] text-[#5A8A6A] bg-white hover:border-[#006C35] hover:shadow-md"
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
                      "h-12 rounded-2xl text-lg px-6 font-bold transition-all",
                      outputLanguage === "ar"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg"
                        : "border-2 border-[#D4EBD9] text-[#5A8A6A] bg-white hover:border-[#006C35] hover:shadow-md"
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
                            ? "bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0]"
                            : "bg-[#D4EBD9]"
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    getAnalysisCount() >= 3 ? "text-red-500" : "text-[#5A8A6A]"
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
                    "relative h-16 text-xl px-10 rounded-2xl font-extrabold transition-all shadow-xl overflow-hidden",
                    getAnalysisCount() >= 3
                      ? "bg-[#D4EBD9] text-[#5A8A6A] cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C] text-[#0A1F0F] hover:shadow-md"
                  )}
                >
                  {/* Shimmer effect */}
                  {getAnalysisCount() < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                  )}
                  {analyzing ? (
                    <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                  ) : getAnalysisCount() >= 3 ? (
                    <AlertCircle className="mr-3 h-7 w-7" />
                  ) : (
                    <Sparkles className="mr-3 h-7 w-7" />
                  )}
                  {getAnalysisCount() >= 3 ? (tc.analysisLimit || "Limit Reached") : tc.analyzeAI}
                </Button>
              </div>
              {brandAnalysis && <BrandAnalysisDisplay data={brandAnalysis} locale={locale} />}
            </section>

            {/* ─── Footer Actions ─── */}
            <div className="sticky bottom-0 bg-white/90 border-t-2 border-[#D4EBD9] rounded-b-lg -mx-8 px-8 py-5 flex justify-end gap-4 mt-4 ">
              <div>
                <Button
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-2xl border-2 border-[#D4EBD9] text-[#2D5A3D] hover:bg-[#F0F7F2] hover:border-[#00A352]/40 transition-all"
                  onClick={() => setFormOpen(false)}
                >
                  {tc.cancel}
                </Button>
              </div>
              <div>
                <Button
                  onClick={saveCompany}
                  disabled={saving}
                  className="h-14 px-12 text-lg font-extrabold rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-xl hover:shadow-md transition-all"
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
        <DialogContent className="max-w-[95vw] lg:max-w-[80vw] max-h-[95vh] overflow-y-auto bg-white border-2 border-[#D4EBD9] text-[#0A1F0F] scrollbar-nawaa p-0">
          {viewingCompany && (() => {
            const vc = viewingCompany;
            const analysisCount = vc.analysis_count ?? 0;
            const hasAnalysis = !!vc.brand_analysis && Object.keys(vc.brand_analysis).length > 0;

            return (
              <>
                {/* Header with gradient + company logo */}
                <div className="relative bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-4 sm:px-8 py-6 sm:py-10 overflow-hidden">

                  {/* Close button */}
                  <button
                    onClick={() => setViewingCompany(null)}
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="relative z-10 flex items-center gap-4 sm:gap-6 flex-wrap">
                    {/* Logo */}
                    <div
                    >
                      <div className="rounded-2xl p-[3px] bg-white/30 shadow-2xl">
                        <div
                          className="flex h-24 w-24 md:h-28 md:w-28 shrink-0 items-center justify-center rounded-[14px] text-4xl font-extrabold text-white"
                          style={{ backgroundColor: vc.brand_colors?.[0] ?? "#006C35" }}
                        >
                          {vc.logo_url ? (
                            <img src={vc.logo_url} alt="" className="h-full w-full rounded-[14px] object-cover" />
                          ) : (
                            vc.name?.charAt(0) ?? "?"
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2
                        className="font-['Cairo'] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg"
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
                    className="grid gap-6 md:grid-cols-2"
                  >
                    {/* Description */}
                    {vc.description && (
                      <div className="md:col-span-2 rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26]">
                            <FileText className="h-5 w-5 text-[#00A352]" />
                            {tc.description}
                          </h4>
                          <span className="text-sm font-medium text-[#5A8A6A]/60">{vc.description.length.toLocaleString()} {locale === "ar" ? "حرف" : "chars"}</span>
                        </div>
                        <div className={cn(
                          "text-base text-[#0A1F0F] leading-relaxed whitespace-pre-wrap",
                          vc.description.length > 600 ? "max-h-[300px] overflow-y-auto scrollbar-nawaa pr-2" : ""
                        )}>
                          {vc.description}
                        </div>
                      </div>
                    )}

                    {/* Target Audience */}
                    {vc.target_audience && (
                      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26] mb-3">
                          <Users className="h-5 w-5 text-[#3B82F6]" />
                          {tc.targetAudience}
                        </h4>
                        <p className="text-lg text-[#5A8A6A] leading-relaxed">{vc.target_audience}</p>
                      </div>
                    )}

                    {/* Unique Value */}
                    {vc.unique_value && (
                      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26] mb-3">
                          <Sparkles className="h-5 w-5 text-[#C9A84C]" />
                          {tc.uniqueValue}
                        </h4>
                        <p className="text-lg text-[#5A8A6A] leading-relaxed">{vc.unique_value}</p>
                      </div>
                    )}

                    {/* Competitors */}
                    {vc.competitors && (
                      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26] mb-3">
                          <Target className="h-5 w-5 text-[#F97316]" />
                          {tc.competitors}
                        </h4>
                        <p className="text-lg text-[#5A8A6A]">{vc.competitors}</p>
                      </div>
                    )}

                    {/* Platforms */}
                    {vc.platforms && vc.platforms.length > 0 && (
                      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26] mb-3">
                          <Megaphone className="h-5 w-5 text-[#A855F7]" />
                          {tc.platforms}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {vc.platforms.map((p) => {
                            const config = PLATFORM_CARDS[p];
                            return (
                              <span key={p} className={cn("rounded-xl px-4 py-2 text-lg font-bold text-white", config?.selectedBg ?? "bg-[#006C35]")}>
                                {config?.emoji ?? "\uD83D\uDCF1"} {p}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Brand Colors */}
                    {vc.brand_colors && vc.brand_colors.length > 0 && (
                      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-[#004D26] mb-3">
                          <Palette className="h-5 w-5 text-[#EC4899]" />
                          {tc.brandColors || "Brand Colors"}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {vc.brand_colors.map((hex, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <div
                                className="h-14 w-14 rounded-2xl border-2 border-white shadow-lg ring-2 ring-[#D4EBD9] cursor-pointer"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-xs font-mono font-semibold text-[#5A8A6A]">{hex}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradient divider */}
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

                  {/* AI Analysis Section */}
                  <div
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg"
                      >
                        <Sparkles className="h-6 w-6 text-[#0A1F0F]" />
                      </div>
                      <div>
                        <h3 className="font-['Cairo'] text-2xl md:text-3xl font-extrabold text-[#004D26]">
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
                                    ? "bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0]"
                                    : "bg-[#D4EBD9]"
                                )}
                              />
                            ))}
                          </div>
                          <span className={cn(
                            "text-sm font-semibold",
                            analysisCount >= 3 ? "text-red-500" : "text-[#5A8A6A]"
                          )}>
                            {analysisCount}/3 {tc.analysisRemaining || "analyses used"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {hasAnalysis ? (
                      <BrandAnalysisDisplay data={vc.brand_analysis!} locale={locale} />
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-[#F8FBF8] p-10 text-center">
                        <div
                        >
                          <Sparkles className="h-12 w-12 text-[#D4EBD9] mx-auto mb-4" />
                        </div>
                        <p className="text-xl font-bold text-[#5A8A6A]">
                          {tc.noAnalysis || "No AI analysis yet. Edit the company to run one."}
                        </p>
                        <Button
                          className="mt-5 h-12 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#0A1F0F] shadow-lg hover:shadow-md transition-all"
                          onClick={() => { setViewingCompany(null); openEdit(vc); }}
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          {tc.analyzeAI}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bottom actions */}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#D4EBD9]">
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-lg font-bold border-2 border-[#D4EBD9] text-[#004D26] hover:bg-[#F0F7F2] rounded-2xl transition-all"
                      onClick={() => { setViewingCompany(null); openEdit(vc); }}
                    >
                      <Pencil className="mr-2 h-5 w-5" /> {tc.edit}
                    </Button>
                    <Button
                      className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-[#006C35] to-[#00A352] text-white rounded-2xl shadow-lg hover:shadow-sm transition-all"
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
