import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: "Shipyard — Build & Share AI Agents",
  description:
    "The no-code platform for creating, sharing, and monetizing AI agents. Build powerful agents in minutes without coding.",
  keywords: ["AI agents", "no-code", "AI builder", "Ollama", "Claude AI"],
  openGraph: {
    title: "Shipyard — Build & Share AI Agents",
    description: "Create, share, and monetize AI agents without code.",
    type: "website",
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
