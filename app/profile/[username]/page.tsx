import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProfileClient from "./ProfileClient";
import { MOCK_AGENTS } from "@/lib/mockData";

type Props = { params: { username: string } };

// Pre-render known creator profiles at build time
export function generateStaticParams() {
  const names = Array.from(new Set(MOCK_AGENTS.map((a) => a.creator.name.toLowerCase().replace(/\s+/g, "-"))));
  return names.map((username) => ({ username }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.username).replace(/-/g, " ");
  return {
    title: `${name} — Shipyard Creator`,
    description: `Explore AI agents built by ${name} on Shipyard.`,
    openGraph: {
      title: `${name} on Shipyard`,
      description: `Explore AI agents built by ${name} on Shipyard.`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  // Attempt to fetch creator data server-side for SSG
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/creators/${params.username}`, { next: { revalidate: 300 } });
    if (!res.ok) notFound();
    const data = (await res.json()) as { creator: unknown; agents: unknown[] };
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <ProfileClient initialData={data} username={params.username} />
        <Footer />
      </div>
    );
  } catch {
    // Render client-only fallback if SSG fetch fails (e.g., no DB at build time)
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <ProfileClient initialData={null} username={params.username} />
        <Footer />
      </div>
    );
  }
}
