"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Sparkles, Bot, User,
  Building2, Calendar, ImageIcon, Hash, Swords, TrendingUp, BookOpen, Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/types";

const QUICK_ACTIONS_EN = [
  { icon: Building2, label: "Add a company", color: "from-[#23ab7e] to-teal-500", msg: "How do I add a new company?" },
  { icon: Calendar, label: "Create plan", color: "from-[#f4f6f8]0 to-purple-500", msg: "How do I create a content plan?" },
  { icon: ImageIcon, label: "Generate images", color: "from-pink-500 to-rose-500", msg: "How do I generate AI images?" },
  { icon: Hash, label: "Get hashtags", color: "from-blue-500 to-cyan-500", msg: "How do I generate hashtags?" },
  { icon: Swords, label: "Analyze competitors", color: "from-[#f4f6f8]0 to-orange-500", msg: "How do I analyze competitors?" },
  { icon: TrendingUp, label: "View insights", color: "from-green-500 to-[#23ab7e]", msg: "How do I view my insights?" },
];

const QUICK_ACTIONS_AR = [
  { icon: Building2, label: "إضافة شركة", color: "from-[#23ab7e] to-teal-500", msg: "كيف أضيف شركة جديدة؟" },
  { icon: Calendar, label: "إنشاء خطة", color: "from-[#f4f6f8]0 to-purple-500", msg: "كيف أنشئ خطة محتوى؟" },
  { icon: ImageIcon, label: "توليد صور", color: "from-pink-500 to-rose-500", msg: "كيف أولّد صور بالذكاء الاصطناعي؟" },
  { icon: Hash, label: "هاشتاقات", color: "from-blue-500 to-cyan-500", msg: "كيف أولّد هاشتاقات؟" },
  { icon: Swords, label: "تحليل المنافسين", color: "from-[#f4f6f8]0 to-orange-500", msg: "كيف أحلل المنافسين؟" },
  { icon: TrendingUp, label: "عرض الرؤى", color: "from-green-500 to-[#23ab7e]", msg: "كيف أشاهد رؤى الأداء؟" },
];

/** Render assistant text with **bold** and bullet points styled */
function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        // Bold markers
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <span key={j} className="font-bold text-[#8054b8]">
                {part.slice(2, -2)}
              </span>
            );
          }
          return part;
        });

        // Bullet detection
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="flex items-start gap-3 my-1">
              <span className="mt-2.5 h-2 w-2 rounded-full bg-gradient-to-r from-[#8054b8] to-[#3B82F6] shrink-0" />
              <span>{rendered.length > 0 ? rendered : trimmed.slice(2)}</span>
            </div>
          );
        }

        // Numbered list
        if (/^\d+[\.\)]\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)/)?.[1];
          return (
            <div key={i} className="flex items-start gap-3 my-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8054b8] to-[#3B82F6] text-xs font-bold text-white mt-0.5">
                {num}
              </span>
              <span className="pt-0.5">{rendered}</span>
            </div>
          );
        }

        return (
          <p key={i} className={line.trim() === "" ? "h-3" : ""}>
            {rendered}
          </p>
        );
      })}
    </>
  );
}

export default function KimzChat() {
  const { locale } = useAppStore();
  const t = messages[locale].chat;
  const isRtl = locale === "ar";
  const quickActions = locale === "ar" ? QUICK_ACTIONS_AR : QUICK_ACTIONS_EN;

  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, loading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setChatMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: t.errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ═══ Chat Panel ═══ */}
      {isOpen && (
        <div
          className={`fixed bottom-24 z-50 w-[680px] max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] rounded-3xl border-2 border-[#8054b8]/20 bg-white shadow-[0_24px_80px_rgba(124,58,237,0.18)] flex flex-col overflow-hidden ${
            isRtl ? "left-3 sm:left-6" : "right-3 sm:right-6"
          }`}
          style={{ height: "min(780px, calc(100vh - 8rem))" }}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* ── Header ── */}
          <div className="relative shrink-0 overflow-hidden">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8054b8] via-[#6D28D9] to-[#3B82F6]" />
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-1/2 right-1/3 h-16 w-16 rounded-full bg-white/5 blur-sm" />

            <div className="relative flex items-center justify-between px-7 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-white leading-tight tracking-tight">
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4a0] animate-pulse" />
                    <p className="text-sm text-white/80 font-medium">
                      {t.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* ── Messages Area ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-nawaa bg-gradient-to-b from-[#F5F3FF]/50 to-white">
            {/* Welcome card */}
            {chatMessages.length === 0 && !loading && (
              <div className="space-y-6">
                {/* Welcome bubble */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#3B82F6] shadow-md">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`max-w-[85%] px-5 py-4 rounded-2xl text-base bg-gradient-to-br from-[#F5F3FF] to-[#EEF2FF] text-[#2d3142] border border-[#8054b8]/10 shadow-sm leading-relaxed ${
                      isRtl ? "rounded-tr-sm" : "rounded-tl-sm"
                    }`}
                  >
                    {t.welcome}
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="px-1">
                  <p className="text-sm font-semibold text-[#8f96a3] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {locale === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage(action.msg)}
                          className="group flex items-center gap-3 rounded-2xl border border-[#e8eaef] bg-white px-4 py-4 text-left hover:border-[#8054b8]/30 hover:shadow-md hover:shadow-[#8054b8]/5 transition-all duration-200"
                        >
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-[#505868] group-hover:text-[#8054b8] transition-colors leading-tight">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  msg.role === "user"
                    ? isRtl ? "flex-row" : "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#23ab7e] to-teal-500"
                      : "bg-gradient-to-br from-[#8054b8] to-[#3B82F6]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? `bg-gradient-to-br from-[#8054b8] to-[#6D28D9] text-white ${
                          isRtl ? "rounded-tl-sm" : "rounded-tr-sm"
                        }`
                      : `bg-gradient-to-br from-[#F5F3FF] to-[#EEF2FF] text-[#2d3142] border border-[#8054b8]/10 ${
                          isRtl ? "rounded-tr-sm" : "rounded-tl-sm"
                        }`
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <FormattedText text={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading animation */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#3B82F6] shadow-sm">
                  <Bot className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div
                  className={`px-5 py-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EEF2FF] border border-[#8054b8]/10 shadow-sm ${
                    isRtl ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#8054b8] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-3 w-3 rounded-full bg-[#3B82F6] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-3 w-3 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="shrink-0 border-t border-[#8054b8]/10 bg-white px-6 py-5">
            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                className="flex-1 px-5 py-4 rounded-2xl bg-[#F5F3FF] text-base text-[#2d3142] placeholder:text-[#8f96a3]/50 outline-none focus:ring-2 focus:ring-[#8054b8]/30 border border-[#8054b8]/15 transition-all focus:bg-white"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#3B82F6] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#8054b8]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Send className={`h-6 w-6 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-[#8f96a3]/50">
              {locale === "ar" ? "مدعوم بالذكاء الاصطناعي من نواة" : "Powered by Nawaa AI"}
            </p>
          </div>
        </div>
      )}

      {/* ═══ Floating Button ═══ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 z-50 group flex items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:shadow-[#8054b8]/25 transition-all duration-300 ${
          isRtl ? "left-4 sm:left-6" : "right-4 sm:right-6"
        } ${!hasAnimated ? "animate-pulse-subtle" : ""} ${
          isOpen
            ? "h-16 w-16 bg-gradient-to-br from-red-500 to-pink-500"
            : "h-18 w-18 bg-gradient-to-br from-[#8054b8] via-[#6D28D9] to-[#3B82F6]"
        }`}
        style={isOpen ? {} : { width: 72, height: 72 }}
        aria-label="Chat with Kimz"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <>
            <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
            {/* Notification dot — only show when chat hasn't been opened */}
            {chatMessages.length === 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2dd4a0] opacity-75 animate-ping" />
                <span className="relative inline-flex h-5 w-5 rounded-full bg-[#23ab7e] border-2 border-white" />
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
