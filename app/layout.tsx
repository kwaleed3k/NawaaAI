import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import LocaleSync from "@/components/LocaleSync";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نواة | Nawaa AI — وكالتك التسويقية الذكية",
  description:
    "Saudi Arabia's AI-powered marketing agency platform. Strategy, content calendar, copywriting, and visual content. نواة للذكاء الاصطناعي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${cairo.variable} ${plusJakarta.variable} font-sans antialiased scrollbar-nawaa`}
      >
        <LocaleSync />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!bg-[#004D26] !text-white !text-base !font-semibold !rounded-2xl !shadow-[0_8px_32px_rgba(0,77,38,0.35)] !px-6 !py-4 !min-w-[320px] !max-w-[480px] !border-2 !border-[#00A352]/40",
            duration: 4000,
            success: {
              className: "!bg-[#004D26] !text-white !text-base !font-semibold !rounded-2xl !shadow-[0_8px_32px_rgba(0,77,38,0.35)] !px-6 !py-4 !min-w-[320px] !max-w-[480px] !border-2 !border-[#00A352]/60",
              iconTheme: { primary: "#22c55e", secondary: "#fff" },
            },
            error: {
              className: "!bg-[#7f1d1d] !text-white !text-base !font-semibold !rounded-2xl !shadow-[0_8px_32px_rgba(127,29,29,0.35)] !px-6 !py-4 !min-w-[320px] !max-w-[480px] !border-2 !border-red-400/50",
              iconTheme: { primary: "#fca5a5", secondary: "#fff" },
            },
            loading: {
              className: "!bg-[#004D26] !text-white !text-base !font-semibold !rounded-2xl !shadow-[0_8px_32px_rgba(0,77,38,0.35)] !px-6 !py-4 !min-w-[320px] !max-w-[480px] !border-2 !border-[#7C3AED]/40",
              iconTheme: { primary: "#7C3AED", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
