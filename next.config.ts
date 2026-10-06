import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Session refresh and auth handling via /api/auth/callback route handler
  // (replaces deprecated middleware.ts pattern)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
