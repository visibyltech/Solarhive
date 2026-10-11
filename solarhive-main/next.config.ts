import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admins can set arbitrary image URLs for products/categories in the
    // admin panel (there's no upload flow), so allow any remote host
    // rather than crashing next/image on unconfigured hostnames.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
