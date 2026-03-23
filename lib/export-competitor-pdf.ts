import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Competitor {
  name: string;
  handle: string;
  platform: string;
  websiteUrl: string;
}

interface StrategyAction {
  action: string;
  priority: string;
  impact: string;
  kpi?: string;
}

interface CompetitorResult {
  name: string;
  handle: string;
  platform: string;
  postingFrequency: string;
  contentTypes: string[];
  captionStyle: string;
  hashtagStrategy: string;
  engagementLevel: string;
  visualStyle: string;
  strengths: string[];
  weakPoints: string[];
  threatLevel: number;
  overallScore: number;
  keyInsight: string;
  stealThisMove?: string;
  audienceProfile?: string;
  contentCalendar?: string;
  paidStrategy?: string;
  companyOverview?: string;
  productsAndServices?: string;
  targetMarket?: string;
  brandPositioning?: string;
  websiteAnalysis?: string;
  digitalPresence?: string;
  pricingStrategy?: string;
  customerReviews?: string;
  technologyStack?: string;
}

interface IndustryAnalysis {
  marketOverview: string;
  competitiveLandscape: string;
  consumerTrends: string;
  futureOutlook: string;
}

interface AnalysisData {
  executiveSummary: string;
  brandAssessment: {
    strengths: string[];
    weaknesses: string[];
    opportunities?: string[];
    threats?: string[];
    overallScore: number;
    marketPosition?: string;
  };
  competitors: CompetitorResult[];
  comparisonMatrix: {
    categories: string[];
    yourBrand: number[];
    competitors: Record<string, number[]>;
  };
  winningStrategy: {
    immediate: StrategyAction[];
    shortTerm: StrategyAction[];
    longTerm: StrategyAction[];
    contentGaps: string[];
    differentiators: string[];
    quickWins?: string[];
    contentSeries?: { name: string; description: string; platform: string }[];
  };
  saudiMarketInsights: {
    trendAlignment: string;
    vision2030Relevance: string;
    culturalFit: string;
    localOpportunities?: string;
    ramadanStrategy?: string;
  };
  industryAnalysis?: IndustryAnalysis;
}

type Locale = "en" | "ar";

function scoreColor(score: number): string {
  return score >= 70 ? "#23ab7e" : score >= 40 ? "#F59E0B" : "#ef4444";
}

function threatColor(level: number): { bg: string; text: string; label: string; labelAr: string } {
  if (level >= 7) return { bg: "#FEE2E2", text: "#DC2626", label: "HIGH", labelAr: "عالي" };
  if (level >= 4) return { bg: "#FEF3C7", text: "#D97706", label: "MEDIUM", labelAr: "متوسط" };
  return { bg: "#DCFCE7", text: "#16A34A", label: "LOW", labelAr: "منخفض" };
}

function priorityColor(p: string): { bg: string; text: string } {
  const l = p.toLowerCase();
  if (l === "high") return { bg: "#FEE2E2", text: "#DC2626" };
  if (l === "medium") return { bg: "#FEF3C7", text: "#D97706" };
  return { bg: "#DCFCE7", text: "#16A34A" };
}

function barHtml(score: number, w: string = "100%"): string {
  const c = scoreColor(score);
  return `<div style="display:flex;align-items:center;gap:8px;width:${w}">
    <div style="flex:1;height:8px;background:#E8F0EA;border-radius:4px;overflow:hidden"><div style="height:100%;width:${score}%;background:${c};border-radius:4px"></div></div>
    <span style="font-size:12px;font-weight:700;color:#2d3142;min-width:24px;text-align:right">${score}</span>
  </div>`;
}

/* ═══ Page 1: Cover + Executive Summary + Brand Assessment ═══ */
function renderCoverPage(data: AnalysisData, companyName: string, locale: Locale): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <!-- Green header -->
    <div style="background:linear-gradient(135deg,#23ab7e,#8054b8);padding:36px 48px;color:white;">
      <div style="font-size:36px;font-weight:800;margin:0;">${isAr ? "تحليل المنافسين" : "Competitor Analysis"}</div>
      <div style="font-size:18px;margin-top:8px;">${companyName}</div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:rgba(255,255,255,0.7);">
        <span>${new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}</span>
        <span>${isAr ? "نواة AI" : "Nawaa AI"}</span>
      </div>
    </div>

    <div style="padding:32px 48px;">
      <!-- Executive Summary -->
      <div style="margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:800;color:#23ab7e;margin:0 0 12px;">${isAr ? "الملخص التنفيذي" : "Executive Summary"}</h2>
        <p style="font-size:13px;color:#505868;line-height:1.8;margin:0;white-space:pre-wrap;">${data.executiveSummary}</p>
      </div>

      <!-- Brand Assessment -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
        <h2 style="font-size:20px;font-weight:800;color:#23ab7e;margin:0;">${isAr ? "تقييم علامتك" : "Brand Assessment"}</h2>
        <div style="width:64px;height:64px;border-radius:50%;border:4px solid ${scoreColor(data.brandAssessment.overallScore)};text-align:center;line-height:56px;">
          <span style="font-size:22px;font-weight:800;color:#2d3142;">${data.brandAssessment.overallScore}</span>
        </div>
      </div>

      ${data.brandAssessment.marketPosition ? `<div style="background:#f4f6f8;border:1px solid #e8eaef;border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#505868;line-height:1.7;">${data.brandAssessment.marketPosition}</div>` : ""}

      <div style="display:flex;gap:24px;">
        <!-- Strengths -->
        <div style="flex:1;background:#f4f6f8;border:1px solid #e8eaef;border-radius:12px;padding:14px 16px;">
          <h3 style="font-size:14px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "نقاط القوة" : "Strengths"}</h3>
          ${data.brandAssessment.strengths.map(s => `<p style="font-size:12px;color:#505868;margin:4px 0;line-height:1.6;">+ ${s}</p>`).join("")}
        </div>
        <!-- Weaknesses -->
        <div style="flex:1;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;">
          <h3 style="font-size:14px;font-weight:800;color:#DC2626;margin:0 0 8px;">${isAr ? "نقاط الضعف" : "Weaknesses"}</h3>
          ${data.brandAssessment.weaknesses.map(w => `<p style="font-size:12px;color:#505868;margin:4px 0;line-height:1.6;">- ${w}</p>`).join("")}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>1</span>
    </div>
  </div>`;
}

/* ═══ Competitor Page ═══ */
function renderCompetitorPage(comp: CompetitorResult, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const tc = threatColor(comp.threatLevel);

  const businessRows = [
    ...(comp.companyOverview ? [{ label: isAr ? "نظرة عامة" : "Company Overview", value: comp.companyOverview }] : []),
    ...(comp.productsAndServices ? [{ label: isAr ? "المنتجات والخدمات" : "Products & Services", value: comp.productsAndServices }] : []),
    ...(comp.targetMarket ? [{ label: isAr ? "السوق المستهدف" : "Target Market", value: comp.targetMarket }] : []),
    ...(comp.brandPositioning ? [{ label: isAr ? "التموضع" : "Brand Positioning", value: comp.brandPositioning }] : []),
    ...(comp.websiteAnalysis ? [{ label: isAr ? "الموقع الإلكتروني" : "Website Analysis", value: comp.websiteAnalysis }] : []),
    ...(comp.digitalPresence ? [{ label: isAr ? "الحضور الرقمي" : "Digital Presence", value: comp.digitalPresence }] : []),
    ...(comp.pricingStrategy ? [{ label: isAr ? "التسعير" : "Pricing Strategy", value: comp.pricingStrategy }] : []),
    ...(comp.customerReviews ? [{ label: isAr ? "مراجعات العملاء" : "Customer Reviews", value: comp.customerReviews }] : []),
    ...(comp.technologyStack ? [{ label: isAr ? "البنية التقنية" : "Tech Stack", value: comp.technologyStack }] : []),
  ];

  const marketingRows = [
    { label: isAr ? "تكرار النشر" : "Posting Frequency", value: comp.postingFrequency },
    { label: isAr ? "التفاعل" : "Engagement", value: comp.engagementLevel },
    { label: isAr ? "الهاشتاقات" : "Hashtags", value: comp.hashtagStrategy },
    { label: isAr ? "الهوية البصرية" : "Visual Style", value: comp.visualStyle },
    ...(comp.captionStyle ? [{ label: isAr ? "أسلوب الكتابة" : "Caption Style", value: comp.captionStyle }] : []),
    ...(comp.audienceProfile ? [{ label: isAr ? "ملف الجمهور" : "Audience", value: comp.audienceProfile }] : []),
  ];

  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <!-- Header bar -->
    <div style="background:#23ab7e;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;color:white;">
      <div style="font-size:20px;font-weight:800;">${comp.name} — ${comp.handle} | ${comp.platform}</div>
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="background:${tc.bg};color:${tc.text};padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;">${isAr ? tc.labelAr : tc.label} (${comp.threatLevel}/10)</span>
        <div style="width:48px;height:48px;border-radius:50%;border:3px solid white;text-align:center;line-height:42px;">
          <span style="font-size:18px;font-weight:800;">${comp.overallScore}</span>
        </div>
      </div>
    </div>

    <div style="padding:20px 48px;">
      ${businessRows.length > 0 ? `
      <!-- Business Intelligence -->
      <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 10px;">${isAr ? "معلومات الأعمال" : "Business Intelligence"}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${businessRows.map(r => `<div style="background:white;border:1px solid #e8eaef;border-radius:10px;padding:10px 14px;">
          <span style="font-size:10px;color:#23ab7e;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${r.label}</span>
          <p style="font-size:11px;color:#505868;margin:3px 0 0;line-height:1.5;">${r.value}</p>
        </div>`).join("")}
      </div>` : ""}

      <div style="display:flex;gap:20px;">
        <!-- Left: Marketing analysis -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "تحليل المحتوى" : "Content Analysis"}</h3>
          ${marketingRows.map(r => `<div style="margin-bottom:6px;">
            <span style="font-size:10px;color:#8f96a3;font-weight:600;">${r.label}:</span>
            <p style="font-size:11px;color:#505868;margin:2px 0 0;line-height:1.5;">${r.value}</p>
          </div>`).join("")}
        </div>

        <!-- Right: Strengths & Weaknesses -->
        <div style="flex:1;">
          <div style="background:#f4f6f8;border:1px solid #e8eaef;border-radius:10px;padding:10px 12px;margin-bottom:10px;">
            <h4 style="font-size:12px;font-weight:800;color:#23ab7e;margin:0 0 4px;">${isAr ? "نقاط القوة" : "Strengths"}</h4>
            ${comp.strengths.map(s => `<p style="font-size:10px;color:#505868;margin:2px 0;line-height:1.4;">+ ${s}</p>`).join("")}
          </div>
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 12px;">
            <h4 style="font-size:12px;font-weight:800;color:#DC2626;margin:0 0 4px;">${isAr ? "نقاط الضعف" : "Weaknesses"}</h4>
            ${comp.weakPoints.map(w => `<p style="font-size:10px;color:#505868;margin:2px 0;line-height:1.4;">- ${w}</p>`).join("")}
          </div>
        </div>
      </div>

      <!-- Key Insight -->
      <div style="margin-top:12px;background:#f4f6f8;border:2px solid #e8eaef;border-radius:10px;padding:10px 14px;">
        <span style="font-size:10px;font-weight:800;color:#23ab7e;text-transform:uppercase;letter-spacing:1px;">${isAr ? "الرؤية الرئيسية" : "KEY INSIGHT"}</span>
        <p style="font-size:12px;color:#2d3142;margin:4px 0 0;line-height:1.6;">${comp.keyInsight}</p>
      </div>

      ${comp.stealThisMove ? `
      <div style="margin-top:8px;background:rgba(124,58,237,0.08);border:2px solid rgba(124,58,237,0.2);border-radius:10px;padding:10px 14px;">
        <span style="font-size:10px;font-weight:800;color:#8054b8;text-transform:uppercase;letter-spacing:1px;">${isAr ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</span>
        <p style="font-size:12px;color:#2d3142;margin:4px 0 0;line-height:1.6;">${comp.stealThisMove}</p>
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Comparison Matrix Page ═══ */
function renderMatrixPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const compNames = Object.keys(data.comparisonMatrix.competitors);

  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#2d3142;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "مصفوفة المقارنة" : "Comparison Matrix"}</div>
    </div>

    <div style="padding:24px 48px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e8eaef;">
            <th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#8f96a3;font-weight:700;">${isAr ? "الفئة" : "Category"}</th>
            <th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#23ab7e;font-weight:700;">${isAr ? "علامتك" : "Your Brand"}</th>
            ${compNames.map(n => `<th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#2d3142;font-weight:700;">${n}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data.comparisonMatrix.categories.map((cat, idx) => `
            <tr style="border-bottom:1px solid rgba(212,235,217,0.5);">
              <td style="padding:10px 12px;font-size:12px;color:#8f96a3;font-weight:600;">${cat}</td>
              <td style="padding:10px 12px;min-width:140px;">${barHtml(data.comparisonMatrix.yourBrand[idx])}</td>
              ${compNames.map(n => `<td style="padding:10px 12px;min-width:140px;">${barHtml(data.comparisonMatrix.competitors[n][idx])}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Score circles -->
      <div style="display:flex;gap:24px;margin-top:24px;justify-content:center;">
        <div style="text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;border:4px solid #23ab7e;text-align:center;line-height:64px;margin:0 auto;">
            <span style="font-size:24px;font-weight:800;color:#2d3142;">${data.brandAssessment.overallScore}</span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#23ab7e;margin-top:6px;">${isAr ? "علامتك" : "Your Brand"}</p>
        </div>
        ${data.competitors.map(c => `<div style="text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;border:4px solid ${scoreColor(c.overallScore)};text-align:center;line-height:64px;margin:0 auto;">
            <span style="font-size:24px;font-weight:800;color:#2d3142;">${c.overallScore}</span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#2d3142;margin-top:6px;">${c.name}</p>
        </div>`).join("")}
      </div>
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Winning Strategy Page ═══ */
function renderStrategyPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  function actionBlock(actions: StrategyAction[], title: string, color: string) {
    return `<div style="margin-bottom:16px;">
      <h3 style="font-size:15px;font-weight:800;color:${color};margin:0 0 8px;">${title}</h3>
      ${actions.slice(0, 4).map(a => {
        const pc = priorityColor(a.priority);
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
          <div style="flex:1;font-size:12px;color:#505868;line-height:1.6;">${a.action}</div>
          <span style="background:${pc.bg};color:${pc.text};padding:2px 10px;border-radius:8px;font-size:10px;font-weight:700;white-space:nowrap;">${a.priority}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#2d3142;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "استراتيجية الفوز" : "Winning Strategy"}</div>
    </div>

    <div style="padding:24px 48px;">
      ${actionBlock(data.winningStrategy.immediate, isAr ? "إجراءات فورية (هذا الأسبوع)" : "Immediate Actions (This Week)", "#DC2626")}
      ${actionBlock(data.winningStrategy.shortTerm, isAr ? "قصيرة المدى (2-4 أسابيع)" : "Short-Term (2-4 Weeks)", "#8054b8")}
      ${actionBlock(data.winningStrategy.longTerm, isAr ? "طويلة المدى (1-3 أشهر)" : "Long-Term (1-3 Months)", "#23ab7e")}

      <div style="display:flex;gap:24px;margin-top:8px;">
        <!-- Content Gaps -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#8054b8;margin:0 0 8px;">${isAr ? "فجوات المحتوى" : "Content Gaps"}</h3>
          ${data.winningStrategy.contentGaps.slice(0, 5).map(g => `<p style="font-size:11px;color:#505868;margin:3px 0;line-height:1.5;">• ${g}</p>`).join("")}
        </div>
        <!-- Differentiators -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "عوامل التميز" : "Differentiators"}</h3>
          ${data.winningStrategy.differentiators.slice(0, 5).map(d => `<p style="font-size:11px;color:#505868;margin:3px 0;line-height:1.5;">• ${d}</p>`).join("")}
        </div>
      </div>

      ${data.winningStrategy.quickWins && data.winningStrategy.quickWins.length > 0 ? `
      <div style="margin-top:16px;background:rgba(0,108,53,0.05);border:2px solid #e8eaef;border-radius:12px;padding:14px 18px;">
        <h3 style="font-size:14px;font-weight:800;color:#8054b8;margin:0 0 8px;">${isAr ? "مكاسب سريعة" : "Quick Wins"}</h3>
        ${data.winningStrategy.quickWins.slice(0, 4).map((w, i) => `<p style="font-size:12px;color:#2d3142;margin:4px 0;line-height:1.6;"><strong>${i + 1}.</strong> ${w}</p>`).join("")}
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Saudi Market Insights Page ═══ */
function renderSaudiPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:linear-gradient(135deg,#23ab7e,#8054b8);padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "رؤى السوق السعودي" : "Saudi Market Insights"}</div>
    </div>

    <div style="padding:32px 48px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "التوافق مع الاتجاهات" : "Trend Alignment"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${data.saudiMarketInsights.trendAlignment}</p>
        </div>
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "صلة برؤية 2030" : "Vision 2030 Relevance"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${data.saudiMarketInsights.vision2030Relevance}</p>
        </div>
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "التوافق الثقافي" : "Cultural Fit"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${data.saudiMarketInsights.culturalFit}</p>
        </div>
        ${data.saudiMarketInsights.localOpportunities ? `
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "فرص محلية" : "Local Opportunities"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${data.saudiMarketInsights.localOpportunities}</p>
        </div>` : ""}
      </div>

      ${data.saudiMarketInsights.ramadanStrategy ? `
      <div style="margin-top:20px;background:linear-gradient(135deg,rgba(0,108,53,0.05),rgba(124,58,237,0.08));border:2px solid rgba(124,58,237,0.2);border-radius:16px;padding:20px;">
        <h3 style="font-size:15px;font-weight:800;color:#8054b8;margin:0 0 8px;">${isAr ? "استراتيجية رمضان" : "Ramadan Strategy"}</h3>
        <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${data.saudiMarketInsights.ramadanStrategy}</p>
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Industry Analysis Page ═══ */
function renderIndustryPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  if (!data.industryAnalysis) return "";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const ia = data.industryAnalysis;

  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#2d3142;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "تحليل الصناعة" : "Industry Analysis"}</div>
    </div>

    <div style="padding:32px 48px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "نظرة عامة على السوق" : "Market Overview"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${ia.marketOverview}</p>
        </div>
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "المشهد التنافسي" : "Competitive Landscape"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${ia.competitiveLandscape}</p>
        </div>
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "اتجاهات المستهلكين" : "Consumer Trends"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${ia.consumerTrends}</p>
        </div>
        <div style="background:white;border:2px solid #e8eaef;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#23ab7e;margin:0 0 8px;">${isAr ? "التوقعات المستقبلية" : "Future Outlook"}</h3>
          <p style="font-size:13px;color:#505868;margin:0;line-height:1.8;">${ia.futureOutlook}</p>
        </div>
      </div>
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#8f96a3;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Render HTML to PDF page via html2canvas ═══ */
async function addHtmlPage(pdf: jsPDF, html: string, isFirst: boolean) {
  if (!isFirst) pdf.addPage();

  const div = document.createElement("div");
  div.style.cssText = "position:absolute;left:-3000px;top:0;z-index:-1;opacity:0.01;";
  div.innerHTML = html;
  document.body.appendChild(div);

  try {
    const canvas = await html2canvas(div, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#fafbfd",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.88);
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height) * 0.95;
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", (pdfW - w) / 2, (pdfH - h) / 2, w, h);
  } finally {
    document.body.removeChild(div);
  }
}

/* ═══ Conclusion Page ═══ */
function renderConclusionPage(data: AnalysisData, companyName: string, pageNum: number): string {
  const compCount = data.competitors?.length ?? 0;
  return `<div style="width:1120px;min-height:780px;padding:0;background:#fafbfd;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;box-sizing:border-box;">
    <div style="height:5px;background:linear-gradient(90deg,#23ab7e,#8054b8,#e67af3);"></div>
    <div style="padding:48px 56px;height:calc(100% - 5px);display:flex;flex-direction:column;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:32px;">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#23ab7e,#8054b8);border-radius:14px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:900;">N</div>
        <span style="font-size:24px;font-weight:800;color:#2d3142;">Nawaa AI</span>
        <span style="font-size:14px;color:#8f96a3;">|</span>
        <span style="font-size:14px;color:#8f96a3;">${companyName}</span>
      </div>

      <div>
        <p style="font-size:36px;font-weight:900;color:#2d3142;margin:0 0 8px;">Analysis Complete</p>
        <p style="font-size:18px;color:#8f96a3;margin:0;">Your competitive intelligence report is ready.</p>
      </div>

      <div style="display:flex;gap:20px;margin:28px 0;">
        <div style="flex:1;background:#23ab7e0a;border:1.5px solid #23ab7e22;border-radius:20px;padding:24px;text-align:center;">
          <p style="margin:0;font-size:44px;font-weight:900;color:#23ab7e;">${compCount}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#8f96a3;">Competitors Analyzed</p>
        </div>
        <div style="flex:1;background:#8054b80a;border:1.5px solid #8054b822;border-radius:20px;padding:24px;text-align:center;">
          <p style="margin:0;font-size:44px;font-weight:900;color:#8054b8;">${data.brandAssessment.overallScore}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#8f96a3;">Your Brand Score</p>
        </div>
        <div style="flex:1;background:#e67af30a;border:1.5px solid #e67af322;border-radius:20px;padding:24px;text-align:center;">
          <p style="margin:0;font-size:44px;font-weight:900;color:#e67af3;">${data.winningStrategy?.immediate?.length ?? 0}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#8f96a3;">Action Items</p>
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#23ab7e0c,#8054b80c);border:1.5px solid #23ab7e22;border-radius:20px;padding:24px 32px;display:flex;align-items:center;gap:20px;">
        <div style="width:52px;height:52px;background:linear-gradient(135deg,#23ab7e,#8054b8);border-radius:16px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:900;flex-shrink:0;">!</div>
        <div>
          <p style="margin:0;font-size:22px;font-weight:800;color:#2d3142;">Ready to Outperform</p>
          <p style="margin:4px 0 0;font-size:14px;color:#8f96a3;">Use the winning strategy actions to gain competitive advantage in the Saudi market.</p>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1.5px solid #e8eaef;">
        <div>
          <p style="margin:0;font-size:13px;font-weight:700;color:#23ab7e;">Generated by Nawaa AI</p>
          <p style="margin:2px 0 0;font-size:11px;color:#8f96a3;">Vision 2030 — Where Saudi brands grow with AI</p>
        </div>
        <p style="margin:0;font-size:11px;color:#8f96a3;">${new Date().toLocaleDateString("en-US")} · Page ${pageNum}</p>
      </div>
    </div>
  </div>`;
}

/* ═══ Main export function ═══ */
export async function exportCompetitorPdf(
  data: AnalysisData,
  companyName: string,
  competitors: Competitor[],
  locale: Locale
) {
  // Always export in English for best rendering
  const pdfLocale: Locale = "en";
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Show loading overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;`;
  overlay.innerHTML = `<div style="text-align:center;font-family:'Cairo','Outfit',sans-serif;"><div style="width:64px;height:64px;margin:0 auto 16px;border-radius:16px;background:linear-gradient(135deg,#23ab7e,#8054b8);display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:900;animation:spin 1.5s linear infinite;">N</div><p style="font-size:18px;font-weight:700;color:#2d3142;margin:0 0 6px;">Exporting PDF...</p><p style="font-size:14px;color:#8f96a3;margin:0;">Generating your report</p><style>@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style></div>`;
  document.body.appendChild(overlay);

  await document.fonts.ready;
  let pageNum = 1;

  // Page 1: Cover
  await addHtmlPage(pdf, renderCoverPage(data, companyName, pdfLocale), true);

  // Competitor pages
  for (const comp of data.competitors) {
    pageNum++;
    await addHtmlPage(pdf, renderCompetitorPage(comp, pdfLocale, pageNum), false);
  }

  // Matrix
  pageNum++;
  await addHtmlPage(pdf, renderMatrixPage(data, pdfLocale, pageNum), false);

  // Strategy
  pageNum++;
  await addHtmlPage(pdf, renderStrategyPage(data, pdfLocale, pageNum), false);

  // Industry (if available)
  if (data.industryAnalysis) {
    pageNum++;
    await addHtmlPage(pdf, renderIndustryPage(data, pdfLocale, pageNum), false);
  }

  // Saudi Market
  pageNum++;
  await addHtmlPage(pdf, renderSaudiPage(data, pdfLocale, pageNum), false);

  // Conclusion
  pageNum++;
  await addHtmlPage(pdf, renderConclusionPage(data, companyName, pageNum), false);

  try { document.body.removeChild(overlay); } catch { /* already removed */ }
  pdf.save(`NawaaAI-CompetitorAnalysis-${companyName.replace(/\s+/g, "-")}.pdf`);
}
