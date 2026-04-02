import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authenticateRequest, checkRateLimit, validateExternalUrl, validateStringInput } from "@/lib/api-auth";

interface ScrapedData {
  text: string;
  title: string;
  metaDescription: string;
  cssColors: string[];
}

async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
  try {
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    const res = await fetch(finalUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NawaaBot/1.0; brand-analysis)",
        "Accept": "text/html",
      },
    });

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    // Extract meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

    // Extract colors from CSS and meta tags
    const cssColors: string[] = [];
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) cssColors.push(themeColorMatch[1]);

    // Extract hex colors from inline styles and style blocks
    const styleBlocks = html.match(/<style[\s\S]*?<\/style>/gi) || [];
    const inlineStyles = html.match(/style=["'][^"']*["']/gi) || [];
    const allStyles = [...styleBlocks, ...inlineStyles].join(" ");
    const hexColors = allStyles.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
    // Count frequency and keep top unique colors (skip black/white/gray)
    const colorCounts: Record<string, number> = {};
    for (const c of hexColors) {
      const normalized = c.length === 4
        ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`.toLowerCase()
        : c.toLowerCase();
      // Skip near-black, near-white, and common gray
      if (/^#(0{6}|f{6}|e{6}|d{6}|c{6}|333|666|999|ccc|eee|fff|000)$/i.test(normalized)) continue;
      colorCounts[normalized] = (colorCounts[normalized] || 0) + 1;
    }
    const topCssColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hex]) => hex);
    cssColors.push(...topCssColors);

    // Strip tags for text content
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-zA-Z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 50) return null;
    return {
      text: text.slice(0, 5000),
      title,
      metaDescription,
      cssColors: [...new Set(cssColors)].slice(0, 8),
    };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are Saudi Arabia's most elite brand strategist and marketing consultant. You have 20 years of experience working with the Kingdom's top brands, deep knowledge of Saudi consumer behavior, cultural nuances, Vision 2030, and the Gulf market. You speak both Arabic and English fluently.

Your task is to analyze a brand and return a structured JSON brand DNA analysis.

Return ONLY valid JSON, no markdown, no explanation outside the JSON. Structure:
{
  "brandPersonality": {
    "innovation": 0-100,
    "trust": 0-100,
    "energy": 0-100,
    "elegance": 0-100,
    "boldness": 0-100,
    "summary": "2 sentence brand personality description"
  },
  "contentPillars": [
    { "name": "pillar name", "nameAr": "Arabic name", "description": "what to post", "percentage": 25 }
  ],
  "audienceInsights": {
    "primaryAge": "18-34",
    "interests": ["interest1", "interest2", "interest3"],
    "saudiSpecific": "One insight specific to Saudi/Gulf audience",
    "bestPostingTimes": [
      { "day": "Tuesday-Thursday", "time": "8pm-10pm", "reason": "why" }
    ]
  },
  "contentMix": {
    "educational": 25,
    "promotional": 20,
    "engagement": 30,
    "storytelling": 15,
    "entertainment": 10
  },
  "platformStrategy": {
    "primary": "platform name",
    "secondary": "platform name",
    "rationale": "why these platforms for this brand in Saudi"
  },
  "toneGuide": {
    "doUse": ["tone trait 1", "tone trait 2", "tone trait 3"],
    "avoid": ["what to never say", "what to avoid"],
    "exampleCaption": "Write one example Instagram caption for this brand"
  },
  "vision2030Alignment": "How this brand aligns with Saudi Vision 2030 (1-2 sentences)",
  "suggestedTargetAudience": "1-2 sentence description of the ideal target audience for this brand based on its industry, offerings, and positioning",
  "suggestedUniqueValue": "1-2 sentence unique value proposition — what makes this brand stand out from competitors"
}

If website content is provided, use it to deeply understand the brand's real offerings, tone, and positioning. Extract key products/services, taglines, brand messaging, and value propositions from the actual site content. This is the most reliable source of truth about the brand.

ALWAYS generate suggestedTargetAudience and suggestedUniqueValue based on the company description, industry, and any website content — even if the user already provided them.

CRITICAL LANGUAGE RULES:
- If outputLanguage is "ar": Write ALL text fields (summary, descriptions, exampleCaption, saudiSpecific, suggestedTargetAudience, suggestedUniqueValue, pillar names, audience insights, tone guide) in Arabic ONLY. Use Saudi/Gulf Arabic tone. Do NOT mix English into Arabic text fields. The nameAr fields must be proper Arabic, not transliteration.
- If outputLanguage is "en": Write ALL text fields in English ONLY. Do NOT mix Arabic into English text fields. The name fields must be proper English.
- Structural keys (JSON keys) stay in English regardless of language.`;

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/analyze-company");
  if (rl) return rl;

  try {
    const body = await request.json();
    const { company, outputLanguage = "en" } = body;
    if (!company || !company.name) {
      return NextResponse.json(
        { error: "Company data required" },
        { status: 400 }
      );
    }
    const nameErr = validateStringInput(company.name, "Company name", 500);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

    // Trim description
    const companyTrimmed = { ...company };
    if (typeof companyTrimmed.description === "string" && companyTrimmed.description.length > 8000) {
      companyTrimmed.description = companyTrimmed.description.slice(0, 8000) + "...";
    }
    delete companyTrimmed.brand_analysis;

    // Stream progress events to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(type: string, data: Record<string, unknown>) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
        }

        try {
          // Step 1: Scrape website
          let websiteContent: string | null = null;
          let websiteTitle = "";
          let websiteMeta = "";
          let websiteCssColors: string[] = [];

          if (companyTrimmed.website) {
            sendEvent("step", { step: "scraping", message: `Scraping ${companyTrimmed.website}...` });
            const scraped = await scrapeWebsite(companyTrimmed.website);
            if (scraped) {
              websiteContent = scraped.text;
              websiteTitle = scraped.title;
              websiteMeta = scraped.metaDescription;
              websiteCssColors = scraped.cssColors;
              sendEvent("step", {
                step: "scraped",
                message: `Scraped ${scraped.text.length} chars`,
                details: {
                  title: websiteTitle,
                  metaDescription: websiteMeta.slice(0, 120),
                  colorsFound: websiteCssColors.length,
                  cssColors: websiteCssColors,
                  contentLength: scraped.text.length,
                },
              });
            } else {
              sendEvent("step", { step: "scrape_failed", message: "Could not scrape website — proceeding with provided data" });
            }
          } else {
            sendEvent("step", { step: "no_website", message: "No website URL — using provided company data" });
          }

          // Step 2: Build prompt and call AI
          sendEvent("step", { step: "analyzing", message: "AI analyzing brand DNA..." });

          const userMessage = [
            `Company data:\n${JSON.stringify(companyTrimmed, null, 2)}`,
            websiteTitle ? `\nWebsite title: ${websiteTitle}` : "",
            websiteMeta ? `\nWebsite meta description: ${websiteMeta}` : "",
            websiteContent ? `\nWebsite content (scraped from ${companyTrimmed.website}):\n${websiteContent}` : "",
            websiteCssColors.length ? `\nBrand colors found on website CSS: ${websiteCssColors.join(", ")}` : "",
            `\nOutput language: ${outputLanguage}. Return JSON only.`,
          ].join("");

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          });

          sendEvent("step", { step: "parsing", message: "Parsing brand DNA results..." });

          const text = completion.choices[0]?.message?.content?.trim() || "{}";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : text;

          let parsed;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            sendEvent("error", { error: "AI returned invalid JSON. Please try again." });
            controller.close();
            return;
          }

          if (!parsed.brandPersonality || !parsed.contentPillars || !parsed.audienceInsights) {
            sendEvent("error", { error: "AI response missing required fields. Please try again." });
            controller.close();
            return;
          }

          sendEvent("done", { analysis: parsed });
          controller.close();
        } catch (err) {
          sendEvent("error", { error: err instanceof Error ? err.message : "Analysis failed" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("analyze-company", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
