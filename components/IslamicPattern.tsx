"use client";

type Props = {
  variant?: "star" | "octagon" | "arabesque";
  opacity?: number;
  animated?: boolean;
  className?: string;
};

export function IslamicPattern({ variant = "star", opacity = 0.04, animated = true, className = "" }: Props) {
  const patterns: Record<string, React.ReactNode> = {
    star: (
      <pattern id="nawaa-star" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 2 L38 22 L58 22 L42 34 L48 54 L30 42 L12 54 L18 34 L2 22 L22 22 Z"
              fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M30 8 L35 24 L51 24 L38 33 L43 49 L30 39 L17 49 L22 33 L9 24 L25 24 Z"
              fill="currentColor" fillOpacity="0.3" />
      </pattern>
    ),
    octagon: (
      <pattern id="nawaa-octagon" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect x="10" y="0" width="30" height="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="0" y="10" width="1" height="30" fill="currentColor" fillOpacity="0.3" />
        <rect x="10" y="49" width="30" height="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="49" y="10" width="1" height="30" fill="currentColor" fillOpacity="0.3" />
        <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
        <line x1="40" y1="0" x2="50" y2="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
        <line x1="50" y1="40" x2="40" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
        <line x1="10" y1="50" x2="0" y2="40" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
      </pattern>
    ),
    arabesque: (
      <pattern id="nawaa-arabesque" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.4" />
        <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
        <circle cx="40" cy="40" r="10" fill="currentColor" fillOpacity="0.15" />
        <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
        <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
      </pattern>
    ),
  };

  const patternId = `nawaa-${variant}`;

  return (
    <svg
      className={`absolute inset-0 h-full w-full text-[#C9A84C] ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>{patterns[variant]}</defs>
      <rect width="200%" height="200%" fill={`url(#${patternId})`} />
    </svg>
  );
}
