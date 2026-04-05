import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authenticateRequest, checkRateLimit, validateExternalUrl, validateStringInput, MAX_STRING_LENGTH } from "@/lib/api-auth";
import { braveWebSearch, braveNewsSearch, isBraveConfigured } from "@/lib/services/brave-search";

/* ═══════════════════════════════════════════════════
   DEEP RESEARCH ENGINE — Real web scraping + search
   ═══════════════════════════════════════════════════ */

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchPage(url: string, timeout = 12000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
        "Accept-Encoding": "identity",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractFromHtml(html: string): { meta: string[]; jsonLd: string[]; text: string; title: string } {
  const meta: string[] = [];
  const jsonLd: string[] = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "";

  // Meta tags
  const metaRegex = /<meta[^>]+>/gi;
  let m;
  while ((m = metaRegex.exec(html)) !== null) {
    const tag = m[0];
    const content = tag.match(/content\s*=\s*"([^"]*)"/i)?.[1] || tag.match(/content\s*=\s*'([^']*)'/i)?.[1];
    const name = tag.match(/(?:name|property)\s*=\s*"([^"]*)"/i)?.[1] || tag.match(/(?:name|property)\s*=\s*'([^']*)'/i)?.[1];
    if (content && name && content.length > 5) {
      meta.push(`${name}: ${content}`);
    }
  }

  // JSON-LD
  const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      jsonLd.push(JSON.stringify(parsed, null, 0).slice(0, 2000));
    } catch { /* skip */ }
  }

  // Visible text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { meta, jsonLd, text, title };
}

/* Scrape a website deeply — homepage + about + products/services pages */
async function deepScrapeWebsite(baseUrl: string): Promise<string> {
  let finalUrl = baseUrl.trim();
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;
  // Remove trailing slash for consistency
  finalUrl = finalUrl.replace(/\/+$/, "");

  const results: string[] = [];

  // Scrape homepage
  const homeHtml = await fetchPage(finalUrl);
  if (homeHtml) {
    const { meta, jsonLd, text, title } = extractFromHtml(homeHtml);
    results.push(`[HOMEPAGE] Title: ${title}`);
    if (meta.length > 0) results.push(`Meta: ${meta.slice(0, 15).join(" | ")}`);
    if (jsonLd.length > 0) results.push(`Structured Data: ${jsonLd.join("\n")}`);
    results.push(`Content: ${text.slice(0, 4000)}`);

    // Find internal links to about, products, services, pricing, team pages
    const linkRegex = /href\s*=\s*"([^"]*?)"/gi;
    const internalPaths = new Set<string>();
    const importantPatterns = /\b(about|who-we-are|our-story|team|leadership|products|services|solutions|pricing|plans|menu|portfolio|clients|partners|careers|contact)\b/i;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(homeHtml)) !== null) {
      const href = linkMatch[1];
      if (href && importantPatterns.test(href) && !href.startsWith("http") && !href.startsWith("mailto") && !href.startsWith("#") && !href.startsWith("tel")) {
        const cleanPath = href.startsWith("/") ? href : "/" + href;
        internalPaths.add(cleanPath.split("?")[0].split("#")[0]);
      } else if (href && importantPatterns.test(href) && href.startsWith(finalUrl)) {
        internalPaths.add(href.replace(finalUrl, "").split("?")[0].split("#")[0] || "/");
      }
    }

    // Scrape up to 3 important internal pages
    const pagesToScrape = Array.from(internalPaths).slice(0, 3);
    const subPages = await Promise.all(
      pagesToScrape.map(async (path) => {
        const pageHtml = await fetchPage(`${finalUrl}${path}`, 8000);
        if (!pageHtml) return null;
        const { text: pageText, title: pageTitle } = extractFromHtml(pageHtml);
        return `[${path.toUpperCase()}] Title: ${pageTitle}\nContent: ${pageText.slice(0, 2500)}`;
      })
    );
    subPages.forEach((p) => { if (p) results.push(p); });
  } else {
    results.push(`[WEBSITE] Could not fetch ${finalUrl}`);
  }

  return results.join("\n\n");
}

/* Search the web using Brave Search API (replaces unreliable Google HTML scraping) */
async function searchWeb(query: string, isNews = false): Promise<{ text: string; resultCount: number }> {
  try {
    if (!isBraveConfigured()) {
      return { text: "Search API not configured (missing BRAVE_API_KEY)", resultCount: 0 };
    }

    if (isNews) {
      const response = await braveNewsSearch(query, { count: 8, freshness: "py" });
      if (response.results.length === 0) return { text: "No news results found", resultCount: 0 };
      const formatted = response.results
        .map((r) => `• [${r.age || "recent"}] ${r.title}\n  ${r.url}\n  ${r.description}`)
        .join("\n\n");
      return { text: formatted, resultCount: response.results.length };
    }

    const response = await braveWebSearch(query, { count: 8 });
    if (response.results.length === 0) return { text: "No search results found", resultCount: 0 };
    const formatted = response.results
      .map((r) => `• ${r.title}\n  ${r.url}\n  ${r.description}`)
      .join("\n\n");
    return { text: formatted, resultCount: response.results.length };
  } catch {
    return { text: "Search failed", resultCount: 0 };
  }
}

/* Scrape social media profile */
async function scrapeSocialProfile(handle: string, platform: string): Promise<string> {
  if (!handle) return "No social handle provided";
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return "Empty social handle";

  const platformUrls: Record<string, string[]> = {
    instagram: [`https://www.instagram.com/${clean}/`],
    twitter: [`https://x.com/${clean}`, `https://twitter.com/${clean}`],
    tiktok: [`https://www.tiktok.com/@${clean}`],
    snapchat: [`https://www.snapchat.com/add/${clean}`],
    linkedin: [`https://www.linkedin.com/company/${clean}/`],
  };

  const urls = platformUrls[platform.toLowerCase()] || platformUrls.instagram;
  for (const url of urls) {
    const html = await fetchPage(url);
    if (html && html.length > 500) {
      const { meta, jsonLd, text, title } = extractFromHtml(html);
      const parts = [`[${platform.toUpperCase()} PROFILE] ${title}`];
      if (meta.length > 0) parts.push(`Meta: ${meta.slice(0, 10).join(" | ")}`);
      if (jsonLd.length > 0) parts.push(`Data: ${jsonLd.join("\n")}`);
      parts.push(`Content: ${text.slice(0, 2000)}`);
      return parts.join("\n");
    }
  }
  return `Could not scrape ${platform} profile for @${clean}`;
}

/* ═══════════════════════════════════════════════════
   MAIN API HANDLER
   ═══════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/competitor-analysis");
  if (rl) return rl;

  try {
    const body = await request.json();
    let { companyName, companyDescription, competitors, outputLanguage } = body;

    // Validate inputs
    const nameErr = validateStringInput(companyName, "Company name", MAX_STRING_LENGTH);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
    if (!competitors?.length) {
      return NextResponse.json({ error: "At least one competitor is required" }, { status: 400 });
    }
    if (competitors.length > 5) {
      return NextResponse.json({ error: "Maximum 5 competitors allowed" }, { status: 400 });
    }
    // Trim long descriptions instead of rejecting them
    if (companyDescription && typeof companyDescription === "string" && companyDescription.length > 10000) {
      companyDescription = companyDescription.slice(0, 10000);
    }

    // Validate each competitor's fields and URLs
    for (const c of competitors) {
      const cErr = validateStringInput(c.name, "Competitor name", MAX_STRING_LENGTH);
      if (cErr) return NextResponse.json({ error: cErr }, { status: 400 });
      if (c.handle && typeof c.handle === "string" && c.handle.length > 200) {
        return NextResponse.json({ error: `Handle too long for "${c.name}"` }, { status: 400 });
      }
      if (c.websiteUrl) {
        const urlCheck = validateExternalUrl(c.websiteUrl);
        if (!urlCheck.valid) {
          return NextResponse.json({ error: `Invalid URL for "${c.name}": ${urlCheck.error}` }, { status: 400 });
        }
      }
    }

    // ── PHASE 1: Deep research on ALL competitors in parallel ──
    // Track data quality metrics across all research
    let websitesScraped = 0;
    let websitesFailed = 0;
    let socialProfilesFound = 0;
    let searchResultsFound = 0;

    // Use Promise.allSettled so one failed competitor doesn't kill the entire request
    const settledResults = await Promise.allSettled(
      competitors.map(async (c: { name: string; handle?: string; platform?: string; websiteUrl?: string }) => {
        const [websiteData, socialData, searchCompanyInfo, searchReviews, searchNews] = await Promise.allSettled([
          c.websiteUrl ? deepScrapeWebsite(c.websiteUrl) : Promise.resolve("No website URL provided"),
          c.handle ? scrapeSocialProfile(c.handle, c.platform || "instagram") : Promise.resolve("No social handle provided"),
          searchWeb(`"${c.name}" company about Saudi Arabia`),
          searchWeb(`"${c.name}" reviews rating customers`),
          searchWeb(`"${c.name}" news latest 2024 2025`, true),
        ]);

        const valStr = (r: PromiseSettledResult<string | null>) => r.status === "fulfilled" ? (r.value || "No data") : "Research failed";
        const valSearch = (r: PromiseSettledResult<{ text: string; resultCount: number }>) => {
          if (r.status === "fulfilled") {
            searchResultsFound += r.value.resultCount;
            return r.value.text;
          }
          return "Research failed";
        };

        // Track website scraping success/failure
        if (c.websiteUrl) {
          if (websiteData.status === "fulfilled" && websiteData.value && !websiteData.value.includes("Could not fetch")) {
            websitesScraped++;
          } else {
            websitesFailed++;
          }
        }

        // Track social profile success
        if (c.handle && socialData.status === "fulfilled" && socialData.value && !socialData.value.includes("Could not scrape")) {
          socialProfilesFound++;
        }

        return {
          name: c.name,
          handle: c.handle || "N/A",
          platform: c.platform || "N/A",
          websiteUrl: c.websiteUrl || "N/A",
          research: [
            `══ WEBSITE DEEP SCRAPE ══\n${valStr(websiteData)}`,
            `══ SOCIAL MEDIA PROFILE ══\n${valStr(socialData)}`,
            `══ SEARCH: COMPANY INFO ══\n${valSearch(searchCompanyInfo)}`,
            `══ SEARCH: CUSTOMER REVIEWS ══\n${valSearch(searchReviews)}`,
            `══ SEARCH: LATEST NEWS ══\n${valSearch(searchNews)}`,
          ].join("\n\n"),
        };
      })
    );

    const researchResults = settledResults
      .filter((r): r is PromiseFulfilledResult<{ name: string; handle: string; platform: string; websiteUrl: string; research: string }> => r.status === "fulfilled")
      .map(r => r.value);

    // Also research the user's own brand
    const brandSearchResult = await searchWeb(`"${companyName}" company Saudi Arabia`);
    searchResultsFound += brandSearchResult.resultCount;
    const brandResearch = brandSearchResult.text;

    // Calculate overall data quality confidence
    const totalCompetitors = competitors.length;
    const totalWebsites = competitors.filter((c: { websiteUrl?: string }) => c.websiteUrl).length;
    const totalSocialHandles = competitors.filter((c: { handle?: string }) => c.handle).length;
    const websiteSuccessRate = totalWebsites > 0 ? websitesScraped / totalWebsites : 0;
    const socialSuccessRate = totalSocialHandles > 0 ? socialProfilesFound / totalSocialHandles : 0;
    const hasSearchResults = searchResultsFound > totalCompetitors;
    const overallConfidence: "high" | "medium" | "low" =
      (websiteSuccessRate >= 0.7 && hasSearchResults) || (socialSuccessRate >= 0.7 && hasSearchResults) ? "high" :
      websiteSuccessRate >= 0.3 || socialSuccessRate >= 0.3 || hasSearchResults ? "medium" : "low";

    const dataQuality = {
      websitesScraped,
      websitesFailed,
      socialProfilesFound,
      searchResultsFound,
      overallConfidence,
    };

    const researchContext = researchResults
      .map((r) => `\n${"═".repeat(60)}\n   COMPETITOR: ${r.name} (@${r.handle} on ${r.platform})\n   Website: ${r.websiteUrl}\n${"═".repeat(60)}\n${r.research}`)
      .join("\n\n");

    const langInstruction = outputLanguage === "ar"
      ? "CRITICAL: You MUST respond ENTIRELY in Arabic. Every single word must be in Arabic. Do NOT use any English words except brand names and technical terms that have no Arabic equivalent."
      : "Respond in English.";

    // ── PHASE 2: AI Analysis with massive depth ──
    const systemPrompt = `You are an elite competitive intelligence analyst — the kind that Fortune 500 companies pay $200,000+ for a single report. You combine the strategic depth of McKinsey, the data rigor of Bloomberg Intelligence, and the creative insight of the best brand strategists in the Middle East.

${langInstruction}

You have been given REAL SCRAPED DATA from competitor websites, social media profiles, Google search results, customer reviews, and news articles. This is REAL data — use it.

YOUR JOB: Produce the most comprehensive, brutally honest, data-backed competitive intelligence report possible. Cover EVERYTHING — not just marketing, but the entire business.

ABSOLUTE RULES:
1. NEVER give similar scores to different companies. If Company A is clearly stronger in area X, their score MUST be significantly higher. Use the FULL 0-100 range. Some companies might score 25, others 92. Be bold.
2. Reference SPECIFIC things you found in the scraped data: quote their taglines, mention their product names, cite their pricing, reference their team size, note their visual style.
3. If real data is missing for a field, provide your best educated estimate based on industry knowledge, but mark it with [Estimated] prefix so users know it's not from direct data. Always fill every field with substantive, useful content — never leave fields empty or say "no data found".
4. Each text field must be 3-6 sentences of DEEP, SPECIFIC analysis. No generic statements like "they have good content." Say exactly WHAT content, WHY it works, and HOW it compares.
5. Scores MUST be justified. Don't just give a number — the surrounding text should make it obvious why that score is what it is.

Return ONLY a valid JSON object (no markdown, no code fences) with this structure:

{
  "executiveSummary": "Write 5-6 substantial paragraphs. Paragraph 1: Market landscape — who dominates and why, market size signals, growth trajectory. Paragraph 2: Each competitor's core positioning and what makes them unique (reference specific things from their websites/profiles). Paragraph 3: Your brand's current position — honest assessment of where you stand relative to each competitor with specific evidence. Paragraph 4: The critical threats — which competitor is most dangerous and exactly why (cite evidence). Paragraph 5: The biggest opportunities — specific gaps no competitor is filling. Paragraph 6: Your 90-day battle plan — the single most important strategic move to make.",

  "brandAssessment": {
    "strengths": ["Each strength must reference SPECIFIC evidence from your company data or market position. 3-4 sentences per strength explaining WHY it matters and HOW it creates competitive advantage. Minimum 6 strengths."],
    "weaknesses": ["Each weakness must be SPECIFIC and reference observable gaps vs competitors. Explain the business impact and urgency. 3-4 sentences each. Minimum 6 weaknesses."],
    "opportunities": ["Each opportunity must reference a SPECIFIC gap found in competitor analysis. Include market size estimate, difficulty level, and time-to-capture. 3-4 sentences each. Minimum 5 opportunities."],
    "threats": ["Each threat must name the SPECIFIC competitor and their specific advantage that threatens you. Include urgency timeline. 3-4 sentences each. Minimum 5 threats."],
    "overallScore": "[SCORE 0-100]",
    "marketPosition": "5-6 sentences describing exactly where the brand sits in the competitive hierarchy. Reference specific evidence: website quality comparison, content volume comparison, apparent audience size, product/service breadth, pricing position, market presence signals."
  },

  "competitors": [
    {
      "name": "Exact competitor name",
      "handle": "@their_handle",
      "platform": "primary platform",

      "companyOverview": "3-5 sentences about the company: what they do, their apparent size, founding context, key products/services, headquarters, market focus. Reference specific things found on their website (taglines, product names, team size if visible).",
      "productsAndServices": "3-5 sentences detailing their product/service lineup as found on their website. Pricing tiers if visible. Key differentiating features. What they emphasize most prominently.",
      "targetMarket": "3-4 sentences about who they serve. Evidence from website copy, language used, imagery, testimonials visible. Geographic focus. Industry verticals if B2B.",
      "brandPositioning": "3-4 sentences on how they position themselves. Their tagline/value proposition from website. Premium vs. budget positioning. Professional vs. casual. What emotional triggers they use.",
      "websiteAnalysis": "4-5 sentences: design quality (1-10), UX assessment, loading experience, mobile optimization signals, content freshness, SEO indicators from meta tags, technology signals, call-to-action strategy, conversion funnel observations.",
      "digitalPresence": "3-4 sentences: Google presence (what comes up when searching them), review scores found, app presence if any, directory listings, press mentions found.",

      "postingFrequency": "3-4 sentences with specific observations. If scraped data shows post counts or dates, cite them exactly. Compare to industry benchmarks for Saudi market. Note consistency patterns.",
      "contentTypes": ["List actual content formats observed"],
      "contentThemes": ["List specific recurring topics/themes from their actual content"],
      "captionStyle": "3-4 sentences describing their actual writing style with a specific example if found. Language mix (Arabic/English ratio), emoji usage, CTA patterns, tone (formal/casual/inspirational).",
      "hashtagStrategy": "3-4 sentences: number used, branded vs trending, Arabic vs English, Saudi-specific tags observed. Give specific hashtag examples found.",
      "engagementLevel": "3-4 sentences with REAL numbers if found. If not found, clearly state 'Estimated:' and give reasoning. Comment quality, response patterns.",
      "visualStyle": "3-4 sentences: color palette (name specific colors), photography style, graphics quality, brand consistency across website and social, production value level.",
      "audienceProfile": "3-4 sentences: demographics visible from content targeting, language signals, geographic indicators, psychographic signals from content themes.",
      "contentCalendar": "3-4 sentences: posting patterns, seasonal campaign evidence, Saudi event alignment (Ramadan, National Day, Founding Day), product launch patterns.",
      "paidStrategy": "2-3 sentences: evidence of paid promotion, influencer collaborations visible, sponsored content indicators.",

      "pricingStrategy": "2-4 sentences: pricing information found on website, positioning (premium/mid/budget), comparison to market rates if known.",
      "customerReviews": "3-4 sentences: review scores found on Google/other platforms, sentiment analysis of review snippets, common praise and complaints found.",
      "technologyStack": "2-3 sentences: observable technology (website platform, payment systems, app availability, booking systems, etc.).",

      "strengths": ["6+ specific strengths. Each 2-3 sentences with evidence. What they genuinely do better than others."],
      "weakPoints": ["6+ specific weaknesses. Each 2-3 sentences with evidence. Real vulnerabilities and gaps you can exploit."],
      "threatLevel": "[SCORE 1-10]",
      "overallScore": "[SCORE 0-100]",
      "keyInsight": "4-5 sentences. The MOST important strategic insight about this competitor. What makes them dangerous OR what is their fatal weakness. Be specific, cite evidence, and explain the implication for your brand.",
      "stealThisMove": "3-4 sentences. One specific brilliant tactic from this competitor. Exactly what they do, why it works, and how your brand should adapt and improve upon it."
    }
  ],

  "comparisonMatrix": {
    "categories": ["Website Quality", "Content Strategy", "Social Media Presence", "Visual Branding", "Customer Experience", "Product/Service Depth", "Pricing Competitiveness", "Brand Recognition", "Digital Innovation", "Saudi Market Fit", "Community Engagement", "SEO & Discoverability"],
    "yourBrand": ["[SCORE]", "[SCORE]", "... one 0-100 score per category based on evidence"],
    "competitors": {
      "[CompetitorName]": ["[SCORE]", "[SCORE]", "... one 0-100 score per category based on evidence"]
    }
  },

  "winningStrategy": {
    "immediate": [
      {"action": "4-5 sentences. Extremely specific — name the exact platform, content type, topic, format, posting time, and expected outcome. A junior employee should be able to execute this TODAY with zero questions.", "priority": "high", "impact": "high", "kpi": "Specific measurable metric with target number and timeframe"},
      "Provide 5-6 immediate actions"
    ],
    "shortTerm": [
      {"action": "4-5 sentences. Detailed 2-4 week initiative with week-by-week specifics. Name exact content types, topics, engagement tactics, and resource requirements.", "priority": "high", "impact": "high", "kpi": "Measurable KPI with target"},
      "Provide 5-6 short-term actions"
    ],
    "longTerm": [
      {"action": "4-5 sentences. Strategic initiative for 1-3 months with milestones. Think brand positioning shifts, new channels, partnership strategies, content series, community programs.", "priority": "medium", "impact": "high", "kpi": "Measurable KPI with target"},
      "Provide 5-6 long-term actions"
    ],
    "contentGaps": ["6+ content gaps. Each 2-3 sentences. Specific content topic, format, or angle that NO competitor is doing well. Explain the opportunity size and how to capture it."],
    "differentiators": ["6+ differentiators. Each 2-3 sentences. Specific ways to position uniquely against ALL competitors. What can you OWN that nobody else does?"],
    "quickWins": ["5+ things executable TODAY with zero budget. Each 2-3 sentences with exact steps."],
    "contentSeries": [
      {"name": "Creative series name", "description": "4-5 sentences: detailed concept, format, frequency, example episode topics, why it positions the brand uniquely, expected audience response.", "platform": "Best platform with reasoning"}
    ]
  },

  "industryAnalysis": {
    "marketOverview": "5-6 sentences: the current state of this industry in Saudi Arabia. Market size signals, growth trajectory, key trends, regulatory environment, consumer behavior shifts.",
    "competitiveLandscape": "4-5 sentences: who are the clear leaders, challengers, and niche players. Market concentration. Entry barriers. Disruption risks.",
    "consumerTrends": "4-5 sentences: how Saudi consumers in this industry are changing. Digital adoption, spending patterns, preference shifts, generational differences.",
    "futureOutlook": "3-4 sentences: where this industry is headed in the next 2-3 years. Emerging threats and opportunities. Technology disruption potential."
  },

  "saudiMarketInsights": {
    "trendAlignment": "4-5 sentences: detailed analysis of alignment with current Saudi digital trends. Reference specific trends: short-form video growth, Saudi creator economy, Arabic-first content movement, e-commerce integration, Saudi app ecosystem.",
    "vision2030Relevance": "4-5 sentences: specific Vision 2030 themes the brand can leverage. Entertainment sector growth, tourism push, women empowerment, tech innovation, sports investment. Concrete opportunities.",
    "culturalFit": "4-5 sentences: assessment of cultural sensitivity. Arabic language quality, Saudi humor understanding, regional dialect awareness, religious sensitivity, family values alignment, Saudi holidays integration depth.",
    "localOpportunities": "4-5 sentences: specific opportunities in the Saudi market. Emerging platforms popular in KSA (Salla, Noon, local apps), Saudi influencer collaboration ideas with specific influencer tiers, local event tie-ins, city-specific targeting (Riyadh, Jeddah, Dammam differences).",
    "ramadanStrategy": "4-5 sentences: detailed Ramadan content strategy. Content themes for each week of Ramadan, posting schedule shifts (late night engagement peaks), tone adjustments, suhoor/iftar content opportunities, Eid transition strategy, charity angle."
  }
}

SCORING RULES — THIS IS CRITICAL:
- Scores MUST vary significantly between competitors. If one company has a beautiful website and another has a basic one, the scores might be 88 vs 35.
- Your brand scores should be HONEST — if competitors are clearly stronger in an area, your score should be LOWER.
- Never cluster all scores in the 60-80 range. Use 15-95+ range. Be brutally honest.
- Each score must be JUSTIFIED by the text analysis around it.`;

    const userPrompt = `PRODUCE THE MOST COMPREHENSIVE COMPETITIVE INTELLIGENCE REPORT FOR:

═══ YOUR BRAND ═══
Company: ${companyName}
Description: ${companyDescription || "Not provided — infer from the industry and competitor context"}

Google Search Results for Your Brand:
${brandResearch}

═══ COMPETITORS TO ANALYZE ═══
${competitors.map((c: { name: string; handle?: string; platform?: string; websiteUrl?: string }) => `• ${c.name} | @${c.handle || "N/A"} on ${c.platform || "N/A"} | ${c.websiteUrl || "No website"}`).join("\n")}

${"═".repeat(70)}
        REAL RESEARCH DATA (SCRAPED & SEARCHED)
${"═".repeat(70)}
${researchContext}
${"═".repeat(70)}

INSTRUCTIONS:
1. The above data is REAL — scraped from actual websites, social profiles, and Google searches. Use it extensively.
2. Quote specific things you find: taglines, product names, pricing, team mentions, review scores.
3. Where scraped data is thin, use your expert knowledge to fill in realistic analysis marked with [Estimated] prefix. NEVER leave anything blank.
4. Make scores DRAMATICALLY different between companies based on actual quality differences observed.
5. This report should be so detailed and specific that the CEO would immediately know you actually researched every company.
6. Cover EVERYTHING: not just social media — business strategy, products, pricing, reputation, technology, market position, customer sentiment.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.65,
      max_tokens: 16000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let analysisData;
    try {
      let cleaned = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      // Fix truncated JSON — try to close unclosed braces/brackets
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets - closeBrackets; i++) cleaned += "]";
      for (let i = 0; i < openBraces - closeBraces; i++) cleaned += "}";
      // Remove trailing comma before closing brace/bracket
      cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
      analysisData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    // Gracefully fix common AI response issues instead of rejecting
    if (!analysisData.executiveSummary) {
      analysisData.executiveSummary = "Analysis completed. See competitor details below.";
    }
    if (!Array.isArray(analysisData.competitors) || analysisData.competitors.length === 0) {
      return NextResponse.json(
        { error: "AI response missing competitor data. Please try again." },
        { status: 500 }
      );
    }
    // Fix incomplete competitor entries instead of failing
    for (const comp of analysisData.competitors) {
      if (!comp.name) comp.name = "Unknown";
      if (typeof comp.overallScore !== "number") {
        comp.overallScore = typeof comp.overallScore === "string" ? parseInt(comp.overallScore, 10) || 50 : 50;
      }
    }

    return NextResponse.json({ success: true, analysis: analysisData, dataQuality });
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
