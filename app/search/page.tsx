"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/agents/FavoriteButton";
import StarRating from "@/components/reviews/StarRating";

interface SearchAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usage_count: number;
  status: string;
  creator: { id: string; name: string; avatar_url: string | null; image?: string | null };
}

interface SearchCreator {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  _count: { agents: number };
}

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "most_used", label: "Most Used" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

const CATEGORIES = ["All", "Workflows", "Code", "Visual", "Apps", "Writing", "Data", "Research", "Other"];

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const initialType = (params.get("type") ?? "agents") as "agents" | "creators";

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState<"agents" | "creators">(initialType);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("trending");
  const [results, setResults] = useState<SearchAgent[] | SearchCreator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (query: string, t: string, cat: string, s: string) => {
    if (!query.trim()) { setResults([]); setTotal(0); return; }
    setLoading(true);
    try {
      const u = new URL("/api/search", window.location.origin);
      u.searchParams.set("q", query);
      u.searchParams.set("type", t);
      u.searchParams.set("limit", "40");
      if (cat !== "All" && t === "agents") u.searchParams.set("category", cat);
      if (t === "agents") u.searchParams.set("sort", s);
      const res = await fetch(u.toString());
      const data = await res.json() as { results: SearchAgent[] | SearchCreator[]; total: number };
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on filter change
  useEffect(() => {
    const id = setTimeout(() => {
      runSearch(q, type, category, sort);
      // Update URL
      const u = new URL(window.location.href);
      if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
      u.searchParams.set("type", type);
      router.replace(u.pathname + u.search, { scroll: false });
    }, 300);
    return () => clearTimeout(id);
  }, [q, type, category, sort, runSearch, router]);

  const agentResults = type === "agents" ? (results as SearchAgent[]) : [];
  const creatorResults = type === "creators" ? (results as SearchCreator[]) : [];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-5xl mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents, creators, categories…"
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-[#0A0E27] border border-[#2A3A4E] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/20 text-base"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 mb-5">
          {(["agents", "creators"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 text-sm rounded-md capitalize transition-colors ${
                type === t
                  ? "bg-[#2563EB] text-white"
                  : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Agent filters */}
        {type === "agents" && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors border ${
                    category === c
                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                      : "border-[#2A3A4E] text-[#A3A3A3] hover:border-[#2563EB] hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#0A0E27] border border-[#2A3A4E] rounded-md px-3 py-1.5 text-xs text-[#A3A3A3] focus:outline-none focus:border-[#00D9FF]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Result count */}
        {q && !loading && (
          <p className="text-sm text-[#6B7280] mb-5">
            {total} result{total !== 1 ? "s" : ""} for{" "}
            <span className="text-white">&quot;{q}&quot;</span>
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && q && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <h2 className="text-lg font-semibold text-white mb-1">No results found</h2>
            <p className="text-sm text-[#6B7280]">Try a different search term or remove filters.</p>
          </div>
        )}

        {!q && !loading && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✨</p>
            <h2 className="text-lg font-semibold text-white mb-1">Search Shipyard</h2>
            <p className="text-sm text-[#6B7280]">Find the perfect agent for your workflow.</p>
          </div>
        )}

        {/* Agent results */}
        {!loading && agentResults.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentResults.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4 flex flex-col hover:border-[#2563EB] transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#1A2332] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {agent.creator.image ?? agent.creator.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(agent.creator.image ?? agent.creator.avatar_url)!} alt={agent.creator.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-[#A3A3A3]">{agent.creator.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B7280] truncate">{agent.creator.name}</span>
                    </div>
                    <FavoriteButton agentId={agent.id} size="sm" />
                  </div>

                  <Link href={`/agent/${agent.id}`} className="flex-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#00D9FF] transition-colors line-clamp-1 mb-1">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-[#A3A3A3] line-clamp-2 mb-3">{agent.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                      <StarRating value={Math.round(agent.rating)} readonly size="sm" />
                      <span>{agent.usage_count.toLocaleString()} uses</span>
                    </div>
                  </Link>

                  <Link
                    href={`/agent/${agent.id}`}
                    className="mt-3 block w-full text-center px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md text-xs font-medium text-white transition-colors"
                  >
                    Use Agent →
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Creator results */}
        {!loading && creatorResults.length > 0 && (
          <div className="space-y-3">
            {creatorResults.map((creator, idx) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  href={`/profile/${creator.name.toLowerCase().replace(/\s+/g, "_")}`}
                  className="flex items-center gap-4 bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4 hover:border-[#2563EB] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1A2332] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {creator.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-[#A3A3A3]">{creator.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{creator.name}</span>
                      {creator.is_verified && (
                        <svg className="w-4 h-4 text-[#2563EB]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    {creator.bio && <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">{creator.bio}</p>}
                    <p className="text-xs text-[#4B5563] mt-1">{creator._count.agents} agent{creator._count.agents !== 1 ? "s" : ""}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
