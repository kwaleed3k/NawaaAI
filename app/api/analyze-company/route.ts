import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    // Normalize URL
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    const res = await fetch(finalUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NawaaBot/1.0; brand-analysis)",
        "Accept": "text/html",
      },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const html = await res.text();

    // Strip script, style, nav, footer, header tags and their content
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<[^>]+>/g, " ")               // Strip remaining HTML tags
      .replace(/&[a-zA-Z]+;/g, " ")           // Strip HTML entities
      .replace(/\s+/g, " ")                   // Collapse whitespace
      .trim();

    if (text.length < 50) return null; // Too little content
    return text.slice(0, 3000);
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

If outputLanguage is "ar", write summary, descriptions, exampleCaption, and saudiSpecific in Arabic (Saudi/Jeddah-appropriate tone where natural).`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, outputLanguage = "en" } = body;
    if (!company || !company.name) {
      return NextResponse.json(
        { error: "Company data required" },
        { status: 400 }
      );
    }

    // Trim description — generous limit to accept large company profiles
    const companyTrimmed = { ...company };
    if (typeof companyTrimmed.description === "string" && companyTrimmed.description.length > 8000) {
      companyTrimmed.description = companyTrimmed.description.slice(0, 8000) + "...";
    }
    // Remove any nested brand_analysis to avoid circular bloat
    delete companyTrimmed.brand_analysis;

    // Scrape website content if URL provided
    const websiteContent = companyTrimmed.website
      ? await scrapeWebsite(companyTrimmed.website)
      : null;

    const userMessage = [
      `Company data:\n${JSON.stringify(companyTrimmed, null, 2)}`,
      websiteContent
        ? `\nWebsite content (scraped from ${companyTrimmed.website}):\n${websiteContent}`
        : "",
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

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (e) {
    console.error("analyze-company", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
