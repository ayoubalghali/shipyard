import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://shipyard.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
  title: {
    default: "Shipyard — Build & Share AI Agents",
    template: "%s — Shipyard",
  },
  description:
    "The no-code platform for creating, sharing, and monetizing AI agents. Build powerful agents in minutes without writing a single line of code.",
  keywords: ["AI agents", "no-code AI", "AI builder", "Ollama", "Claude AI", "automation", "LLM"],
  authors: [{ name: "Shipyard" }],
  creator: "Shipyard",
  openGraph: {
    title: "Shipyard — Build & Share AI Agents",
    description: "Create, share, and monetize AI agents without code. Run locally with Ollama or power up with Claude.",
    url: BASE_URL,
    siteName: "Shipyard",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipyard — Build & Share AI Agents",
    description: "Create, share, and monetize AI agents without code.",
    creator: "@shipyardai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Fonts loaded via <link> in globals.css at runtime (not build time)
    // so they always load correctly in production
    <html lang="en">
      <head>
        {/* Google Fonts — loaded at runtime, not build time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* PWA theme color */}
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Shipyard" />
      </head>
      <body className="antialiased bg-black text-white min-h-screen">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-md focus:text-sm focus:font-medium focus:outline-none"
        >
          Skip to main content
        </a>
        <SessionProvider>
          {children}
          <MobileBottomNav />
        </SessionProvider>
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
