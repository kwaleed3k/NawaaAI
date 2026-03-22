"use client";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "green";
};

export function GlowCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white hover:-translate-y-1 transition-transform duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
