"use client";

type Props = {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

export function AnimatedCounter({ end, suffix = "", prefix = "", className = "" }: Props) {
  return (
    <span className={className}>
      {prefix}{end.toLocaleString()}{suffix}
    </span>
  );
}
