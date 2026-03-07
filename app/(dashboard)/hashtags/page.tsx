"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, Loader2, Copy, TrendingUp, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TRENDING_PLACEHOLDER = [
  { tag: "#\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", reach: "2M+", category: "Local" },
  { tag: "#Riyadh", reach: "1.5M+", category: "City" },
  { tag: "#SaudiVision2030", reach: "800K+", category: "Vision" },
  { tag: "#\u0645\u0648\u0633\u0645_\u0627\u0644\u0631\u064A\u0627\u0636", reach: "500K+", category: "Events" },
  { tag: "#SaudiFashion", reach: "400K+", category: "Fashion" },
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
    <div className="space-y-8">
      <div>
        <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">{th.pageTitle}</h1>
        <p className="mt-2 text-lg text-[#5A8A6A]">{th.pageSub}</p>
      </div>

      {/* Trending */}
      <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-[#004D26]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#006C35]/10">
              <TrendingUp className="h-6 w-6 text-[#006C35]" />
            </div>
            {th.trendingKSA}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-wrap gap-3">
            {TRENDING_PLACEHOLDER.map((t, i) => (
              <motion.button key={t.tag} type="button" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.08 }} onClick={() => { navigator.clipboard.writeText(t.tag); toast.success("Copied " + t.tag); }} className="flex items-center gap-3 rounded-xl border-2 border-[#D4EBD9] bg-[#F8FBF8] px-5 py-3 text-base text-[#004D26] hover:border-[#00A352] hover:bg-[#F0F7F2] transition-all">
                {t.tag}
                <span className="text-sm font-medium text-[#5A8A6A]">{t.reach}</span>
                <Copy className="h-5 w-5 text-[#5A8A6A]" />
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate */}
      <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl text-[#004D26]">{th.generateSets}</CardTitle>
          <p className="mt-1 text-base text-[#5A8A6A]">{th.generateSetsSub}</p>
        </CardHeader>
        <CardContent className="space-y-5 p-6 pt-0">
          <div className="flex gap-3">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={th.topicPlaceholder} className="flex-1 h-14 rounded-xl border-2 border-[#D4EBD9] bg-white text-base text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:border-[#006C35]" />
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-14 rounded-xl border-2 border-[#D4EBD9] bg-white px-5 text-base text-[#0A1F0F] transition-all focus:border-[#006C35]">
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="x">X (Twitter)</option>
              <option value="snapchat">Snapchat</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="pinterest">Pinterest</option>
              <option value="threads">Threads</option>
            </select>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="h-14 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-white text-lg font-bold hover:shadow-[0_0_25px_rgba(0,108,53,0.2)] shadow-md px-8">
            {generating ? <Loader2 className="mr-2.5 h-6 w-6 animate-spin" /> : <Hash className="mr-2.5 h-6 w-6" />}
            {th.generate}
          </Button>
          {sets && (
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { label: th.broadReach, color: "text-[#C9A84C]", icon: "bg-[#C9A84C]/10", data: sets.broad },
                { label: th.niche, color: "text-[#006C35]", icon: "bg-[#006C35]/10", data: sets.niche },
                { label: th.saudiLocal, color: "text-[#C9A84C]", icon: "bg-[#C9A84C]/10", data: sets.saudi },
              ].map((set) => (
                <motion.div key={set.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white border-2 border-[#D4EBD9] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className={`h-5 w-5 ${set.color}`} />
                    <p className={`text-base font-semibold ${set.color}`}>{set.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {set.data.map((tag, i) => (
                      <motion.span key={tag} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }} className="rounded-lg bg-[#F0F7F2] border border-[#D4EBD9] px-4 py-2 text-base font-medium text-[#004D26]">{tag}</motion.span>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 h-12 rounded-xl border-2 border-[#D4EBD9] text-base font-medium text-[#2D5A3D] hover:border-[#006C35]" onClick={() => copySet(set.data)}>
                    <Copy className="mr-1.5 h-5 w-5" /> {th.copyAll}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Hashtags */}
      {brandHashtags.length > 0 && (
        <Card className="border-2 border-[#D4EBD9] bg-white shadow-sm">
          <CardHeader className="p-6"><CardTitle className="text-2xl text-[#004D26]">{th.brandHashtags}</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3 p-6 pt-0">
            {brandHashtags.map((tag) => (
              <motion.button key={tag} type="button" whileHover={{ scale: 1.08 }} onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied"); }} className="rounded-xl bg-[#006C35]/10 border border-[#006C35]/20 px-5 py-3 text-base font-semibold text-[#006C35] hover:bg-[#006C35]/15 hover:shadow-md transition-all">
                {tag}
              </motion.button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
