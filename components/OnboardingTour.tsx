"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Building2, Calendar, Sparkles, Hash, Swords, TrendingUp, FolderOpen, ArrowRight, ArrowLeft, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

const STEPS_EN = [
  {
    icon: Building2,
    target: "/companies",
    title: "Companies",
    desc: "Start here! Add your company details, upload your logo, and let AI analyze your brand DNA. This is the foundation for everything.",
    tip: "Pro tip: Upload a company PDF for instant AI analysis",
    color: "#23ab7e",
  },
  {
    icon: Calendar,
    target: "/planner",
    title: "Content Planner",
    desc: "Generate a full 7-day content calendar with captions, hashtags, and optimal posting times — tailored to your brand and audience.",
    tip: "AI generates bilingual content (Arabic + English)",
    color: "#8054b8",
  },
  {
    icon: Sparkles,
    target: "/vision-studio",
    title: "Vision Studio",
    desc: "Create stunning AI-generated branded visuals. Upload product photos and get professional social media images in seconds.",
    tip: "Supports Instagram, TikTok, and all major platforms",
    color: "#e67af3",
  },
  {
    icon: Hash,
    target: "/hashtags",
    title: "Hashtag Hub",
    desc: "Get AI-optimized hashtags for Saudi trends, platform algorithms, and your specific industry niche.",
    tip: "Hashtags are optimized for the Saudi market",
    color: "#2dd4a0",
  },
  {
    icon: Swords,
    target: "/competitor-analysis",
    title: "Competitor Analysis",
    desc: "Analyze your competitors' strategies, content performance, and get AI-powered insights to outperform them.",
    tip: "Get actionable recommendations to beat your competition",
    color: "#c4a8e8",
  },
  {
    icon: FolderOpen,
    target: "/my-plans",
    title: "Your Saved Work",
    desc: "All your content plans, generated images, competitor analyses, and playbooks are saved here. Access them anytime.",
    tip: "Export plans as PDF for your team",
    color: "#f5c6fa",
  },
];

const STEPS_AR = [
  {
    icon: Building2,
    target: "/companies",
    title: "الشركات",
    desc: "ابدأ من هنا! أضف بيانات شركتك، ارفع شعارك، ودع الذكاء الاصطناعي يحلل هوية علامتك التجارية. هذا أساس كل شيء.",
    tip: "نصيحة: ارفع ملف PDF للشركة للتحليل الفوري",
    color: "#23ab7e",
  },
  {
    icon: Calendar,
    target: "/planner",
    title: "مخطط المحتوى",
    desc: "ولّد تقويم محتوى كامل لـ 7 أيام مع تعليقات وهاشتاقات وأوقات نشر مثالية — مخصص لعلامتك وجمهورك.",
    tip: "الذكاء الاصطناعي يولد محتوى ثنائي اللغة",
    color: "#8054b8",
  },
  {
    icon: Sparkles,
    target: "/vision-studio",
    title: "استوديو الرؤية",
    desc: "أنشئ مرئيات مذهلة بالذكاء الاصطناعي. ارفع صور المنتجات واحصل على صور احترافية للسوشال ميديا في ثوانٍ.",
    tip: "يدعم إنستغرام وتيك توك وجميع المنصات",
    color: "#e67af3",
  },
  {
    icon: Hash,
    target: "/hashtags",
    title: "مركز الهاشتاقات",
    desc: "احصل على هاشتاقات محسّنة بالذكاء الاصطناعي للترندات السعودية وخوارزميات المنصات.",
    tip: "هاشتاقات محسّنة للسوق السعودي",
    color: "#2dd4a0",
  },
  {
    icon: Swords,
    target: "/competitor-analysis",
    title: "تحليل المنافسين",
    desc: "حلّل استراتيجيات منافسيك وأدائهم واحصل على رؤى ذكية للتفوق عليهم.",
    tip: "احصل على توصيات عملية للتغلب على المنافسة",
    color: "#c4a8e8",
  },
  {
    icon: FolderOpen,
    target: "/my-plans",
    title: "أعمالك المحفوظة",
    desc: "جميع خططك وصورك المولّدة وتحليلاتك محفوظة هنا. يمكنك الوصول إليها في أي وقت.",
    tip: "صدّر الخطط كـ PDF لفريقك",
    color: "#f5c6fa",
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const { locale } = useAppStore();
  const isRtl = locale === "ar";
  const steps = locale === "ar" ? STEPS_AR : STEPS_EN;
  const [current, setCurrent] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [exiting, setExiting] = useState(false);

  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const step = steps[current];

  // Find the sidebar nav item to highlight
  const updateHighlight = useCallback(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>("aside a[href]");
    let foundEl: HTMLElement | null = null;
    links.forEach((link) => {
      if (link.getAttribute("href") === step.target) foundEl = link;
    });
    if (foundEl !== null) {
      const el = foundEl as HTMLElement;
      setHighlightRect(el.getBoundingClientRect());
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [step.target]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  const finish = () => {
    setExiting(true);
    localStorage.setItem("nawaa-tour-seen", "true");
    setTimeout(onComplete, 400);
  };

  const goNext = () => {
    if (current === steps.length - 1) { finish(); return; }
    setCurrent((c) => c + 1);
  };
  const goBack = () => { if (current > 0) setCurrent((c) => c - 1); };

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {};
  if (highlightRect) {
    tooltipStyle.position = "fixed";
    tooltipStyle.top = highlightRect.top;
    tooltipStyle.zIndex = 10001;
    if (isRtl) {
      tooltipStyle.right = window.innerWidth - highlightRect.left + 20;
    } else {
      tooltipStyle.left = highlightRect.right + 20;
    }
    // If tooltip would go off screen, position below
    if ((tooltipStyle.left as number) > window.innerWidth - 420 || (tooltipStyle.right as number) > window.innerWidth - 420) {
      tooltipStyle.left = highlightRect.left;
      tooltipStyle.right = undefined;
      tooltipStyle.top = highlightRect.bottom + 16;
    }
  }

  return (
    <div className={`fixed inset-0 z-[9998] transition-opacity duration-400 ${exiting ? "opacity-0" : "opacity-100"}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 9999 }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 6}
                y={highlightRect.top - 6}
                width={highlightRect.width + 12}
                height={highlightRect.height + 12}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-mask)" />
      </svg>

      {/* Pulsing ring around highlighted item */}
      {highlightRect && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            borderRadius: 18,
            border: `2px solid ${step.color}`,
            zIndex: 10000,
            animation: "nl-pulse-ring 2s ease-in-out infinite",
            boxShadow: `0 0 20px ${step.color}40`,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed w-[380px] sm:w-[420px]"
        style={{ ...tooltipStyle, zIndex: 10001 }}
        key={current}
      >
        <div
          className="rounded-3xl p-7 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            border: `2px solid ${step.color}30`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 40px ${step.color}15`,
            animation: "nl-fade-up 0.4s ease forwards",
          }}
        >
          {/* Close */}
          <button onClick={finish} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#8f96a3] hover:text-[#2d3142] hover:bg-[#f4f6f8] transition-all cursor-pointer bg-transparent border-none">
            <X className="w-4 h-4" />
          </button>

          {/* Step counter */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: step.color }}>
              {current + 1} / {steps.length}
            </div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === current ? 20 : 6, background: i === current ? step.color : "#e8eaef" }} />
              ))}
            </div>
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
              <step.icon className="w-7 h-7" style={{ color: step.color }} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#2d3142]">{step.title}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-[#505868] leading-relaxed mb-4">{step.desc}</p>

          {/* Tip */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6" style={{ background: `${step.color}08`, border: `1px solid ${step.color}15` }}>
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: step.color }} />
            <p className="text-sm font-medium" style={{ color: step.color }}>{step.tip}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div>
              {current > 0 && (
                <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8f96a3] hover:text-[#2d3142] hover:bg-[#f4f6f8] transition-all cursor-pointer bg-transparent border-none">
                  <BackArrow className="w-3.5 h-3.5" />
                  {isRtl ? "السابق" : "Back"}
                </button>
              )}
            </div>
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5 border-none"
              style={{ background: step.color, boxShadow: `0 4px 16px ${step.color}40` }}
            >
              {current === steps.length - 1
                ? (isRtl ? "ابدأ العمل!" : "Start Working!")
                : (isRtl ? "التالي" : "Next")
              }
              <NextArrow className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Skip tour */}
        <div className="text-center mt-4">
          <button onClick={finish} className="text-xs text-[#8f96a3] hover:text-[#2d3142] transition-colors cursor-pointer bg-transparent border-none">
            {isRtl ? "تخطي الجولة" : "Skip tour"}
          </button>
        </div>
      </div>
    </div>
  );
}
