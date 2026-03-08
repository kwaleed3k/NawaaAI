"use client";

import { useEffect, useState, useCallback } from "react";
/* framer-motion removed – using plain HTML + CSS transitions */
import { ImageIcon, Trash2, Download, Maximize2, X, Sparkles, Loader2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type GenerationRow = {
  id: string;
  image_urls: string[] | null;
  day_label: string | null;
  prompt_used: string | null;
  company_id: string | null;
  created_at: string;
};

/* ---------- Accent gradient palette cycling per card ---------- */
const cardAccents = [
  "from-[#006C35] via-[#00A352] to-[#2DD17A]",   // green
  "from-[#C9A84C] via-[#E0C068] to-[#F5DC8A]",   // gold
  "from-[#1E6DB8] via-[#3B9AE8] to-[#70C0F5]",   // blue
  "from-[#7B3FA0] via-[#A855F7] to-[#D09CF7]",   // purple
];

const cardBorderHover = [
  "hover:border-[#00A352]",
  "hover:border-[#C9A84C]",
  "hover:border-[#3B9AE8]",
  "hover:border-[#A855F7]",
];

const cardShadowHover = [
  "hover:shadow-lg",
  "hover:shadow-lg",
  "hover:shadow-lg",
  "hover:shadow-lg",
];

/* ---------- Framer Motion Variants ---------- */


export default function MyGenerationsPage() {
  const supabase = createClient();
  const { locale, user } = useAppStore();

  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const title = locale === "ar" ? "معرض الصور" : "My Generations";
  const subtitle = locale === "ar" ? "جميع الصور المولّدة بالذكاء الاصطناعي" : "All your AI-generated images";
  const noGenerations = locale === "ar" ? "لا توجد صور بعد" : "No generations yet";
  const noGenerationsSub = locale === "ar" ? "ابدأ بإنشاء صور من استوديو الرؤية" : "Start creating images from Vision Studio";
  const downloadLabel = locale === "ar" ? "تنزيل" : "Download";
  const deleteLabel = locale === "ar" ? "حذف" : "Delete";
  const fullScreenLabel = locale === "ar" ? "عرض كامل" : "Full screen";

  const fetchGenerations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("generated_images")
      .select("id, image_urls, day_label, prompt_used, company_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(locale === "ar" ? "فشل تحميل الصور" : "Failed to load generations");
      console.error(error);
    } else {
      setGenerations((data as GenerationRow[]) ?? []);
    }
    setLoading(false);
  }, [locale, user]);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("generated_images").delete().eq("id", id);
    if (error) {
      toast.error(locale === "ar" ? "فشل الحذف" : "Failed to delete");
    } else {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success(locale === "ar" ? "تم الحذف" : "Deleted successfully");
    }
    setDeletingId(null);
  }

  function handleDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function formatCreatedAt(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  /* ---------- Loading skeleton with animated gradient sweep ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBF8] p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header skeleton */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8">
            <div className="space-y-3">
              <div className="relative h-10 w-72 overflow-hidden rounded-xl bg-white/20">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
              <div className="relative h-6 w-96 overflow-hidden rounded-xl bg-white/15">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_0.3s] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>
            </div>
          </div>
          {/* Card skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-white"
              >
                {/* Accent bar skeleton */}
                <div className="relative h-1.5 overflow-hidden bg-gradient-to-r from-[#D4EBD9] via-[#A8D5B8] to-[#D4EBD9]">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
                <div className="p-5 space-y-4">
                  {/* Date badge skeleton */}
                  <div className="flex items-center justify-between">
                    <div className="relative h-8 w-48 overflow-hidden rounded-full bg-[#D4EBD9]/40">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#00A352]/10 to-transparent" />
                    </div>
                    <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-[#D4EBD9]/40">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-red-200/30 to-transparent" />
                    </div>
                  </div>
                  {/* Title skeleton */}
                  <div className="relative h-7 w-40 overflow-hidden rounded-lg bg-[#D4EBD9]/30">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_0.2s] bg-gradient-to-r from-transparent via-[#00A352]/10 to-transparent" />
                  </div>
                  {/* Image grid skeleton */}
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="relative aspect-square overflow-hidden rounded-2xl bg-[#D4EBD9]/25"
                      >
                        <div
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00A352]/8 to-transparent"
                          style={{
                            animation: `shimmer 2s infinite ${j * 0.15}s`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Shimmer keyframe injected via style tag */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  /* ---------- Total image count across all generations ---------- */
  const totalImages = generations.reduce(
    (sum, g) => sum + (g.image_urls?.length ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F8FBF8]">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ========== Gradient Banner Header ========== */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10"
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-['Cairo'] text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
                {title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-lg text-white/80">
                <ImageIcon className="h-5 w-5" />
                <span>{subtitle}</span>
              </div>
            </div>
            {/* Count badge */}
            {generations.length > 0 && (
              <div
                className="flex items-center gap-3 self-start rounded-2xl border border-white/20 bg-white/15 px-5 py-3"
              >
                <span className="text-lg font-semibold text-white">
                  {totalImages}
                </span>
                <span className="text-lg text-white/70">
                  {locale === "ar" ? "صورة" : "images"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ========== Empty State ========== */}
        {generations.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-white py-28"
          >
            {/* Animated floating icon in gradient circle */}
            <div
              className="relative"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35]/15 via-[#00A352]/10 to-[#C9A84C]/15">
                <ImageIcon className="h-16 w-16 text-[#00A352]" />
              </div>
              {/* Pulsing sparkles */}
              <div
                className="absolute -right-2 -top-2"
              >
                <Sparkles className="h-7 w-7 text-[#C9A84C]" />
              </div>
              <div
                className="absolute -bottom-1 -left-3"
              >
                <Sparkles className="h-5 w-5 text-[#00A352]" />
              </div>
            </div>

            <p className="mt-8 text-2xl font-bold text-[#004D26]">{noGenerations}</p>
            <p className="mt-2 text-lg text-[#5A8A6A]/70">{noGenerationsSub}</p>
            <a
              href="/vision-studio"
              className="mt-8 inline-flex h-14 items-center rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-10 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#00A352]/25"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              {locale === "ar" ? "افتح استوديو الرؤية" : "Open Vision Studio"}
            </a>
          </div>
        ) : (
          /* ========== Generation Cards Grid ========== */
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {generations.map((gen, idx) => {
              const accentIdx = idx % 4;
              return (
                <div key={gen.id}>
                  <Card
                    className={cn(
                      "group relative overflow-hidden border-2 border-[#D4EBD9] bg-white rounded-2xl transition-all duration-500",
                      "hover:-translate-y-1.5",
                      cardBorderHover[accentIdx],
                      cardShadowHover[accentIdx]
                    )}
                  >
                    {/* Gradient accent bar at top */}
                    <div
                      className={cn(
                        "h-1.5 w-full bg-gradient-to-r",
                        cardAccents[accentIdx]
                      )}
                    />

                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          {/* Date badge */}
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4EBD9] bg-[#F0F7F2] px-3 py-1.5">
                            <Calendar className="h-4 w-4 text-[#00A352]" />
                            <span className="text-sm font-medium text-[#5A8A6A]">
                              {formatCreatedAt(gen.created_at)}
                            </span>
                          </div>
                          {gen.day_label && (
                            <CardTitle className="truncate font-['Cairo'] text-xl font-bold text-[#004D26]">
                              {gen.day_label}
                            </CardTitle>
                          )}
                        </div>
                        {/* Delete button with hover animation */}
                        <div
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === gen.id}
                            onClick={() => handleDelete(gen.id)}
                            className="h-9 w-9 shrink-0 rounded-xl bg-red-50 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30"
                            title={deleteLabel}
                          >
                            {deletingId === gen.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0">
                      {/* 2x2 image grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {(gen.image_urls ?? []).map((url, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="group/img relative aspect-square overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] transition-all duration-300 hover:border-[#00A352]/50"
                          >
                            <img
                              src={url}
                              alt={`${gen.day_label || "Generation"} - ${imgIdx + 1}`}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement("div");
                                  fallback.className =
                                    "absolute inset-0 flex items-center justify-center bg-[#F0F7F2]";
                                  fallback.innerHTML =
                                    '<p class="text-[#5A8A6A] text-sm text-center px-2">Failed to load</p>';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                            {/* Gradient hover overlay */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-t from-[#004D26]/70 via-[#006C35]/40 to-transparent opacity-0 transition-all duration-300 group-hover/img:opacity-100">
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(url)}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/90 text-[#004D26] shadow-lg transition-colors hover:bg-white"
                                title={fullScreenLabel}
                              >
                                <Maximize2 className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(url)}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] text-white shadow-lg transition-shadow hover:shadow-[#00A352]/40"
                                title={downloadLabel}
                              >
                                <Download className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== Lightbox Overlay ========== */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#004D26]/90 via-black/85 to-[#0A1F0F]/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-transparent bg-white text-[#004D26] shadow-xl transition-colors hover:bg-[#F0F7F2]"
              style={{
                backgroundClip: "padding-box",
                borderImage: "linear-gradient(135deg, #006C35, #C9A84C) 1",
                borderImageSlice: 1,
              }}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightboxUrl);
              }}
              className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-7 py-4 text-lg font-bold text-white shadow-xl transition-shadow hover:shadow-2xl hover:shadow-[#00A352]/30"
            >
              <Download className="h-6 w-6" />
              {downloadLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
