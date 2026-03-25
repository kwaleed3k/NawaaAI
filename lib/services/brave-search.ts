/**
 * Brave Search API — Real-time web search for market intelligence
 * Replaces unreliable Google HTML scraping with proper API calls.
 *
 * Get your API key at: https://brave.com/search/api/
 * Free tier: 2,000 queries/month
 */

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";
const BRAVE_NEWS_URL = "https://api.search.brave.com/res/v1/news/search";

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

interface BraveSearchResponse {
  results: BraveSearchResult[];
  query: string;
  totalResults: number;
}

function getApiKey(): string | null {
  return process.env.BRAVE_API_KEY || null;
}

/**
 * Search the web using Brave Search API
 */
export async function braveWebSearch(
  query: string,
  options: { count?: number; country?: string; freshness?: string } = {}
): Promise<BraveSearchResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { results: [], query, totalResults: 0 };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(options.count || 10),
      country: options.country || "SA",
      search_lang: "en",
      text_decorations: "false",
    });
    if (options.freshness) params.set("freshness", options.freshness);

    const res = await fetch(`${BRAVE_API_URL}?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error(`Brave Search failed: ${res.status} ${res.statusText}`);
      return { results: [], query, totalResults: 0 };
    }

    const data = await res.json();
    const webResults = data.web?.results || [];

    return {
      results: webResults.map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.description || "",
        age: r.age || undefined,
      })),
      query,
      totalResults: webResults.length,
    };
  } catch (err) {
    console.error("Brave Search error:", err);
    return { results: [], query, totalResults: 0 };
  }
}

/**
 * Search news using Brave News API
 */
export async function braveNewsSearch(
  query: string,
  options: { count?: number; freshness?: string } = {}
): Promise<BraveSearchResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { results: [], query, totalResults: 0 };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(options.count || 8),
    });
    if (options.freshness) params.set("freshness", options.freshness);

    const res = await fetch(`${BRAVE_NEWS_URL}?${params}`, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return { results: [], query, totalResults: 0 };
    }

    const data = await res.json();
    const newsResults = data.results || [];

    return {
      results: newsResults.map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.description || "",
        age: r.age || undefined,
      })),
      query,
      totalResults: newsResults.length,
    };
  } catch (err) {
    console.error("Brave News error:", err);
    return { results: [], query, totalResults: 0 };
  }
}

/**
 * Run a comprehensive company research query.
 * Returns formatted text for AI consumption.
 */
export async function researchCompany(companyName: string): Promise<string> {
  const [info, reviews, news] = await Promise.allSettled([
    braveWebSearch(`"${companyName}" company about Saudi Arabia`, { count: 8 }),
    braveWebSearch(`"${companyName}" reviews rating customers`, { count: 6 }),
    braveNewsSearch(`"${companyName}"`, { count: 6, freshness: "py" }),
  ]);

  const sections: string[] = [];

  const infoResults = info.status === "fulfilled" ? info.value.results : [];
  if (infoResults.length > 0) {
    sections.push("══ COMPANY INFO (Web Search) ══");
    infoResults.forEach((r) => {
      sections.push(`• ${r.title}\n  ${r.url}\n  ${r.description}`);
    });
  }

  const reviewResults = reviews.status === "fulfilled" ? reviews.value.results : [];
  if (reviewResults.length > 0) {
    sections.push("\n══ CUSTOMER REVIEWS & RATINGS ══");
    reviewResults.forEach((r) => {
      sections.push(`• ${r.title}\n  ${r.description}`);
    });
  }

  const newsResults = news.status === "fulfilled" ? news.value.results : [];
  if (newsResults.length > 0) {
    sections.push("\n══ LATEST NEWS ══");
    newsResults.forEach((r) => {
      sections.push(`• [${r.age || "recent"}] ${r.title}\n  ${r.description}`);
    });
  }

  return sections.join("\n") || "No search results found";
}

/**
 * Search for trending topics in a specific industry in Saudi Arabia
 */
export async function searchTrending(
  industry: string,
  options: { locale?: "en" | "ar" } = {}
): Promise<BraveSearchResponse> {
  const lang = options.locale === "ar" ? "Arabic" : "English";
  const query = `trending ${industry} Saudi Arabia 2025 2026 social media marketing ${lang}`;
  return braveWebSearch(query, { count: 10, freshness: "pm" });
}

export function isBraveConfigured(): boolean {
  return !!getApiKey();
}
