"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/agents/FavoriteButton";

interface FavoriteAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usage_count: number;
  status: string;
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    image: string | null;
  };
}

interface FavoriteEntry {
  id: string;
  created_at: string;
  agent: FavoriteAgent;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch("/api/user/favorites?limit=50")
      .then((r) => r.json())
      .then((d: { favorites?: FavoriteEntry[]; total?: number }) => {
        setFavorites(d.favorites ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setLoading(false));
  }, [status, router]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-1">My Favorites</h1>
          <p className="text-[#6B7280] text-sm">
            {loading ? "Loading…" : `${total} saved agent${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-[#0A0E27] border border-[#2A3A4E] animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🤍</div>
            <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
            <p className="text-[#6B7280] text-sm mb-6">
              Browse agents and click the heart icon to save them here.
            </p>
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Explore Agents
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(({ id, agent }, idx) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4 flex flex-col hover:border-[#2563EB] hover:shadow-lg transition-all group"
                >
                  {/* Creator row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#1A2332] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {agent.creator.image || agent.creator.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={agent.creator.image ?? agent.creator.avatar_url ?? ""}
                            alt={agent.creator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[#A3A3A3]">
                            {agent.creator.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B7280] truncate">{agent.creator.name}</span>
                    </div>
                    <FavoriteButton agentId={agent.id} initialFavorited size="sm" />
                  </div>

                  {/* Agent info */}
                  <Link href={`/agent/${agent.id}`} className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#00D9FF] transition-colors mb-1 line-clamp-1">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-[#A3A3A3] line-clamp-2 mb-3">{agent.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <span className="text-[#F59E0B]">★</span>
                        {agent.rating > 0 ? agent.rating.toFixed(1) : "—"}
                      </span>
                      <span>{agent.usage_count.toLocaleString()} uses</span>
                      <span className="px-1.5 py-0.5 bg-[#1A2332] rounded text-[#A3A3A3]">
                        {agent.category}
                      </span>
                    </div>
                  </Link>

                  <Link
                    href={`/agent/${agent.id}`}
                    className="mt-4 block w-full text-center px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md text-xs font-medium text-white transition-colors"
                  >
                    Use Agent →
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
    </div>
  );
}
