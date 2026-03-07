"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3, Building2, Calendar, ChevronLeft, ChevronRight,
  FolderOpen, Hash, ImageIcon, LogOut, Search, Settings, Sparkles, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { signOut } from "@/lib/auth-actions";
import { cn, extractInitials } from "@/lib/utils";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", key: "dashboard" as const, icon: BarChart3 },
  { href: "/companies", key: "companies" as const, icon: Building2 },
  { href: "/planner", key: "planner" as const, icon: Calendar },
  { href: "/vision-studio", key: "visionStudio" as const, icon: Sparkles, badge: "AI" },
  { href: "/hashtags", key: "hashtags" as const, icon: Hash },
  { href: "/insights", key: "insights" as const, icon: TrendingUp },
];

const savedItems = [
  { href: "/my-plans", key: "myPlans" as const, icon: FolderOpen },
  { href: "/my-generations", key: "myGenerations" as const, icon: ImageIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser, locale, setLocale } = useAppStore();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? null });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  const displayName = user?.email?.split("@")[0] ?? "User";
  const t = messages[locale].nav;
  const isRtl = locale === "ar";

  return (
    <div className="flex min-h-screen bg-[#F8FBF8] text-[#0A1F0F] text-base">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 288 }}
        className={cn(
          "fixed top-0 z-40 flex h-full flex-col overflow-hidden bg-white border-[#D4EBD9]",
          isRtl ? "right-0 border-l-2" : "left-0 border-r-2"
        )}
      >
        {/* Logo */}
        <div className="flex h-24 items-center justify-between border-b-2 border-[#D4EBD9] px-5">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_4px_12px_rgba(0,108,53,0.25)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#004D26]">
                {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"}{" "}
                <span className="text-[#00A352]">AI</span>
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-[#5A8A6A] hover:text-[#006C35] hover:bg-[#F0F7F2] rounded-xl"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />) : (isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />)}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-nawaa">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#F0F7F2] text-[#006C35]"
                    : "text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavItem"
                    className={cn(
                      "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#006C35] to-[#00A352]",
                      isRtl ? "right-0" : "left-0"
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-7 w-7 shrink-0 transition-colors", isActive && "text-[#006C35]")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{t[item.key]}</span>
                    {item.badge && (
                      <span className="rounded-lg bg-gradient-to-r from-[#006C35] to-[#00A352] px-2 py-0.5 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {/* Divider + Saved section */}
          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />
          {!collapsed && (
            <p className="px-4 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A8A6A]/60">
              {locale === "ar" ? "المحفوظات" : "Saved"}
            </p>
          )}
          {savedItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#F0F7F2] text-[#006C35]"
                    : "text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavItem"
                    className={cn(
                      "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#006C35] to-[#00A352]",
                      isRtl ? "right-0" : "left-0"
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-7 w-7 shrink-0 transition-colors", isActive && "text-[#006C35]")} />
                {!collapsed && <span className="flex-1">{t[item.key]}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t-2 border-[#D4EBD9] p-4">
          <Link href="/settings" className="flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26] transition-colors">
            <Settings className="h-7 w-7" />
            {!collapsed && <span>{t.settings}</span>}
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26] transition-colors">
              <LogOut className="h-7 w-7" />
              {!collapsed && <span>{t.logout}</span>}
            </button>
          </form>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex flex-1 flex-col" style={isRtl ? { marginRight: collapsed ? 84 : 288 } : { marginLeft: collapsed ? 84 : 288 }}>
        <header className="sticky top-0 z-30 flex h-24 items-center gap-4 border-b-2 border-[#D4EBD9] bg-white/80 backdrop-blur-lg px-8">
          <div className="flex flex-1 items-center gap-3">
            <div className={cn("relative max-w-lg flex-1", isRtl && "flex-row-reverse")}>
              <Search className={cn("absolute top-1/2 h-6 w-6 -translate-y-1/2 text-[#5A8A6A]", isRtl ? "right-4" : "left-4")} />
              <input
                type="search"
                placeholder={t.search}
                className={cn(
                  "h-14 w-full rounded-xl border-2 border-[#D4EBD9] bg-[#F8FBF8] text-lg text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:outline-none transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.08)]",
                  isRtl ? "pl-4 pr-12" : "pl-12 pr-4"
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="rounded-xl border-2 border-[#D4EBD9] px-5 py-2.5 text-lg font-medium text-[#2D5A3D] hover:bg-[#F0F7F2] hover:border-[#00A352] transition-all">
              {locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
            </button>
            <span className="hidden text-lg text-[#5A8A6A] sm:inline">
              AI Credits: <span className="text-[#006C35] font-bold">47</span> {messages[locale].dashboard.creditsRemaining}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] text-lg font-bold text-white shadow-[0_4px_16px_rgba(0,108,53,0.25)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,108,53,0.35)]">
                  {extractInitials(displayName)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] rounded-xl p-2">
                <DropdownMenuItem className="focus:bg-[#F0F7F2] rounded-lg px-3 py-2.5 text-lg">{displayName}</DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5 text-lg">
                  <form action={signOut}><button type="submit" className="w-full text-left">{t.logout}</button></form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 lg:p-10 scrollbar-nawaa">{children}</main>
      </div>
    </div>
  );
}
