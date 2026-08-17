import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-a8ca4818-5be5-47db-9059-14969c87d8f4.space-z.ai",
  ],
};

export default nextConfig;
// vercel deployment fix