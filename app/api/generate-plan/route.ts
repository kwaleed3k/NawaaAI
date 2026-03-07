import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

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

PLATFORM-SPECIFIC CAPTIONS:
Each day should include platform-specific captions tailored to the assigned platform's style:
- Instagram: Engaging, emoji-rich, storytelling, with call-to-action
- TikTok: Short, trendy, hook-first, using viral phrases
- X (Twitter): Concise, witty, conversation-starting, under 280 chars
- LinkedIn: Professional, value-driven, thought-leadership style
- Snapchat: Casual, personal, urgency-driven
- YouTube: Descriptive, SEO-friendly, with timestamps suggestions
- WhatsApp: Direct, personal, community-focused

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

    const userMessage = [
      `Company: ${JSON.stringify(company)}`,
      `Platforms to use: ${platforms.join(", ") || "all"}`,
      `Week start (Saturday): ${weekStart}`,
      `Output language: ${outputLanguage}`,
      `IMPORTANT: The output language is "${outputLanguage}". ${outputLanguage === "ar" ? "Write ALL captions, topics, strategy, and tips in Arabic only. No English mixing in captions." : "Write ALL captions, topics, strategy, and tips in English only. No Arabic mixing in captions."}`,
      userPrompt ? `Special focus: ${userPrompt}` : "",
      brandAnalysis ? `Brand analysis (use for strategy): ${JSON.stringify(brandAnalysis)}` : "",
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

    return NextResponse.json({ success: true, plan: parsed });
  } catch (e) {
    console.error("generate-plan", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plan generation failed" },
      { status: 500 }
    );
  }
}
