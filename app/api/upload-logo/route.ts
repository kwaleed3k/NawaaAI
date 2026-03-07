import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import sharp from "sharp";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

// Extract dominant colors using sharp's stats
async function extractColors(buffer: Buffer): Promise<{ hex: string; name: string }[]> {
  try {
    // Resize to small image for faster processing
    const small = await sharp(buffer).resize(64, 64, { fit: "cover" }).raw().toBuffer({ resolveWithObject: true });
    const { data, info } = small;
    const { width, height, channels } = info;

    // Count pixel colors (quantize to reduce noise)
    const colorMap = new Map<string, number>();
    for (let i = 0; i < data.length; i += channels) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency
    const sorted = [...colorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Filter out very similar colors and near-black/near-white
    const names = ["Primary", "Secondary", "Accent", "Dark", "Light"];
    const colors: { hex: string; name: string }[] = [];
    const usedHexes = new Set<string>();

    for (const [key] of sorted) {
      if (colors.length >= 5) break;
      const [r, g, b] = key.split(",").map(Number);
      const hex = rgbToHex(r, g, b);

      // Skip if too similar to already added
      let tooSimilar = false;
      for (const used of usedHexes) {
        const [ur, ug, ub] = [
          parseInt(used.slice(1, 3), 16),
          parseInt(used.slice(3, 5), 16),
          parseInt(used.slice(5, 7), 16),
        ];
        if (Math.abs(r - ur) + Math.abs(g - ug) + Math.abs(b - ub) < 80) {
          tooSimilar = true;
          break;
        }
      }
      if (tooSimilar) continue;

      usedHexes.add(hex);
      colors.push({ hex, name: names[colors.length] || "Extra" });
    }

    // Fill remaining with fallbacks
    const fallbacks = ["#006C35", "#00A352", "#C9A84C", "#0A1F0F", "#D4EBD9"];
    while (colors.length < 5) {
      colors.push({ hex: fallbacks[colors.length], name: names[colors.length] || "Extra" });
    }

    return colors;
  } catch (err) {
    console.error("Color extraction failed:", err);
    return [
      { hex: "#006C35", name: "Primary" },
      { hex: "#00A352", name: "Secondary" },
      { hex: "#C9A84C", name: "Accent" },
      { hex: "#0A1F0F", name: "Dark" },
      { hex: "#D4EBD9", name: "Light" },
    ];
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension
    const ext = file.type.includes("png") ? "png" : "jpg";
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: file.type || `image/${ext}`,
        upsert: true,
      });

    let publicUrl: string | null = null;

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      // Return base64 data URI as fallback
      const base64 = buffer.toString("base64");
      publicUrl = `data:${file.type};base64,${base64}`;
    } else {
      const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
      publicUrl = data.publicUrl;
    }

    // Extract colors
    const colors = await extractColors(buffer);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      colors: colors.map((c) => c.hex),
      uploadError: uploadError ? uploadError.message : null,
    });
  } catch (e) {
    console.error("upload-logo error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
