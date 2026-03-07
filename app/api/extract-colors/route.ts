import { NextRequest, NextResponse } from "next/server";
import * as VibrantModule from "node-vibrant";
const Vibrant = (VibrantModule as any).default || VibrantModule;

const FALLBACK_COLORS = [
  { hex: "#006C35", name: "Primary", role: "dominant" as const },
  { hex: "#0B1A0F", name: "Secondary", role: "dark" as const },
  { hex: "#C9A84C", name: "Accent", role: "vibrant" as const },
  { hex: "#172E1F", name: "Dark", role: "dark" as const },
  { hex: "#D0EBDA", name: "Light", role: "muted" as const },
];

function hexFromRgb(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.round(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (!file || !file.size) {
        return NextResponse.json(
          { success: false, error: "No image file" },
          { status: 400 }
        );
      }
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.base64) {
        const base64 = body.base64.replace(/^data:image\/\w+;base64,/, "");
        buffer = Buffer.from(base64, "base64");
      } else if (body.url) {
        const res = await fetch(body.url);
        if (!res.ok) throw new Error("Failed to fetch image URL");
        const arr = await res.arrayBuffer();
        buffer = Buffer.from(arr);
      } else {
        return NextResponse.json(
          { success: false, error: "Send FormData with image, or JSON { base64 } or { url }" },
          { status: 400 }
        );
      }
    }

    if (buffer.length < 100) {
      return NextResponse.json({
        success: true,
        colors: FALLBACK_COLORS,
      });
    }

    const palette = await Vibrant.from(buffer).getPalette();
    const swatches = [
      palette.Vibrant,
      palette.Muted,
      palette.DarkVibrant,
      palette.LightVibrant,
      palette.DarkMuted,
      palette.LightMuted,
    ].filter(Boolean);

    const colors: { hex: string; name: string; role: string }[] = [];
    const roles = ["dominant", "muted", "vibrant", "dark", "light"] as const;
    for (let i = 0; i < 5; i++) {
      const s = swatches[i];
      if (s) {
        const [r, g, b] = s.rgb;
        colors.push({
          hex: hexFromRgb(r, g, b),
          name: i === 0 ? "Primary" : i === 1 ? "Secondary" : i === 2 ? "Accent" : i === 3 ? "Dark" : "Light",
          role: roles[Math.min(i, roles.length - 1)],
        });
      }
    }
    while (colors.length < 5) {
      colors.push(FALLBACK_COLORS[colors.length]);
    }

    return NextResponse.json({
      success: true,
      colors: colors.slice(0, 5),
    });
  } catch (e) {
    console.error("extract-colors", e);
    return NextResponse.json({
      success: true,
      colors: FALLBACK_COLORS,
    });
  }
}
