"use client";

import { useState } from "react";
import { Hash, Loader2, Copy, TrendingUp, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/* ── Trending KSA placeholder data ── */
const TRENDING_PLACEHOLDER = [
  { tag: "#السعودية", reach: "2M+", category: "Local" },
  { tag: "#Riyadh", reach: "1.5M+", category: "City" },
  { tag: "#SaudiVision2030", reach: "800K+", category: "Vision" },
  { tag: "#موسم_الرياض", reach: "500K+", category: "Events" },
  { tag: "#SaudiFashion", reach: "400K+", category: "Fashion" },
];

/* ── Trending card gradient rotation ── */
const TRENDING_GRADIENTS = [
  "from-rose-500 to-orange-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-fuchsia-500",
  "from-amber-500 to-yellow-500",
];

/* ── Platform selector config ── */
const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", emoji: "📸", color: "from-pink-500 to-rose-500", selectedBorder: "border-pink-400", unselectedBg: "bg-pink-50", textColor: "text-pink-600" },
  { id: "tiktok", label: "TikTok", emoji: "🎵", color: "from-slate-800 to-cyan-500", selectedBorder: "border-cyan-400", unselectedBg: "bg-slate-50", textColor: "text-slate-700" },
  { id: "x", label: "X", emoji: "𝕏", color: "from-slate-700 to-slate-900", selectedBorder: "border-slate-400", unselectedBg: "bg-slate-50", textColor: "text-slate-700" },
  { id: "snapchat", label: "Snapchat", emoji: "👻", color: "from-yellow-400 to-amber-400", selectedBorder: "border-yellow-400", unselectedBg: "bg-yellow-50", textColor: "text-yellow-700" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼", color: "from-blue-500 to-blue-700", selectedBorder: "border-blue-400", unselectedBg: "bg-blue-50", textColor: "text-blue-600" },
  { id: "youtube", label: "YouTube", emoji: "🎬", color: "from-red-500 to-red-700", selectedBorder: "border-red-400", unselectedBg: "bg-red-50", textColor: "text-red-600" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬", color: "from-green-500 to-emerald-600", selectedBorder: "border-green-400", unselectedBg: "bg-green-50", textColor: "text-green-700" },
];

/* ── Hashtag pill color rotation ── */
const TAG_PILL_COLORS = [
  "bg-pink-100 text-pink-700 border border-pink-200",
  "bg-blue-100 text-blue-700 border border-blue-200",
  "bg-amber-100 text-amber-700 border border-amber-200",
  "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "bg-purple-100 text-purple-700 border border-purple-200",
];

/* ── Result set configs ── */
const SET_CONFIGS = [
  {
    key: "broad" as const,
    labelKey: "broadReach" as const,
    gradient: "from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C]",
    iconBg: "from-[#C9A84C] to-[#E8D5A0]",
    iconColor: "text-white",
    accentText: "text-[#C9A84C]",
  },
  {
    key: "niche" as const,
    labelKey: "niche" as const,
    gradient: "from-[#006C35] via-[#00A352] to-[#006C35]",
    iconBg: "from-[#006C35] to-[#00A352]",
    iconColor: "text-white",
    accentText: "text-[#006C35]",
  },
  {
    key: "saudi" as const,
    labelKey: "saudiLocal" as const,
    gradient: "from-[#006C35] via-[#00A352] to-[#C9A84C]",
    iconBg: "from-[#006C35] to-[#C9A84C]",
    iconColor: "text-white",
    accentText: "text-[#004D26]",
  },
];

export default function HashtagsPage() {
  const supabase = createClient();
  const { selectedCompany, locale } = useAppStore();
  const th = messages[locale].hashtags;
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [generating, setGenerating] = useState(false);
  const [sets, setSets] = useState<{ broad: string[]; niche: string[]; saudi: string[] } | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setGenerating(true); setSets(null);
    try {
      const res = await fetch("/api/hashtags/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: topic.trim(), platform }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSets(json.sets ?? { broad: [], niche: [], saudi: [] });
      toast.success("Hashtag sets generated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); setSets({ broad: [], niche: [], saudi: [] }); }
    setGenerating(false);
  }

  function copySet(arr: string[]) { navigator.clipboard.writeText(arr.join(" ")); toast.success("Copied to clipboard"); }

  const brandHashtags = selectedCompany
    ? [`#${(selectedCompany.name || "").replace(/\s+/g, "")}`, `#${(selectedCompany.name_ar || selectedCompany.name || "").replace(/\s+/g, "_")}`, "#NawaaSaudi"].filter(Boolean)
    : [];

  return (
    <div className="space-y-10">
      {/* ===== PAGE HEADER BANNER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10 shadow-xl"
      >
        {/* Decorative floating shapes */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="absolute top-4 right-8 flex gap-2">
          {["#️⃣", "🔥", "🚀"].map((em, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl"
            >
              {em}
            </span>
          ))}
        </div>
        <h1 className="font-['Cairo'] text-4xl font-extrabold text-white md:text-5xl drop-shadow-lg">
          {th.pageTitle}
        </h1>
        <p className="mt-3 text-lg text-white/80 md:text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#E8D5A0]" />
          {th.pageSub}
          <Sparkles className="h-5 w-5 text-[#E8D5A0]" />
        </p>
      </div>

      {/* ===== TRENDING KSA SECTION ===== */}
      <div
      >
        <Card className="rounded-2xl border-2 border-[#D4EBD9] bg-white shadow-lg overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl md:text-3xl font-extrabold text-[#004D26] font-['Cairo']">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              {th.trendingKSA}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {TRENDING_PLACEHOLDER.map((t, i) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(t.tag); toast.success("Copied " + t.tag); }}
                  className={cn(
                    "relative flex flex-col items-center gap-3 rounded-2xl border-2 border-white/20 p-5 text-white transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-br",
                    TRENDING_GRADIENTS[i % TRENDING_GRADIENTS.length]
                  )}
                >
                  {/* Glow overlay on hover */}
                  <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all duration-300 rounded-2xl" />
                  <span className="text-3xl leading-none">🔥</span>
                  <span className="text-lg font-extrabold leading-tight text-center drop-shadow-sm relative z-10">{t.tag}</span>
                  <span className="inline-flex items-center rounded-full bg-white/25 backdrop-blur-sm px-3 py-1 text-sm font-bold relative z-10">
                    {t.reach}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-semibold relative z-10">
                    {t.category}
                  </span>
                  <Copy className="absolute top-3 right-3 h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== GENERATE HASHTAG SETS ===== */}
      <div
      >
        <Card className="rounded-2xl border-2 border-[#D4EBD9] bg-white shadow-lg overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C]" />
          <CardHeader className="p-5 sm:p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg">
                <Hash className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-extrabold text-[#004D26] font-['Cairo']">
                  {th.generateSets}
                </CardTitle>
                <p className="text-lg text-[#5A8A6A] mt-1">{th.generateSetsSub}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-5 sm:p-8 pt-4">
            {/* ── Platform Selector Cards ── */}
            <div
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {PLATFORM_OPTIONS.map((p, i) => {
                  const selected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 py-5 transition-all duration-300 cursor-pointer",
                        selected
                          ? `bg-gradient-to-br ${p.color} ${p.selectedBorder} text-white shadow-lg shadow-black/10`
                          : `${p.unselectedBg} border-transparent ${p.textColor} hover:border-gray-200 grayscale-[40%] opacity-70 hover:opacity-100 hover:grayscale-0`
                      )}
                    >
                      {/* Selection ring */}
                      {selected && (
                        <div
                          className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                        >
                          <div className="h-4 w-4 rounded-full bg-[#006C35] flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <span className="text-3xl leading-none">{p.emoji}</span>
                      <span className={cn(
                        "text-sm font-bold leading-tight text-center",
                        selected ? "text-white" : ""
                      )}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />

            {/* ── Topic Input ── */}
            <div
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none z-10">
                <Hash className="h-6 w-6 text-[#5A8A6A]" />
              </div>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={th.topicPlaceholder}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
                className="h-16 pl-14 rounded-2xl border-2 border-[#D4EBD9] bg-white text-lg text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20 transition-all hover:border-[#006C35]/40"
              />
            </div>

            {/* ── Generate Button ── */}
            <div
            >
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="relative w-full h-16 rounded-2xl bg-gradient-to-r from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C] text-[#004D26] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] text-xl font-extrabold transition-all duration-500 shadow-xl border-2 border-[#C9A84C]/30 overflow-hidden group"
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                {generating ? (
                  <Loader2 className="mr-3 h-7 w-7 animate-spin relative z-10" />
                ) : (
                  <Sparkles className="mr-3 h-7 w-7 relative z-10" />
                )}
                <span className="relative z-10">{th.generate}</span>
                {!generating && <Sparkles className="ml-3 h-7 w-7 relative z-10" />}
              </Button>
            </div>

            {/* ── Result Sets ── */}
            {sets && (
              <div
                className="grid gap-6 sm:grid-cols-3"
              >
                {SET_CONFIGS.map((cfg, setIdx) => (
                  <div
                    key={cfg.key}
                    className="rounded-2xl bg-white border-2 border-[#D4EBD9] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Gradient accent bar at top */}
                    <div className={cn("h-2 w-full bg-gradient-to-r", cfg.gradient)} />

                    <div className="p-6">
                      {/* Header with icon badge */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
                          cfg.iconBg
                        )}>
                          <Sparkles className={cn("h-5 w-5", cfg.iconColor)} />
                        </div>
                        <p className={cn("text-xl font-extrabold font-['Cairo']", cfg.accentText)}>
                          {th[cfg.labelKey]}
                        </p>
                      </div>

                      {/* Tags as colorful pills */}
                      <div className="flex flex-wrap gap-2">
                        {sets[cfg.key].map((tag, tagIdx) => (
                          <span
                            key={tag}
                            className={cn(
                              "rounded-full px-4 py-2 text-base font-bold cursor-pointer hover:scale-105 transition-transform",
                              TAG_PILL_COLORS[tagIdx % TAG_PILL_COLORS.length]
                            )}
                            onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied " + tag); }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Copy All button */}
                      <div
                        className="mt-5"
                      >
                        <Button
                          onClick={() => copySet(sets[cfg.key])}
                          className={cn(
                            "w-full h-12 rounded-2xl text-lg font-bold transition-all duration-300 shadow-md overflow-hidden relative group border-2",
                            "bg-gradient-to-r border-[#D4EBD9] text-white hover:shadow-lg",
                            cfg.key === "broad" && "from-[#C9A84C] to-[#E8D5A0] text-[#004D26] border-[#C9A84C]/30",
                            cfg.key === "niche" && "from-[#006C35] to-[#00A352] border-[#006C35]/30",
                            cfg.key === "saudi" && "from-[#006C35] via-[#00A352] to-[#C9A84C] border-[#006C35]/30"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                          <Copy className="mr-2 h-5 w-5 relative z-10" />
                          <span className="relative z-10">{th.copyAll}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== BRAND HASHTAGS ===== */}
      {brandHashtags.length > 0 && (
        <div
        >
          <Card className="rounded-2xl border-2 border-[#D4EBD9] bg-white shadow-lg overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C]" />
            <CardHeader className="p-5 sm:p-8 pb-4">
              <CardTitle className="flex items-center gap-4 text-2xl md:text-3xl font-extrabold text-[#004D26] font-['Cairo']">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#C9A84C] shadow-lg">
                  <Hash className="h-7 w-7 text-white" />
                </div>
                {th.brandHashtags}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-8 pt-2">
              <div className="flex flex-wrap gap-4">
                {brandHashtags.map((tag, i) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied"); }}
                    className="relative rounded-2xl bg-gradient-to-br from-[#F0F7F2] to-white border-2 border-[#006C35]/20 px-7 py-4 text-xl font-extrabold text-[#006C35] hover:border-[#006C35]/50 transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    {/* Gradient border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#006C35]/5 to-[#C9A84C]/5" />
                    <span className="relative z-10 flex items-center gap-2">
                      {tag}
                      <Copy className="h-5 w-5 text-[#5A8A6A] group-hover:text-[#006C35] transition-colors" />
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
