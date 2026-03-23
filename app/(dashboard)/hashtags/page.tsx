"use client";

import { useState } from "react";
import { Hash, Loader2, Copy, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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

/* ── Platform config ── */
const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#E1306C", gradient: "from-[#F77737] via-[#E1306C] to-[#C13584]" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, color: "#010101", gradient: "from-[#010101] via-[#25F4EE] to-[#FE2C55]" },
  { id: "x", label: "X", Icon: XIcon, color: "#14171A", gradient: "from-[#14171A] to-[#657786]" },
  { id: "snapchat", label: "Snapchat", Icon: SnapchatIcon, color: "#FFFC00", gradient: "from-[#FFFC00] to-[#FFE600]" },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, color: "#0077B5", gradient: "from-[#0077B5] to-[#00A0DC]" },
];

/* ── Trending KSA data ── */
const TRENDING = [
  { tag: "#السعودية", reach: "2M+", category: "Local" },
  { tag: "#Riyadh", reach: "1.5M+", category: "City" },
  { tag: "#SaudiVision2030", reach: "800K+", category: "Vision" },
  { tag: "#موسم_الرياض", reach: "500K+", category: "Events" },
  { tag: "#SaudiFashion", reach: "400K+", category: "Fashion" },
];
const TRENDING_COLORS = ["#e67af3", "#8054b8", "#23ab7e", "#2dd4a0", "#c4a8e8"];

/* ── Result set configs ── */
const SETS = [
  { key: "broad" as const, labelKey: "broadReach" as const, color: "#8054b8", icon: "🌍" },
  { key: "niche" as const, labelKey: "niche" as const, color: "#23ab7e", icon: "🎯" },
  { key: "saudi" as const, labelKey: "saudiLocal" as const, color: "#e67af3", icon: "🇸🇦" },
];

const TAG_COLORS = ["#23ab7e", "#8054b8", "#e67af3", "#2dd4a0", "#c4a8e8", "#f5c6fa", "#a6ffea"];

export default function HashtagsPage() {
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
      if (typeof window !== "undefined") localStorage.setItem("nawaa-tried-hashtags", "true");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    setGenerating(false);
  }

  function copySet(arr: string[]) { navigator.clipboard.writeText(arr.join(" ")); toast.success("Copied to clipboard"); }

  const brandHashtags = selectedCompany
    ? [`#${(selectedCompany.name || "").replace(/\s+/g, "")}`, `#${(selectedCompany.name_ar || selectedCompany.name || "").replace(/\s+/g, "_")}`, "#NawaaSaudi"].filter(Boolean)
    : [];

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-10 pb-16">

      {/* ═══════ HERO BANNER ═══════ */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Hash className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">{th.pageTitle}</h1>
              <p className="mt-2 text-lg text-white/60">{th.pageSub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ TRENDING KSA ═══════ */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(35,171,126,0.04), 0 0 0 1.5px #e8eaef" }}>
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #23ab7e, #8054b8, #e67af3)" }} />
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", boxShadow: "0 6px 20px rgba(35,171,126,0.25)" }}>
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d3142]">{th.trendingKSA}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TRENDING.map((t, i) => {
              const clr = TRENDING_COLORS[i];
              return (
                <button key={t.tag} type="button" onClick={() => { navigator.clipboard.writeText(t.tag); toast.success("Copied " + t.tag); }}
                  className="relative flex flex-col items-center gap-3 rounded-2xl p-5 sm:p-6 text-white transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${clr}, ${clr}cc)`, boxShadow: `0 6px 24px ${clr}30` }}
                >
                  <span className="text-3xl">🔥</span>
                  <span className="text-base sm:text-lg font-extrabold text-center leading-tight">{t.tag}</span>
                  <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold">{t.reach}</span>
                  <span className="rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold">{t.category}</span>
                  <Copy className="absolute top-3 right-3 h-4 w-4 text-white/40" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ GENERATE SECTION ═══════ */}
      <div className="space-y-8">

        {/* Platform Selector */}
        <div className="rounded-3xl p-6 sm:p-8 lg:p-10" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(128,84,184,0.04), 0 0 0 1.5px #e8eaef" }}>
          <div className="h-1.5 w-full rounded-full mb-8" style={{ background: "linear-gradient(90deg, #8054b8, #e67af3)" }} />
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#e67af3] text-white text-base font-bold shadow-lg">1</div>
            <div>
              <h3 className="text-xl font-bold text-[#2d3142]">{locale === "ar" ? "اختر المنصة" : "Choose Platform"}</h3>
              <p className="text-base text-[#8f96a3]">{locale === "ar" ? "أي منصة تستهدف؟" : "Which platform are you targeting?"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PLATFORMS.map((p) => {
              const selected = platform === p.id;
              return (
                <button key={p.id} type="button" onClick={() => setPlatform(p.id)}
                  className={cn("relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 cursor-pointer",
                    selected ? "border-[#23ab7e] shadow-[0_4px_20px_rgba(35,171,126,0.12)]" : "border-[#e8eaef] bg-white hover:border-[#c4a8e8] hover:shadow-md"
                  )}
                  style={selected ? { background: `linear-gradient(135deg, ${p.color}10, #8054b810)` } : undefined}
                >
                  {selected && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#23ab7e] flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", selected ? `bg-gradient-to-br ${p.gradient}` : "bg-[#f4f6f8]")}>
                    <span style={!selected ? { color: p.color } : undefined}><p.Icon className={cn("h-7 w-7", selected ? "text-white" : "")} /></span>
                  </div>
                  <span className={cn("text-base font-bold", selected ? "text-[#2d3142]" : "text-[#8f96a3]")}>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input */}
        <div className="rounded-3xl p-6 sm:p-8 lg:p-10" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(35,171,126,0.04), 0 0 0 1.5px #e8eaef" }}>
          <div className="h-1.5 w-full rounded-full mb-8" style={{ background: "linear-gradient(90deg, #23ab7e, #2dd4a0)" }} />
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#2dd4a0] text-white text-base font-bold shadow-lg">2</div>
            <div>
              <h3 className="text-xl font-bold text-[#2d3142]">{locale === "ar" ? "الموضوع" : "Enter Topic"}</h3>
              <p className="text-base text-[#8f96a3]">{locale === "ar" ? "عن ماذا تنشر؟" : "What are you posting about?"}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none z-10">
              <Hash className="h-6 w-6 text-[#8f96a3]" />
            </div>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={th.topicPlaceholder}
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
              className="w-full h-16 pl-14 pr-5 rounded-2xl border-2 border-[#e8eaef] bg-white text-lg text-[#2d3142] placeholder:text-[#8f96a3]/50 outline-none transition-all focus:border-[#23ab7e] focus:shadow-[0_0_0_4px_rgba(35,171,126,0.1)]"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={generating}
          className="relative w-full h-16 sm:h-20 rounded-2xl sm:rounded-3xl border-none text-lg sm:text-2xl font-black text-white cursor-pointer transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          style={{ background: "linear-gradient(135deg, #8054b8, #e67af3, #23ab7e)", backgroundSize: "200% 200%", animation: "nl-aurora 6s ease infinite", boxShadow: "0 8px 32px rgba(128,84,184,0.3)" }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
          <span className="relative flex items-center justify-center gap-3">
            {generating ? <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" /> : <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />}
            {th.generate}
            {!generating && <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />}
          </span>
        </button>
      </div>

      {/* ═══════ RESULTS ═══════ */}
      {sets && (
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-3">
          {SETS.map((cfg) => {
            const tags = sets[cfg.key] || [];
            return (
              <div key={cfg.key} className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", boxShadow: `0 8px 32px ${cfg.color}08, 0 0 0 1.5px #e8eaef` }}
              >
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66)` }} />
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md text-xl" style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)` }}>
                      <span>{cfg.icon}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: cfg.color }}>{th[cfg.labelKey]}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, ti) => {
                      const tc = TAG_COLORS[ti % TAG_COLORS.length];
                      return (
                        <span key={tag} onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied " + tag); }}
                          className="rounded-xl px-3.5 py-2 text-sm font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: `${tc}12`, color: tc, border: `1.5px solid ${tc}25` }}
                        >{tag}</span>
                      );
                    })}
                  </div>

                  <button onClick={() => copySet(tags)}
                    className="w-full h-12 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 cursor-pointer border-none transition-all hover:-translate-y-0.5 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, boxShadow: `0 4px 16px ${cfg.color}25` }}
                  >
                    <Copy className="h-4 w-4" />
                    {th.copyAll}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════ BRAND HASHTAGS ═══════ */}
      {brandHashtags.length > 0 && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(35,171,126,0.04), 0 0 0 1.5px #e8eaef" }}>
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #23ab7e, #8054b8)" }} />
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", boxShadow: "0 6px 20px rgba(35,171,126,0.25)" }}>
                <Hash className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d3142]">{th.brandHashtags}</h2>
            </div>

            <div className="flex flex-wrap gap-4">
              {brandHashtags.map((tag) => (
                <button key={tag} type="button" onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied"); }}
                  className="group relative rounded-2xl px-7 py-4 text-xl font-extrabold text-[#23ab7e] transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #23ab7e08, #8054b808)", border: "2px solid rgba(35,171,126,0.2)" }}
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#23ab7e]/8 to-[#8054b8]/8" />
                  <span className="relative flex items-center gap-2">
                    {tag}
                    <Copy className="h-5 w-5 text-[#8f96a3] group-hover:text-[#23ab7e] transition-colors" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
