// Deploy config for Vercel - env fallbacks for build time
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "placeholder",
    AI_API_KEY: process.env.AI_API_KEY || "placeholder",
  },
};

export default nextConfig;
