"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Calendar, ImageIcon, Hash, Check, X, ArrowRight } from "lucide-react";
import { messages, type Locale } from "@/lib/i18n";

type Props = {
  stats: { companies: number; plans: number; images: number };
  locale: Locale;
};

export default function GettingStartedCard({ stats, locale }: Props) {
  const t = messages[locale].gettingStarted;
  const isRtl = locale === "ar";
  const [dismissed, setDismissed] = useState(false);
  const [triedHashtags, setTriedHashtags] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("nawaa-getting-started-dismissed") === "true");
      setTriedHashtags(localStorage.getItem("nawaa-tried-hashtags") === "true");
    }
  }, []);

  const items = [
    { done: stats.companies > 0, label: t.addCompany, desc: t.addCompanyDesc, href: "/companies", icon: Building2, color: "text-[#23ab7e]", onClick: undefined as (() => void) | undefined },
    { done: stats.plans > 0, label: t.generatePlan, desc: t.generatePlanDesc, href: "/planner", icon: Calendar, color: "text-[#8054b8]", onClick: undefined },
    { done: stats.images > 0, label: t.createVisual, desc: t.createVisualDesc, href: "/vision-studio", icon: ImageIcon, color: "text-[#8B5CF6]", onClick: undefined },
    { done: triedHashtags, label: t.tryHashtags, desc: t.tryHashtagsDesc, href: "/hashtags", icon: Hash, color: "text-blue-500", onClick: () => { localStorage.setItem("nawaa-tried-hashtags", "true"); setTriedHashtags(true); } },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === 4;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem("nawaa-getting-started-dismissed", "true");
    setDismissed(true);
  };

  const progress = (completedCount / 4) * 100;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="rounded-xl border border-[#e8eaef] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#e8eaef]">
        <div>
          <h2 className="text-xl font-bold text-[#1a1d2e]">{t.title}</h2>
          <p className="text-sm text-[#8f96a3] mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#23ab7e]">
            {completedCount}/4 {t.completed}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8f96a3] hover:bg-[#f4f6f8] hover:text-[#23ab7e] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#f4f6f8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#23ab7e] to-[#8054b8] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="p-5 space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.onClick}
            className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
              item.done
                ? "bg-[#f4f6f8]/50 opacity-70"
                : "border border-[#e8eaef] hover:border-[#23ab7e]/40 hover:bg-[#fafbfd]"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              item.done ? "bg-[#23ab7e]" : "bg-[#f4f6f8]"
            }`}>
              {item.done ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <item.icon className={`h-5 w-5 ${item.color}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${item.done ? "text-[#8f96a3] line-through" : "text-[#1a1d2e]"}`}>
                {item.label}
              </p>
              <p className="text-xs text-[#8f96a3] mt-0.5">{item.desc}</p>
            </div>
            {!item.done && (
              <ArrowRight className={`h-4 w-4 shrink-0 text-[#8f96a3] ${isRtl ? "rotate-180" : ""}`} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
