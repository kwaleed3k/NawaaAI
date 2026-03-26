"use client";

/* framer-motion removed – using plain HTML + CSS transitions */
import { TrendingUp, BarChart3, PieChart, Activity, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";


export default function InsightsPage() {
  const { locale } = useAppStore();
  const ti = messages[locale].insights;

  const metricCards = [
    {
      icon: BarChart3,
      label: ti.engagement,
      gradient: "from-[#23ab7e] to-[#8054b8]",
      iconBg: "from-[#23ab7e]/20 to-[#8054b8]/20",
      barColor: "from-[#23ab7e] to-[#8054b8]",
      shadowColor: "hover:shadow-md",
      barWidth: "65%",
    },
    {
      icon: PieChart,
      label: ti.reach,
      gradient: "from-[#8054b8] to-[#60A5FA]",
      iconBg: "from-[#8054b8]/20 to-[#60A5FA]/20",
      barColor: "from-[#8054b8] to-[#60A5FA]",
      shadowColor: "hover:shadow-md",
      barWidth: "55%",
    },
    {
      icon: Activity,
      label: ti.growth,
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      iconBg: "from-[#8B5CF6]/20 to-[#A78BFA]/20",
      barColor: "from-[#8B5CF6] to-[#A78BFA]",
      shadowColor: "hover:shadow-md",
      barWidth: "70%",
    },
  ];

  const featureCards = [
    {
      icon: BarChart3,
      title: locale === "ar" ? "أداء المحتوى" : "Content Performance",
      description:
        locale === "ar"
          ? "تتبع أداء منشوراتك عبر جميع المنصات"
          : "Track how your posts perform across all platforms",
      gradient: "from-[#23ab7e] to-[#8054b8]",
      accentBar: "from-[#23ab7e] to-[#8054b8]",
    },
    {
      icon: TrendingUp,
      title: locale === "ar" ? "نمو الجمهور" : "Audience Growth",
      description:
        locale === "ar"
          ? "راقب نمو جمهورك واكتشف فرص التوسع"
          : "Monitor your audience growth and discover expansion opportunities",
      gradient: "from-[#8054b8] to-[#60A5FA]",
      accentBar: "from-[#8054b8] to-[#60A5FA]",
    },
    {
      icon: Activity,
      title: locale === "ar" ? "تحليلات التفاعل" : "Engagement Analytics",
      description:
        locale === "ar"
          ? "افهم كيف يتفاعل جمهورك مع محتواك"
          : "Understand how your audience interacts with your content",
      gradient: "from-[#3B82F6] to-[#60A5FA]",
      accentBar: "from-[#3B82F6] to-[#60A5FA]",
    },
    {
      icon: PieChart,
      title: locale === "ar" ? "مقارنة المنصات" : "Platform Comparison",
      description:
        locale === "ar"
          ? "قارن أداءك عبر المنصات المختلفة"
          : "Compare your performance across different platforms",
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      accentBar: "from-[#8B5CF6] to-[#A78BFA]",
    },
  ];

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-6"
    >
      {/* ===== PAGE HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-2xl nl-aurora-bg p-5 sm:p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <BarChart3 className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-xl font-bold text-[#a6ffea]/80 tracking-wide">{locale === "ar" ? "التحليلات" : "Insights"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            {ti.pageTitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg font-medium text-white/70">{ti.pageSub}</p>
        </div>
      </div>

      {/* ── Coming Soon Hero Section ── */}
      <div className="relative">
        {/* Gradient border wrapper */}
        <div className="relative rounded-2xl p-[3px]">
          <div className="absolute inset-0 rounded-2xl nl-aurora-bg" />
          <div className="relative rounded-2xl bg-gradient-to-b from-[#fafbfd] to-white px-5 py-7 sm:py-10 md:py-14 md:px-8 lg:py-16">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Animated icon */}
              <div
                className="relative flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full nl-aurora-bg shadow-lg shadow-[#23ab7e]/25"
              >
                <TrendingUp className="text-white" style={{ width: 48, height: 48 }} />
                {/* Outer ring pulse */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-[#23ab7e]/30"
                />
              </div>

              {/* Coming Soon text */}
              <h2 className="mt-7 text-xl sm:text-2xl font-black bg-gradient-to-r from-[#23ab7e] via-[#23ab7e] to-[#8054b8] bg-clip-text text-transparent">
                {ti.comingSoon}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#8f96a3] font-medium">
                {ti.comingSoonDesc}
              </p>

              {/* ── Preview Metric Cards ── */}
              <div
                className="mt-7 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3"
              >
                {metricCards.map((item, i) => (
                  <div
                    key={item.label}
                    className={`group cursor-default rounded-2xl border-2 border-[#e8eaef] bg-gradient-to-b from-white to-[#f4f6f8] p-5 text-center shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-[#23ab7e]/40`}
                  >
                    <div
                      className={`mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg} h-10 w-10 sm:h-14 sm:w-14`}
                    >
                      <item.icon
                        className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
                        style={{
                          color: item.gradient.includes("006C35")
                            ? "#23ab7e"
                            : item.gradient.includes("7C3AED")
                            ? "#8054b8"
                            : "#8B5CF6",
                        }}
                      />
                    </div>
                    <p className="mt-3 text-lg sm:text-xl font-black text-[#1a1d2e]">{item.label}</p>
                    <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[#E8F5EC]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.barColor}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── What to Expect Section ── */}
      <div>
        <h3 className="mb-6 text-center text-lg font-black text-[#23ab7e] md:text-xl">
          {locale === "ar" ? "ماذا تتوقع" : "What to Expect"}
        </h3>
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureCards.map((card, i) => (
            <div
              key={card.title}
              className="group relative cursor-default overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-gradient-to-b from-white to-[#f4f6f8] p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-[#23ab7e]/40"
            >
              {/* Gradient accent bar at top */}
              <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${card.accentBar}`} />

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="mt-4 text-lg sm:text-xl font-black text-[#23ab7e]">{card.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#8f96a3]">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
