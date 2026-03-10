"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="mt-6 text-3xl font-black text-[#004D26]">Something went wrong</h2>
        <p className="mt-3 text-lg text-[#5A8A6A]">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-6 py-3 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#D4EBD9] bg-white px-6 py-3 text-lg font-bold text-[#004D26] transition-all hover:border-[#00A352] hover:bg-[#F0F7F2]"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
