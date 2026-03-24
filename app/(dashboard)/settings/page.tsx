"use client";

import { useState, useRef } from "react";
import {
  Settings,
  User,
  Building2,
  Globe,
  Sparkles,
  Check,
  Lock,
  Eye,
  EyeOff,
  Camera,
  AlertTriangle,
} from "lucide-react";
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

const PASSWORD_MIN_LENGTH = 6;

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "NA";
}

export default function SettingsPage() {
  const { user, setUser, locale, setLocale } = useAppStore();
  const t = messages[locale].settings;
  const isRtl = locale === "ar";

  // Profile state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [agencyName, setAgencyName] = useState(user?.user_metadata?.agency_name || "");
  const [agencyType, setAgencyType] = useState(user?.user_metadata?.agency_type || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Danger zone state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteToast, setDeleteToast] = useState("");

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsDontMatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isPasswordLongEnough = newPassword.length >= PASSWORD_MIN_LENGTH;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    setAvatarError("");

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Ensure the URL includes /public/ for unauthenticated access
      let publicUrl = urlData.publicUrl;
      if (publicUrl && !publicUrl.includes("/public/")) {
        publicUrl = publicUrl.replace("/storage/v1/object/", "/storage/v1/object/public/");
      }

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? undefined,
          user_metadata: data.user.user_metadata as {
            full_name?: string;
            avatar_url?: string;
            agency_name?: string;
            agency_type?: string;
            has_seen_welcome?: boolean;
          },
        });
      }
    } catch {
      setAvatarError(t.avatarError);
      setTimeout(() => setAvatarError(""), 3000);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        user_metadata: data.user.user_metadata as {
          full_name?: string;
          avatar_url?: string;
          agency_name?: string;
          agency_type?: string;
          has_seen_welcome?: boolean;
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordsMatch || !isPasswordLongEnough) return;

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setPasswordMessage({ type: "success", text: t.passwordUpdated });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch {
      setPasswordMessage({ type: "error", text: t.passwordError });
      setTimeout(() => setPasswordMessage(null), 3000);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmText("");
    setDeleteToast(t.deleteContactSupport);
    setTimeout(() => setDeleteToast(""), 4000);
  };

  const strengthBarColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  const initials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10 pb-16">
      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <div className="relative overflow-hidden rounded-3xl nl-aurora-bg p-8 sm:p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8054b8]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#2dd4a0]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-24 right-40 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.5s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Settings className="h-6 w-6 text-[#a6ffea]" />
            </div>
            <span className="text-lg font-bold text-[#a6ffea]/80 tracking-wide">
              {locale === "ar" ? "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a" : "Settings"}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-white/70">
            {locale === "ar"
              ? "\u062e\u0635\u0635 \u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062e\u0635\u064a \u0648\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0648\u0643\u0627\u0644\u062a\u0643"
              : "Customize your profile and agency preferences"}
          </p>
        </div>
      </div>

      {/* ═══════════════════ PROFILE + AVATAR ═══════════════════ */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(35,171,126,0.04), 0 0 0 1.5px #e8eaef" }}>
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #23ab7e, #8054b8)" }} />
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar} className="group relative flex-shrink-0" aria-label={t.uploadAvatar}>
              <div className="absolute -inset-[3px] rounded-full opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)" }} />
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-white overflow-hidden">
                {isUploadingAvatar ? (
                  <svg className="animate-spin h-8 w-8 text-[#8054b8]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-[#8054b8]">{initials}</span>
                )}
                {!isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#2d3142]">{t.profile}</h2>
              <p className="text-base text-[#8f96a3] mt-1">{user?.email}</p>
              {avatarError && <p className="text-sm font-bold text-red-500 mt-1">{avatarError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#2d3142] mb-2">{t.fullName}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-base text-[#2d3142] focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2d3142] mb-2">{t.email}</label>
              <input type="email" value={user?.email || ""} readOnly className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#f4f6f8] px-5 text-base text-[#8f96a3] cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2d3142] mb-2">{t.agencyName}</label>
              <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder={t.agencyNamePlaceholder} className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-base text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2d3142] mb-2">{t.agencyType}</label>
              <select value={agencyType} onChange={(e) => setAgencyType(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-base text-[#2d3142] focus:outline-none focus:border-[#23ab7e] focus:shadow-[0_0_0_3px_rgba(35,171,126,0.08)] transition-all">
                <option value="">{t.selectType}</option>
                {AGENCY_TYPES.map((type) => <option key={type} value={type}>{t[type]}</option>)}
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="mt-6">
            <label className="block text-sm font-bold text-[#2d3142] mb-3">{t.language}</label>
            <div className="flex gap-3 max-w-sm">
              {[{ val: "en" as const, label: "English" }, { val: "ar" as const, label: "العربية" }].map((l) => (
                <button key={l.val} type="button" onClick={() => setLocale(l.val)} className={`flex-1 h-12 rounded-2xl border-2 text-base font-bold transition-all ${locale === l.val ? "border-[#23ab7e] bg-[#23ab7e] text-white" : "border-[#e8eaef] bg-white text-[#8f96a3] hover:border-[#23ab7e]/40"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button type="button" onClick={handleSave} disabled={saving} className="mt-8 relative h-14 px-10 rounded-2xl text-base font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 overflow-hidden border-none cursor-pointer" style={{ background: "linear-gradient(135deg, #23ab7e, #8054b8)", boxShadow: "0 4px 16px rgba(35,171,126,0.25)" }}>
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)", backgroundSize: "300% 100%", animation: "nl-shine 3s ease infinite" }} />
            <span className="relative flex items-center gap-2">{saving ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.saving}</> : <><Sparkles className="h-5 w-5" />{t.save}</>}</span>
          </button>
          {saved && <p className="mt-3 text-sm font-bold text-[#23ab7e] flex items-center gap-1"><Check className="h-4 w-4" />{t.saved}</p>}
        </div>
      </div>

      {/* ═══════════════════ CHANGE PASSWORD ═══════════════════ */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(128,84,184,0.04), 0 0 0 1.5px #e8eaef" }}>
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #8054b8, #e67af3)" }} />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8054b8] to-[#6d3fa0] shadow-lg shadow-[#8054b8]/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1d2e]">{t.changePassword}</h2>
          </div>
          <div className="space-y-6 max-w-lg">
            {/* New Password */}
            <div>
              <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.newPassword}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-lg text-[#2d3142] focus:outline-none focus:border-[#8054b8] focus:shadow-[0_0_0_3px_rgba(128,84,184,0.08)] transition-all"
                  style={{ paddingInlineEnd: "3.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-4" : "right-4"} text-[#8f96a3] hover:text-[#8054b8] transition-colors`}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Strength bars */}
              {newPassword.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < passwordStrength ? strengthBarColors[passwordStrength - 1] : "bg-[#e8eaef]"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Min chars indicator */}
              {newPassword.length > 0 && (
                <p className={`mt-2 text-sm font-semibold flex items-center gap-1.5 ${isPasswordLongEnough ? "text-emerald-600" : "text-[#8f96a3]"}`}>
                  {isPasswordLongEnough && <Check className="h-4 w-4" />}
                  {t.minChars}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg font-bold text-[#1a1d2e] mb-2">{t.confirmPassword}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-[#e8eaef] bg-[#fafbfd] px-5 text-lg text-[#2d3142] focus:outline-none focus:border-[#8054b8] focus:shadow-[0_0_0_3px_rgba(128,84,184,0.08)] transition-all"
                  style={{ paddingInlineEnd: "3.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-4" : "right-4"} text-[#8f96a3] hover:text-[#8054b8] transition-colors`}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Match indicator */}
              {passwordsMatch && (
                <p className="mt-2 text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  {t.passwordsMatch}
                </p>
              )}
              {passwordsDontMatch && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {t.passwordsDontMatch}
                </p>
              )}
            </div>

            {/* Update button */}
            <button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={!passwordsMatch || !isPasswordLongEnough || isUpdatingPassword}
              className="group/btn relative h-14 w-full rounded-2xl bg-gradient-to-r from-[#8054b8] to-[#6d3fa0] text-lg font-black text-white shadow-lg shadow-[#8054b8]/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isUpdatingPassword ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.updatingPassword}
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    {t.updatePassword}
                  </>
                )}
              </span>
            </button>

            {/* Password message toast */}
            {passwordMessage && (
              <div
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 shadow-sm ${
                  passwordMessage.type === "success"
                    ? "bg-gradient-to-r from-[#f4f6f8] to-[#f4f6f8] border border-[#a6ffea]"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <Check className="h-5 w-5 text-[#1a8a64]" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <p className={`text-lg font-bold ${passwordMessage.type === "success" ? "text-[#1a8a64]" : "text-red-600"}`}>
                  {passwordMessage.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════ DANGER ZONE ═══════════════════ */}
      <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200 bg-red-50/50 shadow-lg transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-red-400" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-700">{t.dangerZone}</h2>
          </div>

          <p className="text-lg text-red-600/80 mb-6">
            {locale === "ar"
              ? "\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646\u0647\u0627. \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u0623\u0643\u062f \u0642\u0628\u0644 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629."
              : "Actions in this section are irreversible. Please be certain before proceeding."}
          </p>

          {!showDeleteDialog ? (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="group/btn relative h-14 px-8 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-lg font-black text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t.deleteAccount}
              </span>
            </button>
          ) : (
            <div className="space-y-4 max-w-lg rounded-2xl border-2 border-red-200 bg-white p-6">
              <p className="text-lg font-bold text-red-700">{t.deleteConfirm}</p>
              {agencyName && (
                <div>
                  <label className="block text-sm font-semibold text-red-600 mb-2">
                    {t.typeToConfirm}: <span className="font-black">{agencyName}</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-red-200 bg-[#fafbfd] px-5 text-lg text-[#2d3142] focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] transition-all"
                    placeholder={agencyName}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmText("");
                  }}
                  className="h-12 flex-1 rounded-2xl border-2 border-[#e8eaef] bg-white text-lg font-bold text-[#8f96a3] hover:border-[#8f96a3] transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={agencyName ? deleteConfirmText !== agencyName : false}
                  className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-lg font-bold text-white disabled:opacity-40 hover:scale-[1.02] transition-all"
                >
                  {t.deleteAccount}
                </button>
              </div>
            </div>
          )}

          {/* Delete toast */}
          {deleteToast && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white border border-red-200 px-6 py-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-lg font-bold text-red-600">{deleteToast}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
