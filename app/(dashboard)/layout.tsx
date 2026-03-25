"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import {
  BarChart3, BookOpen, Building2, Calendar, ChevronLeft, ChevronRight,
  FolderOpen, Hash, ImageIcon, LogOut, Menu, Moon, Search, Settings, Sparkles, Sun, Swords, TrendingUp, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { signOut } from "@/lib/auth-actions";
import { cn, extractInitials } from "@/lib/utils";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import OnboardingTour from "@/components/OnboardingTour";
import KimzChat from "@/components/KimzChat";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", key: "dashboard" as const, icon: BarChart3 },
  { href: "/companies", key: "companies" as const, icon: Building2 },
  { href: "/planner", key: "planner" as const, icon: Calendar },
  { href: "/vision-studio", key: "visionStudio" as const, icon: Sparkles, badge: "AI" },
  { href: "/hashtags", key: "hashtags" as const, icon: Hash },
  { href: "/competitor-analysis", key: "competitorAnalysis" as const, icon: Swords, badge: "AI" },
  { href: "/insights", key: "insights" as const, icon: TrendingUp },
];

const savedItems = [
  { href: "/my-plans", key: "myPlans" as const, icon: FolderOpen },
  { href: "/my-generations", key: "myGenerations" as const, icon: ImageIcon },
  { href: "/my-competitors", key: "myCompetitors" as const, icon: Swords },
  { href: "/playbook", key: "playbook" as const, icon: BookOpen },
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
                ? "bg-[#f4f6f8] dark:bg-[#1e2030] text-[#23ab7e]"
                : "text-[#8f96a3] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2030] hover:text-[#1a1d2e] dark:hover:text-[#e2e8f0]"
            )}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#23ab7e] to-[#8054b8]",
                  isRtl ? "right-0" : "left-0"
                )}
              />
            )}
            <Icon className={cn("h-7 w-7 shrink-0 transition-colors", isActive && "text-[#23ab7e]")} />
            {!collapsed && (
              <>
                <span className="flex-1">{t[item.key]}</span>
                {item.badge && (
                  <span className="rounded-lg bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-2 py-0.5 text-xs font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}

      <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-[#e8eaef] to-transparent" />
      {!collapsed && (
        <p className="px-4 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#8f96a3]/60">
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
                ? "bg-[#f4f6f8] dark:bg-[#1e2030] text-[#23ab7e]"
                : "text-[#8f96a3] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2030] hover:text-[#1a1d2e] dark:hover:text-[#e2e8f0]"
            )}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#23ab7e] to-[#8054b8]",
                  isRtl ? "right-0" : "left-0"
                )}
              />
            )}
            <Icon className={cn("h-7 w-7 shrink-0 transition-colors", isActive && "text-[#23ab7e]")} />
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
    <div className="border-t-2 border-[#e8eaef] dark:border-[#2a2d3e] p-4">
      <Link
        href="/settings"
        onClick={onNavClick}
        className="flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#8f96a3] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2030] hover:text-[#1a1d2e] dark:hover:text-[#e2e8f0] transition-colors"
      >
        <Settings className="h-7 w-7" />
        {!collapsed && <span>{t.settings}</span>}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-[#8f96a3] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2030] hover:text-[#1a1d2e] dark:hover:text-[#e2e8f0] transition-colors"
        >
          <LogOut className="h-7 w-7" />
          {!collapsed && <span>{t.logout}</span>}
        </button>
      </form>
    </div>
  );
}

/* ═══ Breadcrumbs ═══ */
const PAGE_LABELS: Record<string, { en: string; ar: string }> = {
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  companies: { en: "Companies", ar: "الشركات" },
  planner: { en: "Content Planner", ar: "مخطط المحتوى" },
  "vision-studio": { en: "Vision Studio", ar: "استوديو الرؤية" },
  hashtags: { en: "Hashtag Hub", ar: "مركز الهاشتاقات" },
  "competitor-analysis": { en: "Competitor Analysis", ar: "تحليل المنافسين" },
  insights: { en: "Insights", ar: "التحليلات" },
  "my-plans": { en: "My Plans", ar: "خططي" },
  "my-generations": { en: "My Generations", ar: "صوري" },
  "my-competitors": { en: "My Competitors", ar: "منافسي" },
  playbook: { en: "Playbook", ar: "دليل التشغيل" },
  settings: { en: "Settings", ar: "الإعدادات" },
};

function Breadcrumbs({ pathname, locale }: { pathname: string; locale: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) return null;
  const isRtl = locale === "ar";

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-[#8f96a3] mb-4">
      <Link href="/dashboard" className="hover:text-[#23ab7e] transition-colors">
        {locale === "ar" ? "الرئيسية" : "Home"}
      </Link>
      {segments.map((seg, i) => {
        const label = PAGE_LABELS[seg];
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={seg} className="flex items-center gap-2">
            <span className={isRtl ? "rotate-180" : ""}>/</span>
            {isLast ? (
              <span className="text-[#1a1d2e] font-bold">{label ? label[locale as "en" | "ar"] : seg}</span>
            ) : (
              <Link href={href} className="hover:text-[#23ab7e] transition-colors">
                {label ? label[locale as "en" | "ar"] : seg}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ═══ Mobile Sidebar with Focus Trap ═══ */
function MobileSidebar({
  isRtl,
  locale,
  pathname,
  t,
  onClose,
}: {
  isRtl: boolean;
  locale: string;
  pathname: string;
  t: typeof messages["en"]["nav"] | typeof messages["ar"]["nav"];
  onClose: () => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Focus first focusable element
    const focusables = sidebar.querySelectorAll<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length > 0) focusables[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const elems = sidebar!.querySelectorAll<HTMLElement>(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (elems.length === 0) return;
      const first = elems[0];
      const last = elems[elems.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 lg:hidden transition-opacity duration-200"
        onClick={onClose}
      />
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 z-[60] flex h-full w-72 flex-col overflow-hidden bg-white dark:bg-[#0c0e14] shadow-2xl lg:hidden transition-transform duration-300",
          isRtl ? "right-0 border-l-2 border-[#e8eaef]" : "left-0 border-r-2 border-[#e8eaef]"
        )}
      >
        <div className="flex h-24 items-center justify-between border-b-2 border-[#e8eaef] dark:border-[#2a2d3e] px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-[0_4px_12px_rgba(35,171,126,0.25)]">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1a1d2e] dark:text-[#e2e8f0]">
              {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"}{" "}
              <span className="text-[#8054b8]">AI</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f6f8] text-[#8f96a3] hover:text-[#23ab7e] transition-colors"
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
          onNavClick={onClose}
        />
        <SidebarBottom t={t} collapsed={false} onNavClick={onClose} />
      </aside>
    </>
  );
}

function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return fallback ?? null;
  return children;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState<"none" | "welcome" | "tour">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [localeSwitching, setLocaleSwitching] = useState(false);
  const { user, setUser, locale, setLocale, theme, setTheme, toggleTheme } = useAppStore();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-theme") : null;
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? undefined, user_metadata: u.user_metadata as { full_name?: string; avatar_url?: string; agency_name?: string; agency_type?: string; has_seen_welcome?: boolean } });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined, user_metadata: session.user.user_metadata as { full_name?: string; avatar_url?: string; agency_name?: string; agency_type?: string; has_seen_welcome?: boolean } } : null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const seenWelcome = localStorage.getItem("nawaa-welcome-seen") === "true" || user.user_metadata?.has_seen_welcome === true;
      const seenTour = localStorage.getItem("nawaa-tour-seen") === "true";
      if (!seenWelcome) {
        setOnboardingPhase("welcome");
      } else if (!seenTour) {
        setOnboardingPhase("tour");
      }
    }
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const displayName = user?.email?.split("@")[0] ?? "User";
  const t = messages[locale].nav;
  const isRtl = locale === "ar";
  const sidebarWidth = collapsed ? 84 : 288;

  return (
    <div className="flex min-h-screen bg-[#fafbfd] dark:bg-[#0c0e14] text-[#2d3142] dark:text-[#e2e8f0] text-base transition-colors duration-300">
      {onboardingPhase === "welcome" && (
        <OnboardingWelcome
          onComplete={() => {
            localStorage.setItem("nawaa-welcome-seen", "true");
            // Update Supabase metadata
            const supabase = createClient();
            supabase.auth.updateUser({ data: { has_seen_welcome: true } });
            // Check if tour should start
            const seenTour = localStorage.getItem("nawaa-tour-seen") === "true";
            setOnboardingPhase(seenTour ? "none" : "tour");
          }}
        />
      )}
      {onboardingPhase === "tour" && (
        <OnboardingTour onComplete={() => setOnboardingPhase("none")} />
      )}

      {/* ═══ Desktop Sidebar (lg+) ═══ */}
      <aside
        className={cn(
          "fixed top-0 z-40 hidden lg:flex h-full flex-col overflow-hidden bg-white dark:bg-[#0c0e14] border-[#e8eaef] dark:border-[#2a2d3e] transition-[width] duration-300",
          isRtl ? "right-0 border-l-2" : "left-0 border-r-2"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="flex h-24 items-center justify-between border-b-2 border-[#e8eaef] dark:border-[#2a2d3e] px-5">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-[0_4px_12px_rgba(35,171,126,0.25)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1a1d2e] dark:text-[#e2e8f0]">
                {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"}{" "}
                <span className="text-[#8054b8]">AI</span>
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-[#8f96a3] hover:text-[#23ab7e] hover:bg-[#f4f6f8] rounded-xl"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
        <MobileSidebar
          isRtl={isRtl}
          locale={locale}
          pathname={pathname}
          t={t}
          onClose={() => setMobileOpen(false)}
        />
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
          <header className="sticky top-0 z-30 flex h-20 sm:h-24 items-center gap-3 sm:gap-4 border-b-2 border-[#e8eaef] dark:border-[#2a2d3e] bg-white/80 dark:bg-[#0c0e14]/80 backdrop-blur-sm px-4 sm:px-8">
            {/* Hamburger — visible only on mobile */}
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6f8] text-[#8f96a3] hover:text-[#23ab7e] transition-colors lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div className={cn("relative flex-1 max-w-lg min-w-0", isRtl && "flex-row-reverse")}>
                <Search className={cn(
                  "absolute top-1/2 h-5 w-5 sm:h-6 sm:w-6 -translate-y-1/2 text-[#8f96a3]",
                  isRtl ? "right-4" : "left-4"
                )} />
                <input
                  type="search"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={t.search}
                  className={cn(
                    "h-12 sm:h-14 w-full rounded-xl border-2 border-[#e8eaef] dark:border-[#2a2d3e] bg-[#fafbfd] dark:bg-[#141620] text-base sm:text-lg text-[#2d3142] dark:text-[#e2e8f0] placeholder:text-[#8f96a3]/50 focus:outline-none transition-all focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)]",
                    isRtl ? "pl-10 pr-12" : "pl-12 pr-10"
                  )}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8eaef] text-[#8f96a3] hover:bg-[#23ab7e] hover:text-white transition-colors",
                      isRtl ? "left-3" : "right-3"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLocaleSwitching(true);
                  setLocale(locale === "ar" ? "en" : "ar");
                  setTimeout(() => setLocaleSwitching(false), 400);
                }}
                aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                className={cn(
                  "rounded-xl border-2 px-3 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg font-bold transition-all duration-300",
                  localeSwitching
                    ? "border-[#23ab7e] bg-[#23ab7e] text-white scale-95"
                    : "border-[#e8eaef] text-[#505868] hover:bg-[#f4f6f8] hover:border-[#8054b8]"
                )}
              >
                {locale === "ar" ? "EN" : "عر"}
              </button>
              <ClientOnly fallback={
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] text-lg font-bold text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)]">
                  {extractInitials(displayName)}
                </div>
              }>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="User menu"
                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] text-lg font-bold text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)] transition-shadow hover:shadow-[0_6px_20px_rgba(35,171,126,0.35)]"
                  >
                    {extractInitials(displayName)}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-2 border-[#e8eaef] bg-white text-[#2d3142] rounded-xl p-2"
                  >
                    <DropdownMenuItem className="focus:bg-[#f4f6f8] rounded-lg px-3 py-2.5 text-lg font-bold">
                      {displayName}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-lg p-0">
                      <Link href="/settings" className="w-full flex items-center gap-2 px-3 py-2.5 no-underline text-[#2d3142]">
                        <Settings className="h-4 w-4 text-[#8f96a3]" />{t.settings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-lg p-0">
                      <form action={signOut} className="w-full">
                        <button type="submit" className="w-full text-left px-3 py-2.5 flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-[#8f96a3]" />{t.logout}
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientOnly>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 xl:p-10 scrollbar-nawaa">
            <Breadcrumbs pathname={pathname} locale={locale} />
            {children}
          </main>
        </div>
      </div>

      {/* Kimz AI Chatbot */}
      <KimzChat />
    </div>
  );
}
