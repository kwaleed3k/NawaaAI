import Link from "next/link";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBF8] px-6">
      <div className="flex flex-col items-center text-center max-w-lg">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35]/15 via-[#00A352]/10 to-[#7C3AED]/15">
            <span className="text-7xl font-black bg-gradient-to-r from-[#006C35] to-[#7C3AED] bg-clip-text text-transparent">
              404
            </span>
          </div>
          <div className="absolute -right-2 -top-2">
            <Sparkles className="h-7 w-7 text-[#7C3AED]" />
          </div>
        </div>
        <h1 className="mt-8 text-4xl font-black text-[#004D26]">Page Not Found</h1>
        <p className="mt-3 text-lg text-[#5A8A6A]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#D4EBD9] bg-white px-8 py-4 text-lg font-bold text-[#004D26] transition-all hover:border-[#00A352] hover:bg-[#F0F7F2]"
          >
            <ArrowLeft className="h-5 w-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
