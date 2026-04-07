import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://shipyard.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
      </head>
      <body className="antialiased bg-black text-white min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
