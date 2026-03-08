"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3, Building2, Calendar, ChevronLeft, ChevronRight,
  FolderOpen, Hash, ImageIcon, LogOut, Menu, Search, Settings, Sparkles, TrendingUp, X,
} from "lucide-react";
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

function NavLinks({
  collapsed,
  pathname,
  t,
  isRtl,
  locale,
  onNavClick,
}: {
  collapsed: boolean;
  pathname: string;
  t: typeof messages["en"]["nav"] | typeof messages["ar"]["nav"];
  isRtl: boolean;
  locale: string;
  onNavClick?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-nawaa">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-bold transition-all duration-200",
              isActive
                ? "bg-[#F0F7F2] text-[#006C35]"
                : "text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26]"
            )}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#006C35] to-[#00A352]",
                  isRtl ? "right-0" : "left-0"
                )}
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
            onClick={onNavClick}
            className={cn(
              "relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-bold transition-all duration-200",
              isActive
                ? "bg-[#F0F7F2] text-[#006C35]"
                : "text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26]"
            )}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#006C35] to-[#00A352]",
                  isRtl ? "right-0" : "left-0"
                )}
              />
            )}
            <Icon className={cn("h-7 w-7 shrink-0 transition-colors", isActive && "text-[#006C35]")} />
            {!collapsed && <span className="flex-1">{t[item.key]}</span>}
          </Link>
        );
      })}
    </nav>
  );
}


function SidebarBottom({ t, collapsed, onNavClick }: {
  t: typeof messages["en"]["nav"] | typeof messages["ar"]["nav"];
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  return (
    <div className="border-t-2 border-[#D4EBD9] p-4">
      <Link
        href="/settings"
        onClick={onNavClick}
        className="flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26] transition-colors"
      >
        <Settings className="h-7 w-7" />
        {!collapsed && <span>{t.settings}</span>}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#004D26] transition-colors"
        >
          <LogOut className="h-7 w-7" />
          {!collapsed && <span>{t.logout}</span>}
        </button>
      </form>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      if (u) setUser({ id: u.id, email: u.email ?? undefined });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const displayName = user?.email?.split("@")[0] ?? "User";
  const t = messages[locale].nav;
  const isRtl = locale === "ar";
  const sidebarWidth = collapsed ? 84 : 288;

  return (
    <div className="flex min-h-screen bg-[#F8FBF8] text-[#0A1F0F] text-base">

      {/* ═══ Desktop Sidebar (lg+) ═══ */}
      <aside
        className={cn(
          "fixed top-0 z-40 hidden lg:flex h-full flex-col overflow-hidden bg-white border-[#D4EBD9] transition-[width] duration-300",
          isRtl ? "right-0 border-l-2" : "left-0 border-r-2"
        )}
        style={{ width: sidebarWidth }}
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
            {collapsed
              ? (isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />)
              : (isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />)
            }
          </Button>
        </div>

        <NavLinks
          collapsed={collapsed}
          pathname={pathname}
          t={t}
          isRtl={isRtl}
          locale={locale}
        />
        <SidebarBottom t={t} collapsed={collapsed} />
      </aside>

      {/* ═══ Mobile Overlay Sidebar (below lg) ═══ */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={cn(
              "fixed top-0 z-[60] flex h-full w-72 flex-col overflow-hidden bg-white shadow-2xl lg:hidden transition-transform duration-300",
              isRtl ? "right-0 border-l-2 border-[#D4EBD9]" : "left-0 border-r-2 border-[#D4EBD9]"
            )}
          >
            {/* Logo + close */}
            <div className="flex h-24 items-center justify-between border-b-2 border-[#D4EBD9] px-5">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_4px_12px_rgba(0,108,53,0.25)]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#004D26]">
                  {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"}{" "}
                  <span className="text-[#00A352]">AI</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F7F2] text-[#5A8A6A] hover:text-[#006C35] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavLinks
              collapsed={false}
              pathname={pathname}
              t={t}
              isRtl={isRtl}
              locale={locale}
              onNavClick={() => setMobileOpen(false)}
            />
            <SidebarBottom t={t} collapsed={false} onNavClick={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ═══ Main Content ═══ */}
      <div
        className="flex flex-1 flex-col min-w-0 transition-[margin] duration-300"
        style={isRtl
          ? { marginRight: 0 }
          : { marginLeft: 0 }
        }
      >
        <style>{`
          @media (min-width: 1024px) {
            .nawaa-desktop-content {
              ${isRtl ? `margin-right: ${sidebarWidth}px !important;` : `margin-left: ${sidebarWidth}px !important;`}
            }
          }
        `}</style>
        <div className="nawaa-desktop-content flex flex-1 flex-col min-w-0">
          {/* ── Topbar Header ── */}
          <header className="sticky top-0 z-30 flex h-20 sm:h-24 items-center gap-3 sm:gap-4 border-b-2 border-[#D4EBD9] bg-white/80 px-4 sm:px-8">
            {/* Hamburger — visible only on mobile */}
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F7F2] text-[#5A8A6A] hover:text-[#006C35] transition-colors lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div className={cn("relative flex-1 max-w-lg min-w-0", isRtl && "flex-row-reverse")}>
                <Search className={cn(
                  "absolute top-1/2 h-5 w-5 sm:h-6 sm:w-6 -translate-y-1/2 text-[#5A8A6A]",
                  isRtl ? "right-4" : "left-4"
                )} />
                <input
                  type="search"
                  placeholder={t.search}
                  className={cn(
                    "h-12 sm:h-14 w-full rounded-xl border-2 border-[#D4EBD9] bg-[#F8FBF8] text-base sm:text-lg text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 focus:outline-none transition-all focus:border-[#006C35] focus:shadow-[0_0_0_3px_rgba(0,108,53,0.08)]",
                    isRtl ? "pl-4 pr-12" : "pl-12 pr-4"
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="rounded-xl border-2 border-[#D4EBD9] px-3 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg font-medium text-[#2D5A3D] hover:bg-[#F0F7F2] hover:border-[#00A352] transition-all"
              >
                {locale === "ar" ? "EN" : "عر"}
              </button>
              <span className="hidden xl:inline text-lg text-[#5A8A6A]">
                AI Credits: <span className="text-[#006C35] font-bold">47</span>{" "}
                {messages[locale].dashboard.creditsRemaining}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#006C35] to-[#00A352] text-lg font-bold text-white shadow-[0_4px_16px_rgba(0,108,53,0.25)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,108,53,0.35)]"
                >
                  {extractInitials(displayName)}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] rounded-xl p-2"
                >
                  <DropdownMenuItem className="focus:bg-[#F0F7F2] rounded-lg px-3 py-2.5 text-lg">
                    {displayName}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-lg p-0">
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full text-left px-3 py-2.5">{t.logout}</button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 xl:p-10 scrollbar-nawaa">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
