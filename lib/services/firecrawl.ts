/**
 * Firecrawl API — Advanced web scraping for competitor intelligence
 * Handles JavaScript-rendered sites, PDFs, and complex layouts.
 *
 * Get your API key at: https://firecrawl.dev
 * Free tier: 500 credits/month
 */

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1";

interface FirecrawlScrapeResult {
  success: boolean;
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    ogImage?: string;
    language?: string;
  };
  url: string;
}

interface FirecrawlMapResult {
  success: boolean;
  links: string[];
}

function getApiKey(): string | null {
  return process.env.FIRECRAWL_API_KEY || null;
}

/**
 * Scrape a single URL and return clean markdown content
 */
export async function scrapePage(
  url: string,
  options: { onlyMainContent?: boolean; timeout?: number } = {}
): Promise<FirecrawlScrapeResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, markdown: "", metadata: {}, url };
  }

  try {
    const res = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: options.onlyMainContent ?? true,
        timeout: options.timeout || 30_000,
      }),
      signal: AbortSignal.timeout(35_000),
    });

    if (!res.ok) {
      console.error(`Firecrawl scrape failed: ${res.status}`);
      return { success: false, markdown: "", metadata: {}, url };
    }

    const data = await res.json();
    if (!data.success) {
      return { success: false, markdown: "", metadata: {}, url };
    }

    return {
      success: true,
      markdown: data.data?.markdown || "",
      metadata: {
        title: data.data?.metadata?.title || "",
        description: data.data?.metadata?.description || "",
        ogImage: data.data?.metadata?.ogImage || "",
        language: data.data?.metadata?.language || "",
      },
      url,
    };
  } catch (err) {
    console.error("Firecrawl scrape error:", err);
    return { success: false, markdown: "", metadata: {}, url };
  }
}

/**
 * Map a website to discover all its pages/links
 */
export async function mapWebsite(url: string): Promise<FirecrawlMapResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, links: [] };
  }

  try {
    const res = await fetch(`${FIRECRAWL_API_URL}/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      return { success: false, links: [] };
    }

    const data = await res.json();
    return {
      success: data.success || false,
      links: data.links || [],
    };
  } catch (err) {
    console.error("Firecrawl map error:", err);
    return { success: false, links: [] };
  }
}

/**
 * Deep scrape a competitor website — homepage + key internal pages.
 * Returns formatted text for AI consumption.
 */
export async function deepScrapeCompetitor(baseUrl: string): Promise<string> {
  const sections: string[] = [];

  // Step 1: Scrape homepage
  const homepage = await scrapePage(baseUrl);
  if (homepage.success) {
    sections.push(`══ HOMEPAGE ══`);
    sections.push(`Title: ${homepage.metadata.title || "N/A"}`);
    sections.push(`Description: ${homepage.metadata.description || "N/A"}`);
    // Truncate to keep token usage reasonable
    sections.push(`Content:\n${homepage.markdown.slice(0, 5000)}`);
  } else {
    sections.push(`══ HOMEPAGE ══\nCould not scrape ${baseUrl}`);
  }

  // Step 2: Discover important pages
  const map = await mapWebsite(baseUrl);
  if (map.success && map.links.length > 0) {
    const importantPatterns = /\/(about|who-we-are|our-story|team|products|services|solutions|pricing|plans|menu|portfolio|clients|contact|careers)/i;
    const importantLinks = map.links
      .filter((link) => importantPatterns.test(link))
      .slice(0, 3); // Max 3 subpages to stay within credit limits

    // Step 3: Scrape important subpages
    const subResults = await Promise.allSettled(
      importantLinks.map((link) => scrapePage(link, { timeout: 15_000 }))
    );

    subResults.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value.success) {
        const page = result.value;
        const path = new URL(importantLinks[i]).pathname;
        sections.push(`\n══ ${path.toUpperCase()} ══`);
        sections.push(`Title: ${page.metadata.title || "N/A"}`);
        sections.push(`Content:\n${page.markdown.slice(0, 3000)}`);
      }
    });
  }

  return sections.join("\n") || `Could not scrape ${baseUrl}`;
}

export function isFirecrawlConfigured(): boolean {
  return !!getApiKey();
}
