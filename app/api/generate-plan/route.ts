import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authenticateRequest, checkRateLimit } from "@/lib/api-auth";

const SYSTEM_PROMPT = `You are the Chief Content Strategist at Saudi Arabia's most prestigious marketing agency. You have mastered content creation for the Gulf market, deep expertise in Saudi culture, Arabic language nuances, Islamic values, Vision 2030, and regional trends. You create content plans that go viral and drive real business results.

Your content plans are:
- Culturally aware (respectful of Islamic values, Saudi traditions, local humor)
- Platform-native (Reels for Instagram/TikTok, Threads for X, Stories for Snapchat)
- Bilingual when appropriate (Arabic + English code-switching is normal for Saudi audiences)
- Data-driven (based on best posting times and engagement patterns in KSA)
- Commercially smart (balance brand building with conversion)

CRITICAL LANGUAGE RULES:
- If outputLanguage is "ar": ALL captions, topics, strategy text, content tips MUST be written in Arabic. Use Saudi dialect where natural. Do NOT mix English into captions.
- If outputLanguage is "en": ALL captions, topics, strategy text, content tips MUST be written in English. Do NOT mix Arabic into captions.
- dayAr should always be Arabic day name, dayEn should always be English day name regardless of output language.
- topicAr should be Arabic version, topic should be English version — always provide both.
- captionAr should be Arabic caption, caption should be English caption — always provide both.

PLATFORM-SPECIFIC CAPTIONS (CRITICAL — each platform MUST have its own unique caption style):
- Instagram: Engaging, emoji-rich, storytelling format. 3-5 sentences. Include a call-to-action. Use line breaks for readability. Add relevant emojis between sentences.
- TikTok: Short hook-first caption. 1-2 punchy sentences max. Use trending phrases and viral hooks. Keep it casual and energetic.
- X (Twitter): Concise and witty. MUST be under 280 characters. Conversation-starting. Can include a question or bold statement.
- LinkedIn: Professional thought-leadership style. 8-12 sentences minimum. Write a full story or lesson with a hook, body, and takeaway. Use paragraph breaks and line spacing for readability. Share personal insights, industry knowledge, or behind-the-scenes stories. End with a question to drive engagement. LinkedIn rewards long-form content — make it substantial (300-500 words).
- Snapchat: Ultra-casual, personal, urgency-driven. 1-2 short sentences. Use slang where appropriate. Create FOMO.

Return ONLY valid JSON in this exact structure:
{
  "weekTheme": "Overall theme for the week in English",
  "weekThemeAr": "نفس الفكرة بالعربي",
  "days": [
    {
      "dayIndex": 0,
      "dayEn": "Saturday",
      "dayAr": "السبت",
      "date": "YYYY-MM-DD",
      "platform": "instagram",
      "contentType": "Carousel",
      "topic": "Topic headline in English",
      "topicAr": "العنوان بالعربي",
      "caption": "Full English caption ready to post, tailored to the platform style",
      "captionAr": "النص الكامل بالعربي جاهز للنشر، مخصص لأسلوب المنصة",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "postingTime": "8:00 PM",
      "postingTimeReason": "Brief reason why this time is best for this platform in KSA",
      "contentTips": "Specific production tip for this post",
      "imagePromptHint": "Brief visual direction for the AI image generator"
    }
  ],
  "weeklyStrategy": "2-3 sentence summary of the week's strategy",
  "expectedEngagement": "What results to expect this week"
}

Generate exactly 7 days starting from Saturday (Saudi week).
Make each day unique and varied across different platforms.
If the user provided a special focus, build the week around it.
If no focus given, analyze the company data to create the most relevant strategy.
Incorporate any brand analysis data provided.
Make captions long, detailed, and ready to copy-paste — at least 2-3 sentences each.
Include best posting times specific to Saudi Arabia timezone (AST/GMT+3).`;

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/generate-plan");
  if (rl) return rl;

  try {
    const body = await request.json();
    const {
      company,
      platforms = [],
      weekStart,
      userPrompt,
      brandAnalysis,
      outputLanguage = "ar",
    } = body;

    if (!company?.name || !weekStart) {
      return NextResponse.json(
        { error: "Company and weekStart required" },
        { status: 400 }
      );
    }
    if (typeof company.name !== "string" || company.name.length > 500) {
      return NextResponse.json({ error: "Company name must be under 500 characters" }, { status: 400 });
    }
    if (userPrompt && typeof userPrompt === "string" && userPrompt.length > 5000) {
      return NextResponse.json({ error: "Focus prompt must be under 5000 characters" }, { status: 400 });
    }

    // Trim company data to essential fields to stay within token limits
    const companySlim = {
      name: company.name,
      name_ar: company.name_ar,
      industry: company.industry,
      description: typeof company.description === "string" ? company.description.slice(0, 1500) : "",
      brand_colors: company.brand_colors,
    };

    // Trim brand analysis to summary-level data
    const brandAnalysisSlim = brandAnalysis ? {
      summary: brandAnalysis.brandPersonality?.summary ?? brandAnalysis.summary ?? "",
      pillars: Array.isArray(brandAnalysis.contentPillars) ? brandAnalysis.contentPillars.map((p: { name?: string }) => p.name) : [],
      tone: brandAnalysis.toneGuide?.doUse ?? [],
      vision2030: brandAnalysis.vision2030Alignment ?? "",
    } : null;

    const userMessage = [
      `Company: ${JSON.stringify(companySlim)}`,
      `Platforms to use: ${platforms.join(", ") || "all"}`,
      `Week start (Saturday): ${weekStart}`,
      `Output language: ${outputLanguage}`,
      `IMPORTANT: The output language is "${outputLanguage}". ${outputLanguage === "ar" ? "Write ALL captions, topics, strategy, and tips in Arabic only. No English mixing in captions." : "Write ALL captions, topics, strategy, and tips in English only. No Arabic mixing in captions."}`,
      userPrompt ? `Special focus: ${userPrompt}` : "",
      brandAnalysisSlim ? `Brand analysis summary: ${JSON.stringify(brandAnalysisSlim)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage + "\n\nReturn JSON only." },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      return NextResponse.json(
        { error: "AI response missing plan days. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, plan: parsed });
  } catch (e) {
    console.error("generate-plan", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plan generation failed" },
      { status: 500 }
    );
  }
}
