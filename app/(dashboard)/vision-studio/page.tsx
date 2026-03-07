"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Download, ImageIcon, Maximize2, ImagePlus, X, Upload } from "lucide-react";
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

export default function VisionStudioPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany, locale } = useAppStore();
  const tv = messages[locale].visionStudio;

  const STYLES = [
    { id: "lifestyle", label: tv.lifestyleLabel, emoji: "\uD83D\uDCF8", desc: tv.lifestyleDesc },
    { id: "graphic", label: tv.graphicLabel, emoji: "\uD83C\uDFA8", desc: tv.graphicDesc },
    { id: "luxury", label: tv.luxuryLabel, emoji: "\u2728", desc: tv.luxuryDesc },
    { id: "heritage", label: tv.heritageLabel, emoji: "\uD83C\uDF19", desc: tv.heritageDesc },
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
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: comps } = await supabase.from("companies").select("*").eq("user_id", user.id);
      setCompanies((comps as Company[]) ?? []);
      if (comps?.length && !selectedCompany) setSelectedCompany(comps[0] as Company);
      const { data: plansData } = await supabase.from("content_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      setPlans((plansData as ContentPlanRow[]) ?? []);
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

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

      const res = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany,
          dayContent: { platform: currentDay.platform, contentType: currentDay.contentType, topic: currentDay.topic, topicAr: currentDay.topicAr, caption: currentDay.caption, imagePromptHint: currentDay.imagePromptHint },
          style, additionalInstructions: additionalInstructions.trim() || undefined, outputLanguage,
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
      toast.success(locale === "ar" ? "تم الحفظ بنجاح" : "Images saved!");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-xl bg-[#D4EBD9]/50" />
        <Skeleton className="h-[500px] rounded-2xl bg-white border-2 border-[#D4EBD9]" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">{tv.pageTitle}</h1>
          <p className="mt-2 text-lg text-[#5A8A6A]">{tv.pageSub}</p>
        </div>

        {/* Company */}
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-[#004D26]">{tv.company}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <select value={selectedCompany?.id ?? ""} onChange={(e) => { const c = companies.find((x) => x.id === e.target.value); if (c) setSelectedCompany(c); }} className="w-full rounded-xl border-2 border-[#D4EBD9] bg-white px-4 py-3 text-base text-[#0A1F0F] transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.08)]">
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            {selectedCompany?.brand_colors?.length ? (
              <div className="mt-3 flex gap-2">
                {selectedCompany.brand_colors.slice(0, 5).map((hex, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }} whileHover={{ scale: 1.3, y: -3 }} className="h-8 w-8 rounded-full border-2 border-[#D4EBD9] shadow-sm" style={{ backgroundColor: hex }} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Content Day */}
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6"><CardTitle className="text-xl font-semibold text-[#004D26]">{tv.contentDay}</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            <select value={selectedPlan?.id ?? ""} onChange={(e) => { const p = plans.find((x) => x.id === e.target.value); setSelectedPlan(p ?? null); setSelectedDayIndex(0); }} className="w-full rounded-xl border-2 border-[#D4EBD9] bg-white px-4 py-3 text-base text-[#0A1F0F] transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.08)]">
              {plans.filter((p) => p.plan_data?.days?.length).map((p) => (<option key={p.id} value={p.id}>{p.title || p.week_start}</option>))}
            </select>
            {selectedPlan?.plan_data?.days?.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedPlan.plan_data.days.map((d, i) => (
                  <button key={i} type="button" onClick={() => setSelectedDayIndex(i)} className={cn("rounded-xl px-5 py-3 text-base font-medium transition-all", selectedDayIndex === i ? "bg-[#006C35] text-white shadow-md" : "bg-[#F0F7F2] text-[#5A8A6A] border border-[#D4EBD9] hover:border-[#006C35]")}>
                    {locale === "ar" ? (d.dayAr || d.dayEn) : (d.dayEn || d.dayAr)}
                  </button>
                ))}
              </div>
            ) : null}
            {currentDay ? (
              <div className="rounded-xl border-2 border-[#D4EBD9] bg-[#F8FBF8] p-4">
                <p className="text-base font-semibold text-[#004D26]">{locale === "ar" ? (currentDay.topicAr || currentDay.topic) : (currentDay.topic || currentDay.topicAr)}</p>
                <p className="mt-1.5 text-sm text-[#5A8A6A]">{currentDay.imagePromptHint}</p>
              </div>
            ) : (
              <p className="text-base text-[#5A8A6A]">{tv.noPlan}</p>
            )}
          </CardContent>
        </Card>

        {/* Reference Images */}
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-[#004D26]">
              {locale === "ar" ? "صور مرجعية" : "Reference Photos"}
            </CardTitle>
            <p className="text-sm text-[#5A8A6A] mt-1">
              {locale === "ar" ? "أضف صور أطباقك، مكانك، أو منتجاتك ليستخدمها الذكاء الاصطناعي" : "Add photos of your dishes, place, or products for AI to reference"}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-3 gap-3">
              {referenceImages.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#D4EBD9]">
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeReferenceImage(i)}
                    className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {referenceImages.length < 6 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4EBD9] bg-[#F8FBF8] hover:border-[#006C35] hover:bg-[#F0F7F2] transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                  <Upload className="h-6 w-6 text-[#5A8A6A] mb-1" />
                  <span className="text-xs text-[#5A8A6A]">{locale === "ar" ? "إضافة" : "Add"}</span>
                </label>
              )}
            </div>
            {referenceImages.length > 0 && (
              <p className="mt-2 text-xs text-[#5A8A6A]">
                {referenceImages.length}/6 {locale === "ar" ? "صور" : "photos"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Style */}
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6"><CardTitle className="text-xl font-semibold text-[#004D26]">{tv.style}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-6 pt-0">
            {STYLES.map((s) => (
              <motion.button key={s.id} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setStyle(s.id)} className={cn("rounded-xl border-2 p-5 text-left transition-all", style === s.id ? "border-[#006C35] bg-[#F0F7F2] shadow-[0_0_20px_rgba(0,108,53,0.08)]" : "border-[#D4EBD9] bg-white hover:border-[#00A352]")}>
                <span className="text-3xl">{s.emoji}</span>
                <p className="mt-2 text-lg font-semibold text-[#004D26]">{s.label}</p>
                <p className="text-base text-[#5A8A6A]">{s.desc}</p>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Language */}
        <div>
          <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tv.generateIn}</label>
          <div className="flex gap-3">
            <Button type="button" variant={outputLanguage === "en" ? "default" : "outline"} className={cn("h-12 px-6 rounded-xl text-base", outputLanguage === "en" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md" : "border-2 border-[#D4EBD9] text-[#2D5A3D]")} onClick={() => setOutputLanguage("en")}>{tv.english}</Button>
            <Button type="button" variant={outputLanguage === "ar" ? "default" : "outline"} className={cn("h-12 px-6 rounded-xl text-base", outputLanguage === "ar" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md" : "border-2 border-[#D4EBD9] text-[#2D5A3D]")} onClick={() => setOutputLanguage("ar")}>{tv.arabic}</Button>
          </div>
        </div>

        {/* Include Logo Toggle */}
        {selectedCompany?.logo_url && (
          <motion.button
            type="button"
            onClick={() => setIncludeLogo(!includeLogo)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all",
              includeLogo
                ? "border-[#006C35] bg-[#F0F7F2] shadow-[0_0_20px_rgba(0,108,53,0.08)]"
                : "border-[#D4EBD9] bg-white hover:border-[#00A352]"
            )}
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
              includeLogo ? "bg-[#006C35]" : "bg-[#F0F7F2]"
            )}>
              <ImagePlus className={cn("h-6 w-6", includeLogo ? "text-white" : "text-[#5A8A6A]")} />
            </div>
            <div className="flex-1">
              <p className={cn("text-base font-semibold", includeLogo ? "text-[#004D26]" : "text-[#5A8A6A]")}>{tv.includeLogo}</p>
              <p className="text-sm text-[#5A8A6A]">{tv.logoNote}</p>
            </div>
            <div className={cn(
              "h-7 w-12 rounded-full transition-colors relative",
              includeLogo ? "bg-[#006C35]" : "bg-[#D4EBD9]"
            )}>
              <div className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform",
                includeLogo ? "translate-x-5" : "translate-x-0.5"
              )} />
            </div>
          </motion.button>
        )}

        {/* Extra */}
        <div>
          <label className="mb-2.5 block text-base font-semibold text-[#004D26]">{tv.extraInstructions}</label>
          <Textarea value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)} placeholder={tv.extraPlaceholder} className="min-h-[100px] rounded-xl border-2 border-[#D4EBD9] bg-white text-base text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35]" />
        </div>

        {/* Generate */}
        <Button onClick={handleGenerate} disabled={generating || !currentDay} className="w-full h-16 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#004D26] text-xl font-bold hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all shadow-md">
          {generating ? <Loader2 className="mr-2.5 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2.5 h-6 w-6" />}
          {tv.generate4}
        </Button>
      </div>

      {/* Image Output */}
      <div className="lg:col-span-3">
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6"><CardTitle className="text-2xl font-bold text-[#004D26]">{tv.generatedImages}</CardTitle></CardHeader>
          <CardContent className="p-6 pt-0">
            {images.length === 0 && !generating ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-[#F8FBF8] py-24">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#F0F7F2]">
                  <ImageIcon className="h-14 w-14 text-[#5A8A6A]" />
                </div>
                <p className="mt-6 text-xl font-medium text-[#5A8A6A]">{tv.imagesHere}</p>
                <p className="mt-1 text-base text-[#5A8A6A]/60">{tv.selectAndGenerate}</p>
              </div>
            ) : generating ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="relative aspect-square overflow-hidden rounded-2xl border-2 border-[#D4EBD9]"
                      style={{ background: "linear-gradient(135deg, #F0F7F2 0%, #F8FBF8 50%, #F0F7F2 100%)" }}
                    >
                      {/* Animated gradient sweep */}
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,108,53,0.06) 50%, transparent 100%)" }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      />
                      {/* Pulsing icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                        >
                          <Sparkles className="h-12 w-12 text-[#C9A84C]/30" />
                        </motion.div>
                      </div>
                      {/* Progress dots */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            className="h-2 w-2 rounded-full bg-[#006C35]/20"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.3 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Funny quote */}
                <motion.div
                  key={loadingQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <p className="text-lg font-semibold text-[#004D26]">
                    {loadingQuotes[loadingQuoteIndex]}
                  </p>
                  <div className="mt-2 mx-auto h-1.5 w-48 rounded-full bg-[#F0F7F2] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <motion.div key={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="group relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9]">
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
                            fallback.className = "aspect-square w-full flex items-center justify-center bg-[#F0F7F2]";
                            fallback.innerHTML = '<p class="text-[#5A8A6A] text-center px-4">Image failed to load</p>';
                            parent.insertBefore(fallback, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center bg-[#F0F7F2]">
                        <div className="text-center">
                          <ImageIcon className="h-10 w-10 text-[#5A8A6A] mx-auto mb-2" />
                          <p className="text-sm text-[#5A8A6A]">Generation failed</p>
                        </div>
                      </div>
                    )}
                    {img.url && (
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <motion.button type="button" onClick={() => setLightboxUrl(img.url!)} whileHover={{ scale: 1.1 }} className="rounded-xl bg-white border-2 border-[#D4EBD9] px-4 py-2.5 text-base font-medium text-[#004D26] flex items-center gap-2 shadow-md">
                          <Maximize2 className="h-5 w-5" /> {tv.fullScreen}
                        </motion.button>
                        <motion.a href={img.url} download whileHover={{ scale: 1.1 }} className="rounded-xl bg-[#006C35] px-4 py-2.5 text-base font-medium text-white flex items-center gap-2 shadow-md">
                          <Download className="h-5 w-5" />
                        </motion.a>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 border border-[#D4EBD9] px-4 py-1.5 text-base font-medium text-[#004D26]">{img.style_label}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {images.length > 0 && !generating && (
              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saved || saving}
                  className={cn(
                    "h-14 px-8 rounded-xl text-lg font-bold shadow-md transition-all",
                    saved
                      ? "bg-[#D4EBD9] text-[#5A8A6A] cursor-default"
                      : "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white hover:shadow-[0_0_25px_rgba(0,108,53,0.3)]"
                  )}
                >
                  {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {saved ? (locale === "ar" ? "\u2713 تم الحفظ" : "\u2713 Saved") : saving ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : (locale === "ar" ? "حفظ الصور" : "Save Images")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-4 -right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#D4EBD9] shadow-lg text-[#004D26] hover:bg-[#F0F7F2] transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.a
              href={lightboxUrl}
              download
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-[#006C35] px-5 py-3 text-base font-semibold text-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-5 w-5" /> Download
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
