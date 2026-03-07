"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Trash2, Download, Maximize2, X, Sparkles, Loader2 } from "lucide-react";
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

export default function MyGenerationsPage() {
  const supabase = createClient();
  const { locale } = useAppStore();

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
    const { data: { user } } = await supabase.auth.getUser();
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
  }, [locale]);

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

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBF8] p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-[#D4EBD9]/50" />
            <div className="h-5 w-96 animate-pulse rounded-xl bg-[#D4EBD9]/30" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-2xl border-2 border-[#D4EBD9] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF8]">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-['Cairo'] text-3xl font-bold text-[#004D26] md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-lg text-[#5A8A6A]">{subtitle}</p>
        </motion.div>

        {/* Empty state */}
        {generations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-white py-24"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#F0F7F2]">
              <ImageIcon className="h-14 w-14 text-[#5A8A6A]" />
            </div>
            <p className="mt-6 text-xl font-medium text-[#5A8A6A]">{noGenerations}</p>
            <p className="mt-1 text-base text-[#5A8A6A]/60">{noGenerationsSub}</p>
            <Button
              asChild
              className="mt-6 h-12 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-8 text-base font-semibold text-white shadow-md"
            >
              <a href="/vision-studio">
                <Sparkles className="mr-2 h-5 w-5" />
                {locale === "ar" ? "افتح استوديو الرؤية" : "Open Vision Studio"}
              </a>
            </Button>
          </motion.div>
        ) : (
          /* Generation groups grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {generations.map((gen, idx) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
              >
                <Card className="group relative overflow-hidden border-2 border-[#D4EBD9] bg-white shadow-sm transition-shadow hover:shadow-md rounded-2xl">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#5A8A6A]">
                          {formatCreatedAt(gen.created_at)}
                        </p>
                        {gen.day_label && (
                          <CardTitle className="mt-1 truncate font-['Cairo'] text-lg font-semibold text-[#004D26]">
                            {gen.day_label}
                          </CardTitle>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === gen.id}
                        onClick={() => handleDelete(gen.id)}
                        className="h-10 w-10 shrink-0 rounded-xl bg-red-500 text-white hover:bg-red-600"
                        title={deleteLabel}
                      >
                        {deletingId === gen.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0">
                    {/* 2x2 image grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {(gen.image_urls ?? []).map((url, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="group/img relative aspect-square overflow-hidden rounded-xl border-2 border-[#D4EBD9] bg-[#F8FBF8]"
                        >
                          <img
                            src={url}
                            alt={`${gen.day_label || "Generation"} - ${imgIdx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
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
                          {/* Hover overlay for each image */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover/img:opacity-100">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setLightboxUrl(url)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[#004D26] shadow-md transition-colors hover:bg-white"
                              title={fullScreenLabel}
                            >
                              <Maximize2 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownload(url)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-md"
                              title={downloadLabel}
                            >
                              <Download className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}

                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxUrl}
                alt=""
                className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
              />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4EBD9] bg-white text-[#004D26] shadow-lg transition-colors hover:bg-[#F0F7F2]"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Download button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(lightboxUrl);
                }}
                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-5 py-3 text-base font-semibold text-white shadow-lg"
              >
                <Download className="h-5 w-5" />
                {downloadLabel}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
