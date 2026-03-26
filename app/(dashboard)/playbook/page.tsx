"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2, Calendar, ImageIcon, Hash, Swords,
  ChevronDown, ArrowRight, Sparkles, Clock,
  Plus, PenLine, Search, Copy,
  BarChart3, Target, Paintbrush, CircleDashed,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

/* ═══════════════════ CONSTANTS ═══════════════════ */

const STORAGE_KEY = "nawaa-playbook-completed";
const TOTAL_GUIDES = 5;

const TIME_ESTIMATES = [2, 3, 5, 2, 5] as const;

/* ═══════════════════ TYPES ═══════════════════ */

type Guide = {
  icon: typeof Building2;
  titleKey: string;
  descKey: string;
  difficulty: "beginner" | "intermediate";
  color: string;
  colorFrom: string;
  glow: string;
  href: string;
  steps: { titleKey: string; descKey: string }[];
};

/* ═══════════════════ GUIDE CONFIG ═══════════════════ */

const guides: Guide[] = [
  {
    icon: Building2,
    titleKey: "guide1Title",
    descKey: "guide1Desc",
    difficulty: "beginner",
    color: "from-[#23ab7e] to-[#1a8a64]",
    colorFrom: "#23ab7e",
    glow: "shadow-[#23ab7e]/20",
    href: "/companies",
    steps: [
      { titleKey: "guide1Step1Title", descKey: "guide1Step1Desc" },
      { titleKey: "guide1Step2Title", descKey: "guide1Step2Desc" },
      { titleKey: "guide1Step3Title", descKey: "guide1Step3Desc" },
    ],
  },
  {
    icon: Calendar,
    titleKey: "guide2Title",
    descKey: "guide2Desc",
    difficulty: "beginner",
    color: "from-[#e67af3] to-[#f5c6fa]",
    colorFrom: "#e67af3",
    glow: "shadow-[#e67af3]/20",
    href: "/planner",
    steps: [
      { titleKey: "guide2Step1Title", descKey: "guide2Step1Desc" },
      { titleKey: "guide2Step2Title", descKey: "guide2Step2Desc" },
      { titleKey: "guide2Step3Title", descKey: "guide2Step3Desc" },
    ],
  },
  {
    icon: ImageIcon,
    titleKey: "guide3Title",
    descKey: "guide3Desc",
    difficulty: "intermediate",
    color: "from-[#8054b8] to-[#6d3fa0]",
    colorFrom: "#8054b8",
    glow: "shadow-[#8054b8]/20",
    href: "/vision-studio",
    steps: [
      { titleKey: "guide3Step1Title", descKey: "guide3Step1Desc" },
      { titleKey: "guide3Step2Title", descKey: "guide3Step2Desc" },
      { titleKey: "guide3Step3Title", descKey: "guide3Step3Desc" },
    ],
  },
  {
    icon: Hash,
    titleKey: "guide4Title",
    descKey: "guide4Desc",
    difficulty: "beginner",
    color: "from-[#a6ffea] to-[#6d3fa0]",
    colorFrom: "#a6ffea",
    glow: "shadow-[#a6ffea]/20",
    href: "/hashtags",
    steps: [
      { titleKey: "guide4Step1Title", descKey: "guide4Step1Desc" },
      { titleKey: "guide4Step2Title", descKey: "guide4Step2Desc" },
      { titleKey: "guide4Step3Title", descKey: "guide4Step3Desc" },
    ],
  },
  {
    icon: Swords,
    titleKey: "guide5Title",
    descKey: "guide5Desc",
    difficulty: "intermediate",
    color: "from-rose-500 to-red-600",
    colorFrom: "#f43f5e",
    glow: "shadow-rose-500/20",
    href: "/competitor-analysis",
    steps: [
      { titleKey: "guide5Step1Title", descKey: "guide5Step1Desc" },
      { titleKey: "guide5Step2Title", descKey: "guide5Step2Desc" },
      { titleKey: "guide5Step3Title", descKey: "guide5Step3Desc" },
    ],
  },
];

/* ═══════════════════ STEP ILLUSTRATIONS ═══════════════════ */

function CompaniesStep1({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
        style={{ backgroundColor: accentColor }}
      >
        <Plus className="h-7 w-7 text-white" />
      </div>
      <span className="text-sm font-bold text-[#1a1d2e]/70">Add Company</span>
    </div>
  );
}

function CompaniesStep2() {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[220px]">
      <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2">
        <PenLine className="h-4 w-4 text-[#8f96a3]" />
        <span className="text-xs text-[#8f96a3]">Company Name</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2">
        <Building2 className="h-4 w-4 text-[#8f96a3]" />
        <span className="text-xs text-[#8f96a3]">Industry</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2 h-12">
        <PenLine className="h-4 w-4 text-[#8f96a3]" />
        <span className="text-xs text-[#8f96a3]">Description...</span>
      </div>
    </div>
  );
}

function CompaniesStep3({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[220px]">
      <Sparkles className="h-8 w-8 animate-pulse" style={{ color: accentColor }} />
      <span className="text-sm font-bold text-[#1a1d2e]/70">AI Analyzing...</span>
      <div className="w-full h-2.5 rounded-full bg-white/60 overflow-hidden">
        <div
          className="h-full rounded-full animate-[progressPulse_2s_ease-in-out_infinite]"
          style={{ backgroundColor: accentColor, width: "65%" }}
        />
      </div>
    </div>
  );
}

function PlannerStep1() {
  return (
    <div className="flex items-center justify-center gap-4">
      {["Instagram", "TikTok", "X"].map((platform) => (
        <div
          key={platform}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-white/80 border border-[#e8eaef] px-4 py-3"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#e67af3]/30 to-[#f5c6fa]/30 flex items-center justify-center">
            <span className="text-xs font-black text-[#e67af3]">
              {platform[0]}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#8f96a3]">{platform}</span>
        </div>
      ))}
    </div>
  );
}

function PlannerStep2({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Sparkles className="h-8 w-8 animate-spin" style={{ color: accentColor, animationDuration: "3s" }} />
      <span className="text-sm font-bold text-[#1a1d2e]/70">Generating...</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ backgroundColor: accentColor, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function PlannerStep3() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="grid grid-cols-7 gap-1.5 w-full max-w-[220px]">
      {days.map((d, i) => (
        <div
          key={i}
          className="flex items-center justify-center h-8 rounded-lg bg-white/80 border border-[#e8eaef] text-[10px] font-bold text-[#e67af3]"
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function VisionStep1() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/80 border border-[#c4a8e8] px-4 py-3">
        <ImageIcon className="h-6 w-6 text-[#8054b8]" />
        <span className="text-[10px] font-bold text-[#8054b8]">Lifestyle</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/80 border border-[#c4a8e8] px-4 py-3">
        <Sparkles className="h-6 w-6 text-[#8054b8]" />
        <span className="text-[10px] font-bold text-[#8054b8]">Luxury</span>
      </div>
    </div>
  );
}

function VisionStep2({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Paintbrush className="h-8 w-8 animate-pulse" style={{ color: accentColor }} />
      <span className="text-sm font-bold text-[#1a1d2e]/70">AI Creating...</span>
    </div>
  );
}

function VisionStep3() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-[180px]">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl bg-gradient-to-br from-[#8054b8]/20 to-[#6d3fa0]/10 border border-[#c4a8e8]/40 flex items-center justify-center"
        >
          <ImageIcon className="h-5 w-5 text-[#8054b8]/40" />
        </div>
      ))}
    </div>
  );
}

function HashtagsStep1() {
  return (
    <div className="flex items-center gap-2 w-full max-w-[220px] rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2.5">
      <Hash className="h-5 w-5 text-[#6d3fa0]" />
      <span className="text-xs text-[#8f96a3]">Enter your topic...</span>
    </div>
  );
}

function HashtagsStep2() {
  const pills = [
    { label: "#marketing", bg: "bg-[#a6ffea]/30", text: "text-[#1a8a64]" },
    { label: "#socialmedia", bg: "bg-[#e67af3]/20", text: "text-[#c44cd9]" },
    { label: "#growth", bg: "bg-[#8054b8]/15", text: "text-[#6d3fa0]" },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {pills.map((p) => (
        <span key={p.label} className={`${p.bg} ${p.text} rounded-full px-3 py-1.5 text-xs font-bold`}>
          {p.label}
        </span>
      ))}
    </div>
  );
}

function HashtagsStep3() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Copy className="h-7 w-7 text-[#23ab7e]" />
      <span className="text-sm font-bold text-[#23ab7e]">Copied!</span>
    </div>
  );
}

function CompetitorStep1() {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[220px]">
      <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2">
        <Search className="h-4 w-4 text-[#f43f5e]" />
        <span className="text-xs text-[#8f96a3]">Competitor 1</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2">
        <Search className="h-4 w-4 text-[#f43f5e]" />
        <span className="text-xs text-[#8f96a3]">Competitor 2</span>
      </div>
    </div>
  );
}

function CompetitorStep2() {
  return (
    <div className="flex items-end justify-center gap-3">
      {[60, 85, 45].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-[#f43f5e]">{h}</span>
          <div
            className="w-8 rounded-t-lg bg-gradient-to-t from-rose-500 to-red-400"
            style={{ height: `${h * 0.5}px` }}
          />
        </div>
      ))}
      <BarChart3 className="h-5 w-5 text-[#f43f5e]/50 mb-0.5" />
    </div>
  );
}

function CompetitorStep3() {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[220px]">
      {["Improve SEO", "Boost Engagement", "New Channel"].map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#e8eaef] px-3 py-2">
          <Target className="h-4 w-4 text-[#f43f5e]" />
          <span className="text-xs font-semibold text-[#1a1d2e]/70">{item}</span>
        </div>
      ))}
    </div>
  );
}

/** Returns the illustration component for a given guide index and step index */
function StepIllustration({ guideIndex, stepIndex, accentColor }: {
  guideIndex: number;
  stepIndex: number;
  accentColor: string;
}) {
  const illustrationMap: Record<string, React.ReactNode> = {
    "0-0": <CompaniesStep1 accentColor={accentColor} />,
    "0-1": <CompaniesStep2 />,
    "0-2": <CompaniesStep3 accentColor={accentColor} />,
    "1-0": <PlannerStep1 />,
    "1-1": <PlannerStep2 accentColor={accentColor} />,
    "1-2": <PlannerStep3 />,
    "2-0": <VisionStep1 />,
    "2-1": <VisionStep2 accentColor={accentColor} />,
    "2-2": <VisionStep3 />,
    "3-0": <HashtagsStep1 />,
    "3-1": <HashtagsStep2 />,
    "3-2": <HashtagsStep3 />,
    "4-0": <CompetitorStep1 />,
    "4-1": <CompetitorStep2 />,
    "4-2": <CompetitorStep3 />,
  };

  return (
    <>{illustrationMap[`${guideIndex}-${stepIndex}`] ?? null}</>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export default function PlaybookPage() {
  const { locale } = useAppStore();
  const t = messages[locale].playbook;
  const isRtl = locale === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [completedGuides, setCompletedGuides] = useState<number[]>([]);

  // Load completed guides from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompletedGuides(parsed.filter((n: unknown) => typeof n === "number"));
        }
      }
    } catch {
      // localStorage unavailable or corrupted — start fresh
    }
  }, []);

  const toggleComplete = useCallback((guideIndex: number) => {
    setCompletedGuides((prev) => {
      const isCompleted = prev.includes(guideIndex);
      const next = isCompleted
        ? prev.filter((i) => i !== guideIndex)
        : [...prev, guideIndex];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const completedCount = completedGuides.length;
  const progressPercent = Math.round((completedCount / TOTAL_GUIDES) * 100);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 pb-16">
      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <div className="relative overflow-hidden rounded-2xl nl-aurora-bg p-5 sm:p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">
              {locale === "ar" ? "\u062f\u0644\u064a\u0644 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645" : "Playbook"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg font-medium text-white/70">{t.pageSub}</p>

          {/* Quick stats */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2.5">
              <span className="text-xl">{"📚"}</span>
              <div>
                <p className="text-lg font-black text-white">{guides.length}</p>
                <p className="text-sm font-medium text-[#a6ffea]/60">{locale === "ar" ? "\u0623\u062f\u0644\u0629" : "Guides"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2.5">
              <span className="text-xl">{"🎯"}</span>
              <div>
                <p className="text-lg font-black text-white">15</p>
                <p className="text-sm font-medium text-[#a6ffea]/60">{t.steps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PROGRESS BAR ═══════════════════ */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-[#e8eaef] p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-[#1a1d2e]">
            {locale === "ar"
              ? `${completedCount}/${TOTAL_GUIDES} أدلة مكتملة`
              : `${completedCount}/${TOTAL_GUIDES} guides completed`}
          </span>
          <span className="text-sm font-bold text-[#23ab7e]">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#f4f6f8] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#23ab7e] to-[#a6ffea] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ═══════════════════ GUIDES ═══════════════════ */}
      <div className="space-y-6">
        {guides.map((guide, i) => {
          const Icon = guide.icon;
          const isOpen = openIndex === i;
          const isCompleted = completedGuides.includes(i);
          const tTitle = t[guide.titleKey as keyof typeof t] as string;
          const tDesc = t[guide.descKey as keyof typeof t] as string;
          const diffLabel = t[guide.difficulty as keyof typeof t] as string;
          const timeEst = TIME_ESTIMATES[i];

          return (
            <div
              key={i}
              className={`group rounded-3xl overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "shadow-xl shadow-black/5"
                  : "shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: isOpen
                  ? `2px solid ${guide.colorFrom}33`
                  : "2px solid #e8eaef",
              }}
            >
              {/* Guide top accent bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${guide.color}`} />

              {/* Guide header */}
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 p-4 sm:p-5 text-left hover:bg-white/40 transition-colors"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${guide.color} shadow-lg ${guide.glow}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-[#1a1d2e]">{tTitle}</h3>
                    <span className={`rounded-xl px-3 py-1 text-sm font-bold ${
                      guide.difficulty === "beginner"
                        ? "bg-gradient-to-r from-[#f4f6f8] to-[#f4f6f8] text-[#23ab7e] border border-[#a6ffea]"
                        : "bg-gradient-to-r from-[#f4f6f8] to-purple-50 text-[#8054b8] border border-[#c4a8e8]"
                    }`}>
                      {diffLabel}
                    </span>
                    {isCompleted && (
                      <span className="rounded-xl bg-[#23ab7e]/10 px-3 py-1 text-sm font-bold text-[#23ab7e] border border-[#23ab7e]/20">
                        <CheckCircle2 className="inline h-4 w-4 -mt-0.5 me-1" />
                        {locale === "ar" ? "مكتمل" : "Done"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8f96a3] mt-1 leading-relaxed">{tDesc}</p>
                  {/* Time estimate */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="h-4 w-4 text-[#8f96a3]/60" />
                    <span className="text-sm font-semibold text-[#8f96a3]/60">
                      ~{timeEst} {locale === "ar" ? "دقائق" : "min"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-base font-bold text-[#8f96a3]">{guide.steps.length} {t.steps}</span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOpen ? "bg-[#23ab7e] text-white" : "bg-[#f4f6f8] text-[#8f96a3]"} transition-all`}>
                    <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Steps (expanded) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t-2 border-[#e8eaef] p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#fafbfd]/80 to-white/80">
                    {guide.steps.map((step, si) => {
                      const stepTitle = t[step.titleKey as keyof typeof t] as string;
                      const stepDesc = t[step.descKey as keyof typeof t] as string;
                      return (
                        <div key={si} className="flex gap-4">
                          {/* Step number with gradient circle */}
                          <div className="flex flex-col items-center">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${guide.color} text-base font-black text-white shadow-lg ${guide.glow}`}>
                              {si + 1}
                            </div>
                            {si < guide.steps.length - 1 && (
                              <div className={`flex-1 w-1 bg-gradient-to-b ${guide.color} mt-3 rounded-full opacity-30`} />
                            )}
                          </div>
                          {/* Step content */}
                          <div className="flex-1 pb-4">
                            <h4 className="text-base sm:text-lg font-extrabold text-[#1a1d2e]">{stepTitle}</h4>
                            <p className="text-sm text-[#8f96a3] mt-2 leading-relaxed">{stepDesc}</p>
                            {/* Visual illustration */}
                            <div
                              className="mt-4 min-h-[7rem] rounded-2xl border border-black/5 flex items-center justify-center p-4"
                              style={{
                                background: `linear-gradient(135deg, ${guide.colorFrom}08, ${guide.colorFrom}15)`,
                              }}
                            >
                              <StepIllustration
                                guideIndex={i}
                                stepIndex={si}
                                accentColor={guide.colorFrom}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mark as Complete button */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(i)}
                      className={`flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#23ab7e] text-white shadow-lg shadow-[#23ab7e]/20 hover:bg-[#1a8a64]"
                          : "bg-white text-[#8f96a3] border-2 border-[#e8eaef] hover:border-[#23ab7e]/40 hover:text-[#23ab7e]"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          {locale === "ar" ? "مكتمل" : "Completed"}
                        </>
                      ) : (
                        <>
                          <CircleDashed className="h-5 w-5" />
                          {locale === "ar" ? "وضع علامة مكتمل" : "Mark as Complete"}
                        </>
                      )}
                    </button>

                    {/* Try it now button */}
                    <Link
                      href={guide.href}
                      className={`flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${guide.color} px-5 py-2.5 text-sm font-black text-white shadow-lg ${guide.glow} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                    >
                      {t.tryItNow} <ArrowRight className={`h-6 w-6 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyframe for progress bar pulse animation */}
      <style jsx global>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
