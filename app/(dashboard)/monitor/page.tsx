"use client";

import { useEffect, useState } from "react";
import {
  Users, Building2, Calendar, ImageIcon, Sparkles, Swords, Globe, DollarSign,
  Loader2, RefreshCw, TrendingUp, Activity, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

type OverviewStats = {
  totalUsers: number;
  totalCompanies: number;
  totalPlans: number;
  totalImages: number;
  totalAnalyses: number;
  totalCompetitorAnalyses: number;
  totalScrapes: number;
};

type CostBreakdown = {
  planGeneration: number;
  imageGeneration: number;
  brandAnalysis: number;
  competitorAnalysis: number;
  pdfExtraction: number;
  aiSuggestions: number;
  websiteScraping: number;
  total: number;
};

type UserRow = {
  id: string;
  email: string;
  companies: number;
  plans: number;
  images: number;
  analyses: number;
  competitors: number;
  lastActive: string;
};

type DailyActivity = {
  date: string;
  plans: number;
  images: number;
  companies: number;
  analyses: number;
};

export default function MonitorPage() {
  const { locale } = useAppStore();
  const isRtl = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [costs, setCosts] = useState<CostBreakdown | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setOverview(json.overview);
      setCosts(json.costs);
      setUsers(json.users);
      setDailyActivity(json.dailyActivity);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#8054b8] animate-spin" />
          <p className="text-sm font-medium text-[#8f96a3]">{isRtl ? "جاري تحميل البيانات..." : "Loading monitor data..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button onClick={loadStats} className="text-sm font-bold text-[#8054b8] hover:underline">
            {isRtl ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: isRtl ? "المستخدمين" : "Total Users", value: overview?.totalUsers ?? 0, icon: Users, color: "from-[#8054b8] to-[#A78BFA]", bg: "bg-[#8054b8]/10" },
    { label: isRtl ? "الشركات" : "Companies", value: overview?.totalCompanies ?? 0, icon: Building2, color: "from-[#23ab7e] to-[#1a8a64]", bg: "bg-[#23ab7e]/10" },
    { label: isRtl ? "خطط المحتوى" : "Content Plans", value: overview?.totalPlans ?? 0, icon: Calendar, color: "from-[#3B82F6] to-[#2563EB]", bg: "bg-[#3B82F6]/10" },
    { label: isRtl ? "الصور المولّدة" : "Images Generated", value: overview?.totalImages ?? 0, icon: ImageIcon, color: "from-[#e67af3] to-[#d946ef]", bg: "bg-[#e67af3]/10" },
    { label: isRtl ? "تحليلات العلامة" : "Brand Analyses", value: overview?.totalAnalyses ?? 0, icon: Sparkles, color: "from-[#F97316] to-[#EA580C]", bg: "bg-[#F97316]/10" },
    { label: isRtl ? "تحليلات المنافسين" : "Competitor Analyses", value: overview?.totalCompetitorAnalyses ?? 0, icon: Swords, color: "from-[#EF4444] to-[#DC2626]", bg: "bg-[#EF4444]/10" },
    { label: isRtl ? "مواقع مُستخرجة" : "Websites Scraped", value: overview?.totalScrapes ?? 0, icon: Globe, color: "from-[#14B8A6] to-[#0D9488]", bg: "bg-[#14B8A6]/10" },
  ];

  const costItems = costs ? [
    { label: isRtl ? "توليد الخطط" : "Plan Generation", cost: costs.planGeneration, detail: `${overview?.totalPlans ?? 0} plans × $0.03` },
    { label: isRtl ? "توليد الصور" : "Image Generation", cost: costs.imageGeneration, detail: `${overview?.totalImages ?? 0} images × $0.02` },
    { label: isRtl ? "تحليل العلامة" : "Brand Analysis", cost: costs.brandAnalysis, detail: `${overview?.totalAnalyses ?? 0} analyses × $0.05` },
    { label: isRtl ? "تحليل المنافسين" : "Competitor Analysis", cost: costs.competitorAnalysis, detail: `${overview?.totalCompetitorAnalyses ?? 0} analyses × $0.04` },
    { label: isRtl ? "استخراج المواقع" : "Web Scraping", cost: costs.websiteScraping, detail: `${overview?.totalScrapes ?? 0} scrapes` },
  ] : [];

  // Activity chart — last 14 days
  const recentActivity = dailyActivity.slice(-14);
  const maxActivity = Math.max(1, ...recentActivity.map(d => d.plans + d.images + d.companies + d.analyses));

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Cairo'] text-2xl font-black text-[#1a1d2e]">
            {isRtl ? "لوحة المراقبة" : "Usage Monitor"}
          </h1>
          <p className="text-sm text-[#8f96a3]">
            {isRtl ? "مراقبة الاستخدام والتكاليف لجميع المستخدمين" : "Track usage, costs, and activity across all users"}
          </p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 rounded-xl bg-white border-2 border-[#e8eaef] px-4 py-2.5 text-sm font-bold text-[#2d3142] hover:border-[#8054b8] hover:shadow-md transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-2xl bg-white border border-[#e8eaef] p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md", card.color)}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1a1d2e]">{card.value.toLocaleString()}</p>
            <p className="text-xs font-medium text-[#8f96a3] mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Cost Breakdown + Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Breakdown */}
        <div className="rounded-2xl bg-white border border-[#e8eaef] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaef] bg-gradient-to-r from-[#f8f5ff] to-[#f0ebff]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#A78BFA] shadow-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1a1d2e]">{isRtl ? "تقدير التكاليف" : "Estimated Costs"}</h2>
              <p className="text-[10px] text-[#8f96a3]">{isRtl ? "تقدير بناءً على أسعار API" : "Based on API pricing estimates"}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {costItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#e8eaef]/50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-[#2d3142]">{item.label}</p>
                  <p className="text-[10px] text-[#8f96a3]">{item.detail}</p>
                </div>
                <span className="text-sm font-black text-[#8054b8]">${item.cost.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t-2 border-[#8054b8]/20">
              <span className="text-sm font-black text-[#1a1d2e]">{isRtl ? "الإجمالي" : "Total"}</span>
              <span className="text-lg font-black bg-gradient-to-r from-[#8054b8] to-[#23ab7e] bg-clip-text text-transparent">
                ${costs?.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="rounded-2xl bg-white border border-[#e8eaef] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaef] bg-gradient-to-r from-[#f0fdf7] to-[#ecfdf3]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#1a8a64] shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1a1d2e]">{isRtl ? "النشاط (14 يوم)" : "Activity (14 Days)"}</h2>
              <p className="text-[10px] text-[#8f96a3]">{isRtl ? "الخطط والصور والشركات" : "Plans, images, and companies"}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-1 h-40">
              {recentActivity.map((day, i) => {
                const total = day.plans + day.images + day.companies + day.analyses;
                const height = Math.max(4, (total / maxActivity) * 100);
                const dayLabel = new Date(day.date).toLocaleDateString(isRtl ? "ar" : "en", { day: "numeric" });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex flex-col justify-end" style={{ height: "120px" }}>
                      {day.plans > 0 && (
                        <div
                          className="w-full rounded-t-sm bg-[#3B82F6]"
                          style={{ height: `${(day.plans / maxActivity) * 100}%` }}
                          title={`Plans: ${day.plans}`}
                        />
                      )}
                      {day.images > 0 && (
                        <div
                          className="w-full bg-[#e67af3]"
                          style={{ height: `${(day.images / maxActivity) * 100}%` }}
                          title={`Images: ${day.images}`}
                        />
                      )}
                      {day.companies > 0 && (
                        <div
                          className="w-full bg-[#23ab7e]"
                          style={{ height: `${(day.companies / maxActivity) * 100}%` }}
                          title={`Companies: ${day.companies}`}
                        />
                      )}
                      {day.analyses > 0 && (
                        <div
                          className="w-full rounded-b-sm bg-[#F97316]"
                          style={{ height: `${(day.analyses / maxActivity) * 100}%` }}
                          title={`Analyses: ${day.analyses}`}
                        />
                      )}
                      {total === 0 && (
                        <div className="w-full rounded-sm bg-[#e8eaef]" style={{ height: "3%" }} />
                      )}
                    </div>
                    <span className="text-[8px] text-[#8f96a3] font-medium">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-[#e8eaef]/50">
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#8f96a3]">
                <div className="h-2 w-2 rounded-sm bg-[#3B82F6]" /> {isRtl ? "خطط" : "Plans"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#8f96a3]">
                <div className="h-2 w-2 rounded-sm bg-[#e67af3]" /> {isRtl ? "صور" : "Images"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#8f96a3]">
                <div className="h-2 w-2 rounded-sm bg-[#23ab7e]" /> {isRtl ? "شركات" : "Companies"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#8f96a3]">
                <div className="h-2 w-2 rounded-sm bg-[#F97316]" /> {isRtl ? "تحليلات" : "Analyses"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-[#e8eaef] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaef]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8054b8] to-[#23ab7e] shadow-md">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#1a1d2e]">{isRtl ? "المستخدمين" : "Users Breakdown"}</h2>
            <p className="text-[10px] text-[#8f96a3]">{users.length} {isRtl ? "مستخدم" : "users"}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafbfd] border-b border-[#e8eaef]">
                <th className="text-start px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "المستخدم" : "User"}</th>
                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "شركات" : "Companies"}</th>
                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "خطط" : "Plans"}</th>
                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "صور" : "Images"}</th>
                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "تحليلات" : "Analyses"}</th>
                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "منافسين" : "Competitors"}</th>
                <th className="text-start px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8f96a3]">{isRtl ? "آخر نشاط" : "Last Active"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={cn("border-b border-[#e8eaef]/50 hover:bg-[#fafbfd] transition-colors", i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]/30")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8054b8] to-[#A78BFA] text-white text-[10px] font-bold shadow-sm">
                        {u.email[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-xs font-semibold text-[#2d3142] truncate max-w-[180px]">{u.email}</span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3 text-xs font-bold text-[#23ab7e]">{u.companies}</td>
                  <td className="text-center px-3 py-3 text-xs font-bold text-[#3B82F6]">{u.plans}</td>
                  <td className="text-center px-3 py-3 text-xs font-bold text-[#e67af3]">{u.images}</td>
                  <td className="text-center px-3 py-3 text-xs font-bold text-[#F97316]">{u.analyses}</td>
                  <td className="text-center px-3 py-3 text-xs font-bold text-[#EF4444]">{u.competitors}</td>
                  <td className="px-3 py-3 text-[10px] text-[#8f96a3]">
                    {u.lastActive ? new Date(u.lastActive).toLocaleDateString(isRtl ? "ar" : "en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-[#8f96a3]">{isRtl ? "لا يوجد مستخدمين" : "No users found"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
