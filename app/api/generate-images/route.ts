import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { genAI } from "@/lib/gemini";
import sharp from "sharp";
import { authenticateRequest, checkRateLimit, validateStringInput, MAX_STRING_LENGTH } from "@/lib/api-auth";

/* ══ Constants ══ */
const MAX_COMPANY_NAME_LEN = MAX_STRING_LENGTH;          // 500
const MAX_INSTRUCTIONS_LEN = 2_000;
const MAX_IMAGE_TEXT_LEN = 200;
const MAX_BRAND_COLORS = 5;
const MAX_IMAGES_PER_REQUEST = 4;
const MAX_REFERENCE_IMAGES = 4;
const LOGO_RESIZE = 256;
const LOGO_FETCH_TIMEOUT_MS = 10_000;
const PROMPT_TEMPERATURE = 0.75;
const PROMPT_MAX_TOKENS = 1_800;

/* ══ Content policy — reject prompts that violate platform guidelines ══ */
const BLOCKED_PATTERNS = [
  /\b(nude|naked|nsfw|porn|sex|erotic|gore|violen(t|ce)|weapon|gun|drug|alcohol|beer|wine|tobacco|cigarette|vape|gambling|casino)\b/i,
  /\b(hate|racist|discriminat|terroris|extremis|nazi|supremac)\b/i,
  /\b(child\s*(abuse|exploit)|minor|underage)\b/i,
];

function checkContentPolicy(text: string): string | null {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return "Your prompt contains content that violates our platform guidelines. Please revise and try again.";
    }
  }
  return null;
}

const PROMPT_BUILDER_SYSTEM = `You are an elite commercial photography director and art director who creates prompts for AI image generation. Your goal is to produce images that look like REAL professional photography — NOT AI-generated.

You specialize in creating marketing content for Saudi Arabian brands that looks indistinguishable from real professional photoshoots.

═══ PHOTOREALISM RULES (CRITICAL) ═══

1. CAMERA & LENS: Always specify a real camera + lens combo. Examples:
   - "Shot on Canon EOS R5, 85mm f/1.4 lens" (portraits)
   - "Shot on Sony A7IV, 35mm f/1.8 lens" (lifestyle/wide)
   - "Shot on Hasselblad X2D, 90mm f/2.5 lens" (luxury/product)
   - "Shot on Fujifilm GFX 100S, 110mm f/2 lens" (editorial)

2. LIGHTING: Always specify realistic lighting setups:
   - "Natural window light with white reflector fill"
   - "Golden hour backlight with subtle fill flash"
   - "Two-point studio lighting, key light at 45°, large softbox"
   - "Overcast diffused daylight, no harsh shadows"

3. HUMAN FACES: When people appear:
   - "Clear, sharp facial features with natural skin texture"
   - "Genuine relaxed expression, not posed or stiff"
   - "Natural skin tones, subtle pores visible, no airbrushing"
   - "Eyes in sharp focus with natural catchlights"
   - Avoid: groups of more than 2-3 people (faces degrade in groups)

4. TEXTURES & DETAILS: Make it tangible:
   - "Visible fabric weave on clothing"
   - "Natural wood grain texture on the table"
   - "Condensation droplets on the cold glass"
   - "Micro scratches on the metal surface showing real use"

5. IMPERFECTIONS (key to realism):
   - "Slight depth of field blur on background"
   - "Natural lens vignetting at edges"
   - "Subtle film grain, ISO 400 aesthetic"
   - "One element slightly off-center for natural composition"

6. AVOID these AI tells:
   - NO "hyper-detailed", "ultra-realistic", "8K", "octane render"
   - NO "perfect symmetry" or "perfectly centered"
   - NO glossy/plastic skin on people
   - NO overly saturated or HDR-looking colors
   - NO multiple people with all faces visible (keep it 1-2 people max, or show from behind/profile)
   - NO unnaturally clean or sterile environments — add lived-in details
   - NO perfectly uniform lighting — real photos have subtle light falloff

7. ANTI-AI REALISM (CRITICAL):
   - NEVER produce images that look digitally rendered, CGI, or AI-generated
   - Every image MUST pass as a real photograph taken by a professional photographer
   - Add micro-imperfections: a slightly wrinkled napkin, a small coffee ring stain, natural dust motes in light beams
   - Use natural color grading — slightly muted, not oversaturated. Think analog film, not digital HDR
   - Include real environment context: reflections in glass, shadows that match the light source, ambient occlusion in corners
   - Surfaces should show wear: fingerprints on glass, patina on metal, creases in leather

═══ BRAND COLOR INTEGRATION (CRITICAL — MUST FOLLOW) ═══
- The client's brand colors are NON-NEGOTIABLE. At least 2 brand colors MUST be clearly visible in EVERY image.
- Incorporate brand colors through REAL objects: colored packaging, clothing, walls, props, food items, furniture, accessories, signage, stationery
- For each brand color, suggest specific objects: e.g., #006C35 → clothing, wall paint, packaging, foliage; #7C3AED → jewelry, cushions, coffee cups, frames
- Do NOT apply color filters or unrealistic color grading
- Colors appear naturally: "wearing a deep green (#006C35) linen shirt", "violet (#7C3AED) accent cushion on the sofa"
- If colors are warm (reds, oranges, purples), use warm-toned props and textiles
- If colors are cool (blues, greens), use corresponding natural elements

═══ CLIENT REQUIREMENTS ═══
- Any client requirements provided in the brief OVERRIDE default style choices
- Client instructions are MANDATORY — never ignore or deprioritize them
- If a client requirement conflicts with a style guideline, follow the client requirement

═══ TEXT IN IMAGES ═══
- If the output language is Arabic: you may include SHORT Arabic text (1-3 words max) on a sign, menu, or product label — specify the exact Arabic text in quotes
- If English: same rule, short English text only
- NEVER include long sentences — text degrades in AI generation
- When possible, avoid text entirely and let the visual tell the story

═══ SAUDI CULTURAL CONTEXT ═══
- Modest clothing always (thobes for men, abayas/modest fashion for women)
- Settings: modern Riyadh cafes, Jeddah waterfront, desert glamping, luxury malls, coworking spaces, traditional souks modernized
- Props: Arabic coffee (dallah), dates, oud, Saudi geometric patterns as background elements
- Architecture: mashrabiya screens, modern Saudi skylines, traditional doors with geometric carvings

═══ STYLE DIRECTIONS ═══
- "lifestyle": Candid moment photography. Person interacting naturally with product/brand. Shot on 35mm lens, shallow DOF, warm natural light. Think: magazine editorial for a Saudi lifestyle publication.
- "graphic": Clean flat-lay or product arrangement on textured surface. Top-down or 45° angle. Geometric props that echo Saudi patterns. Shot on 50mm macro, even studio light.
- "luxury": Single hero product/moment with dramatic negative space. Dark moody background with one precise light source. Shot on medium format, razor-thin DOF. Think: Vogue Arabia ad.
- "heritage": Modern-traditional fusion. Contemporary subject framed by traditional Saudi architectural elements. Warm tungsten + cool daylight mix. Shot on 24mm wide angle, deep DOF.

═══ OUTPUT FORMAT ═══
Return ONLY JSON — no explanation:
{
  "prompts": [
    { "id": 1, "style_label": "Hero Shot", "prompt": "..." },
    { "id": 2, "style_label": "Lifestyle", "prompt": "..." },
    { "id": 3, "style_label": "Close-up", "prompt": "..." },
    { "id": 4, "style_label": "Atmosphere", "prompt": "..." }
  ]
}

Each prompt must be 80-120 words. No more.`;

async function fetchLogoAsTransparentBase64(logoUrl: string): Promise<string | null> {
  try {
    let buffer: Buffer;

    if (logoUrl.startsWith("data:")) {
      const base64Part = logoUrl.split(",")[1];
      if (!base64Part) return null;
      buffer = Buffer.from(base64Part, "base64");
    } else {
      const res = await fetch(logoUrl, { signal: AbortSignal.timeout(LOGO_FETCH_TIMEOUT_MS) });
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    }

    const metadata = await sharp(buffer).metadata();

    // If no alpha channel (JPEG etc), make white/light pixels transparent
    if (metadata.format === "jpeg" || metadata.format === "jpg" || !metadata.hasAlpha) {
      const { data, info } = await sharp(buffer)
        .resize(LOGO_RESIZE, LOGO_RESIZE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels = Buffer.from(data);
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        if (r > 230 && g > 230 && b > 230) {
          pixels[i + 3] = 0;
        }
      }

      const transparentBuffer = await sharp(pixels, {
        raw: { width: info.width, height: info.height, channels: 4 },
      }).png().toBuffer();

      return transparentBuffer.toString("base64");
    }

    // Already has alpha, just resize
    const pngBuffer = await sharp(buffer)
      .resize(LOGO_RESIZE, LOGO_RESIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    return pngBuffer.toString("base64");
  } catch (err) {
    console.error("Logo processing error:", err);
    return null;
  }
}

// Try multiple Gemini model names in order of preference
const GEMINI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-3-pro-image-preview",
  "gemini-2.0-flash-preview-image-generation",
];

async function generateImageWithGemini(
  contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>,
  aspectRatio?: string,
): Promise<{ base64: string; mimeType: string } | null> {
  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: contentParts }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          ...(aspectRatio ? { aspectRatio } : {}),
        } as Record<string, unknown>,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((part: any) => part.inlineData?.data);

      if (imagePart?.inlineData) {
        return {
          base64: imagePart.inlineData.data as string,
          mimeType: (imagePart.inlineData.mimeType as string) || "image/png",
        };
      }
      // Model responded but no image — try next model
    } catch (err: any) {
      console.warn(`Model ${modelName} failed:`, err?.message || err);
      // Try next model
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/generate-images");
  if (rl) return rl;

  try {
    const body = await request.json();
    const {
      company,
      dayContent,
      style = "lifestyle",
      additionalInstructions,
      outputLanguage = "ar",
      includeLogo = false,
      logoUrl,
      referenceImages: referenceImagesData = [],
      imageText,
      numImages = 4,
      imageSize = "1:1",
    } = body;

    const imageCount = Math.max(1, Math.min(5, Number(numImages) || 4));
    // Map user sizes to Gemini-supported aspect ratios
    const geminiRatioMap: Record<string, string> = { "1:1": "1:1", "4:5": "3:4", "9:16": "9:16", "16:9": "16:9", "3:4": "3:4" };
    const aspectRatio = geminiRatioMap[imageSize] || "1:1";
    const sizeLabels: Record<string, string> = { "1:1": "square", "4:5": "portrait (Instagram feed 4:5)", "9:16": "vertical (Stories/Reels 9:16)", "16:9": "landscape widescreen (16:9)", "3:4": "portrait (3:4)" };
    const sizeDirective = `Image aspect ratio: ${imageSize} ${sizeLabels[imageSize] || "square"}. Compose the shot to perfectly fill this frame.`;

    if (!company?.name || !dayContent?.topic) {
      return NextResponse.json(
        { error: "Company and dayContent (topic) required" },
        { status: 400 }
      );
    }
    if (typeof company.name !== "string" || company.name.length > MAX_COMPANY_NAME_LEN) {
      return NextResponse.json({ error: `Company name must be under ${MAX_COMPANY_NAME_LEN} characters` }, { status: 400 });
    }
    if (additionalInstructions && typeof additionalInstructions === "string" && additionalInstructions.length > MAX_INSTRUCTIONS_LEN) {
      return NextResponse.json({ error: `Additional instructions must be under ${MAX_INSTRUCTIONS_LEN} characters` }, { status: 400 });
    }
    if (imageText && typeof imageText === "string" && imageText.length > MAX_IMAGE_TEXT_LEN) {
      return NextResponse.json({ error: `Image text must be under ${MAX_IMAGE_TEXT_LEN} characters` }, { status: 400 });
    }

    // Content policy check on all user-provided text
    const textToCheck = [dayContent.topic, additionalInstructions, imageText].filter(Boolean).join(" ");
    const policyViolation = checkContentPolicy(textToCheck);
    if (policyViolation) {
      return NextResponse.json({ error: policyViolation }, { status: 400 });
    }

    // Build brand color instruction string
    const brandColors = (company.brand_colors || []).slice(0, MAX_BRAND_COLORS);
    const colorSuggestions: Record<string, string> = {};
    const colorObjectHints = ["clothing, packaging, wall paint, furniture", "accessories, cushions, frames, stationery", "tableware, signage, textiles, rugs", "backgrounds, props, flowers, food items", "accents, jewelry, bags, ribbons"];
    brandColors.forEach((color: string, i: number) => {
      colorSuggestions[color] = colorObjectHints[i] || "props, accents, backgrounds";
    });
    const colorInstruction = brandColors.length
      ? `⚠️ CRITICAL BRAND COLORS (MUST be prominently visible):\n${brandColors.map((c: string, i: number) => `  • ${c} → use on: ${colorObjectHints[i] || "props, accents, backgrounds"}`).join("\n")}\nAt least 2 of these brand colors MUST be clearly visible in every image. Integrate them through real objects — NOT as color filters.`
      : "";

    // Build language directive
    const langName = outputLanguage === "ar" ? "Arabic" : "English";
    const langDirective = `ALL text elements in the image (signs, labels, menus, packaging) MUST be in ${langName}. Do NOT mix languages.` +
      (outputLanguage === "ar" ? " Use Arabic calligraphy or modern Arabic typography when text appears." : " Use clean modern English typography when text appears.");

    // Build text-on-image directive
    const textDirective = imageText
      ? `Include the text "${imageText}" prominently in the image as a stylish overlay/sign/banner that fits the scene naturally. The text should be in ${langName} and clearly readable.`
      : "Do NOT include any text, words, or letters in the image.";

    const userMsg = [
      `Brand: "${company.name}" — ${company.industry || "general"} industry, ${company.tone || "professional"} tone`,
      additionalInstructions ? `⚠️ MANDATORY CLIENT REQUIREMENTS (must follow exactly): ${additionalInstructions}` : "",
      `Content topic: ${dayContent.topic}`,
      `Platform: ${dayContent.platform || "Instagram"}`,
      colorInstruction,
      `Visual style direction: ${style}`,
      sizeDirective,
      `Language: ${langDirective}`,
      textDirective,
      referenceImagesData.length ? `⚠️ REFERENCE PHOTOS PROVIDED (${referenceImagesData.length} photo(s)): The client uploaded real photos of their actual products/venue/dishes. These are NOT just inspiration — they are the REAL thing. The generated images MUST:\n  1. Recreate the SAME environment/setting as closely as possible (same type of space, same decor style, same surfaces and backgrounds)\n  2. Match the exact visual style, lighting mood, color palette, and atmosphere\n  3. Feature the same products/dishes/items with matching textures, plating, and presentation\n  4. Feel like they were taken in the SAME photoshoot session — same photographer, same location, same day\n  5. If it's a place (restaurant, cafe, store), generate images that look like they were shot IN that exact place\n  6. If it's a product/dish, show the same item from different angles or in complementary compositions` : "",
      includeLogo ? "Composition note: leave a clean corner area (bottom-right preferred) where a logo watermark can be overlaid in post-production." : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Step 1: Use GPT-4o to build photorealistic image prompts
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT_BUILDER_SYSTEM },
        { role: "user", content: userMsg + `\n\n⚠️ Generate exactly ${imageCount} image prompts (not more, not less). Return JSON with "prompts" array containing exactly ${imageCount} items.\n\nReturn JSON only.` },
      ],
      temperature: PROMPT_TEMPERATURE,
      max_tokens: PROMPT_MAX_TOKENS,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const prompts = parsed.prompts ?? [];

    if (!prompts.length) {
      return NextResponse.json({ error: "No prompts generated" }, { status: 500 });
    }

    // Step 1.5: If includeLogo, fetch and prepare logo with transparent bg
    let logoBase64: string | null = null;
    if (includeLogo && logoUrl) {
      logoBase64 = await fetchLogoAsTransparentBase64(logoUrl);
    }

    // Step 2: Generate images with Gemini (try multiple models)
    const images: { id: number; style_label: string; url?: string; prompt_used: string }[] = [];

    // Append photorealism booster to every prompt
    const realisticSuffix = " Photorealistic, shot on a professional camera, natural lighting, real textures, subtle film grain, shallow depth of field. Micro-imperfections visible: natural fabric wrinkles, real surface wear, authentic environment details. Natural color grading — slightly muted tones like analog film, not oversaturated or HDR. Must look like a real photograph, never CGI or digitally rendered.";
    const colorReminder = brandColors.length
      ? ` At least 2 brand colors MUST be clearly visible: ${brandColors.map((c: string, i: number) => `${c} on ${colorObjectHints[i]?.split(",")[0] || "props"}`).join(", ")}.`
      : "";

    for (const p of prompts.slice(0, imageCount)) {
      const fullPrompt = p.prompt + colorReminder + realisticSuffix;

      // Build content parts for Gemini
      const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (logoBase64) {
        contentParts.push({
          text: "Reference: company logo (transparent background). Subtly place this logo in the bottom-right corner of the generated image as a small watermark:",
        });
        contentParts.push({
          inlineData: { mimeType: "image/png", data: logoBase64 },
        });
      }

      // Add reference images
      if (referenceImagesData.length > 0) {
        contentParts.push({
          text: "⚠️ CRITICAL REFERENCE PHOTOS — these are real photos from the client's actual place/products. You MUST replicate the same environment, setting, surfaces, lighting, and vibe as closely as possible. The generated image should look like it was taken in the SAME location during the SAME photoshoot. Match everything: wall colors, table surfaces, decor, plating style, product appearance, spatial layout. Do NOT create a generic scene — recreate THIS specific place/product:",
        });
        for (const refUri of referenceImagesData.slice(0, MAX_REFERENCE_IMAGES)) {
          const [header, base64Data] = refUri.split(",");
          const mimeMatch = header.match(/data:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          contentParts.push({
            inlineData: { mimeType, data: base64Data },
          });
        }
      }

      contentParts.push({ text: `Generate this photorealistic marketing image: ${fullPrompt}` });

      const result = await generateImageWithGemini(contentParts, aspectRatio);

      if (result) {
        const dataUri = `data:${result.mimeType};base64,${result.base64}`;
        images.push({
          id: p.id,
          style_label: p.style_label || `Style ${p.id}`,
          url: dataUri,
          prompt_used: fullPrompt,
        });
      } else {
        images.push({
          id: p.id,
          style_label: p.style_label || `Style ${p.id}`,
          url: undefined,
          prompt_used: fullPrompt,
        });
      }
    }

    return NextResponse.json({ success: true, images });
  } catch (e) {
    console.error("generate-images error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
