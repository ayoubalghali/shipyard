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
  },

  // Silence the font stylesheet warning in CI (fonts load at runtime)
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
