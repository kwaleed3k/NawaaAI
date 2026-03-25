/**
 * Exa API — AI-powered semantic search for marketing intelligence
 * Finds similar brands, trending content, and industry insights.
 *
 * Get your API key at: https://exa.ai
 * Free tier: 1,000 searches/month
 */

const EXA_API_URL = "https://api.exa.ai";

interface ExaResult {
  title: string;
  url: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
}

interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
}

function getApiKey(): string | null {
  return process.env.EXA_API_KEY || null;
}

/**
 * Semantic search — finds content by meaning, not just keywords.
 * Great for finding similar brands, industry content, etc.
 */
export async function exaSearch(
  query: string,
  options: {
    numResults?: number;
    type?: "keyword" | "neural" | "auto";
    category?: string;
    startPublishedDate?: string;
    includeText?: boolean;
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {}
): Promise<ExaSearchResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { results: [] };
  }

  try {
    const body: Record<string, unknown> = {
      query,
      numResults: options.numResults || 10,
      type: options.type || "auto",
      useAutoprompt: true,
    };

    if (options.category) body.category = options.category;
    if (options.startPublishedDate) body.startPublishedDate = options.startPublishedDate;
    if (options.includeDomains?.length) body.includeDomains = options.includeDomains;
    if (options.excludeDomains?.length) body.excludeDomains = options.excludeDomains;

    if (options.includeText) {
      body.contents = { text: { maxCharacters: 2000 } };
    }

    const res = await fetch(`${EXA_API_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error(`Exa search failed: ${res.status}`);
      return { results: [] };
    }

    const data = await res.json();

    return {
      results: (data.results || []).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        text: r.text || undefined,
        publishedDate: r.publishedDate || undefined,
        author: r.author || undefined,
        score: r.score || undefined,
      })),
      autopromptString: data.autopromptString,
    };
  } catch (err) {
    console.error("Exa search error:", err);
    return { results: [] };
  }
}

/**
 * Find companies similar to the given one.
 * Uses neural search to find semantically related brands.
 */
export async function findSimilarCompanies(
  companyName: string,
  industry: string,
  options: { count?: number } = {}
): Promise<ExaSearchResponse> {
  const query = `${companyName} is a ${industry} company in Saudi Arabia. Find similar companies and competitors in the same industry.`;
  return exaSearch(query, {
    numResults: options.count || 8,
    type: "neural",
    includeText: true,
    category: "company",
  });
}

/**
 * Find trending content for a specific industry in Saudi Arabia.
 * Returns recent articles, posts, and discussions.
 */
export async function findTrendingContent(
  industry: string,
  options: { count?: number; daysBack?: number } = {}
): Promise<ExaSearchResponse> {
  const daysBack = options.daysBack || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const query = `trending ${industry} marketing social media Saudi Arabia KSA`;
  return exaSearch(query, {
    numResults: options.count || 10,
    type: "auto",
    includeText: true,
    startPublishedDate: startDate.toISOString().split("T")[0],
    category: "news",
  });
}

/**
 * Find content ideas for a specific topic — blog posts, viral content, etc.
 */
export async function findContentIdeas(
  topic: string,
  platform: string,
  options: { count?: number } = {}
): Promise<ExaSearchResponse> {
  const query = `best ${platform} content ideas for ${topic} marketing brand strategy`;
  return exaSearch(query, {
    numResults: options.count || 10,
    type: "auto",
    includeText: true,
  });
}

/**
 * Full market intelligence report for an industry.
 * Returns formatted text for AI consumption.
 */
export async function marketIntelligence(
  companyName: string,
  industry: string
): Promise<string> {
  const [similar, trending] = await Promise.allSettled([
    findSimilarCompanies(companyName, industry, { count: 6 }),
    findTrendingContent(industry, { count: 8 }),
  ]);

  const sections: string[] = [];

  const similarResults = similar.status === "fulfilled" ? similar.value.results : [];
  if (similarResults.length > 0) {
    sections.push("══ SIMILAR COMPANIES & COMPETITORS (AI Discovery) ══");
    similarResults.forEach((r) => {
      sections.push(`• ${r.title} — ${r.url}`);
      if (r.text) sections.push(`  ${r.text.slice(0, 300)}`);
    });
  }

  const trendingResults = trending.status === "fulfilled" ? trending.value.results : [];
  if (trendingResults.length > 0) {
    sections.push("\n══ TRENDING INDUSTRY CONTENT ══");
    trendingResults.forEach((r) => {
      sections.push(`• [${r.publishedDate || "recent"}] ${r.title}`);
      if (r.text) sections.push(`  ${r.text.slice(0, 250)}`);
    });
  }

  return sections.join("\n") || "No market intelligence data found";
}

export function isExaConfigured(): boolean {
  return !!getApiKey();
}
