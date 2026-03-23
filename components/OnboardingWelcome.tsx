"use client";

import { useState } from "react";
import { Sparkles, Rocket, Globe, ArrowRight, ArrowLeft, Building2, Calendar, ImageIcon, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";

/* 3D Cube */
function Cube({ size, border, bg, dur, reverse, className }: { size: number; border: string; bg: string; dur: number; reverse?: boolean; className?: string }) {
  const h = size / 2;
  const f: React.CSSProperties = { position: "absolute", width: size, height: size, borderRadius: "25%", border: `2px solid ${border}`, background: bg };
  return (
    <div className={className} style={{ transformStyle: "preserve-3d" }}>
      <div className="nl-cube" style={{ width: size, height: size, animation: `nl-spin ${dur}s linear infinite ${reverse ? "reverse" : ""}` }}>
        <div style={{ ...f, transform: `translateZ(${h}px)` }} /><div style={{ ...f, transform: `translateZ(${-h}px) rotateY(180deg)` }} />
        <div style={{ ...f, transform: `translateX(${-h}px) rotateY(-90deg)` }} /><div style={{ ...f, transform: `translateX(${h}px) rotateY(90deg)` }} />
        <div style={{ ...f, transform: `translateY(${-h}px) rotateX(90deg)` }} /><div style={{ ...f, transform: `translateY(${h}px) rotateX(-90deg)` }} />
      </div>
    </div>
  );
}

function Dots({ count, className }: { count: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: 2 + Math.random() * 4, height: 2 + Math.random() * 4,
          top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          background: ["#a6ffea", "#e67af3", "#c4a8e8", "#23ab7e", "#f5c6fa"][i % 5],
          opacity: 0.15 + Math.random() * 0.25,
          animation: `nl-float-particle ${8 + Math.random() * 10}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
    </div>
  );
}

const SLIDES_EN = [
  {
    icon: Sparkles,
    badge: "Welcome",
    title: "Welcome to Nawaa AI",
    subtitle: "Saudi Arabia's first AI-powered marketing agency platform",
    desc: "Everything you need to build, plan, and grow your brand — powered by artificial intelligence, built for the Saudi market.",
    features: [
      { icon: Building2, label: "Brand DNA Analysis" },
      { icon: Calendar, label: "Content Planning" },
      { icon: ImageIcon, label: "Visual Generation" },
      { icon: Zap, label: "Hashtag Intelligence" },
    ],
  },
  {
    icon: Globe,
    badge: "Built for You",
    title: "Arabic-First Intelligence",
    subtitle: "Vision 2030 aligned, bilingual everything",
    desc: "Native Arabic content generation, Saudi cultural awareness, local market intelligence, and full RTL support throughout.",
    features: [
      { icon: Globe, label: "Bilingual AR/EN" },
      { icon: Rocket, label: "Vision 2030 Aligned" },
      { icon: Sparkles, label: "Saudi Market AI" },
      { icon: Zap, label: "Local Insights" },
    ],
  },
  {
    icon: Rocket,
    badge: "Let's Go",
    title: "Set Up Your First Brand",
    subtitle: "It only takes 2 minutes",
    desc: "Add your company details, let AI analyze your brand DNA, and generate your first week of content — all in minutes.",
    features: [
      { icon: Building2, label: "Add Company" },
      { icon: Sparkles, label: "AI Analysis" },
      { icon: Calendar, label: "Generate Plan" },
      { icon: ImageIcon, label: "Create Visuals" },
    ],
  },
];

const SLIDES_AR = [
  {
    icon: Sparkles,
    badge: "مرحباً",
    title: "مرحباً بك في نواة AI",
    subtitle: "أول منصة تسويق بالذكاء الاصطناعي في السعودية",
    desc: "كل ما تحتاجه لبناء وتخطيط وتنمية علامتك التجارية — مدعوم بالذكاء الاصطناعي، مصمم للسوق السعودي.",
    features: [
      { icon: Building2, label: "تحليل هوية العلامة" },
      { icon: Calendar, label: "تخطيط المحتوى" },
      { icon: ImageIcon, label: "توليد المرئيات" },
      { icon: Zap, label: "ذكاء الهاشتاقات" },
    ],
  },
  {
    icon: Globe,
    badge: "مصمم لك",
    title: "ذكاء عربي أولاً",
    subtitle: "متوافق مع رؤية 2030، ثنائي اللغة بالكامل",
    desc: "توليد محتوى عربي أصلي، وعي ثقافي سعودي، ذكاء السوق المحلي، ودعم كامل للغة العربية.",
    features: [
      { icon: Globe, label: "ثنائي اللغة" },
      { icon: Rocket, label: "رؤية 2030" },
      { icon: Sparkles, label: "ذكاء سعودي" },
      { icon: Zap, label: "رؤى محلية" },
    ],
  },
  {
    icon: Rocket,
    badge: "هيا نبدأ",
    title: "أضف أول علامة تجارية",
    subtitle: "دقيقتان فقط",
    desc: "أضف بيانات شركتك، دع الذكاء الاصطناعي يحلل هوية علامتك، وولّد أول أسبوع من المحتوى — كل ذلك في دقائق.",
    features: [
      { icon: Building2, label: "أضف شركتك" },
      { icon: Sparkles, label: "تحليل AI" },
      { icon: Calendar, label: "ولّد خطة" },
      { icon: ImageIcon, label: "أنشئ مرئيات" },
    ],
  },
];

export default function OnboardingWelcome({ onComplete }: { onComplete: () => void }) {
  const { locale } = useAppStore();
  const isRtl = locale === "ar";
  const slides = locale === "ar" ? SLIDES_AR : SLIDES_EN;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [exiting, setExiting] = useState(false);

  const goNext = () => {
    if (current === slides.length - 1) {
      setExiting(true);
      setTimeout(onComplete, 500);
      return;
    }
    setDirection(1);
    setCurrent((c) => c + 1);
  };

  const goBack = () => {
    if (current === 0) return;
    setDirection(-1);
    setCurrent((c) => c - 1);
  };

  const slide = slides[current];
  const SlideIcon = slide.icon;
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background */}
      <div className="absolute inset-0 nl-aurora-bg" />
      <div className="absolute inset-0 bg-black/20" />

      {/* 3D Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: "800px" }}>
        <Cube size={60} border="rgba(255,255,255,.15)" bg="rgba(255,255,255,.03)" dur={18} className="absolute top-[8%] left-[5%]" />
        <Cube size={40} border="rgba(255,255,255,.12)" bg="rgba(255,255,255,.02)" dur={24} reverse className="absolute top-[15%] right-[8%]" />
        <Cube size={50} border="rgba(255,255,255,.1)" bg="rgba(255,255,255,.02)" dur={20} className="absolute bottom-[15%] left-[8%]" />
        <Cube size={35} border="rgba(255,255,255,.1)" bg="rgba(255,255,255,.02)" dur={26} reverse className="absolute bottom-[20%] right-[5%]" />
        <div className="absolute top-[30%] right-[15%] w-[100px] h-[100px] rounded-full" style={{ border: "2px solid rgba(255,255,255,.1)", transformStyle: "preserve-3d", animation: "nl-ring-rotate 14s linear infinite" }} />
        <Dots count={30} className="absolute inset-0" />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[620px] mx-4 sm:mx-8"
        key={current}
        style={{
          animation: `nl-fade-up 0.5s ease forwards`,
        }}
      >
        <div
          className="rounded-[32px] p-6 sm:p-8 lg:p-12"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white/90 mb-6" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <SlideIcon className="w-4 h-4" />
            {slide.badge}
          </div>

          {/* Icon */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
            <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(255,255,255,0.1)", animation: "nl-glow-breathe 3s ease-in-out infinite" }} />
            <div className="relative w-full h-full rounded-3xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <SlideIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3" style={{ fontFamily: isRtl ? "var(--font-cairo),'IBM Plex Sans Arabic',sans-serif" : "'Playfair Display','Outfit',sans-serif" }}>
            {slide.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-medium mb-2">{slide.subtitle}</p>
          <p className="text-base text-white/50 leading-relaxed mb-8 max-w-[480px]">{slide.desc}</p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {slide.features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white/90"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", animationDelay: `${i * 0.1}s` }}
              >
                <f.icon className="w-4 h-4 text-[#a6ffea]" />
                {f.label}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {current > 0 && (
                <button onClick={goBack} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-none bg-transparent">
                  <BackArrow className="w-4 h-4" />
                  {isRtl ? "السابق" : "Back"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Dots */}
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/30"}`}
                  />
                ))}
              </div>

              {/* Next / Start button */}
              <button
                onClick={goNext}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-[#1a8a64] bg-white cursor-pointer transition-all hover:-translate-y-0.5 border-none"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
              >
                {current === slides.length - 1
                  ? (isRtl ? "ابدأ الآن" : "Get Started")
                  : (isRtl ? "التالي" : "Next")
                }
                <NextArrow className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <button onClick={() => { setExiting(true); setTimeout(onComplete, 400); }} className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none">
            {isRtl ? "تخطي المقدمة" : "Skip introduction"}
          </button>
        </div>
      </div>
    </div>
  );
}
