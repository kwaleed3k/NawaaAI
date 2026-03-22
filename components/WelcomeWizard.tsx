"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BarChart3, Calendar, ImageIcon, Hash, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
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

export default function WelcomeWizard({ onComplete }: { onComplete: () => void }) {
  const { locale, setLocale, user, setUser } = useAppStore();
  const t = messages[locale].welcome;
  const st = messages[locale].settings;
  const isRtl = locale === "ar";
  const [step, setStep] = useState(0);
  const [agencyName, setAgencyName] = useState("");
  const [agencyType, setAgencyType] = useState("");

  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const features = [
    { icon: BarChart3, title: t.featureBrandAnalysis, desc: t.featureBrandAnalysisDesc, color: "from-[#23ab7e] to-[#8054b8]" },
    { icon: Calendar, title: t.featureContentPlans, desc: t.featureContentPlansDesc, color: "from-[#8054b8] to-[#A78BFA]" },
    { icon: ImageIcon, title: t.featureVisionStudio, desc: t.featureVisionStudioDesc, color: "from-[#8B5CF6] to-[#A78BFA]" },
    { icon: Hash, title: t.featureHashtags, desc: t.featureHashtagsDesc, color: "from-blue-500 to-blue-400" },
  ];

  const handleFinish = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.updateUser({
      data: { has_seen_welcome: true, agency_name: agencyName || undefined, agency_type: agencyType || undefined },
    });
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        user_metadata: data.user.user_metadata as { full_name?: string; avatar_url?: string; agency_name?: string; agency_type?: string; has_seen_welcome?: boolean },
      });
    }
    localStorage.setItem("nawaa-welcome-seen", "true");
    onComplete();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? (isRtl ? -300 : 300) : (isRtl ? 300 : -300), opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? (isRtl ? 300 : -300) : (isRtl ? -300 : 300), opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 3)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#23ab7e]/95 to-[#1a1d2e]/95 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-[#23ab7e]" : i < step ? "w-2 bg-[#8054b8]" : "w-2 bg-[#e8eaef]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-8"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1a1d2e]">{t.welcomeTitle}</h2>
                  <p className="mt-2 text-[#8f96a3]">{t.welcomeSub}</p>
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-8 py-3.5 text-lg font-bold text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)] hover:shadow-[0_6px_20px_rgba(35,171,126,0.35)] transition-all"
                >
                  {t.getStarted} <NextIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Step 1: Feature Overview */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-[#1a1d2e]">{t.featuresTitle}</h2>
                  <p className="mt-1 text-[#8f96a3]">{t.featuresSub}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((f) => (
                    <div key={f.title} className="rounded-xl border border-[#e8eaef] p-4 text-center">
                      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}>
                        <f.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#1a1d2e]">{f.title}</p>
                      <p className="mt-1 text-xs text-[#8f96a3] leading-snug">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Quick Setup */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-[#1a1d2e]">{t.setupTitle}</h2>
                  <p className="mt-1 text-[#8f96a3]">{t.setupSub}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#505868] mb-1.5">{st.language}</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLocale("en")}
                        className={`flex-1 h-11 rounded-xl border-2 text-sm font-semibold transition-all ${
                          locale === "en" ? "border-[#23ab7e] bg-[#f4f6f8] text-[#23ab7e]" : "border-[#e8eaef] text-[#8f96a3]"
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocale("ar")}
                        className={`flex-1 h-11 rounded-xl border-2 text-sm font-semibold transition-all ${
                          locale === "ar" ? "border-[#23ab7e] bg-[#f4f6f8] text-[#23ab7e]" : "border-[#e8eaef] text-[#8f96a3]"
                        }`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#505868] mb-1.5">{st.agencyName}</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder={st.agencyNamePlaceholder}
                      className="h-12 w-full rounded-xl border-2 border-[#e8eaef] bg-[#fafbfd] px-4 text-base text-[#2d3142] placeholder:text-[#8f96a3]/50 focus:outline-none focus:border-[#23ab7e] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#505868] mb-1.5">{st.agencyType}</label>
                    <select
                      value={agencyType}
                      onChange={(e) => setAgencyType(e.target.value)}
                      className="h-12 w-full rounded-xl border-2 border-[#e8eaef] bg-[#fafbfd] px-4 text-base text-[#2d3142] focus:outline-none focus:border-[#23ab7e] transition-all"
                    >
                      <option value="">{st.selectType}</option>
                      {AGENCY_TYPES.map((type) => (
                        <option key={type} value={type}>{st[type]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Ready */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#23ab7e] to-[#8054b8] shadow-lg">
                  <span className="text-4xl">&#x1F389;</span>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1a1d2e]">{t.readyTitle}</h2>
                  <p className="mt-2 text-[#8f96a3]">{t.readySub}</p>
                </div>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#23ab7e] to-[#8054b8] px-8 py-3.5 text-lg font-bold text-white shadow-[0_4px_16px_rgba(35,171,126,0.25)] hover:shadow-[0_6px_20px_rgba(35,171,126,0.35)] transition-all"
                >
                  {t.startExploring} <NextIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {step > 0 && step < 3 && (
          <div className="flex items-center justify-between px-8 pb-8">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-semibold text-[#8f96a3] hover:text-[#23ab7e] transition-colors"
            >
              <BackIcon className="h-4 w-4" /> {t.back}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-xl bg-[#23ab7e] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1a1d2e] transition-colors"
            >
              {t.next} <NextIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Skip button */}
        {step < 3 && (
          <div className="text-center pb-6">
            <button
              type="button"
              onClick={handleFinish}
              className="text-sm text-[#8f96a3] hover:text-[#23ab7e] underline transition-colors"
            >
              {t.skip}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
