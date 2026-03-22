"use client";

import { useEffect, useState } from "react";
/* framer-motion removed – using plain HTML + CSS transitions */
import { Sparkles, Loader2, Download, ImageIcon, Maximize2, ImagePlus, X, Upload, Check, Camera, Paintbrush, MessageSquare, Type, Building2, Volume2, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type ContentPlanRow = {
  id: string;
  week_start: string;
  title: string | null;
  plan_data: { days?: Array<{ dayIndex: number; dayEn: string; dayAr: string; topic: string; topicAr?: string; caption?: string; imagePromptHint?: string; platform?: string; contentType?: string }> };
};

/* ── Animation variants ── */


/* ── Platform emoji map for day buttons ── */
const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\uD83D\uDCF8",
  tiktok: "\uD83C\uDFB5",
  x: "\uD835\uDD4F",
  snapchat: "\uD83D\uDC7B",
  linkedin: "\uD83D\uDCBC",
};

export default function VisionStudioPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany, locale, user } = useAppStore();
  const tv = messages[locale].visionStudio;

  const STYLES = [
    { id: "lifestyle", label: tv.lifestyleLabel, emoji: "\uD83D\uDCF8", desc: tv.lifestyleDesc, best: tv.lifestyleBest },
    { id: "graphic", label: tv.graphicLabel, emoji: "\uD83D\uDED2", desc: tv.graphicDesc, best: tv.graphicBest },
    { id: "luxury", label: tv.luxuryLabel, emoji: "\uD83D\uDC8E", desc: tv.luxuryDesc, best: tv.luxuryBest },
    { id: "heritage", label: tv.heritageLabel, emoji: "\uD83D\uDD4C", desc: tv.heritageDesc, best: tv.heritageBest },
  ];

  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<ContentPlanRow[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlanRow | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [style, setStyle] = useState<string>("lifestyle");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [includeLogo, setIncludeLogo] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ id: number; style_label: string; url?: string; prompt_used: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const [referenceImages, setReferenceImages] = useState<{ file: File; preview: string }[]>([]);
  const [addTextToImage, setAddTextToImage] = useState(false);
  const [imageText, setImageText] = useState("");

  const loadingQuotesEn = [
    "Brewing pixel magic... \u2615",
    "Teaching AI about Saudi aesthetics...",
    "Mixing your brand colors into art... \uD83C\uDFA8",
    "AI is having a creative moment...",
    "Making it scroll-stopping... \uD83D\uDCF1",
    "Adding that Saudi touch... \uD83C\uDDF8\uD83C\uDDE6",
    "Almost there, perfecting the vibes... \u2728",
    "Your designer called in sick, AI took over... \uD83E\uDD16",
    "Generating content that slaps... \uD83D\uDD25",
    "If this takes long, blame the creativity...",
    "Making your competitors jealous... \uD83D\uDE0E",
    "Crafting visuals worth a thousand likes...",
  ];

  const loadingQuotesAr = [
    "\u0646\u062D\u0636\u0651\u0631 \u0644\u0643 \u0633\u062D\u0631 \u0627\u0644\u0628\u0643\u0633\u0644\u0627\u062A... \u2615",
    "\u0646\u0639\u0644\u0651\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0630\u0648\u0642 \u0627\u0644\u0633\u0639\u0648\u062F\u064A...",
    "\u0646\u0645\u0632\u062C \u0623\u0644\u0648\u0627\u0646 \u0639\u0644\u0627\u0645\u062A\u0643 \u0641\u064A \u0641\u0646... \uD83C\uDFA8",
    "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u0644\u062D\u0638\u0629 \u0625\u0628\u062F\u0627\u0639...",
    "\u0646\u0635\u0646\u0639 \u0645\u062D\u062A\u0648\u0649 \u064A\u0648\u0642\u0641 \u0627\u0644\u0633\u0643\u0631\u0648\u0644... \uD83D\uDCF1",
    "\u0646\u0636\u064A\u0641 \u0627\u0644\u0644\u0645\u0633\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629... \uD83C\uDDF8\uD83C\uDDE6",
    "\u062A\u0642\u0631\u064A\u0628\u0627\u064B \u062C\u0627\u0647\u0632\u060C \u0646\u0643\u0645\u0651\u0644 \u0627\u0644\u0623\u062C\u0648\u0627\u0621... \u2728",
    "\u0627\u0644\u0645\u0635\u0645\u0645 \u0623\u062E\u0630 \u0625\u062C\u0627\u0632\u0629\u060C \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0646\u0627\u0628 \u0639\u0646\u0647... \uD83E\uDD16",
    "\u0646\u0648\u0644\u0651\u062F \u0645\u062D\u062A\u0648\u0649 \u064A\u0643\u0633\u0631 \u0627\u0644\u0645\u0642\u0627\u064A\u064A\u0633... \uD83D\uDD25",
    "\u0625\u0630\u0627 \u0637\u0648\u0651\u0644\u062A\u060C \u0644\u0648\u0645 \u0627\u0644\u0625\u0628\u062F\u0627\u0639...",
    "\u0646\u062E\u0644\u0651\u064A \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646 \u064A\u063A\u0627\u0631\u0648\u0646... \uD83D\uDE0E",
    "\u0646\u0635\u0646\u0639 \u0635\u0648\u0631 \u0628\u0623\u0644\u0641 \u0644\u0627\u064A\u0643...",
  ];

  const loadingQuotes = locale === "ar" ? loadingQuotesAr : loadingQuotesEn;

  useEffect(() => {
    if (!generating) return;
    setLoadingQuoteIndex(0);
    const interval = setInterval(() => {
      setLoadingQuoteIndex((prev) => (prev + 1) % (locale === "ar" ? loadingQuotesAr.length : loadingQuotesEn.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [generating, locale]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data: comps } = await supabase.from("companies").select("*").eq("user_id", user.id);
      setCompanies((comps as Company[]) ?? []);
      if (comps?.length && !selectedCompany) setSelectedCompany(comps[0] as Company);
      const { data: plansData } = await supabase.from("content_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      setPlans((plansData as ContentPlanRow[]) ?? []);
      setLoading(false);
    })();
  }, [user, selectedCompany, setSelectedCompany]);

  useEffect(() => {
    if (!selectedCompany?.id) return;
    const filtered = plans.filter((p) => p.plan_data?.days?.length);
    if (filtered.length && !selectedPlan) setSelectedPlan(filtered[0]);
    else setSelectedPlan(filtered[0] ?? null);
    setSelectedDayIndex(0);
  }, [selectedCompany?.id, plans]);

  const currentDay = selectedPlan?.plan_data?.days?.[selectedDayIndex ?? 0];

  function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 6 - referenceImages.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setReferenceImages((prev) => [...prev, ...newImages].slice(0, 6));
    e.target.value = "";
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return updated;
    });
  }

  async function handleGenerate() {
    if (!selectedCompany || !currentDay) { toast.error("Select a company and a content day"); return; }
    setGenerating(true);
    setImages([]);
    setSaved(false);
    try {
      // Convert reference images to base64 (resize first to avoid huge payloads)
      const referenceBase64: string[] = [];
      for (const ref of referenceImages) {
        const dataUri = await new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const MAX = 1024;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
              const scale = MAX / Math.max(w, h);
              w = Math.round(w * scale);
              h = Math.round(h * scale);
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          };
          img.src = URL.createObjectURL(ref.file);
        });
        referenceBase64.push(dataUri);
      }

      // Send only essential company fields to avoid bloated requests
      const companySlim = {
        name: selectedCompany.name,
        name_ar: selectedCompany.name_ar,
        industry: selectedCompany.industry,
        tone: selectedCompany.tone,
        brand_colors: selectedCompany.brand_colors,
        logo_url: selectedCompany.logo_url,
      };
      const res = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companySlim,
          dayContent: { platform: currentDay.platform, contentType: currentDay.contentType, topic: currentDay.topic, topicAr: currentDay.topicAr, caption: currentDay.caption, imagePromptHint: currentDay.imagePromptHint },
          style, additionalInstructions: additionalInstructions.trim() || undefined, outputLanguage, imageText: addTextToImage && imageText.trim() ? imageText.trim() : undefined,
          includeLogo: includeLogo && !!selectedCompany?.logo_url,
          logoUrl: includeLogo ? selectedCompany?.logo_url : undefined,
          referenceImages: referenceBase64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setImages(json.images ?? []);
      toast.success("Images generated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Generation failed"); }
    setGenerating(false);
  }

  async function handleSave() {
    if (!selectedCompany || !images.length) return;
    const urls = images.map((i) => i.url).filter(Boolean);
    if (!urls.length) { toast.error("No images to save"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not authenticated"); setSaving(false); return; }
      const currentDay = selectedPlan?.plan_data?.days?.[selectedDayIndex ?? 0];
      await supabase.from("generated_images").insert({
        user_id: user.id,
        company_id: selectedCompany.id,
        plan_id: selectedPlan?.id ?? null,
        day_label: currentDay ? (locale === "ar" ? currentDay.dayAr : currentDay.dayEn) || currentDay.dayAr : null,
        prompt_used: images.map((i) => i.prompt_used).join("\n---\n"),
        image_urls: urls,
      });
      setSaved(true);
      toast.success(locale === "ar" ? "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0628\u0646\u062C\u0627\u062D" : "Images saved!");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8">
        <Skeleton className="h-40 w-full rounded-2xl" style={{ backgroundColor: "#e8eaef" }} />
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" style={{ backgroundColor: "#f4f6f8", border: "2px solid #e8eaef" }} />
          ))}
        </div>
        <Skeleton className="h-20 w-full max-w-2xl mx-auto rounded-2xl" style={{ backgroundColor: "#e8eaef" }} />
        <Skeleton className="h-[400px] w-full max-w-5xl mx-auto rounded-2xl" style={{ backgroundColor: "#f4f6f8", border: "2px solid #e8eaef" }} />
      </div>
    );
  }

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-10"
    >
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <ImagePlus className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">{locale === "ar" ? "استوديو الرؤية" : "Vision Studio"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {tv.pageTitle}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">{tv.pageSub}</p>
        </div>
      </div>

      {/* ===== ROW 1: Company + Content Day ===== */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* ── Company Selector ── */}
        <Card className="rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl font-extrabold text-[#1a1d2e] font-['Cairo']">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                <Camera className="h-7 w-7 text-white" />
              </div>
              {tv.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 pt-2 space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <select
                value={selectedCompany?.id ?? ""}
                onChange={(e) => { const c = companies.find((x) => x.id === e.target.value); if (c) setSelectedCompany(c); }}
                className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white pl-14 pr-4 text-lg text-[#2d3142] font-medium transition-all focus:border-[#23ab7e] focus:ring-2 focus:ring-[#23ab7e]/20 hover:border-[#23ab7e]/40"
              >
                {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            {/* ── Company Info Preview ── */}
            {selectedCompany && (
              <div className="rounded-2xl border-2 border-[#e8eaef] bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8] p-5 space-y-4">
                {/* Logo + Name row */}
                <div className="flex items-center gap-4">
                  {selectedCompany.logo_url ? (
                    <img
                      src={selectedCompany.logo_url}
                      alt={selectedCompany.name}
                      className="h-16 w-16 rounded-2xl object-contain border-2 border-[#e8eaef] bg-white p-1 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#e8eaef] bg-white shadow-sm">
                      <Building2 className="h-8 w-8 text-[#8f96a3]/50" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-extrabold text-[#1a1d2e] truncate">{selectedCompany.name}</p>
                    {selectedCompany.name_ar && (
                      <p className="text-lg font-bold text-[#8f96a3] truncate" dir="rtl">{selectedCompany.name_ar}</p>
                    )}
                  </div>
                </div>

                {/* Info chips: Industry + Tone */}
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.industry && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#e8eaef] px-3 py-1.5 text-sm font-bold text-[#1a1d2e] shadow-sm">
                      <Building2 className="h-3.5 w-3.5 text-[#23ab7e]" />
                      {selectedCompany.industry}
                    </span>
                  )}
                  {selectedCompany.tone && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#e8eaef] px-3 py-1.5 text-sm font-bold text-[#1a1d2e] shadow-sm">
                      <Volume2 className="h-3.5 w-3.5 text-[#8054b8]" />
                      {selectedCompany.tone}
                    </span>
                  )}
                </div>

                {/* Platforms */}
                {selectedCompany.platforms?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.platforms.map((p, i) => {
                      const emoji = PLATFORM_EMOJI[p.toLowerCase()] || "\uD83C\uDF10";
                      return (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#e8eaef] px-2.5 py-1 text-lg font-semibold text-[#8f96a3] shadow-sm">
                          <span className="text-xl">{emoji}</span> {p}
                        </span>
                      );
                    })}
                  </div>
                ) : null}

                {/* Brand colors */}
                {selectedCompany.brand_colors?.length ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[#8f96a3]">{locale === "ar" ? "الألوان" : "Colors"}</span>
                    <div className="flex gap-2">
                      {selectedCompany.brand_colors.slice(0, 5).map((hex, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-white shadow-md ring-2 ring-[#e8eaef]"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Content Day Selector ── */}
        <Card className="rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8054b8] via-[#A78BFA] to-[#8054b8]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl font-extrabold text-[#1a1d2e] font-['Cairo']">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg">
                <ImageIcon className="h-7 w-7 text-white" />
              </div>
              {tv.contentDay}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5 sm:p-8 pt-2">
            <select
              value={selectedPlan?.id ?? ""}
              onChange={(e) => { const p = plans.find((x) => x.id === e.target.value); setSelectedPlan(p ?? null); setSelectedDayIndex(0); }}
              className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-5 text-lg text-[#2d3142] font-medium transition-all focus:border-[#23ab7e] focus:ring-2 focus:ring-[#23ab7e]/20 hover:border-[#23ab7e]/40"
            >
              {plans.filter((p) => p.plan_data?.days?.length).map((p) => (<option key={p.id} value={p.id}>{p.title || p.week_start}</option>))}
            </select>

            {selectedPlan?.plan_data?.days?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedPlan.plan_data.days.map((d, i) => {
                  const selected = selectedDayIndex === i;
                  const platformEmoji = d.platform ? PLATFORM_EMOJI[d.platform.toLowerCase()] || "\uD83D\uDCC5" : "\uD83D\uDCC5";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDayIndex(i)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 cursor-pointer",
                        selected
                          ? "bg-gradient-to-br from-[#23ab7e] to-[#8054b8] border-[#23ab7e] text-white shadow-lg shadow-[#23ab7e]/20"
                          : "bg-[#fafbfd] border-[#e8eaef] text-[#8f96a3] hover:border-[#23ab7e]/40 hover:bg-[#f4f6f8]"
                      )}
                    >
                      {selected && (
                        <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                          <div className="h-4 w-4 rounded-full bg-[#8054b8] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <span className="text-2xl leading-none">{platformEmoji}</span>
                      <span className={cn("text-lg font-bold leading-tight text-center", selected ? "text-white" : "text-[#1a1d2e]")}>
                        {locale === "ar" ? (d.dayAr || d.dayEn) : (d.dayEn || d.dayAr)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {currentDay ? (
              <div className="rounded-2xl border-2 border-[#e8eaef] bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8] p-5">
                <p className="text-lg font-bold text-[#1a1d2e]">{locale === "ar" ? (currentDay.topicAr || currentDay.topic) : (currentDay.topic || currentDay.topicAr)}</p>
                <p className="mt-2 text-lg text-[#8f96a3]">{currentDay.imagePromptHint}</p>
              </div>
            ) : (
              <p className="text-lg text-[#8f96a3]">{tv.noPlan}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 2: Reference Photos + Style ===== */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* ── Reference Images ── */}
        <Card className="rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                <Upload className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-[#1a1d2e] font-['Cairo']">
                  {locale === "ar" ? "\u0635\u0648\u0631 \u0645\u0631\u062C\u0639\u064A\u0629" : "Reference Photos"}
                </CardTitle>
                <p className="text-lg text-[#8f96a3] mt-1">
                  {locale === "ar" ? "\u0623\u0636\u0641 \u0635\u0648\u0631 \u0623\u0637\u0628\u0627\u0642\u0643\u060C \u0645\u0643\u0627\u0646\u0643\u060C \u0623\u0648 \u0645\u0646\u062A\u062C\u0627\u062A\u0643 \u0644\u064A\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A" : "Add photos of your dishes, place, or products for AI to reference"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {referenceImages.map((img, i) => (
                <div
                  key={i}
                  className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-[#e8eaef] shadow-md"
                >
                  <img src={img.preview} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  <button
                    type="button"
                    onClick={() => removeReferenceImage(i)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {referenceImages.length < 6 && (
                <label
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-[#fafbfd] hover:bg-[#f4f6f8] transition-all duration-300"
                  style={{ borderColor: "#23ab7e", borderImage: "linear-gradient(135deg, #23ab7e, #8054b8) 1" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-md mb-2">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-bold text-[#1a1d2e]">{locale === "ar" ? "\u0625\u0636\u0627\u0641\u0629" : "Add"}</span>
                </label>
              )}
            </div>
            {referenceImages.length > 0 && (
              <p className="mt-3 text-lg font-semibold text-[#8f96a3]">
                {referenceImages.length}/6 {locale === "ar" ? "\u0635\u0648\u0631" : "photos"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Style Selector ── */}
        <Card className="rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8054b8] via-[#23ab7e] to-[#8054b8]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl font-extrabold text-[#1a1d2e] font-['Cairo']">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-lg">
                <Paintbrush className="h-7 w-7 text-white" />
              </div>
              {tv.style}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 sm:p-8 pt-2">
            {STYLES.map((s) => {
              const selected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "relative rounded-2xl border-2 p-5 text-left transition-all duration-300 overflow-hidden",
                    selected
                      ? "border-[#23ab7e] bg-gradient-to-br from-[#23ab7e]/10 via-[#8054b8]/5 to-[#8054b8]/10 shadow-lg shadow-[#23ab7e]/10"
                      : "border-[#e8eaef] bg-white hover:border-[#8054b8]/40"
                  )}
                >
                  {selected && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md z-10">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#23ab7e] to-[#8054b8] flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  {selected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] origin-left" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{s.emoji}</span>
                    <p className="text-lg font-extrabold text-[#1a1d2e]">{s.label}</p>
                  </div>
                  <p className="mt-2 text-lg leading-relaxed text-[#8f96a3]">{s.desc}</p>
                  <p className={cn(
                    "mt-2 text-sm font-bold rounded-lg px-2.5 py-1 inline-block",
                    selected
                      ? "bg-[#23ab7e]/10 text-[#23ab7e]"
                      : "bg-[#f4f6f8] text-[#8f96a3]"
                  )}>
                    {s.best}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 3: Options + Instructions ===== */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* ── Left: Language, Logo, Text toggles ── */}
        <div className="space-y-6">
          {/* Language Toggle */}
          <div>
            <label className="mb-3 flex items-center gap-3 text-xl font-extrabold text-[#1a1d2e] font-['Cairo']">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {tv.generateIn}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Button
                  type="button"
                  variant={outputLanguage === "en" ? "default" : "outline"}
                  className={cn(
                    "w-full h-14 rounded-2xl text-lg font-bold transition-all duration-300",
                    outputLanguage === "en"
                      ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#23ab7e]/20 border-2 border-[#23ab7e]"
                      : "border-2 border-[#e8eaef] text-[#8f96a3] bg-white hover:border-[#23ab7e]/40"
                  )}
                  onClick={() => setOutputLanguage("en")}
                >
                  <span className="text-2xl mr-2">{"\uD83C\uDDFA\uD83C\uDDF8"}</span> {tv.english}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  variant={outputLanguage === "ar" ? "default" : "outline"}
                  className={cn(
                    "w-full h-14 rounded-2xl text-lg font-bold transition-all duration-300",
                    outputLanguage === "ar"
                      ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#23ab7e]/20 border-2 border-[#23ab7e]"
                      : "border-2 border-[#e8eaef] text-[#8f96a3] bg-white hover:border-[#23ab7e]/40"
                  )}
                  onClick={() => setOutputLanguage("ar")}
                >
                  <span className="text-2xl mr-2">{"\uD83C\uDDF8\uD83C\uDDE6"}</span> {tv.arabic}
                </Button>
              </div>
            </div>
          </div>

          {/* Include Logo Toggle */}
          {selectedCompany?.logo_url && (
            <button
              type="button"
              onClick={() => setIncludeLogo(!includeLogo)}
              className={cn(
                "w-full flex items-center gap-5 rounded-2xl border-2 p-5 text-left transition-all duration-300 overflow-hidden relative",
                includeLogo
                  ? "border-[#23ab7e] bg-gradient-to-br from-[#23ab7e]/5 to-[#8054b8]/5 shadow-lg shadow-[#23ab7e]/10"
                  : "border-[#e8eaef] bg-white hover:border-[#8054b8]/40"
              )}
            >
              {includeLogo && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] origin-left" />
              )}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-md",
                includeLogo ? "bg-gradient-to-br from-[#23ab7e] to-[#8054b8]" : "bg-[#f4f6f8]"
              )}>
                <ImagePlus className={cn("h-6 w-6", includeLogo ? "text-white" : "text-[#8f96a3]")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-lg font-bold", includeLogo ? "text-[#1a1d2e]" : "text-[#8f96a3]")}>{tv.includeLogo}</p>
                <p className="text-lg text-[#8f96a3]">{tv.logoNote}</p>
              </div>
              <div className={cn(
                "h-7 w-12 rounded-full transition-all duration-300 relative flex-shrink-0",
                includeLogo ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] shadow-inner" : "bg-[#e8eaef]"
              )}>
                <div className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center")}>
                  {includeLogo && <Check className="h-3.5 w-3.5 text-[#23ab7e]" />}
                </div>
              </div>
            </button>
          )}

          {/* Text on Image Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setAddTextToImage(!addTextToImage)}
              className={cn(
                "w-full flex items-center gap-5 rounded-2xl border-2 p-5 text-left transition-all duration-300 overflow-hidden relative",
                addTextToImage
                  ? "border-[#23ab7e] bg-gradient-to-br from-[#23ab7e]/5 to-[#8054b8]/5 shadow-lg shadow-[#23ab7e]/10"
                  : "border-[#e8eaef] bg-white hover:border-[#8054b8]/40"
              )}
            >
              {addTextToImage && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] origin-left" />
              )}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-md",
                addTextToImage ? "bg-gradient-to-br from-[#23ab7e] to-[#8054b8]" : "bg-[#f4f6f8]"
              )}>
                <Type className={cn("h-6 w-6", addTextToImage ? "text-white" : "text-[#8f96a3]")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-lg font-bold", addTextToImage ? "text-[#1a1d2e]" : "text-[#8f96a3]")}>{tv.addText}</p>
                <p className="text-lg text-[#8f96a3]">{tv.addTextDesc}</p>
              </div>
              <div className={cn(
                "h-7 w-12 rounded-full transition-all duration-300 relative flex-shrink-0",
                addTextToImage ? "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] shadow-inner" : "bg-[#e8eaef]"
              )}>
                <div className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center")}>
                  {addTextToImage && <Check className="h-3.5 w-3.5 text-[#23ab7e]" />}
                </div>
              </div>
            </button>
            {addTextToImage && (
              <div className="mt-3">
                <input
                  type="text"
                  value={imageText}
                  onChange={(e) => setImageText(e.target.value)}
                  placeholder={tv.imageTextPlaceholder}
                  className="w-full h-14 rounded-2xl border-2 border-[#e8eaef] bg-white px-5 text-lg text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:ring-2 focus:ring-[#23ab7e]/20 transition-all hover:border-[#23ab7e]/40"
                />
                <p className="mt-2 text-lg text-[#8f96a3]">
                  {outputLanguage === "ar" ? "سيظهر النص بالعربية" : "Text will appear in English"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Extra Instructions ── */}
        <div>
          <label className="mb-3 flex items-center gap-3 text-xl font-extrabold text-[#1a1d2e] font-['Cairo']">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-md">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            {tv.extraInstructions}
          </label>
          <Textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder={tv.extraPlaceholder}
            className="min-h-[280px] rounded-2xl border-2 border-[#e8eaef] bg-white text-lg text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:border-[#23ab7e] focus:ring-2 focus:ring-[#23ab7e]/20 transition-all hover:border-[#23ab7e]/40 p-5"
          />
        </div>
      </div>

      {/* ===== GENERATE BUTTON (centered) ===== */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={generating || !currentDay}
          className="relative w-full max-w-2xl h-20 rounded-2xl bg-gradient-to-r from-[#8054b8] via-[#A78BFA] to-[#8054b8] text-white hover:shadow-md text-2xl font-extrabold transition-all duration-500 shadow-md border-2 border-[#8054b8]/30 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          {generating ? (
            <Loader2 className="mr-3 h-8 w-8 animate-spin relative z-10" />
          ) : (
            <Sparkles className="mr-3 h-8 w-8 relative z-10" />
          )}
          <span className="relative z-10">{tv.generate4}</span>
          {!generating && <Sparkles className="ml-3 h-8 w-8 relative z-10" />}
        </Button>
      </div>

      {/* ===== GENERATED IMAGES (full width, centered) ===== */}
      <div className="w-full">
        <Card className="rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <CardTitle className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-extrabold text-[#1a1d2e] font-['Cairo']">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                <ImageIcon className="h-7 w-7 text-white" />
              </div>
              {tv.generatedImages}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 pt-2">
            {images.length === 0 && !generating ? (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8eaef] bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8] py-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#23ab7e]/10 to-[#8054b8]/10 shadow-inner">
                  <ImageIcon className="h-12 w-12 text-[#8f96a3]/50" />
                </div>
                <p className="mt-6 text-2xl font-bold text-[#1a1d2e]">{tv.imagesHere}</p>
                <p className="mt-2 text-lg text-[#8f96a3]">{tv.selectAndGenerate}</p>
              </div>
            ) : generating ? (
              /* ── Loading State ── */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-2xl border-2 border-[#e8eaef] shadow-md"
                      style={{ background: "linear-gradient(135deg, #f4f6f8 0%, #fafbfd 50%, #f4f6f8 100%)" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(35,171,126,0.08) 30%, rgba(124,58,237,0.08) 50%, rgba(35,171,126,0.08) 70%, transparent 100%)" }}
                      />
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-14 w-14 text-[#8054b8]/30" />
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {[0, 1, 2].map((d) => (
                          <div key={d} className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#23ab7e] to-[#8054b8]" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center py-4">
                  <p className="text-2xl font-extrabold text-[#1a1d2e] font-['Cairo']">
                    {loadingQuotes[loadingQuoteIndex]}
                  </p>
                  <div className="mt-4 mx-auto h-2 w-64 rounded-full bg-[#f4f6f8] overflow-hidden border border-[#e8eaef]">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] transition-all duration-700" />
                  </div>
                  <p className="mt-2 text-lg text-[#8f96a3]">
                    {locale === "ar" ? "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0646\u0634\u0627\u0621..." : "Creating your visuals..."}
                  </p>
                </div>
              </div>
            ) : (
              /* ── Generated Images Grid ── */
              <div className="grid grid-cols-2 gap-5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white shadow-md transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#23ab7e] via-[#8054b8] to-[#8054b8] z-10" />
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.style_label}
                        className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement("div");
                            fallback.className = "aspect-square w-full flex items-center justify-center bg-[#f4f6f8]";
                            fallback.innerHTML = '<p class="text-[#8f96a3] text-center px-4 text-lg">Image failed to load</p>';
                            parent.insertBefore(fallback, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center bg-gradient-to-br from-[#fafbfd] to-[#f4f6f8]">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-[#8f96a3] mx-auto mb-3" />
                          <p className="text-lg text-[#8f96a3]">Generation failed</p>
                        </div>
                      </div>
                    )}
                    {img.url && (
                      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-t from-[#1a1d2e]/70 via-[#1a1d2e]/30 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(img.url!)}
                          className="rounded-2xl bg-white/95 border-2 border-[#e8eaef] px-5 py-3 text-lg font-bold text-[#1a1d2e] flex items-center gap-2.5 shadow-xl"
                        >
                          <Maximize2 className="h-5 w-5" /> {tv.fullScreen}
                        </button>
                        <a
                          href={img.url}
                          download
                          className="rounded-2xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-5 py-3 text-lg font-bold text-white flex items-center gap-2.5 shadow-xl"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-xl bg-white/95 border-2 border-[#e8eaef] px-4 py-2 text-lg font-bold text-[#1a1d2e] shadow-md">
                      {img.style_label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Save Button (centered) ── */}
            {images.length > 0 && !generating && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleSave}
                  disabled={saved || saving}
                  className={cn(
                    "relative h-16 px-10 rounded-2xl text-xl font-extrabold shadow-lg transition-all duration-500 border-2 overflow-hidden group",
                    saved
                      ? "bg-gradient-to-r from-[#e8eaef] to-[#f4f6f8] text-[#8f96a3] border-[#e8eaef] cursor-default"
                      : "bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white border-[#23ab7e]/30 hover:shadow-md"
                  )}
                >
                  {!saved && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  )}
                  {saving ? <Loader2 className="mr-2.5 h-6 w-6 animate-spin relative z-10" /> : saved ? <Check className="mr-2.5 h-6 w-6 relative z-10" /> : null}
                  <span className="relative z-10">
                    {saved ? (locale === "ar" ? "\u2713 \u062A\u0645 \u0627\u0644\u062D\u0641\u0638" : "\u2713 Saved") : saving ? (locale === "ar" ? "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638..." : "Saving...") : (locale === "ar" ? "\u062D\u0641\u0638 \u0627\u0644\u0635\u0648\u0631" : "Save Images")}
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== LIGHTBOX ===== */}
      {/* ===== LIGHTBOX ===== */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          {/* Gradient backdrop tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d2e]/90 via-black/80 to-[#1a1d2e]/90" />
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl ring-2 ring-white/20"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-5 -right-5 flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-[#e8eaef] shadow-xl text-[#1a1d2e] hover:bg-[#f4f6f8] transition-colors"
            >
              <X className="h-7 w-7" />
            </button>
            <div className="absolute bottom-5 right-5 flex gap-3">
              <a
                href={lightboxUrl}
                download
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-7 py-4 text-lg font-extrabold text-white shadow-xl border-2 border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-6 w-6" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
