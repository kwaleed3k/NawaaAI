export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#F8FBF8] overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-[#006C35]/[0.06] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-[#00A352]/[0.04] blur-[100px]" />
      </div>
      {children}
    </div>
  );
}
