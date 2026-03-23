"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, Repeat2, Eye, Play, Music, ChevronUp } from "lucide-react";

type Props = {
  platform: string;
  caption: string;
  hashtags: string[];
  companyName: string;
  companyLogo?: string | null;
  contentType?: string;
  postingTime?: string;
  locale?: "en" | "ar";
};

/* ── Phone Frame ── */
function PhoneFrame({ children, platform }: { children: React.ReactNode; platform: string }) {
  const platformColors: Record<string, string> = {
    instagram: "#E1306C",
    tiktok: "#010101",
    x: "#14171A",
    snapchat: "#FFFC00",
    linkedin: "#0077B5",
  };
  const color = platformColors[platform] || "#23ab7e";

  return (
    <div className="relative mx-auto" style={{ width: 320, maxWidth: "100%" }}>
      {/* Phone outer frame */}
      <div className="rounded-[2.5rem] p-[3px]" style={{ background: `linear-gradient(135deg, ${color}60, #2d314240, ${color}40)` }}>
        <div className="rounded-[2.3rem] bg-[#0a0a0a] p-2 overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center mb-1">
            <div className="w-24 h-5 bg-[#0a0a0a] rounded-b-2xl relative z-10 flex items-center justify-center">
              <div className="w-12 h-3.5 bg-[#1a1a1a] rounded-full" />
            </div>
          </div>
          {/* Screen */}
          <div className="rounded-[1.8rem] overflow-hidden bg-white" style={{ minHeight: 500 }}>
            {children}
          </div>
          {/* Home bar */}
          <div className="flex justify-center mt-2">
            <div className="w-32 h-1 bg-[#333] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Instagram Preview ── */
function InstagramPreview({ caption, hashtags, companyName, companyLogo }: Props) {
  const fullCaption = caption + (hashtags.length ? "\n\n" + hashtags.join(" ") : "");
  return (
    <div className="flex flex-col h-full bg-white text-[#262626]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #F77737, #E1306C, #C13584)" }}>
          {companyLogo ? <img src={companyLogo} alt="" className="w-full h-full rounded-full object-cover" /> : companyName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{companyName.toLowerCase().replace(/\s+/g, "")}</p>
          <p className="text-[10px] text-gray-400">Sponsored</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>

      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] flex items-center justify-center relative">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F77737, #C13584)" }}>
            <Eye className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs text-gray-400 font-medium">AI Visual will appear here</p>
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3897F0]" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <Heart className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
          <Send className="w-5 h-5" />
        </div>
        <Bookmark className="w-5 h-5" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-xs font-semibold">2,847 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3 flex-1">
        <p className="text-xs leading-relaxed">
          <span className="font-semibold">{companyName.toLowerCase().replace(/\s+/g, "")} </span>
          {fullCaption.length > 120 ? fullCaption.slice(0, 120) + "..." : fullCaption}
        </p>
        {fullCaption.length > 120 && <p className="text-xs text-gray-400 mt-0.5">more</p>}
      </div>
    </div>
  );
}

/* ── TikTok Preview ── */
function TikTokPreview({ caption, hashtags, companyName, companyLogo }: Props) {
  return (
    <div className="flex flex-col h-full bg-black text-white relative" style={{ minHeight: 500 }}>
      {/* Full screen video placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
          <p className="text-xs text-white/40">Video Preview</p>
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-2 bottom-28 flex flex-col items-center gap-5 z-10">
        <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shrink-0" style={{ background: companyLogo ? "transparent" : "linear-gradient(135deg, #25F4EE, #FE2C55)" }}>
          {companyLogo ? <img src={companyLogo} alt="" className="w-full h-full rounded-full object-cover" /> : companyName.charAt(0)}
        </div>
        {[
          { icon: Heart, label: "24.5K" },
          { icon: MessageCircle, label: "1,205" },
          { icon: Bookmark, label: "3,402" },
          { icon: Share2, label: "Share" },
        ].map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-0.5">
            <a.icon className="w-6 h-6 text-white" />
            <span className="text-[9px] text-white/70">{a.label}</span>
          </div>
        ))}
        {/* Music disc */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border-[3px] border-gray-500 flex items-center justify-center">
          <Music className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-12 p-3 z-10 bg-gradient-to-t from-black/80 to-transparent pt-10">
        <p className="text-[11px] font-semibold mb-1">@{companyName.toLowerCase().replace(/\s+/g, "")}</p>
        <p className="text-[10px] leading-relaxed text-white/90">{caption.length > 100 ? caption.slice(0, 100) + "..." : caption}</p>
        {hashtags.length > 0 && (
          <p className="text-[10px] text-[#25F4EE] mt-1">{hashtags.slice(0, 4).join(" ")}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <Music className="w-3 h-3 text-white/60" />
          <p className="text-[9px] text-white/60">Original Sound — {companyName}</p>
        </div>
      </div>
    </div>
  );
}

/* ── X (Twitter) Preview ── */
function XPreview({ caption, hashtags, companyName, companyLogo }: Props) {
  const fullText = caption + (hashtags.length ? "\n\n" + hashtags.slice(0, 5).join(" ") : "");
  return (
    <div className="flex flex-col h-full bg-white text-[#0F1419]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <ChevronUp className="w-5 h-5 text-gray-500 rotate-[-90deg]" />
        <p className="text-sm font-bold flex-1">Post</p>
      </div>

      {/* Tweet */}
      <div className="flex gap-3 p-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #14171A, #657786)" }}>
          {companyLogo ? <img src={companyLogo} alt="" className="w-full h-full rounded-full object-cover" /> : companyName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold truncate">{companyName}</p>
            <svg viewBox="0 0 22 22" className="w-4 h-4 text-[#1D9BF0] shrink-0" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
          </div>
          <p className="text-xs text-gray-500">@{companyName.toLowerCase().replace(/\s+/g, "")} · 2h</p>

          <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">{fullText.length > 280 ? fullText.slice(0, 280) + "..." : fullText}</p>

          {/* Image placeholder */}
          <div className="mt-3 rounded-2xl bg-gray-100 aspect-video flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <Eye className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Image Preview</p>
            </div>
          </div>

          {/* Time */}
          <p className="text-xs text-gray-500 mt-3">10:30 AM · Mar 23, 2026</p>

          {/* Stats */}
          <div className="flex items-center gap-1 mt-2 py-2 border-y border-gray-100 text-xs text-gray-500">
            <span className="font-bold text-[#0F1419]">42</span> Reposts
            <span className="mx-2">·</span>
            <span className="font-bold text-[#0F1419]">12</span> Quotes
            <span className="mx-2">·</span>
            <span className="font-bold text-[#0F1419]">847</span> Likes
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between py-2 text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <Repeat2 className="w-4 h-4" />
            <Heart className="w-4 h-4" />
            <Bookmark className="w-4 h-4" />
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LinkedIn Preview ── */
function LinkedInPreview({ caption, hashtags, companyName, companyLogo }: Props) {
  return (
    <div className="flex flex-col h-full bg-white text-[#000000E6]">
      <div className="flex items-center gap-2.5 px-3 py-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #0077B5, #00A0DC)" }}>
          {companyLogo ? <img src={companyLogo} alt="" className="w-full h-full rounded-full object-cover" /> : companyName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">{companyName}</p>
          <p className="text-[10px] text-gray-500">1,205 followers · 2h</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs leading-relaxed">{caption.length > 150 ? caption.slice(0, 150) + "...more" : caption}</p>
        {hashtags.length > 0 && <p className="text-xs text-[#0A66C2] mt-1.5">{hashtags.slice(0, 5).join(" ")}</p>}
      </div>

      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-8 h-8 text-gray-300 mx-auto mb-1" />
          <p className="text-[10px] text-gray-400">Image Preview</p>
        </div>
      </div>

      <div className="px-3 py-2 flex items-center gap-1 text-[10px] text-gray-500 border-b border-gray-100">
        <span>👍 🎉 ❤️</span> <span>247 · 18 comments</span>
      </div>

      <div className="flex items-center justify-around py-1.5 text-[10px] text-gray-600 font-semibold">
        {["Like", "Comment", "Repost", "Send"].map((a) => (
          <span key={a} className="px-2 py-1.5">{a}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function PostPreview({ platform, caption, hashtags, companyName, companyLogo, locale }: Props) {
  const [open, setOpen] = useState(false);

  const PreviewComponent = {
    instagram: InstagramPreview,
    tiktok: TikTokPreview,
    x: XPreview,
    linkedin: LinkedInPreview,
  }[platform] || InstagramPreview;

  const platformLabel = {
    instagram: "Instagram",
    tiktok: "TikTok",
    x: "X (Twitter)",
    linkedin: "LinkedIn",
    snapchat: "Snapchat",
  }[platform] || platform;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border-2 border-[#e8eaef] bg-white text-[#8054b8] hover:border-[#8054b8] hover:bg-[#8054b8]/5">
        <Eye className="h-4 w-4" />
        {locale === "ar" ? `معاينة على ${platformLabel}` : `Preview on ${platformLabel}`}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(false)} className="w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-[#8054b8] bg-[#8054b8]/5 text-[#8054b8]">
        {locale === "ar" ? "إخفاء المعاينة" : "Hide Preview"}
      </button>
      <div className="rounded-3xl p-5 sm:p-6" style={{ background: "linear-gradient(170deg, #f7f9fb, #f0fdf8, #f5f0ff)", border: "1.5px solid #e8eaef" }}>
        <p className="text-center text-xs font-bold text-[#8f96a3] uppercase tracking-wider mb-4">
          {locale === "ar" ? `معاينة ${platformLabel}` : `${platformLabel} Preview`}
        </p>
        <PhoneFrame platform={platform}>
          <PreviewComponent
            platform={platform}
            caption={caption}
            hashtags={hashtags}
            companyName={companyName}
            companyLogo={companyLogo}
            locale={locale}
          />
        </PhoneFrame>
      </div>
    </div>
  );
}
