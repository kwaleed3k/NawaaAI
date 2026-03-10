import { Sparkles } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBF8]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-lg shadow-[#006C35]/25">
          <Sparkles className="h-10 w-10 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#006C35] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-3 w-3 rounded-full bg-[#00A352] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-3 w-3 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
