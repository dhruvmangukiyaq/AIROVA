import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default bundler in Next 16 — no config needed.

  images: {
    // Products live in /public/images, so only local patterns are allowed.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/icon.png", search: "" },
      { pathname: "/apple-icon.png", search: "" },
    ],
    // Longer cache: catalogue art changes rarely, fewer revalidations on Vercel.
    minimumCacheTTL: 60 * 60 * 24,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
