"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentCard from "@/components/agents/AgentCard";
import { useAgentStore } from "@/store/agentStore";
import { CATEGORIES } from "@/lib/mockData";
import { SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "most_used", label: "Most Used" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

const PAGE_SIZE = 6;

export default function BrowseAgents() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    filteredAgents,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
  } = useAgentStore();

  const visibleAgents = filteredAgents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAgents.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const isFiltered = !!selectedCategory || !!searchQuery;

  return (
    <section id="browse" className="px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.3] text-white">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Agents`
                : "Browse All Agents"}
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort agents"
                className="appearance-none rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] py-2 pl-3 pr-8 text-sm text-white transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0A0E27]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-expanded={filterOpen}
              aria-label="Toggle category filter"
              className={`flex items-center gap-2 rounded-[6px] border px-3 py-2 text-sm transition-all duration-150 sm:hidden ${
                selectedCategory
                  ? "border-[#2563EB] bg-[#0A0E27] text-[#00D9FF]"
                  : "border-[#2A3A4E] bg-[#1A2332] text-[#A3A3A3] hover:border-[#2563EB] hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter
              {selectedCategory && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] text-white">
                  1
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar filter */}
          <aside className="hidden w-48 shrink-0 sm:block" aria-label="Category filters">
            <div className="sticky top-24">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Categories
              </h3>
              <nav>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`mb-1 w-full rounded-[6px] px-3 py-2 text-left text-sm transition-all duration-150 ${
                    !selectedCategory
                      ? "bg-[#0A0E27] text-[#00D9FF] font-medium"
                      : "text-[#A3A3A3] hover:bg-[#0A0E27] hover:text-white"
                  }`}
                  aria-current={!selectedCategory ? "true" : undefined}
                >
                  All Agents
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                    }
                    className={`mb-1 flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left text-sm transition-all duration-150 ${
                      selectedCategory === cat.id
                        ? "bg-[#0A0E27] text-[#00D9FF] font-medium"
                        : "text-[#A3A3A3] hover:bg-[#0A0E27] hover:text-white"
                    }`}
                    aria-pressed={selectedCategory === cat.id}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#4B5563]">{cat.agentCount}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile filter modal */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 sm:hidden"
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setFilterOpen(false)}
                  aria-hidden="true"
                />
                {/* Drawer */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 rounded-t-[12px] border-t border-[#2A3A4E] bg-[#0A0E27] p-6"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Category filter"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Filter by Category</h3>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="text-[#6B7280] hover:text-white"
                      aria-label="Close filter"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedCategory(null); setFilterOpen(false); }}
                      className={`rounded-[6px] border px-3 py-2 text-sm transition-all ${
                        !selectedCategory ? "border-[#2563EB] bg-[#1A2332] text-[#00D9FF]" : "border-[#2A3A4E] text-[#A3A3A3]"
                      }`}
                    >
                      All Agents
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); setFilterOpen(false); }}
                        className={`rounded-[6px] border px-3 py-2 text-sm transition-all text-left ${
                          selectedCategory === cat.id
                            ? "border-[#2563EB] bg-[#1A2332] text-[#00D9FF]"
                            : "border-[#2A3A4E] text-[#A3A3A3]"
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent grid */}
          <div className="flex-1 min-w-0">
            {filteredAgents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 text-5xl" aria-hidden="true">🔍</div>
                <h3 className="text-lg font-semibold text-white">No agents found</h3>
                <p className="mt-2 text-sm text-[#A3A3A3]">
                  Try adjusting your search or filter
                </p>
                {isFiltered && (
                  <button
                    onClick={() => { setSelectedCategory(null); useAgentStore.getState().setSearchQuery(""); }}
                    className="mt-4 rounded-[6px] border border-[#2A3A4E] px-4 py-2 text-sm text-[#00D9FF] transition-all hover:border-[#2563EB]"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {visibleAgents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.15, delay: index < PAGE_SIZE ? index * 0.04 : 0 }}
                        className="animate-gpu"
                      >
                        <AgentCard agent={agent} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="rounded-[6px] border border-[#2A3A4E] px-6 py-2.5 text-sm font-medium text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27]"
                    >
                      Load more ({filteredAgents.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
