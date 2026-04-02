import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authenticateRequest, checkRateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/ai-suggest");
  if (rl) return rl;

  try {
    const { field, company, language } = await request.json();

    if (!field || !company?.name) {
      return NextResponse.json({ error: "Field and company name required" }, { status: 400 });
    }

    const validFields = ["target_audience", "unique_value", "competitors"];
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const lang = language === "ar" ? "ar" : "en";
    const langInstruction = lang === "ar"
      ? "CRITICAL: Write your ENTIRE response in Arabic only. Use Saudi/Gulf Arabic tone. Do NOT include any English words or phrases."
      : "CRITICAL: Write your ENTIRE response in English only. Do NOT include any Arabic words or phrases.";

    const companyContext = [
      `Company: ${company.name}`,
      company.name_ar ? `Arabic name: ${company.name_ar}` : "",
      company.industry ? `Industry: ${company.industry}` : "",
      company.description ? `Description: ${company.description.slice(0, 1000)}` : "",
      company.website ? `Website: ${company.website}` : "",
    ].filter(Boolean).join("\n");

    const prompts: Record<string, string> = {
      target_audience: `Based on this company info, generate a detailed target audience description. Include demographics (age, gender, location), psychographics (interests, lifestyle), and buying behavior. Be specific to the Saudi/Gulf market where relevant.\n\n${companyContext}\n\n${langInstruction}\n\nReturn ONLY the target audience description text, 2-4 sentences. No labels, no JSON.`,
      unique_value: `Based on this company info, generate a compelling unique value proposition. What makes this company different? What problem do they solve uniquely? Why should customers choose them?\n\n${companyContext}\n\n${langInstruction}\n\nReturn ONLY the unique value proposition text, 2-3 sentences. No labels, no JSON.`,
      competitors: `Based on this company info, list 3-5 likely competitors in the Saudi/Gulf market. For each, give just the company/brand name.\n\n${companyContext}\n\n${langInstruction}\n\nReturn ONLY a comma-separated list of competitor names. No labels, no numbering, no descriptions.`,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Saudi market expert and brand strategist. Give concise, actionable answers." },
        { role: "user", content: prompts[field] },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    if (!text) {
      return NextResponse.json({ error: "No suggestion generated" }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });
  } catch (e) {
    console.error("ai-suggest error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Suggestion failed" },
      { status: 500 }
    );
  }
}
