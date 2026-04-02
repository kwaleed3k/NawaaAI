import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Fetch all data in parallel
    const [
      usersRes,
      companiesRes,
      plansRes,
      imagesRes,
      competitorRes,
    ] = await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from("companies").select("id, user_id, name, brand_analysis, analysis_count, created_at, scraped_data"),
      supabase.from("content_plans").select("id, user_id, company_id, title, week_start, platforms, created_at"),
      supabase.from("generated_images").select("id, user_id, company_id, image_urls, created_at"),
      supabase.from("competitor_analyses").select("id, user_id, company_id, output_language, created_at"),
    ]);

    // Users — may fail if not admin, fall back to counting from other tables
    const users = usersRes.data?.users ?? [];

    const companies = companiesRes.data ?? [];
    const plans = plansRes.data ?? [];
    const images = imagesRes.data ?? [];
    const competitors = competitorRes.data ?? [];

    // Unique user IDs across all tables
    const allUserIds = new Set([
      ...companies.map((c: any) => c.user_id),
      ...plans.map((p: any) => p.user_id),
      ...images.map((i: any) => i.user_id),
      ...competitors.map((c: any) => c.user_id),
    ]);

    // Count total generated images (each row can have multiple URLs)
    const totalImageCount = images.reduce((sum: number, row: any) => {
      const urls = row.image_urls;
      if (Array.isArray(urls)) return sum + urls.length;
      if (typeof urls === "string") return sum + 1;
      return sum;
    }, 0);

    // Brand analyses done
    const totalAnalyses = companies.reduce((sum: number, c: any) => sum + (c.analysis_count || 0), 0);

    // Website scrapes done
    const totalScrapes = companies.filter((c: any) => c.scraped_data).length;

    // Per-user breakdown
    const userMap: Record<string, {
      email: string;
      companies: number;
      plans: number;
      images: number;
      analyses: number;
      competitors: number;
      lastActive: string;
    }> = {};

    for (const uid of allUserIds) {
      const userObj = users.find((u: any) => u.id === uid);
      const userCompanies = companies.filter((c: any) => c.user_id === uid);
      const userPlans = plans.filter((p: any) => p.user_id === uid);
      const userImages = images.filter((i: any) => i.user_id === uid);
      const userCompetitors = competitors.filter((c: any) => c.user_id === uid);

      const allDates = [
        ...userCompanies.map((c: any) => c.created_at),
        ...userPlans.map((p: any) => p.created_at),
        ...userImages.map((i: any) => i.created_at),
        ...userCompetitors.map((c: any) => c.created_at),
      ].filter(Boolean).sort().reverse();

      userMap[uid] = {
        email: userObj?.email || uid.slice(0, 8) + "...",
        companies: userCompanies.length,
        plans: userPlans.length,
        images: userImages.reduce((s: number, i: any) => s + (Array.isArray(i.image_urls) ? i.image_urls.length : 0), 0),
        analyses: userCompanies.reduce((s: number, c: any) => s + (c.analysis_count || 0), 0),
        competitors: userCompetitors.length,
        lastActive: allDates[0] || "",
      };
    }

    // Activity over last 30 days (daily counts)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity: Record<string, { plans: number; images: number; companies: number; analyses: number }> = {};

    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      dailyActivity[key] = { plans: 0, images: 0, companies: 0, analyses: 0 };
    }

    for (const p of plans) {
      const key = p.created_at?.split("T")[0];
      if (key && dailyActivity[key]) dailyActivity[key].plans++;
    }
    for (const i of images) {
      const key = i.created_at?.split("T")[0];
      if (key && dailyActivity[key]) dailyActivity[key].images++;
    }
    for (const c of companies) {
      const key = c.created_at?.split("T")[0];
      if (key && dailyActivity[key]) dailyActivity[key].companies++;
    }

    // Estimated API costs (rough estimates)
    const costs = {
      planGeneration: plans.length * 0.03,        // GPT-4o per plan ~$0.03
      imageGeneration: totalImageCount * 0.02,     // Gemini image ~$0.02
      brandAnalysis: totalAnalyses * 0.05,         // GPT-4o analysis ~$0.05
      competitorAnalysis: competitors.length * 0.04, // GPT-4o competitor ~$0.04
      pdfExtraction: 0,                            // Gemini flash ~free tier
      aiSuggestions: 0,                            // GPT-4o-mini ~negligible
      websiteScraping: totalScrapes * 0.001,       // Minimal cost
      total: 0,
    };
    costs.total = costs.planGeneration + costs.imageGeneration + costs.brandAnalysis + costs.competitorAnalysis + costs.websiteScraping;

    return NextResponse.json({
      success: true,
      overview: {
        totalUsers: Math.max(users.length, allUserIds.size),
        totalCompanies: companies.length,
        totalPlans: plans.length,
        totalImages: totalImageCount,
        totalAnalyses,
        totalCompetitorAnalyses: competitors.length,
        totalScrapes,
      },
      costs,
      users: Object.entries(userMap)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => (b.lastActive || "").localeCompare(a.lastActive || "")),
      dailyActivity: Object.entries(dailyActivity).map(([date, counts]) => ({ date, ...counts })),
    });
  } catch (e) {
    console.error("admin-stats error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load stats" },
      { status: 500 }
    );
  }
}
