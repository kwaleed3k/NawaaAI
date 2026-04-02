import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, checkRateLimit, validateExternalUrl } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/scrape-website");
  if (rl) return rl;

  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const urlCheck = validateExternalUrl(url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error || "Invalid URL" }, { status: 400 });
    }

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    const res = await fetch(finalUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NawaaBot/1.0; brand-analysis)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Website returned ${res.status}` }, { status: 400 });
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "URL did not return HTML content" }, { status: 400 });
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    // Extract meta description
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

    // Extract OG image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1].trim() : "";

    // Extract colors from CSS and meta tags
    const cssColors: string[] = [];
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) cssColors.push(themeColorMatch[1]);

    const styleBlocks = html.match(/<style[\s\S]*?<\/style>/gi) || [];
    const inlineStyles = html.match(/style=["'][^"']*["']/gi) || [];
    const allStyles = [...styleBlocks, ...inlineStyles].join(" ");
    const hexColors = allStyles.match(/#[0-9a-fA-F]{3,6}\b/g) || [];

    const colorCounts: Record<string, number> = {};
    for (const c of hexColors) {
      const normalized =
        c.length === 4
          ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`.toLowerCase()
          : c.toLowerCase();
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

    if (text.length < 30) {
      return NextResponse.json({ error: "Could not extract meaningful content from this website" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      title,
      metaDescription,
      ogImage,
      text: text.slice(0, 5000),
      cssColors: [...new Set(cssColors)].slice(0, 8),
      charCount: Math.min(text.length, 5000),
    });
  } catch (e) {
    console.error("scrape-website error:", e);
    const msg = e instanceof Error && e.name === "TimeoutError"
      ? "Website took too long to respond"
      : "Failed to scrape website";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
