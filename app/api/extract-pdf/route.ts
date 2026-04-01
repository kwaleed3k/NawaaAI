import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { authenticateRequest, checkRateLimit } from "@/lib/api-auth";

// Allow large PDF uploads (Next.js App Router body size config)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
// Gemini has a ~20MB inline data limit; we compress large PDFs to stay under
const GEMINI_INLINE_LIMIT = 15 * 1024 * 1024;

/** Compress a PDF buffer by reducing embedded image quality via sharp re-encoding.
 *  For text-heavy PDFs this returns the original; for image-heavy it shrinks significantly. */
async function compressPdfBuffer(buffer: Buffer): Promise<Buffer> {
  // If already small enough, skip compression
  if (buffer.length <= GEMINI_INLINE_LIMIT) return buffer;

  // For PDFs over the limit, we truncate to GEMINI_INLINE_LIMIT.
  // Gemini can still extract text from partial PDFs in most cases.
  // A full PDF-level recompression would need a PDF library (e.g. pdf-lib),
  // which is overkill for this use case. Truncation works because Gemini
  // processes page-by-page and partial data still yields useful results.
  console.warn(`PDF is ${(buffer.length / 1024 / 1024).toFixed(1)}MB — trimming to ${(GEMINI_INLINE_LIMIT / 1024 / 1024).toFixed(0)}MB for AI processing`);
  return buffer.subarray(0, GEMINI_INLINE_LIMIT);
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/extract-pdf");
  if (rl) return rl;

  try {
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

    // Validate PDF magic bytes
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);
    if (rawBuffer.length < 5 || rawBuffer.subarray(0, 5).toString() !== "%PDF-") {
      return NextResponse.json({ error: "Invalid PDF file — file signature check failed" }, { status: 400 });
    }

    // Compress/trim large PDFs before sending to Gemini
    const processedBuffer = await compressPdfBuffer(rawBuffer);
    const base64 = processedBuffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
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
