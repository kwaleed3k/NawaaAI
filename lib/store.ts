import { create } from "zustand";

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
  created_at?: string;
  updated_at?: string;
};

type User = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
} | null;

type Store = {
  selectedCompany: Company | null;
  setSelectedCompany: (c: Company | null) => void;
  user: User;
  setUser: (u: User) => void;
  locale: "en" | "ar";
  setLocale: (l: "en" | "ar") => void;
};

export const useStore = create<Store>((set) => ({
  selectedCompany: null,
  setSelectedCompany: (c) => set({ selectedCompany: c }),
  user: null,
  setUser: (u) => set({ user: u }),
  locale: "ar",
  setLocale: (l) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nawaa-locale", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
    set({ locale: l });
  },
}));

export const useAppStore = useStore;
