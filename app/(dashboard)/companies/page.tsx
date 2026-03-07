"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Trash2, Upload, Loader2, Sparkles, FileText, Clock, Target, Megaphone, Users, Zap, Shield, Flame, Crown, BadgeCheck } from "lucide-react";
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
import { GlowCard } from "@/components/GlowCard";
import toast from "react-hot-toast";
import { messages } from "@/lib/i18n";

const INDUSTRIES = [
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Technology",
  "Healthcare",
  "Education",
  "Retail",
  "Finance",
  "Other",
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
  "YouTube",
  "WhatsApp",
];

const FALLBACK_COLORS = ["#006C35", "#00A352", "#C9A84C", "#0B1A0F", "#D0EBDA"];

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352]"
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0]"
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
              <motion.div
                key={key}
                initial={{ width: 0 }}
                animate={{ width: `${(val / mixTotal) * 100}%` }}
                transition={{ duration: 0.6 }}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ backgroundColor: mixColors[key] || "#5A8A6A" }}
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
    </motion.div>
  );
}

export default function CompaniesPage() {
  const supabase = createBrowserClient();
  const { setSelectedCompany, locale } = useAppStore();
  const tc = messages[locale].companies;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [brandAnalysis, setBrandAnalysis] = useState<Record<string, unknown> | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");

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
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
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
    setFormOpen(true);
  }

  function openEdit(c: Company) {
    setEditingId(c.id);
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
      if (error) toast.error(error.message);
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    } else {
      const { error } = await supabase.from("companies").insert(payload);
      if (error) toast.error(error.message);
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    }
    setSaving(false);
  }

  async function runAnalyze() {
    if (!form.name.trim()) {
      toast.error("Save company first or enter a name");
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
      // Save analysis to company record
      if (editingId) {
        await supabase.from("companies").update({ brand_analysis: json.analysis }).eq("id", editingId);
      }
      toast.success("Brand DNA ready");
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
    if (error) toast.error(error.message);
    else { toast.success(tc.deleted || "Company deleted"); loadCompanies(); }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-shimmer rounded bg-[#D4EBD9]/50" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-shimmer rounded-2xl bg-[#F0F7F2] border-2 border-[#D4EBD9]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">{tc.pageTitle}</h1>
        </div>
        <Button
          onClick={openAdd}
          className="h-14 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#0A1F0F] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-shadow"
        >
          <Plus className="mr-2 h-5 w-5" />
          {tc.addCompany}
        </Button>
      </div>

      {companies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] py-16"
        >
          <Building2 className="h-16 w-16 text-[#5A8A6A]" />
          <p className="mt-4 text-lg text-[#004D26]">{tc.noCompanies}</p>
          <p className="text-base text-[#5A8A6A]">{tc.addFirst}</p>
          <Button onClick={openAdd} className="mt-6 h-12 text-base rounded-xl bg-[#006C35] hover:bg-[#00A352] text-white">
            {tc.addCompany}
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {companies.map((c, i) => {
            const tagColors = [
              { bg: "bg-[#006C35]/10", border: "border-[#006C35]/25", text: "text-[#006C35]" },
              { bg: "bg-[#C9A84C]/10", border: "border-[#C9A84C]/25", text: "text-[#C9A84C]" },
              { bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/25", text: "text-[#3B82F6]" },
              { bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/25", text: "text-[#A855F7]" },
              { bg: "bg-[#F97316]/10", border: "border-[#F97316]/25", text: "text-[#F97316]" },
              { bg: "bg-[#EC4899]/10", border: "border-[#EC4899]/25", text: "text-[#EC4899]" },
            ];
            const keywords: { label: string; colorIdx: number }[] = [];
            if (c.industry) keywords.push({ label: c.industry, colorIdx: 0 });
            if (c.tone) keywords.push({ label: c.tone, colorIdx: 1 });
            if (c.target_audience) keywords.push({ label: c.target_audience.length > 30 ? c.target_audience.slice(0, 30) + "..." : c.target_audience, colorIdx: 2 });
            (c.platforms || []).forEach((p, pi) => keywords.push({ label: p, colorIdx: (3 + pi) % tagColors.length }));
            if (c.website) keywords.push({ label: c.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), colorIdx: 4 });

            return (
              <GlowCard
                key={c.id}
                glowColor={i % 2 === 0 ? "green" : "gold"}
                className="!bg-white !border-2 !border-[#D4EBD9]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8"
                >
                  {/* Top: gradient accent bar using brand color */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${c.brand_colors?.[0] ?? "#006C35"}, ${c.brand_colors?.[1] ?? "#00A352"}, ${c.brand_colors?.[2] ?? "#C9A84C"})` }}
                  />

                  {/* Logo + Name */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div
                        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg transition-shadow hover:shadow-[0_0_25px_rgba(0,108,53,0.3)]"
                        style={{ backgroundColor: c.brand_colors?.[0] ?? "#006C35" }}
                      >
                        {c.logo_url ? (
                          <img src={c.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                        ) : (
                          c.name?.charAt(0) ?? "?"
                        )}
                      </div>
                      <div
                        className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-25"
                        style={{ backgroundColor: c.brand_colors?.[0] ?? "#006C35" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-['Cairo'] text-2xl font-bold text-[#004D26] truncate">{c.name}</h3>
                      {c.name_ar && <p className="text-lg text-[#5A8A6A] mt-0.5 truncate">{c.name_ar}</p>}
                    </div>
                  </div>

                  {/* Description snippet */}
                  {c.description && (
                    <p className="mt-4 text-base text-[#5A8A6A] line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  {/* Colorful keyword tags */}
                  {keywords.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {keywords.map((kw, ki) => {
                        const color = tagColors[kw.colorIdx % tagColors.length];
                        return (
                          <motion.span
                            key={ki}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 + ki * 0.03, type: "spring", stiffness: 300 }}
                            className={cn("rounded-xl border px-4 py-2 text-sm font-semibold", color.bg, color.border, color.text)}
                          >
                            {kw.label}
                          </motion.span>
                        );
                      })}
                    </div>
                  )}

                  {/* Brand color swatches */}
                  {c.brand_colors?.length ? (
                    <div className="mt-5 flex items-center gap-2">
                      <span className="text-sm font-medium text-[#5A8A6A] mr-1">Colors</span>
                      {c.brand_colors.slice(0, 5).map((hex, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.4, y: -3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="h-9 w-9 rounded-xl border-2 border-white shadow-md cursor-pointer"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="h-12 flex-1 text-base font-semibold border-2 border-[#D4EBD9] text-[#004D26] hover:bg-[#F0F7F2] rounded-xl"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="mr-2 h-5 w-5" /> {tc.edit}
                    </Button>
                    <Button
                      className="h-12 px-5 text-base font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="mr-2 h-5 w-5" /> {tc.delete}
                    </Button>
                  </div>
                </motion.div>
              </GlowCard>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[95vw] lg:max-w-[85vw] max-h-[95vh] overflow-y-auto bg-white border-2 border-[#D4EBD9] text-[#0A1F0F] scrollbar-nawaa p-0">
          {/* Gradient header bar */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-8 py-6 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="font-['Cairo'] text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                    {editingId ? tc.editCompany : tc.addCompany}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/80 text-sm mt-0.5">Premium Brand Builder</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-0">
            {/* ─── Section 1: Basic Info ─── */}
            <section className="rounded-2xl bg-white p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-2xl font-bold text-[#004D26]">{tc.basicInfo}</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.nameEn} {tc.required}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base px-5"
                    placeholder={tc.namePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.nameAr}</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base px-5"
                    placeholder={tc.nameArPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.industry}</Label>
                  <Select
                    value={form.industry}
                    onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}
                  >
                    <SelectTrigger className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] focus:border-[#006C35] rounded-xl text-base px-5">
                      <SelectValue placeholder={tc.selectIndustry} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#D4EBD9]">
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind} className="text-[#0A1F0F] text-base py-3">{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.website}</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base px-5"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.description}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base p-5"
                  rows={5}
                />
                <div className="mt-3 flex items-center gap-3">
                  <label className={cn("cursor-pointer flex items-center gap-2 bg-[#F0F7F2] border border-[#D4EBD9] rounded-xl px-4 py-2.5 hover:border-[#006C35] transition-colors", uploadingPdf && "pointer-events-none opacity-50")}>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                    {uploadingPdf ? (
                      <Loader2 className="h-5 w-5 text-[#C9A84C] animate-spin" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#006C35]" />
                    )}
                    <span className="text-base font-medium text-[#006C35]">
                      {uploadingPdf ? tc.extracting : tc.uploadPdf}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-2 h-1 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

            {/* ─── Section 2: Brand Identity ─── */}
            <section className="rounded-2xl bg-gradient-to-br from-[#F8FBF8] to-[#F0F7F2] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0]">
                  <Crown className="h-5 w-5 text-[#0A1F0F]" />
                </div>
                <h3 className="font-['Cairo'] text-2xl font-bold text-[#004D26]">{tc.brandIdentity}</h3>
              </div>
              <div className="mb-5">
                <Label className="text-base font-semibold text-[#004D26] mb-2 block">{tc.logo}</Label>
                <div className="flex items-center gap-5">
                  {uploadingLogo ? (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-dashed border-[#C9A84C] bg-white shadow-inner">
                      <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
                    </div>
                  ) : form.logo_url ? (
                    <div className="relative">
                      <img src={form.logo_url} alt="" className="h-24 w-24 rounded-2xl object-cover border-2 border-[#D4EBD9] shadow-md" />
                      <div className="absolute inset-0 -z-10 rounded-2xl blur-lg opacity-20 bg-[#006C35]" />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-dashed border-[#D4EBD9] bg-white shadow-inner">
                      <Upload className="h-8 w-8 text-[#5A8A6A]" />
                    </div>
                  )}
                  <label className={cn("cursor-pointer bg-white border-2 border-[#D4EBD9] rounded-xl px-5 py-3 hover:border-[#006C35] hover:shadow-md transition-all", uploadingLogo && "pointer-events-none opacity-50")}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                    <span className="text-base font-medium text-[#006C35]">
                      {uploadingLogo ? tc.uploadingLogo : tc.uploadLogo}
                    </span>
                  </label>
                </div>
              </div>
              <div className="mb-5">
                <Label className="text-base font-semibold text-[#004D26] mb-2 block">Brand Colors</Label>
                <div className="flex flex-wrap gap-3">
                  {form.brand_colors.map((hex, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.3, y: -4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="h-12 w-12 rounded-xl border-2 border-[#D4EBD9] cursor-pointer shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.tone}</Label>
                <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}>
                  <SelectTrigger className="h-14 border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] focus:border-[#006C35] rounded-xl text-base px-5">
                    <SelectValue placeholder={tc.selectTone} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#D4EBD9]">
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t} className="text-[#0A1F0F] text-base py-3">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-2 h-1 rounded-full bg-gradient-to-r from-transparent via-[#006C35]/30 to-transparent" />

            {/* ─── Section 3: Marketing ─── */}
            <section className="rounded-2xl bg-white p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352]">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-['Cairo'] text-2xl font-bold text-[#004D26]">{tc.marketing}</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.targetAudience}</Label>
                  <Textarea
                    value={form.target_audience}
                    onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                    className="border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base p-5"
                    rows={3}
                    placeholder={tc.targetPlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.uniqueValue}</Label>
                  <Textarea
                    value={form.unique_value}
                    onChange={(e) => setForm((f) => ({ ...f, unique_value: e.target.value }))}
                    className="border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base p-5"
                    rows={3}
                    placeholder={tc.uniquePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-1.5 block">{tc.competitors}</Label>
                  <Input
                    value={form.competitors}
                    onChange={(e) => setForm((f) => ({ ...f, competitors: e.target.value }))}
                    className="h-14 border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:bg-white rounded-xl text-base px-5"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-[#004D26] mb-2 block">{tc.platforms}</Label>
                  <div className="flex flex-wrap gap-3">
                    {PLATFORMS.map((p) => (
                      <motion.button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "rounded-xl px-5 py-3 text-base font-medium transition-all shadow-sm",
                          form.platforms.includes(p)
                            ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-[0_0_12px_rgba(0,108,53,0.25)]"
                            : "bg-white text-[#5A8A6A] border-2 border-[#D4EBD9] hover:border-[#006C35] hover:shadow-md"
                        )}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Gradient divider */}
            <div className="my-2 h-1 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

            {/* ─── Section 4: AI Analysis ─── */}
            <section className="rounded-2xl bg-gradient-to-br from-[#F8FBF8] to-[#F0F7F2] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0]">
                  <Sparkles className="h-5 w-5 text-[#0A1F0F]" />
                </div>
                <h3 className="font-['Cairo'] text-2xl font-bold text-[#004D26]">{tc.analyzeAI}</h3>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <Label className="text-base font-semibold text-[#004D26]">{tc.generateIn}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "en" ? "default" : "outline"}
                    className={cn(
                      "h-11 rounded-xl text-base px-5",
                      outputLanguage === "en"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md"
                        : "border-2 border-[#D4EBD9] text-[#5A8A6A] bg-white hover:border-[#006C35]"
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
                      "h-11 rounded-xl text-base px-5",
                      outputLanguage === "ar"
                        ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md"
                        : "border-2 border-[#D4EBD9] text-[#5A8A6A] bg-white hover:border-[#006C35]"
                    )}
                    onClick={() => setOutputLanguage("ar")}
                  >
                    {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                onClick={runAnalyze}
                disabled={analyzing}
                className="h-14 text-lg px-8 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#0A1F0F] font-semibold hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all shadow-md"
              >
                {analyzing ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-6 w-6" />
                )}
                {tc.analyzeAI}
              </Button>
              {brandAnalysis && <BrandAnalysisDisplay data={brandAnalysis} locale={locale} />}
            </section>

            {/* ─── Footer Actions ─── */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t-2 border-[#D4EBD9] rounded-b-lg -mx-8 px-8 py-5 flex justify-end gap-3 mt-4">
              <Button variant="outline" className="h-14 px-8 text-base font-semibold rounded-xl border-2 border-[#D4EBD9] text-[#2D5A3D] hover:bg-[#F0F7F2]" onClick={() => setFormOpen(false)}>
                {tc.cancel}
              </Button>
              <Button onClick={saveCompany} disabled={saving} className="h-14 px-10 text-base font-semibold rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg hover:shadow-[0_0_25px_rgba(0,108,53,0.3)] transition-all">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : tc.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
