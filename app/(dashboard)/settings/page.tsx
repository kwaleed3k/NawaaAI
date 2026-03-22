"use client";

import { useState } from "react";
import { Settings, User, Building2, Globe, Sparkles, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

const AGENCY_TYPES = [
  "marketingAgency",
  "creativeStudio",
  "freelancer",
  "inHouseTeam",
  "ecommerceBrand",
  "startup",
  "enterprise",
  "other",
] as const;

export default function SettingsPage() {
  const { user, setUser, locale, setLocale } = useAppStore();
  const t = messages[locale].settings;
  const isRtl = locale === "ar";

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [agencyName, setAgencyName] = useState(user?.user_metadata?.agency_name || "");
  const [agencyType, setAgencyType] = useState(user?.user_metadata?.agency_type || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName, agency_name: agencyName, agency_type: agencyType },
    });
    if (!error && data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        user_metadata: data.user.user_metadata as { full_name?: string; avatar_url?: string; agency_name?: string; agency_type?: string; has_seen_welcome?: boolean },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10 pb-16">
      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#23ab7e] via-[#23ab7e] to-[#8054b8] p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-24 right-40 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.5s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Settings className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">{locale === "ar" ? "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a" : "Settings"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">
            {locale === "ar" ? "\u062e\u0635\u0635 \u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062e\u0635\u064a \u0648\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0648\u0643\u0627\u0644\u062a\u0643" : "Customize your profile and agency preferences"}
          </p>
        </div>
      </div>

      {/* ═══════════════════ SETTINGS GRID ═══════════════════ */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Profile Section ── */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#23ab7e] to-[#1a8a64]" />
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#1a8a64] shadow-lg shadow-[#23ab7e]/20">
                <User className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">{t.profile}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-lg text-[#2d3142] focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.email}</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#f4f6f8] px-5 text-lg text-[#8f96a3] cursor-not-allowed"
                />
                <p className="mt-2 text-lg text-[#8f96a3]">
                  {locale === "ar" ? "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "Email cannot be changed"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Agency Section ── */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#e67af3] to-[#f5c6fa]" />
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e67af3] to-[#f5c6fa] shadow-lg shadow-[#e67af3]/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">{t.agency}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.agencyName}</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder={t.agencyNamePlaceholder}
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-lg text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.agencyType}</label>
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-lg text-[#2d3142] focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all"
                >
                  <option value="">{t.selectType}</option>
                  {AGENCY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Preferences Section (full width) ── */}
        <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl border-2 border-[#e8eaef] bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8054b8] to-[#6d3fa0]" />
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#6d3fa0] shadow-lg shadow-[#8054b8]/20">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">{t.preferences}</h2>
            </div>
            <div>
              <label className="block text-lg font-bold text-[#1a1d2e] mb-4">{t.language}</label>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`relative h-16 rounded-2xl border-2 text-xl font-bold transition-all duration-300 ${
                    locale === "en"
                      ? "border-[#23ab7e] bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#23ab7e]/20"
                      : "border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#23ab7e]/40 hover:shadow-md"
                  }`}
                >
                  {locale === "en" && <Check className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} h-5 w-5 text-white/70`} />}
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("ar")}
                  className={`relative h-16 rounded-2xl border-2 text-xl font-bold transition-all duration-300 ${
                    locale === "ar"
                      ? "border-[#23ab7e] bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-white shadow-lg shadow-[#23ab7e]/20"
                      : "border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#23ab7e]/40 hover:shadow-md"
                  }`}
                >
                  {locale === "ar" && <Check className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} h-5 w-5 text-white/70`} />}
                  {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ SAVE BUTTON ═══════════════════ */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="relative w-full sm:w-auto sm:min-w-[320px] h-16 rounded-2xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] text-xl font-black text-white shadow-xl shadow-[#23ab7e]/20 hover:shadow-2xl hover:shadow-[#23ab7e]/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {saving ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {t.saving}
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                {t.save}
              </>
            )}
          </span>
        </button>
        {saved && (
          <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#f4f6f8] to-[#f4f6f8] border border-[#a6ffea] px-6 py-3 shadow-sm">
            <Check className="h-5 w-5 text-[#1a8a64]" />
            <p className="text-lg font-bold text-[#1a8a64]">{t.saved}</p>
          </div>
        )}
      </div>
    </div>
  );
}
