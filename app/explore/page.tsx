"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgentCard from "@/components/agents/AgentCard";
import { Agent } from "@/lib/types";
import { CATEGORIES } from "@/lib/mockData";

type SortOption = "trending" | "most_used" | "highest_rated" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "trending",      label: "Trending" },
  { value: "most_used",     label: "Most Used" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "newest",        label: "Newest" },
];

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset]           = useState(0);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("");
  const [sort, setSort]               = useState<SortOption>("trending");
  const searchRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAgents = useCallback(
    async (opts: { append?: boolean; searchQ?: string; cat?: string; srt?: SortOption; off?: number } = {}) => {
      const q   = opts.searchQ   ?? search;
      const cat = opts.cat       ?? category;
      const srt = opts.srt       ?? sort;
      const off = opts.off       ?? 0;
      const appending = opts.append ?? false;

      if (!appending) setLoading(true);
      else            setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: off.toString(),
          sort: srt,
          ...(q   ? { search: q }   : {}),
          ...(cat ? { category: cat } : {}),
        });
        const res  = await fetch(`/api/agents?${params}`);
        const data = (await res.json()) as { agents: Agent[]; total: number };
        setAgents((prev) => appending ? [...prev, ...data.agents] : data.agents);
        setTotal(data.total);
        setOffset(off + PAGE_SIZE);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, category, sort]
  );

  // Initial load
  useEffect(() => { void fetchAgents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setOffset(0);
      void fetchAgents({ searchQ: v, off: 0 });
    }, 350);
  };

  const handleCategory = (cat: string) => {
    const next = cat === category ? "" : cat;
    setCategory(next);
    setOffset(0);
    void fetchAgents({ cat: next, off: 0 });
  };

  const handleSort = (srt: SortOption) => {
    setSort(srt);
    setOffset(0);
    void fetchAgents({ srt, off: 0 });
  };

  const loadMore = () => fetchAgents({ append: true, off: offset });

  const hasMore = offset < total;

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero */}
      <section className="border-b border-[#2A3A4E] bg-gradient-to-b from-[#0A0E27] to-black px-4 py-12 text-center sm:px-8">
        <h1 className="text-[36px] font-semibold leading-[1.2] text-white sm:text-[48px]">
          Explore AI Agents
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-[#A3A3A3]">
          Discover {total > 0 ? total.toLocaleString() : "hundreds of"} agents built by the community. Run them
          instantly, no setup required.
        </p>

        {/* Search */}
        <div className="mx-auto mt-6 max-w-lg">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search agents by name, category, or tag…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search agents"
              className="w-full rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] py-3 pl-12 pr-4 text-sm text-white placeholder-[#6B7280] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
                aria-label="Clear"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Filters row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategory("")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                category === ""
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#2A3A4E] text-[#A3A3A3] hover:border-[#2563EB]/50 hover:text-white"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.name.toLowerCase())}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  category === cat.name.toLowerCase()
                    ? "bg-[#2563EB] text-white"
                    : "border border-[#2A3A4E] text-[#A3A3A3] hover:border-[#2563EB]/50 hover:text-white"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortOption)}
            className="rounded-[6px] border border-[#2A3A4E] bg-[#0A0E27] px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            aria-label="Sort agents"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mb-5 text-xs text-[#6B7280]">
            {total.toLocaleString()} agent{total !== 1 ? "s" : ""}
            {search ? ` matching "${search}"` : ""}
            {category ? ` in ${category}` : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-[8px] bg-[#0A0E27]" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-medium text-white">No agents found</p>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Try a different search term or category
            </p>
            <button
              onClick={() => { setSearch(""); setCategory(""); void fetchAgents({ searchQ: "", cat: "", off: 0 }); }}
              className="mt-4 text-sm text-[#2563EB] hover:underline"
            >
              Clear filters →
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${search}-${category}-${sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {agents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load more */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-[6px] border border-[#2A3A4E] px-6 py-2.5 text-sm font-medium text-[#A3A3A3] transition-all hover:border-[#2563EB] hover:text-white disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading…
                    </span>
                  ) : (
                    `Load more  (${total - offset} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
