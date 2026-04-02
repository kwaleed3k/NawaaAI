import { create } from "zustand";

/* ══ Shared Types ══ */

export type Company = {
  id: string;
  user_id: string;
  name: string;
  name_ar?: string | null;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  brand_colors?: string[] | null;
  target_audience?: string | null;
  tone?: string | null;
  platforms?: string[] | null;
  competitors?: string | null;
  unique_value?: string | null;
  brand_analysis?: Record<string, unknown> | null;
  scraped_data?: Record<string, unknown> | null;
  analysis_count?: number;
  created_at?: string;
  updated_at?: string;
};

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    agency_name?: string;
    agency_type?: string;
    has_seen_welcome?: boolean;
  };
} | null;

/* ══ Auth Slice ══ */
interface AuthSlice {
  user: User;
  setUser: (u: User) => void;
}

/* ══ UI Slice ══ */
interface UISlice {
  selectedCompany: Company | null;
  setSelectedCompany: (c: Company | null) => void;
  locale: "en" | "ar";
  setLocale: (l: "en" | "ar") => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
}

/* ══ Combined Store ══ */
type Store = AuthSlice & UISlice;

export const useStore = create<Store>((set) => ({
  // Auth
  user: null,
  setUser: (u) => set({ user: u }),

  // UI
  selectedCompany: null,
  setSelectedCompany: (c) => set({ selectedCompany: c }),
  locale: "en",
  setLocale: (l) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nawaa-locale", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
    set({ locale: l });
  },
  theme: "light",
  setTheme: (t) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nawaa-theme", t);
      document.documentElement.classList.toggle("dark", t === "dark");
    }
    set({ theme: t });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("nawaa-theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    });
  },
}));

// Convenience alias
export const useAppStore = useStore;
