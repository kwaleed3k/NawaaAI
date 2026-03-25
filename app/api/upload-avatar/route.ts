import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.includes("png") ? "png" : "jpg";
    const fileName = `avatars/${user.id}/${Date.now()}.${ext}`;

    // Upload to logos bucket — same as upload-logo route which works
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    console.error("Avatar upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
