"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Calendar,
  Image as ImageIcon,
  Globe,
  Plus,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  TrendingUp,
  Rocket,
  Quote,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import GettingStartedCard from "@/components/GettingStartedCard";

/* ── Loading Messages ── */
const LOADING_LINES_EN = [
  { emoji: "\ud83d\udcca", text: "Fetching your companies & stats..." },
  { emoji: "\ud83d\udcc5", text: "Loading your latest content plans..." },
  { emoji: "\ud83d\uddbc\ufe0f", text: "Gathering your generated images..." },
  { emoji: "\ud83d\udce1", text: "Syncing your platform data..." },
  { emoji: "\u2699\ufe0f", text: "Preparing your personalized dashboard..." },
  { emoji: "\ud83d\udce6", text: "Unpacking your marketing insights..." },
  { emoji: "\ud83d\udd0d", text: "Scanning your brand analytics..." },
  { emoji: "\ud83c\udf10", text: "Connecting to your workspace..." },
];
const LOADING_LINES_AR = [
  { emoji: "\ud83d\udcca", text: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0634\u0631\u0643\u0627\u062a\u0643 \u0648\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a\u0643..." },
  { emoji: "\ud83d\udcc5", text: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0623\u062d\u062f\u062b \u062e\u0637\u0637 \u0627\u0644\u0645\u062d\u062a\u0648\u0649..." },
  { emoji: "\ud83d\uddbc\ufe0f", text: "\u062c\u0627\u0631\u064a \u062c\u0645\u0639 \u0635\u0648\u0631\u0643 \u0627\u0644\u0645\u064f\u0648\u0644\u0651\u062f\u0629..." },
  { emoji: "\ud83d\udce1", text: "\u062c\u0627\u0631\u064a \u0645\u0632\u0627\u0645\u0646\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0646\u0635\u0627\u062a\u0643..." },
  { emoji: "\u2699\ufe0f", text: "\u062c\u0627\u0631\u064a \u062a\u062c\u0647\u064a\u0632 \u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645\u0643 \u0627\u0644\u0645\u062e\u0635\u0635\u0629..." },
  { emoji: "\ud83d\udce6", text: "\u062c\u0627\u0631\u064a \u0641\u062a\u062d \u0631\u0624\u0649 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643..." },
  { emoji: "\ud83d\udd0d", text: "\u062c\u0627\u0631\u064a \u0641\u062d\u0635 \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0639\u0644\u0627\u0645\u062a\u0643..." },
  { emoji: "\ud83c\udf10", text: "\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644\u0643..." },
];

/* ── Marketing Quotes ── */
const MARKETING_QUOTES_EN = [
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne", role: "Marketoonist" },
  { text: "Content is king, but context is God.", author: "Gary Vaynerchuk", role: "CEO, VaynerMedia" },
  { text: "Make the customer the hero of your story.", author: "Ann Handley", role: "Chief Content Officer" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek", role: "Author & Speaker" },
  { text: "Your brand is what people say about you when you're not in the room.", author: "Jeff Bezos", role: "Founder, Amazon" },
  { text: "Marketing is no longer about the stuff you make, but the stories you tell.", author: "Seth Godin", role: "Marketing Guru" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", role: "Co-founder, Apple" },
  { text: "The aim of marketing is to know the customer so well the product sells itself.", author: "Peter Drucker", role: "Management Consultant" },
];
const MARKETING_QUOTES_AR = [
  { text: "\u0623\u0641\u0636\u0644 \u062a\u0633\u0648\u064a\u0642 \u0647\u0648 \u0627\u0644\u0630\u064a \u0644\u0627 \u064a\u0628\u062f\u0648 \u0643\u062a\u0633\u0648\u064a\u0642.", author: "Tom Fishburne", role: "Marketoonist" },
  { text: "\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0647\u0648 \u0627\u0644\u0645\u0644\u0643\u060c \u0644\u0643\u0646 \u0627\u0644\u0633\u064a\u0627\u0642 \u0647\u0648 \u0627\u0644\u0625\u0644\u0647.", author: "Gary Vaynerchuk", role: "VaynerMedia \u0631\u0626\u064a\u0633" },
  { text: "\u0627\u062c\u0639\u0644 \u0627\u0644\u0639\u0645\u064a\u0644 \u0628\u0637\u0644 \u0642\u0635\u062a\u0643.", author: "Ann Handley", role: "\u0631\u0626\u064a\u0633\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649" },
  { text: "\u0627\u0644\u0646\u0627\u0633 \u0644\u0627 \u064a\u0634\u062a\u0631\u0648\u0646 \u0645\u0627 \u062a\u0641\u0639\u0644\u0647\u060c \u0628\u0644 \u064a\u0634\u062a\u0631\u0648\u0646 \u0644\u0645\u0627\u0630\u0627 \u062a\u0641\u0639\u0644\u0647.", author: "Simon Sinek", role: "\u0645\u0624\u0644\u0641 \u0648\u0645\u062a\u062d\u062f\u062b" },
  { text: "\u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0647\u064a \u0645\u0627 \u064a\u0642\u0648\u0644\u0647 \u0627\u0644\u0646\u0627\u0633 \u0639\u0646\u0643 \u0639\u0646\u062f\u0645\u0627 \u0644\u0627 \u062a\u0643\u0648\u0646 \u0641\u064a \u0627\u0644\u063a\u0631\u0641\u0629.", author: "Jeff Bezos", role: "Amazon \u0645\u0624\u0633\u0633" },
  { text: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0644\u0645 \u064a\u0639\u062f \u0639\u0646 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0628\u0644 \u0639\u0646 \u0627\u0644\u0642\u0635\u0635 \u0627\u0644\u062a\u064a \u062a\u0631\u0648\u064a\u0647\u0627.", author: "Seth Godin", role: "\u062e\u0628\u064a\u0631 \u062a\u0633\u0648\u064a\u0642" },
  { text: "\u0627\u0644\u0627\u0628\u062a\u0643\u0627\u0631 \u064a\u0645\u064a\u0632 \u0628\u064a\u0646 \u0627\u0644\u0642\u0627\u0626\u062f \u0648\u0627\u0644\u062a\u0627\u0628\u0639.", author: "Steve Jobs", role: "Apple \u0645\u0624\u0633\u0633" },
  { text: "\u0647\u062f\u0641 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0647\u0648 \u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u062c\u064a\u062f\u0627\u064b \u0628\u062d\u064a\u062b \u064a\u0628\u064a\u0639 \u0627\u0644\u0645\u0646\u062a\u062c \u0646\u0641\u0633\u0647.", author: "Peter Drucker", role: "\u0645\u0633\u062a\u0634\u0627\u0631 \u0625\u062f\u0627\u0631\u064a" },
];

/* ── Platform data ── */
const PLATFORM_GRADIENT: Record<string, string> = {
  instagram: "from-pink-500 to-rose-500",
  tiktok: "from-slate-800 to-slate-600",
  x: "from-slate-700 to-slate-500",
  snapchat: "from-yellow-400 to-[#e67af3]",
  linkedin: "from-[#6d3fa0] to-[#8054b8]",
};
const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf8", tiktok: "\ud83c\udfb5", x: "\u2716\ufe0f",
  snapchat: "\ud83d\udc7b", linkedin: "\ud83d\udcbc",
};

type ContentPlan = {
  id: string;
  title: string | null;
  week_start: string;
  plan_data: { days?: Array<{ dayAr?: string; dayEn?: string; platform?: string; topic?: string; topicAr?: string }> };
};
type GeneratedImage = {
  id: string;
  image_urls: string[] | null;
  company_id: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestPlan, setLatestPlan] = useState<ContentPlan | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [stats, setStats] = useState({ companies: 0, plans: 0, images: 0, platforms: 0 });

  const t = messages[locale].dashboard;

  useEffect(() => {
    if (!user?.id) return;
    // Don't block rendering — load data in background
    const supabase = createClient();
    const uid = user.id;
    (async () => {
      try {
        const [companiesRes, plansRes, imagesRes, plansCountRes, allImagesRes] = await Promise.all([
          supabase.from("companies").select("id, name, name_ar, industry, logo_url, brand_colors, platforms, created_at").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("content_plans").select("id, title, week_start, plan_data").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
          supabase.from("generated_images").select("id, image_urls, company_id, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
          supabase.from("content_plans").select("id", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("generated_images").select("id", { count: "exact", head: true }).eq("user_id", uid),
        ]);
        const comps = (companiesRes.data || []) as Company[];
        setCompanies(comps);
        if (comps.length && !selectedCompany) setSelectedCompany(comps[0]);
        setLatestPlan((plansRes.data as ContentPlan[] | null)?.[0] || null);
        setRecentImages((imagesRes.data || []) as GeneratedImage[]);
        const platformSet = new Set<string>();
        comps.forEach((c) => (c.platforms || []).forEach((p) => platformSet.add(p)));
        const totalImages = allImagesRes.count ?? 0;
        setStats({ companies: comps.length, plans: plansCountRes.count ?? 0, images: totalImages, platforms: platformSet.size });
      } catch { /* supabase query error */ }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  /* ── Quote Rotation — 10s instead of 3s to reduce re-renders ── */
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex((p) => (p + 1) % MARKETING_QUOTES_EN.length), 10000);
    return () => clearInterval(interval);
  }, []);

  /* ── Loading State ── */
  const [lineIndex, setLineIndex] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setLineIndex((p) => (p + 1) % LOADING_LINES_EN.length), 2400);
    return () => clearInterval(interval);
  }, [loading]);

  /* ── Insane Loading Screen ── */
  if (loading) {
    const lines = locale === "ar" ? LOADING_LINES_AR : LOADING_LINES_EN;
    const current = lines[lineIndex];
    const isRtl = locale === "ar";
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="relative flex items-center justify-center min-h-[80vh] overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 nl-aurora-bg opacity-[0.07]" />

        {/* 3D Cubes */}
        <div className="absolute inset-0 pointer-events-none" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          {[
            { size: 50, top: "8%", left: "5%", border: "rgba(35,171,126,.15)", bg: "rgba(35,171,126,.04)", dur: 16 },
            { size: 35, top: "15%", left: "85%", border: "rgba(128,84,184,.15)", bg: "rgba(128,84,184,.04)", dur: 22, reverse: true },
            { size: 28, top: "75%", left: "8%", border: "rgba(230,122,243,.15)", bg: "rgba(230,122,243,.04)", dur: 18 },
            { size: 40, top: "70%", left: "88%", border: "rgba(166,255,234,.18)", bg: "rgba(166,255,234,.04)", dur: 24, reverse: true },
            { size: 20, top: "45%", left: "15%", border: "rgba(196,168,232,.12)", bg: "rgba(196,168,232,.03)", dur: 20 },
            { size: 25, top: "30%", left: "75%", border: "rgba(245,198,250,.15)", bg: "rgba(245,198,250,.04)", dur: 26, reverse: true },
          ].map((c, i) => (
            <div key={i} className="absolute" style={{ top: c.top, left: c.left, transformStyle: "preserve-3d", animation: `nl-drift-${["a", "b", "c", "d", "a", "b"][i]} ${14 + i * 2}s ease-in-out infinite` }}>
              <div className="nl-cube" style={{ width: c.size, height: c.size, animation: `nl-spin ${c.dur}s linear infinite ${c.reverse ? "reverse" : ""}` }}>
                {[0,1,2,3,4,5].map(f => <div key={f} style={{ position: "absolute", width: c.size, height: c.size, borderRadius: "25%", border: `2px solid ${c.border}`, background: c.bg, transform: [
                  `translateZ(${c.size/2}px)`, `translateZ(${-c.size/2}px) rotateY(180deg)`,
                  `translateX(${-c.size/2}px) rotateY(-90deg)`, `translateX(${c.size/2}px) rotateY(90deg)`,
                  `translateY(${-c.size/2}px) rotateX(90deg)`, `translateY(${c.size/2}px) rotateX(-90deg)`
                ][f] }} />)}
              </div>
            </div>
          ))}

          {/* 3D Rings */}
          <div className="absolute top-[25%] right-[20%] w-[80px] h-[80px] rounded-full" style={{ border: "2px solid rgba(166,255,234,.12)", transformStyle: "preserve-3d", animation: "nl-ring-rotate 12s linear infinite" }}>
            <div className="absolute inset-[10px] rounded-full" style={{ border: "1.5px solid rgba(128,84,184,.1)" }} />
          </div>
          <div className="absolute bottom-[20%] left-[25%] w-[60px] h-[60px] rounded-full" style={{ border: "1.5px solid rgba(230,122,243,.1)", transformStyle: "preserve-3d", animation: "nl-ring-rotate-2 16s linear infinite" }} />

          {/* Gradient Spheres */}
          <div className="absolute top-[5%] right-[10%] w-[120px] h-[120px] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, rgba(196,168,232,.2), transparent 70%)", animation: "nl-drift-c 18s ease-in-out infinite" }} />
          <div className="absolute bottom-[10%] left-[10%] w-[100px] h-[100px] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, rgba(166,255,234,.2), transparent 70%)", animation: "nl-drift-b 16s ease-in-out infinite" }} />

          {/* Floating particles */}
          {Array.from({ length: 15 }).map((_, i) => {
            const s1 = (i * 7 + 13) % 100;
            const s2 = (i * 11 + 37) % 100;
            return <div key={i} className="absolute rounded-full" style={{ width: 3 + (s1 % 4), height: 3 + (s2 % 4), top: `${s1}%`, left: `${s2}%`, background: ["#23ab7e", "#8054b8", "#e67af3", "#a6ffea", "#c4a8e8"][i % 5], opacity: 0.15 + (s1 % 20) / 100, animation: `nl-float-particle ${8 + (s1 % 10)}s ease-in-out infinite`, animationDelay: `${(s2 % 50) / 10}s` }} />;
          })}

          {/* Orbiting dots */}
          <div className="absolute top-[40%] left-[45%]" style={{ animation: "nl-orbit 14s linear infinite" }}>
            <div className="w-2 h-2 rounded-full bg-[#23ab7e] opacity-30" />
          </div>
          <div className="absolute top-[55%] left-[50%]" style={{ animation: "nl-orbit-lg 18s linear infinite reverse" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#8054b8] opacity-25" />
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-lg px-6">
          {/* Animated logo with glow */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-[32px] opacity-20" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", animation: "nl-glow-breathe 3s ease-in-out infinite" }} />
            <div className="absolute -inset-16 rounded-[40px] opacity-10" style={{ background: "linear-gradient(135deg, #8054b8, #e67af3)", animation: "nl-glow-breathe 3s ease-in-out infinite 1s" }} />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[24px]" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", boxShadow: "0 16px 48px rgba(35,171,126,0.4), 0 0 80px rgba(128,84,184,0.15)" }}>
              <Sparkles className="h-8 w-8 text-white" style={{ animation: "nl-spin-slow 8s linear infinite" }} />
            </div>
            {/* Pulse ring */}
            <div className="absolute -inset-3 rounded-[28px]" style={{ border: "2px solid #23ab7e", animation: "nl-pulse-ring 2.5s ease-in-out infinite" }} />
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="text-sm sm:text-xl font-black text-[#2d3142]" style={{ animation: "nl-fade-up 0.6s ease forwards" }}>
              {isRtl ? "جارٍ تحميل بياناتك" : "Loading your workspace"}
            </h2>
            <p className="text-sm text-[#8f96a3] mt-2" style={{ animation: "nl-fade-up 0.6s ease forwards 0.15s", opacity: 0 }}>
              {isRtl ? "نجهز لوحة التحكم الخاصة بك" : "Preparing your personalized dashboard"}
            </p>
          </div>

          {/* Rotating message card */}
          <div className="w-full rounded-xl border border-[#e8eaef] p-3 transition-all duration-300" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-4">
              <span className="text-3xl shrink-0">{current.emoji}</span>
              <p className="text-sm font-semibold text-[#2d3142] leading-snug">{current.text}</p>
            </div>
          </div>

          {/* Progress bar with aurora gradient */}
          <div className="w-full space-y-4">
            <div className="h-2 rounded-full bg-[#e8eaef] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "70%", background: "linear-gradient(90deg, #23ab7e, #8054b8, #e67af3)", backgroundSize: "200% 100%", animation: "nl-aurora 3s ease infinite" }} />
            </div>

            {/* Mini feature cards skeleton */}
            <div className="grid grid-cols-4 gap-3">
              {["#23ab7e", "#8054b8", "#e67af3", "#2dd4a0"].map((color, i) => (
                <div key={i} className="h-16 rounded-xl overflow-hidden" style={{ background: `${color}08`, border: `1.5px solid ${color}15` }}>
                  <div className="h-full w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}10, transparent)`, backgroundSize: "200% 100%", animation: `nl-aurora ${2 + i * 0.3}s ease infinite` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Stat cards config ── */
  const statItems = [
    { label: t.totalCompanies, value: stats.companies, icon: Building2, gradient: "from-[#23ab7e] to-[#1a8a64]", glow: "shadow-[#23ab7e]/25" },
    { label: t.plansGenerated, value: stats.plans, icon: Calendar, gradient: "from-[#e67af3] to-[#c4a8e8]", glow: "shadow-[#e67af3]/25" },
    { label: t.imagesCreated, value: stats.images, icon: ImageIcon, gradient: "from-[#8054b8] to-[#a45dd4]", glow: "shadow-[#8054b8]/25" },
    { label: t.platformsActive, value: stats.platforms, icon: Globe, gradient: "from-[#2dd4a0] to-[#23ab7e]", glow: "shadow-[#2dd4a0]/25" },
  ];

  /* ── Quick actions config ── */
  const quickActions = [
    { href: "/companies", icon: Building2, title: t.addNewCompany, desc: locale === "ar" ? "\u0627\u0636\u0641 \u0634\u0631\u0643\u0629 \u062c\u062f\u064a\u062f\u0629 \u0648\u062d\u0644\u0644 \u0647\u0648\u064a\u062a\u0647\u0627" : "Add a new brand and analyze its identity", gradient: "from-[#23ab7e] to-[#1a8a64]", glow: "hover:shadow-[#23ab7e]/20" },
    { href: "/planner", icon: Calendar, title: t.generateThisWeek, desc: locale === "ar" ? "\u062e\u0637\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0633\u0628\u0648\u0639\u064a\u0629 \u0645\u062e\u0635\u0635\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" : "AI-powered weekly content plan", gradient: "from-[#e67af3] to-[#c4a8e8]", glow: "hover:shadow-[#e67af3]/20" },
    { href: "/vision-studio", icon: Sparkles, title: t.createVisual, desc: locale === "ar" ? "\u0635\u0648\u0631 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0645\u0648\u0644\u062f\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" : "Professional AI-generated visuals", gradient: "from-[#8054b8] to-[#a45dd4]", glow: "hover:shadow-[#8054b8]/20" },
  ];

  const isRtl = locale === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 pb-10">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div className="relative overflow-hidden rounded-xl nl-aurora-bg p-3 sm:p-6 lg:p-8">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-24 right-40 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left side - Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/nawaa-logo.svg" alt="Nawaa AI" className="h-40 w-auto" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-2xl font-black text-white leading-tight tracking-tight">
              {t.greeting}, {displayName} {"\ud83d\udc4b"}
            </h1>
            <p className="mt-3 text-sm sm:text-sm font-medium text-white/70">{formatDate(new Date())}</p>

            {/* Mini inline stats in hero */}
            <div className="mt-5 flex flex-wrap gap-3">
              {statItems.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3">
                  <s.icon className="h-6 w-6 text-[#a6ffea]" />
                  <div>
                    {loading ? (
                      <div className="h-7 w-10 rounded-lg bg-white/20 animate-pulse" />
                    ) : (
                      <p className="text-xl font-black text-white">{s.value}</p>
                    )}
                    <p className="text-sm font-medium text-[#a6ffea]/60">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Rotating Quotes */}
          <div className="lg:max-w-lg xl:max-w-xl">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 lg:p-6 relative overflow-hidden">
              <Quote className={`h-8 w-8 text-[#a6ffea]/30 mb-3 ${isRtl ? "scale-x-[-1]" : ""}`} />
              <div key={quoteIndex} className="transition-opacity duration-500">
                <p className="text-sm lg:text-sm font-bold text-white/95 leading-relaxed italic mb-4">
                  &ldquo;{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#a6ffea] to-[#23ab7e] flex items-center justify-center text-sm font-black text-white shadow-lg">
                    {(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].author}</p>
                    <p className="text-xs text-[#a6ffea]/70">{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].role}</p>
                  </div>
                </div>
              </div>
              {/* Quote dots indicator */}
              <div className="flex gap-2 mt-6 justify-center">
                {MARKETING_QUOTES_EN.slice(0, 8).map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === quoteIndex ? "w-6 bg-[#a6ffea]" : "w-2 bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ GETTING STARTED ═══════════════════ */}
      <GettingStartedCard stats={stats} locale={locale} />

      {/* ═══════════════════ STATS GRID ═══════════════════ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statItems.map((s) => (
          <div
            key={s.label}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${s.gradient} p-3 shadow-xl ${s.glow} hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-default`}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 mb-3">
                <s.icon className="h-5 w-5 text-white" />
              </div>
              {loading ? (
                <div className="h-8 w-16 rounded-xl bg-white/20 animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-black text-white tracking-tight">{s.value.toLocaleString()}</p>
              )}
              <p className="text-sm font-bold text-white/70 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════ QUICK ACTIONS ═══════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#1a8a64]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-[#1a1d2e]">{t.quickActions}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <div key={a.href}>
              <Link href={a.href} className={`group relative block overflow-hidden rounded-xl border-2 border-transparent bg-white p-3 shadow-lg ${a.glow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Top gradient accent bar */}
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${a.gradient}`} />
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.gradient} shadow-lg`}>
                  <a.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-extrabold text-[#1a1d2e] mb-1">{a.title}</h3>
                <p className="text-sm text-[#8f96a3] leading-relaxed">{a.desc}</p>
                <div className={`mt-4 inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${a.gradient} bg-clip-text text-transparent`}>
                  {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646" : "Get started"} <ArrowRight className={`h-5 w-5 text-[#23ab7e] group-hover:translate-x-1 transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ LATEST PLAN ═══════════════════ */}
      <div className="rounded-xl border-2 border-[#e8eaef] bg-white overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-3 border-b-2 border-[#e8eaef]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e67af3] to-[#c4a8e8] shadow-lg shadow-[#e67af3]/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-sm sm:text-xl font-black text-[#1a1d2e]">{t.latestPlan}</h2>
          </div>
          {latestPlan && (
            <Link href="/my-plans" className="flex items-center gap-2 text-sm font-bold text-[#23ab7e] hover:underline">
              {t.viewFullPlan} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>
        <div className="p-5">
          {days.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {days.map((d, i) => {
                const key = d.platform?.toLowerCase().trim() ?? "";
                const grad = PLATFORM_GRADIENT[key] || "from-gray-400 to-gray-500";
                return (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl border-2 border-[#e8eaef] p-3 text-center hover:border-transparent hover:shadow-lg transition-all duration-300"
                  >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${grad}`} />
                    <p className="text-sm font-bold text-[#1a1d2e]">{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                    <p className="my-3 text-4xl">{PLATFORM_EMOJI[key] || "\ud83d\udce2"}</p>
                    <p className="text-sm text-[#505868] leading-snug line-clamp-2">{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                    <span className={`mt-3 inline-block rounded-xl bg-gradient-to-r ${grad} px-3 py-1 text-sm font-bold text-white capitalize`}>{d.platform}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8eaef] to-orange-100">
                <Calendar className="h-10 w-10 text-[#e67af3]" />
              </div>
              <p className="text-xl text-[#8f96a3]">{t.noPlansYet}</p>
              <Link href="/planner" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:underline">
                {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646" : "Create one now"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ YOUR COMPANIES ═══════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#1a8a64]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-[#1a1d2e]">{t.yourCompanies}</h2>
          </div>
          <Link href="/companies" className="flex items-center gap-2 text-sm font-bold text-[#23ab7e] hover:underline">
            {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-nawaa">
          {companies.map((c, i) => (
            <div key={c.id}>
              <Link href="/companies" className="group block min-w-[240px] sm:min-w-[280px] shrink-0 rounded-xl border-2 border-[#e8eaef] bg-white p-7 text-center hover:border-[#2dd4a0] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div
                  className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-xl text-4xl font-black text-white overflow-hidden shadow-lg"
                  style={{ backgroundColor: c.brand_colors?.[0] || "#23ab7e" }}
                >
                  {c.logo_url ? <Image src={c.logo_url} alt={c.name || "Company logo"} width={96} height={96} className="h-full w-full object-cover" /> : c.name?.charAt(0) || "?"}
                </div>
                <p className="text-xl font-extrabold text-[#1a1d2e] truncate">{c.name}</p>
                {c.industry && (
                  <span className="mt-3 inline-block rounded-xl bg-gradient-to-r from-[#f4f6f8] to-[#f4f6f8] border border-[#a6ffea] px-4 py-1.5 text-sm font-semibold text-[#1a8a64]">{c.industry}</span>
                )}
              </Link>
            </div>
          ))}
          <Link href="/companies" className="min-w-[240px] sm:min-w-[280px] shrink-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e8eaef] p-7 hover:border-[#2dd4a0] hover:bg-[#f4f6f8]/50 transition-all duration-300 group">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white group-hover:bg-[#a6ffea] transition-colors">
              <Plus className="h-8 w-8 text-[#1a8a64]" />
            </div>
            <span className="text-xl font-extrabold text-[#1a1d2e]">{t.addCompany}</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════ RECENT IMAGES ═══════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#a45dd4]">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-[#1a1d2e]">{t.recentImages}</h2>
          </div>
          {recentImages.length > 0 && (
            <Link href="/my-generations" className="flex items-center gap-2 text-sm font-bold text-[#6d3fa0] hover:underline">
              {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentImages.filter(img => img.image_urls?.[0]).slice(0, 5).map((img, i) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-[#e8eaef] shadow-md hover:shadow-xl hover:border-[#c4a8e8] transition-all duration-300"
              >
                <Image src={img.image_urls![0]} alt={locale === "ar" ? "صورة مولدة" : "Generated image"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-xl bg-white/90 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-[#1a1d2e] flex items-center gap-2 shadow-lg">
                    <Eye className="h-5 w-5" /> {locale === "ar" ? "\u0639\u0631\u0636" : "View"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-[#c4a8e8] bg-gradient-to-br from-[#f4f6f8] to-purple-50 py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8eaef] to-purple-100">
              <ImageIcon className="h-10 w-10 text-[#8054b8]" />
            </div>
            <p className="text-xl text-[#c4a8e8] font-semibold">{t.noImagesYet}</p>
            <Link href="/vision-studio" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#6d3fa0] hover:underline">
              {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0625\u0646\u0634\u0627\u0621" : "Start creating"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
