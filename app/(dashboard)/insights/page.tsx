"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

export default function InsightsPage() {
  const { locale } = useAppStore();
  const ti = messages[locale].insights;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-cairo text-3xl font-bold text-[#004D26] md:text-4xl">{ti.pageTitle}</h1>
        <p className="mt-2 text-lg text-[#5A8A6A]">{ti.pageSub}</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-3xl bg-white border-2 border-[#D4EBD9] shadow-sm py-32"
      >
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-[#006C35]/15 to-[#00A352]/10">
            <TrendingUp className="h-16 w-16 text-[#006C35]" />
          </div>
        </div>
        <p className="mt-8 text-4xl font-bold text-[#006C35]">{ti.comingSoon}</p>
        <p className="mt-3 max-w-md text-center text-xl text-[#5A8A6A] leading-relaxed">
          {ti.comingSoonDesc}
        </p>

        {/* Preview cards */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl w-full">
          {[
            { icon: BarChart3, label: ti.engagement, color: "text-[#006C35]", bg: "bg-[#006C35]/10" },
            { icon: PieChart, label: ti.reach, color: "text-[#C9A84C]", bg: "bg-[#C9A84C]/10" },
            { icon: Activity, label: ti.growth, color: "text-[#006C35]", bg: "bg-[#006C35]/10" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-2xl bg-white border-2 border-[#D4EBD9] p-6 text-center shadow-sm"
            >
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}>
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <p className="mt-3 text-lg font-semibold text-[#004D26]">{item.label}</p>
              <div className="mt-2 h-3 w-full rounded-full bg-[#F0F7F2] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352]"
                  initial={{ width: "0%" }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
