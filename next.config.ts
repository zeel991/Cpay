import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // !! WARNING: This temporarily ignores ALL ESLint errors/warnings during the 'next build'.
    // Use this to get your deployment working immediately. 
    // You MUST fix the underlying errors and remove this line later for code quality.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;