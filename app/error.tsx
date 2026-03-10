"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBF8] px-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="mt-8 text-4xl font-black text-[#004D26]">Something went wrong</h1>
        <p className="mt-3 text-lg text-[#5A8A6A]">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#D4EBD9] bg-white px-8 py-4 text-lg font-bold text-[#004D26] transition-all hover:border-[#00A352] hover:bg-[#F0F7F2]"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
