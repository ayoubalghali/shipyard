/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/Railway deployment
  output: "standalone",

  // Allow external image domains for avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Silence the font stylesheet warning in CI (fonts load at runtime)
  logging: {
    fetches: { fullUrl: false },
  },

  // Production security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Long-lived cache for static assets (Next.js immutable chunks)
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Service worker — must not be cached
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Power output to ANSI — helps Railway/Render log parsing
  reactStrictMode: true,
};

export default nextConfig;
