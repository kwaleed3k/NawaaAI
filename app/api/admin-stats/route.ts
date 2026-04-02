import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Fetch all rows from a table (Supabase defaults to 1000 limit)
async function fetchAll(supabase: any, table: string, select: string) {
  const allRows: any[] = [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + pageSize - 1)
      .order("created_at", { ascending: false });
    if (error) { console.error(`Error fetching ${table}:`, error.message); break; }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return allRows;
}

export async function GET() {
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let supabase: any;
    if (serviceKey && supabaseUrl) {
      supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } else {
      supabase = authSupabase;
    }

    // Fetch all data with pagination
    const [companies, plans, images, competitors] = await Promise.all([
      fetchAll(supabase, "companies", "id, user_id, name, brand_analysis, analysis_count, created_at, scraped_data"),
      fetchAll(supabase, "content_plans", "id, user_id, company_id, title, week_start, platforms, created_at"),
      fetchAll(supabase, "generated_images", "id, user_id, company_id, image_urls, day_label, created_at"),
      fetchAll(supabase, "competitor_analyses", "id, user_id, company_id, output_language, created_at"),
    ]);

    // Try to get all auth users (service role only)
    let authUsers: any[] = [];
    try {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      authUsers = data?.users ?? [];
    } catch { /* no service role — skip */ }

    // Build complete user set: auth users + any user_ids from tables
    const allUserIds = new Set<string>([
      ...authUsers.map((u: any) => u.id),
      ...companies.map((c: any) => c.user_id),
      ...plans.map((p: any) => p.user_id),
      ...images.map((i: any) => i.user_id),
      ...competitors.map((c: any) => c.user_id),
    ]);

    // Count total generated images (each row has an array of URLs)
    const totalImageCount = images.reduce((sum: number, row: any) => {
      const urls = row.image_urls;
      if (Array.isArray(urls)) return sum + urls.length;
      if (typeof urls === "string") return sum + 1;
      return sum;
    }, 0);

    const totalAnalyses = companies.reduce((sum: number, c: any) => sum + (c.analysis_count || 0), 0);
    const totalScrapes = companies.filter((c: any) => c.scraped_data).length;

    // Per-user breakdown (includes ALL users, even with 0 activity)
    const userList = [...allUserIds].map((uid) => {
      const authUser = authUsers.find((u: any) => u.id === uid);
      const userCompanies = companies.filter((c: any) => c.user_id === uid);
      const userPlans = plans.filter((p: any) => p.user_id === uid);
      const userImages = images.filter((i: any) => i.user_id === uid);
      const userCompetitors = competitors.filter((c: any) => c.user_id === uid);

      const imageCount = userImages.reduce((s: number, i: any) => s + (Array.isArray(i.image_urls) ? i.image_urls.length : 0), 0);
      const analysisCount = userCompanies.reduce((s: number, c: any) => s + (c.analysis_count || 0), 0);

      const allDates = [
        ...userCompanies.map((c: any) => c.created_at),
        ...userPlans.map((p: any) => p.created_at),
        ...userImages.map((i: any) => i.created_at),
        ...userCompetitors.map((c: any) => c.created_at),
      ].filter(Boolean).sort().reverse();

      return {
        id: uid,
        email: authUser?.email || uid.slice(0, 12) + "...",
        createdAt: authUser?.created_at || "",
        companies: userCompanies.length,
        plans: userPlans.length,
        images: imageCount,
        imageRows: userImages.length,
        analyses: analysisCount,
        competitors: userCompetitors.length,
        lastActive: allDates[0] || authUser?.created_at || "",
      };
    }).sort((a, b) => (b.lastActive || "").localeCompare(a.lastActive || ""));

    // Activity over ALL time (group by month if > 90 days of data, otherwise daily)
    const allDates = [
      ...plans.map((p: any) => p.created_at),
      ...images.map((i: any) => i.created_at),
      ...companies.map((c: any) => c.created_at),
    ].filter(Boolean).sort();

    // Daily activity for last 30 days
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

    // Estimated API costs
    const costs = {
      planGeneration: plans.length * 0.03,
      imageGeneration: totalImageCount * 0.02,
      brandAnalysis: totalAnalyses * 0.05,
      competitorAnalysis: competitors.length * 0.04,
      pdfExtraction: 0,
      aiSuggestions: 0,
      websiteScraping: totalScrapes * 0.001,
      total: 0,
    };
    costs.total = costs.planGeneration + costs.imageGeneration + costs.brandAnalysis + costs.competitorAnalysis + costs.websiteScraping;

    return NextResponse.json({
      success: true,
      overview: {
        totalUsers: allUserIds.size,
        totalCompanies: companies.length,
        totalPlans: plans.length,
        totalImages: totalImageCount,
        totalImageRows: images.length,
        totalAnalyses,
        totalCompetitorAnalyses: competitors.length,
        totalScrapes,
      },
      costs,
      users: userList,
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
