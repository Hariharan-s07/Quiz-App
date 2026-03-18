import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google/generative-ai'],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
