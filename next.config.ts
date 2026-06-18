import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests",
          },
          { key: "Cache-Control", value: "public, max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
