"use client";

import { useEffect, useState } from "react";

/* ─── Section config: position, scale, pose for each scroll zone ─── */
const SECTIONS = [
  { id: "hero",         fromY: 0,    toY: 0.14, x: 88, y: 60, scale: 1.4, pose: "wave",     flip: false },
  { id: "features",     fromY: 0.14, toY: 0.35, x: 90, y: 42, scale: 1.5, pose: "present",  flip: false },
  { id: "how-it-works", fromY: 0.35, toY: 0.50, x: 8,  y: 48, scale: 1.6, pose: "point",    flip: true  },
  { id: "platforms",    fromY: 0.50, toY: 0.63, x: 90, y: 52, scale: 1.3, pose: "excited",  flip: false },
  { id: "pricing",      fromY: 0.63, toY: 0.82, x: 7,  y: 45, scale: 1.5, pose: "think",    flip: true  },
  { id: "cta",          fromY: 0.82, toY: 1.0,  x: 88, y: 52, scale: 1.7, pose: "celebrate",flip: false },
];

function getSection(progress: number) {
  for (const s of SECTIONS) {
    if (progress >= s.fromY && progress < s.toY) return s;
  }
  return SECTIONS[SECTIONS.length - 1];
}

/* ─── Section-specific messages ─── */
const SECTION_MESSAGES: Record<string, { en: string; ar: string }> = {
  wave:      { en: "Hi! I'm Nawaa, your AI marketing assistant", ar: "أهلاً! أنا نواة، مساعدك التسويقي الذكي" },
  present:   { en: "Powerful AI tools to grow your brand",       ar: "أدوات ذكاء اصطناعي لتنمية علامتك التجارية" },
  point:     { en: "Three simple steps to get started",          ar: "ثلاث خطوات بسيطة للبدء" },
  excited:   { en: "Post on all platforms at once!",             ar: "!انشر على جميع المنصات دفعة واحدة" },
  think:     { en: "Pick the plan that fits your goals",         ar: "اختر الخطة المناسبة لأهدافك" },
  celebrate: { en: "Ready to transform your marketing?",         ar: "جاهز لتحويل تسويقك؟" },
};

/* ─── Realistic AI Robot SVG ─── */
function AIRobotSVG({ pose, flip }: { pose: string; flip: boolean }) {
  const leftArm = pose === "wave" ? -50 : pose === "present" ? -25 : pose === "point" ? -55 : pose === "excited" ? -55 : pose === "celebrate" ? -60 : -15;
  const rightArm = pose === "wave" ? 25 : pose === "present" ? 55 : pose === "point" ? 15 : pose === "excited" ? 55 : pose === "celebrate" ? 60 : 15;
  const mouthType = pose === "excited" || pose === "celebrate" ? "big-smile" : pose === "think" ? "hmm" : pose === "wave" ? "open" : "smile";
  const bodyBounce = pose === "excited" || pose === "celebrate" ? "animate-bounce-subtle" : "";

  return (
    <svg
      width="140"
      height="200"
      viewBox="0 0 140 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? "scaleX(-1)" : "none", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))" }}
      className={bodyBounce}
    >
      {/* ── Antenna ── */}
      <line x1="70" y1="16" x2="70" y2="4" stroke="url(#r_antennaG)" strokeWidth="3.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-6 70 16;6 70 16;-6 70 16" dur="2.5s" repeatCount="indefinite" />
      </line>
      <circle cx="70" cy="3" r="5.5" fill="url(#r_orbG)">
        <animate attributeName="r" values="4.5;6.5;4.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* Antenna glow */}
      <circle cx="70" cy="3" r="10" fill="none" stroke="#23ab7e" strokeWidth="0.8" opacity="0.3">
        <animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* ── Head ── */}
      <rect x="30" y="16" width="80" height="58" rx="22" fill="url(#r_headG)" />
      {/* Head highlight */}
      <rect x="36" y="19" width="68" height="20" rx="14" fill="white" opacity="0.12" />
      {/* Head outline */}
      <rect x="30" y="16" width="80" height="58" rx="22" fill="none" stroke="url(#r_headStroke)" strokeWidth="2" />

      {/* Face visor */}
      <rect x="38" y="26" width="64" height="40" rx="16" fill="#0a1a12" />
      {/* Visor reflection */}
      <rect x="40" y="28" width="58" height="14" rx="10" fill="white" opacity="0.06" />

      {/* ── Eyes ── */}
      {/* Left eye */}
      <circle cx="54" cy="43" r="9" fill="#111" />
      <circle cx="54" cy="43" r="7.5" fill="url(#r_eyeGreenG)">
        <animate attributeName="r" values="7.5;1.5;7.5" dur="3.5s" repeatCount="indefinite" begin="2s" />
      </circle>
      <circle cx="56" cy="40" r="2.5" fill="white" opacity="0.85" />
      <circle cx="52" cy="45" r="1.2" fill="white" opacity="0.4" />

      {/* Right eye */}
      <circle cx="86" cy="43" r="9" fill="#111" />
      <circle cx="86" cy="43" r="7.5" fill="url(#r_eyePurpleG)">
        <animate attributeName="r" values="7.5;1.5;7.5" dur="3.5s" repeatCount="indefinite" begin="2s" />
      </circle>
      <circle cx="88" cy="40" r="2.5" fill="white" opacity="0.85" />
      <circle cx="84" cy="45" r="1.2" fill="white" opacity="0.4" />

      {/* ── Mouth ── */}
      {mouthType === "big-smile" && (
        <>
          <path d="M55 57 Q70 68 85 57" stroke="#a6ffea" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <animate attributeName="d" values="M55 57 Q70 68 85 57;M55 55 Q70 70 85 55;M55 57 Q70 68 85 57" dur="1.2s" repeatCount="indefinite" />
          </path>
          <path d="M60 58 Q70 65 80 58" fill="#23ab7e" opacity="0.3" />
        </>
      )}
      {mouthType === "open" && (
        <>
          <ellipse cx="70" cy="58" rx="8" ry="5" fill="#0d2818" stroke="#a6ffea" strokeWidth="1.5" />
          <ellipse cx="70" cy="59" rx="5" ry="2.5" fill="#23ab7e" opacity="0.4" />
        </>
      )}
      {mouthType === "smile" && (
        <path d="M58 56 Q70 64 82 56" stroke="#a6ffea" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {mouthType === "hmm" && (
        <>
          <ellipse cx="70" cy="58" rx="6" ry="5" fill="#0d2818" stroke="#a6ffea" strokeWidth="1.2">
            <animate attributeName="rx" values="6;7;6" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="70" cy="59" rx="3" ry="2" fill="#8054b8" opacity="0.3" />
        </>
      )}

      {/* ── Ear modules ── */}
      <rect x="20" y="35" width="13" height="22" rx="6" fill="url(#r_earG)" stroke="#1a8a64" strokeWidth="1" />
      <rect x="22" y="39" width="9" height="5" rx="2.5" fill="#a6ffea" opacity="0.3" />
      <rect x="107" y="35" width="13" height="22" rx="6" fill="url(#r_earG)" stroke="#1a8a64" strokeWidth="1" />
      <rect x="109" y="39" width="9" height="5" rx="2.5" fill="#a6ffea" opacity="0.3" />

      {/* ── Neck ── */}
      <rect x="58" y="74" width="24" height="10" rx="4" fill="url(#r_neckG)" />
      <rect x="62" y="76" width="16" height="6" rx="3" fill="#a6ffea" opacity="0.1" />

      {/* ── Body / Torso ── */}
      <rect x="32" y="82" width="76" height="58" rx="18" fill="url(#r_bodyG)" />
      {/* Body outline */}
      <rect x="32" y="82" width="76" height="58" rx="18" fill="none" stroke="url(#r_bodyStroke)" strokeWidth="1.5" />
      {/* Body highlight */}
      <rect x="38" y="85" width="64" height="16" rx="10" fill="white" opacity="0.08" />

      {/* Chest core */}
      <circle cx="70" cy="108" r="12" fill="#0a1a12" stroke="#1a8a64" strokeWidth="1" />
      <circle cx="70" cy="108" r="8" fill="url(#r_coreG)">
        <animate attributeName="r" values="6;9;6" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Core glow ring */}
      <circle cx="70" cy="108" r="14" fill="none" stroke="#23ab7e" strokeWidth="0.6" opacity="0.2">
        <animate attributeName="r" values="12;18;12" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Chest panel lines */}
      <line x1="44" y1="94" x2="58" y2="94" stroke="#a6ffea" strokeWidth="0.8" opacity="0.25" />
      <line x1="82" y1="94" x2="96" y2="94" stroke="#a6ffea" strokeWidth="0.8" opacity="0.25" />
      <line x1="44" y1="122" x2="58" y2="122" stroke="#a6ffea" strokeWidth="0.8" opacity="0.25" />
      <line x1="82" y1="122" x2="96" y2="122" stroke="#a6ffea" strokeWidth="0.8" opacity="0.25" />
      {/* Small indicator dots */}
      <circle cx="48" cy="98" r="2" fill="#23ab7e" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="92" cy="98" r="2" fill="#8054b8" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>

      {/* ── Left arm ── */}
      <g style={{ transformOrigin: "34px 90px", transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }} transform={`rotate(${leftArm} 34 90)`}>
        {/* Upper arm */}
        <rect x="10" y="84" width="26" height="14" rx="7" fill="url(#r_armG)" stroke="#1a8a64" strokeWidth="1" />
        {/* Elbow joint */}
        <circle cx="12" cy="91" r="5" fill="#2dc98e" stroke="#1a8a64" strokeWidth="1" />
        {/* Hand */}
        <circle cx="6" cy="91" r="9" fill="url(#r_handLG)" stroke="#1a8a64" strokeWidth="1.2" />
        <circle cx="6" cy="91" r="4" fill="#a6ffea" opacity="0.15" />
        {/* Fingers hint */}
        <circle cx="0" cy="87" r="3" fill="#23ab7e" opacity="0.6" />
        <circle cx="-2" cy="92" r="2.5" fill="#23ab7e" opacity="0.5" />
        {pose === "wave" && (
          <g>
            <animateTransform attributeName="transform" type="rotate" values="-12 6 91;12 6 91;-12 6 91" dur="0.5s" repeatCount="indefinite" />
          </g>
        )}
      </g>

      {/* ── Right arm ── */}
      <g style={{ transformOrigin: "106px 90px", transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }} transform={`rotate(${rightArm} 106 90)`}>
        {/* Upper arm */}
        <rect x="104" y="84" width="26" height="14" rx="7" fill="url(#r_armG)" stroke="#6a3fa0" strokeWidth="1" />
        {/* Elbow joint */}
        <circle cx="128" cy="91" r="5" fill="#9a6cd4" stroke="#6a3fa0" strokeWidth="1" />
        {/* Hand */}
        <circle cx="134" cy="91" r="9" fill="url(#r_handRG)" stroke="#6a3fa0" strokeWidth="1.2" />
        <circle cx="134" cy="91" r="4" fill="#e67af3" opacity="0.12" />
        {/* Fingers hint */}
        <circle cx="140" cy="87" r="3" fill="#8054b8" opacity="0.6" />
        <circle cx="142" cy="92" r="2.5" fill="#8054b8" opacity="0.5" />
        {pose === "point" && (
          <>
            <line x1="142" y1="88" x2="155" y2="82" stroke="#8054b8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="157" cy="81" r="3" fill="#e67af3" opacity="0.6">
              <animate attributeName="r" values="2;4;2" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>

      {/* ── Legs ── */}
      {/* Left leg */}
      <rect x="42" y="138" width="18" height="28" rx="9" fill="url(#r_legG)" stroke="#1a8a64" strokeWidth="1" />
      <rect x="44" y="140" width="14" height="8" rx="5" fill="white" opacity="0.06" />
      {/* Left foot */}
      <ellipse cx="51" cy="170" rx="14" ry="8" fill="url(#r_footLG)" stroke="#1a8a64" strokeWidth="1" />
      <ellipse cx="49" cy="168" rx="6" ry="3" fill="white" opacity="0.08" />

      {/* Right leg */}
      <rect x="80" y="138" width="18" height="28" rx="9" fill="url(#r_legG)" stroke="#6a3fa0" strokeWidth="1" />
      <rect x="82" y="140" width="14" height="8" rx="5" fill="white" opacity="0.06" />
      {/* Right foot */}
      <ellipse cx="89" cy="170" rx="14" ry="8" fill="url(#r_footRG)" stroke="#6a3fa0" strokeWidth="1" />
      <ellipse cx="87" cy="168" rx="6" ry="3" fill="white" opacity="0.08" />

      {/* ── Ground shadow ── */}
      <ellipse cx="70" cy="186" rx="38" ry="6" fill="rgba(0,0,0,0.1)">
        <animate attributeName="rx" values="36;40;36" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* ── Sparkle effects for excited/celebrate ── */}
      {(pose === "celebrate" || pose === "excited") && (
        <>
          <path d="M12 20 L14 14 L16 20 L22 18 L16 22 L18 28 L14 24 L10 28 L12 22 L6 20 Z" fill="#e67af3" opacity="0.8">
            <animate attributeName="opacity" values="0;0.9;0" dur="0.9s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" values="0 14 20;180 14 20;360 14 20" dur="1.8s" repeatCount="indefinite" />
          </path>
          <path d="M122 14 L124 8 L126 14 L132 12 L126 16 L128 22 L124 18 L120 22 L122 16 L116 14 Z" fill="#23ab7e" opacity="0.8">
            <animate attributeName="opacity" values="0;0.9;0" dur="0.9s" repeatCount="indefinite" begin="0.3s" />
            <animateTransform attributeName="transform" type="rotate" values="0 124 14;-180 124 14;-360 124 14" dur="1.8s" repeatCount="indefinite" begin="0.3s" />
          </path>
          <circle cx="25" cy="8" r="2.5" fill="#a6ffea">
            <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="cy" values="12;2;12" dur="0.7s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="115" cy="4" r="2" fill="#8054b8">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="cy" values="8;0;8" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="70" cy="0" r="2" fill="#e67af3">
            <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </>
      )}

      {/* ── Thought bubble for "think" ── */}
      {pose === "think" && (
        <>
          <circle cx="24" cy="22" r="4" fill="white" stroke="#d4d8e0" strokeWidth="1.2">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="14" cy="12" r="6" fill="white" stroke="#d4d8e0" strokeWidth="1.2">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <ellipse cx="2" cy="0" rx="14" ry="10" fill="white" stroke="#d4d8e0" strokeWidth="1.2">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </ellipse>
          <text x="2" y="2" textAnchor="middle" fontSize="6" fill="#8054b8" fontWeight="800">💰</text>
        </>
      )}

      {/* ── Gradients ── */}
      <defs>
        <linearGradient id="r_headG" x1="30" y1="16" x2="110" y2="74">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#2dc98e" />
          <stop offset="100%" stopColor="#4aafbb" />
        </linearGradient>
        <linearGradient id="r_headStroke" x1="30" y1="16" x2="110" y2="74">
          <stop offset="0%" stopColor="#1a8a64" />
          <stop offset="100%" stopColor="#3d8fb8" />
        </linearGradient>
        <linearGradient id="r_bodyG" x1="32" y1="82" x2="108" y2="140">
          <stop offset="0%" stopColor="#23ab7e" />
          <stop offset="35%" stopColor="#2a9e8a" />
          <stop offset="65%" stopColor="#5a7cbf" />
          <stop offset="100%" stopColor="#8054b8" />
        </linearGradient>
        <linearGradient id="r_bodyStroke" x1="32" y1="82" x2="108" y2="140">
          <stop offset="0%" stopColor="#1a8a64" />
          <stop offset="100%" stopColor="#6a3fa0" />
        </linearGradient>
        <linearGradient id="r_armG" x1="0" y1="84" x2="140" y2="98">
          <stop offset="0%" stopColor="#2dc98e" />
          <stop offset="100%" stopColor="#9a6cd4" />
        </linearGradient>
        <linearGradient id="r_legG" x1="42" y1="138" x2="98" y2="166">
          <stop offset="0%" stopColor="#1e9e72" />
          <stop offset="100%" stopColor="#7a52b0" />
        </linearGradient>
        <linearGradient id="r_earG" x1="20" y1="35" x2="20" y2="57">
          <stop offset="0%" stopColor="#b0ffe8" />
          <stop offset="100%" stopColor="#23ab7e" />
        </linearGradient>
        <linearGradient id="r_neckG" x1="58" y1="74" x2="82" y2="84">
          <stop offset="0%" stopColor="#2aaa80" />
          <stop offset="100%" stopColor="#6a70b8" />
        </linearGradient>
        <linearGradient id="r_antennaG" x1="70" y1="16" x2="70" y2="4">
          <stop offset="0%" stopColor="#23ab7e" />
          <stop offset="100%" stopColor="#8054b8" />
        </linearGradient>
        <radialGradient id="r_orbG" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#a6ffea" />
          <stop offset="100%" stopColor="#23ab7e" />
        </radialGradient>
        <radialGradient id="r_eyeGreenG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#6fffcc" />
          <stop offset="60%" stopColor="#23ab7e" />
          <stop offset="100%" stopColor="#0d6b4a" />
        </radialGradient>
        <radialGradient id="r_eyePurpleG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#d4a6ff" />
          <stop offset="60%" stopColor="#8054b8" />
          <stop offset="100%" stopColor="#4a2880" />
        </radialGradient>
        <radialGradient id="r_coreG" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#a6ffea" />
          <stop offset="40%" stopColor="#23ab7e" />
          <stop offset="80%" stopColor="#8054b8" />
          <stop offset="100%" stopColor="#e67af3" />
        </radialGradient>
        <radialGradient id="r_handLG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#5aedc0" />
          <stop offset="100%" stopColor="#1a8a64" />
        </radialGradient>
        <radialGradient id="r_handRG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#c9a0f0" />
          <stop offset="100%" stopColor="#6a3fa0" />
        </radialGradient>
        <linearGradient id="r_footLG" x1="37" y1="166" x2="65" y2="178">
          <stop offset="0%" stopColor="#1e9e72" />
          <stop offset="100%" stopColor="#1a8a64" />
        </linearGradient>
        <linearGradient id="r_footRG" x1="75" y1="166" x2="103" y2="178">
          <stop offset="0%" stopColor="#7a52b0" />
          <stop offset="100%" stopColor="#6a3fa0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Speech Bubble ─── */
function SpeechBubble({ pose, flip, locale }: { pose: string; flip: boolean; locale: string }) {
  const msg = SECTION_MESSAGES[pose] || SECTION_MESSAGES.wave;
  const text = locale === "ar" ? msg.ar : msg.en;

  return (
    <div
      className="absolute rounded-2xl font-bold shadow-xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1.5px solid rgba(35,171,126,0.3)",
        color: "#1a1d2e",
        padding: "8px 14px",
        fontSize: "12px",
        maxWidth: "180px",
        whiteSpace: "normal" as const,
        lineHeight: "1.4",
        top: "-24px",
        [flip ? "right" : "left"]: "105%",
        boxShadow: "0 8px 32px rgba(35,171,126,0.15), 0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        {text}
      </span>
      {/* Triangle pointer */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0 h-0"
        style={{
          [flip ? "right" : "left"]: "-8px",
          borderTop: "7px solid transparent",
          borderBottom: "7px solid transparent",
          [flip ? "borderLeft" : "borderRight"]: "8px solid rgba(255,255,255,0.95)",
        }}
      />
    </div>
  );
}

/* ─── Main AI Character Component ─── */
export default function AICharacter({ locale = "en" }: { locale?: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 1024);
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted || isMobile) return null;

  const section = getSection(scrollProgress);

  return (
    <div
      className="fixed pointer-events-none z-40"
      style={{
        left: `${section.x}%`,
        top: `${section.y}%`,
        transform: `translate(-50%, -50%) scale(${section.scale})`,
        transition: "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="relative">
        <SpeechBubble pose={section.pose} flip={section.flip} locale={locale} />
        <div style={{ animation: "float 5s ease-in-out infinite" }}>
          <AIRobotSVG pose={section.pose} flip={section.flip} />
        </div>
      </div>
    </div>
  );
}
