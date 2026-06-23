import type { NextConfig } from "next";

// NEXT_PUBLIC_BASE_PATH must be set WITHOUT a leading slash, e.g.
// hopsworks-api/pythonappp/g2/testagentapp
// With no leading slash the browser resolves asset URLs relative to the page
// URL, which doubles the prefix. The proxy strips the first copy, and the
// Next.js container serves the file at the remaining prefixed path (200).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  assetPrefix: basePath,
  async rewrites() {
    if (!basePath) return [];
    // The proxy strips the prefix before forwarding, so the container receives
    // GET /<basePath>/api/chat. Map that back to /api/chat.
    return [
      {
        source: `/${basePath}/api/:path*`,
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
