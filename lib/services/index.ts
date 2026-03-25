/**
 * MCP Service Integrations — Nawaa AI Marketing Intelligence
 *
 * Each service gracefully degrades if its API key is not configured.
 * The orchestrator layer automatically falls back to basic fetch
 * when premium services are unavailable.
 *
 * Required env vars:
 *   BRAVE_API_KEY     — Brave Search (web + news search)
 *   FIRECRAWL_API_KEY — Firecrawl (advanced web scraping)
 *   EXA_API_KEY       — Exa (AI semantic search)
 */

export { braveWebSearch, braveNewsSearch, researchCompany, searchTrending, isBraveConfigured } from "./brave-search";
export { scrapePage, mapWebsite, deepScrapeCompetitor, isFirecrawlConfigured } from "./firecrawl";
export { exaSearch, findSimilarCompanies, findTrendingContent, findContentIdeas, marketIntelligence, isExaConfigured } from "./exa-search";

/** Check which MCP services are configured */
export function getConfiguredServices(): { brave: boolean; firecrawl: boolean; exa: boolean } {
  return {
    brave: !!process.env.BRAVE_API_KEY,
    firecrawl: !!process.env.FIRECRAWL_API_KEY,
    exa: !!process.env.EXA_API_KEY,
  };
}
