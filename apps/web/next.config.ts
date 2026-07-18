import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@saas/contracts", "@saas/ui"],
};

export default nextConfig;
