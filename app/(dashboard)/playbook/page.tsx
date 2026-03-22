"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Calendar, ImageIcon, Hash, Swords,
  ChevronDown, ArrowRight, Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

type Guide = {
  icon: typeof Building2;
  titleKey: string;
  descKey: string;
  difficulty: "beginner" | "intermediate";
  color: string;
  glow: string;
  href: string;
  steps: { titleKey: string; descKey: string }[];
};

const guides: Guide[] = [
  {
    icon: Building2,
    titleKey: "guide1Title",
    descKey: "guide1Desc",
    difficulty: "beginner",
    color: "from-[#23ab7e] to-[#1a8a64]",
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
    glow: "shadow-rose-500/20",
    href: "/competitor-analysis",
    steps: [
      { titleKey: "guide5Step1Title", descKey: "guide5Step1Desc" },
      { titleKey: "guide5Step2Title", descKey: "guide5Step2Desc" },
      { titleKey: "guide5Step3Title", descKey: "guide5Step3Desc" },
    ],
  },
];

export default function PlaybookPage() {
  const { locale } = useAppStore();
  const t = messages[locale].playbook;
  const isRtl = locale === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10 pb-16">
      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">{t.pageSub}</p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3">
              <span className="text-3xl">{"📚"}</span>
              <div>
                <p className="text-2xl font-black text-white">{guides.length}</p>
                <p className="text-base font-medium text-[#a6ffea]/60">{locale === "ar" ? "\u0623\u062f\u0644\u0629" : "Guides"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3">
              <span className="text-3xl">{"🎯"}</span>
              <div>
                <p className="text-2xl font-black text-white">15</p>
                <p className="text-base font-medium text-[#a6ffea]/60">{t.steps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ GUIDES ═══════════════════ */}
      <div className="space-y-6">
        {guides.map((guide, i) => {
          const Icon = guide.icon;
          const isOpen = openIndex === i;
          const tTitle = t[guide.titleKey as keyof typeof t] as string;
          const tDesc = t[guide.descKey as keyof typeof t] as string;
          const diffLabel = t[guide.difficulty as keyof typeof t] as string;

          return (
            <div key={i} className={`group rounded-2xl border-2 bg-white overflow-hidden transition-all duration-300 ${isOpen ? "border-[#23ab7e]/40 shadow-lg" : "border-[#e8eaef] shadow-md hover:shadow-lg hover:-translate-y-0.5"}`}>
              {/* Guide top accent bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${guide.color}`} />

              {/* Guide header */}
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-5 p-6 sm:p-8 text-left hover:bg-[#fafbfd] transition-colors"
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${guide.color} shadow-lg ${guide.glow}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">{tTitle}</h3>
                    <span className={`rounded-xl px-3 py-1 text-base font-bold ${
                      guide.difficulty === "beginner"
                        ? "bg-gradient-to-r from-[#f4f6f8] to-[#f4f6f8] text-[#23ab7e] border border-[#a6ffea]"
                        : "bg-gradient-to-r from-[#f4f6f8] to-purple-50 text-[#8054b8] border border-[#c4a8e8]"
                    }`}>
                      {diffLabel}
                    </span>
                  </div>
                  <p className="text-lg text-[#8f96a3] mt-1 leading-relaxed">{tDesc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-base font-bold text-[#8f96a3]">{guide.steps.length} {t.steps}</span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOpen ? "bg-[#23ab7e] text-white" : "bg-[#f4f6f8] text-[#8f96a3]"} transition-all`}>
                    <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Steps (expanded) */}
              {isOpen && (
                <div className="border-t-2 border-[#e8eaef] p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#fafbfd] to-white">
                  {guide.steps.map((step, si) => {
                    const stepTitle = t[step.titleKey as keyof typeof t] as string;
                    const stepDesc = t[step.descKey as keyof typeof t] as string;
                    return (
                      <div key={si} className="flex gap-5">
                        {/* Step number */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${guide.color} text-xl font-black text-white shadow-lg ${guide.glow}`}>
                            {si + 1}
                          </div>
                          {si < guide.steps.length - 1 && (
                            <div className={`flex-1 w-1 bg-gradient-to-b ${guide.color} mt-3 rounded-full opacity-30`} />
                          )}
                        </div>
                        {/* Step content */}
                        <div className="flex-1 pb-4">
                          <h4 className="text-xl sm:text-2xl font-extrabold text-[#1a1d2e]">{stepTitle}</h4>
                          <p className="text-lg text-[#8f96a3] mt-2 leading-relaxed">{stepDesc}</p>
                          {/* Visual illustration placeholder */}
                          <div className={`mt-4 h-28 rounded-2xl bg-gradient-to-br ${guide.color} opacity-5 border-2 border-[#e8eaef] flex items-center justify-center`}>
                            <span className="text-base text-[#8f96a3]/40 font-bold">{stepTitle}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Try it now button */}
                  <Link
                    href={guide.href}
                    className={`flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${guide.color} px-8 py-4 text-xl font-black text-white shadow-lg ${guide.glow} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                  >
                    {t.tryItNow} <ArrowRight className={`h-6 w-6 ${isRtl ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
