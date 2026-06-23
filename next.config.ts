import type { NextConfig } from "next";
import { getHopsworksPublicBasePath } from "./lib/hopsworks-public-path";

// Hopsworks serves Python Apps under /hopsworks-api/pythonapp/{project}/{job}/.
// Prefer an explicit NEXT_PUBLIC_BASE_PATH for local overrides, but fall back
// to the injected HOPSWORKS_* vars so the deployed bundle is built with the
// correct public mount automatically.
const basePath = getHopsworksPublicBasePath();

const nextConfig: NextConfig = {
  assetPrefix: basePath,
  async rewrites() {
    if (!basePath) return [];
    // The browser reaches the app through the public Hopsworks mount. If the
    // request arrives at Next with the public prefix intact, map it back to the
    // internal /api/chat route.
    return [
      {
        source: `${basePath}/api/:path*`,
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
