import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Netlify static export doesn't support Next.js Image Optimization API
  images: { unoptimized: true },
};

export default nextConfig;
