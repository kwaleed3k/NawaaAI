export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header banner skeleton */}
      <div className="rounded-3xl nl-aurora-bg h-48 sm:h-56" />

      {/* Content cards skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border-2 border-[#e8eaef] bg-white p-6 space-y-4">
            <div className="h-6 w-2/3 rounded-lg bg-[#e8eaef]/50" />
            <div className="h-4 w-full rounded-lg bg-[#e8eaef]/30" />
            <div className="h-4 w-4/5 rounded-lg bg-[#e8eaef]/30" />
            <div className="h-32 rounded-xl bg-[#e8eaef]/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
