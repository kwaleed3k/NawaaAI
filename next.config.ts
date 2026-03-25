import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["node-vibrant"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
    // Allow data: URIs for generated images (base64 from Gemini)
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
};

export default nextConfig;
