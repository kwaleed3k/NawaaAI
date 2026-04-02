import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { authenticateRequest, checkRateLimit } from "@/lib/api-auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const GEMINI_INLINE_LIMIT = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/extract-pdf");
  if (rl) return rl;

  try {
    let base64: string;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Client sends base64-encoded PDF as JSON (bypasses FormData body limits)
      const body = await request.json();
      if (!body.base64 || typeof body.base64 !== "string") {
        return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
      }
      const rawBuffer = Buffer.from(body.base64, "base64");
      if (rawBuffer.length > MAX_PDF_SIZE) {
        return NextResponse.json({ error: `PDF too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB` }, { status: 400 });
      }
      if (rawBuffer.length < 5 || rawBuffer.subarray(0, 5).toString() !== "%PDF-") {
        return NextResponse.json({ error: "Invalid PDF file — file signature check failed" }, { status: 400 });
      }
      // Trim to Gemini inline limit if needed
      const processed = rawBuffer.length > GEMINI_INLINE_LIMIT
        ? rawBuffer.subarray(0, GEMINI_INLINE_LIMIT)
        : rawBuffer;
      base64 = processed.toString("base64");
    } else {
      // Legacy FormData upload path
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
      }
      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json({ error: `PDF too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB` }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const rawBuffer = Buffer.from(bytes);
      if (rawBuffer.length < 5 || rawBuffer.subarray(0, 5).toString() !== "%PDF-") {
        return NextResponse.json({ error: "Invalid PDF file — file signature check failed" }, { status: 400 });
      }
      const processed = rawBuffer.length > GEMINI_INLINE_LIMIT
        ? rawBuffer.subarray(0, GEMINI_INLINE_LIMIT)
        : rawBuffer;
      base64 = processed.toString("base64");
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            {
              text: `Extract the key company information from this PDF document. Focus on:
- Company description and mission
- Products/services offered
- Target market/audience
- Unique value proposition
- Any brand values or tone of voice mentioned

Return a clean, well-structured summary text (NOT JSON). Use clear paragraphs. Keep it comprehensive but concise — aim for 300-800 words. Write in the same language as the document.`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });
  } catch (e) {
    console.error("extract-pdf error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF extraction failed" },
      { status: 500 }
    );
  }
}
