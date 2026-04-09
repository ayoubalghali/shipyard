"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import UserMenu from "@/components/auth/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useAgentStore();
  const router = useRouter();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#2A3A4E] bg-[#000000]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition-opacity duration-150 hover:opacity-80"
            aria-label="Shipyard Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 14L9 4L16 14H2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="14" r="2" fill="#00D9FF" />
              </svg>
            </div>
            <span className="text-[18px] font-semibold leading-none tracking-tight text-white">
              Shipyard
            </span>
          </Link>

          {/* Search bar — centered, hidden on mobile */}
          <form onSubmit={handleSearchSubmit} className="mx-4 hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search agents"
                className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] py-2 pl-10 pr-4 text-sm text-white placeholder-[#6B7280] transition-all duration-150 focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-white"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/explore"
                className="rounded-[6px] px-3 py-2 text-sm text-[#A3A3A3] transition-colors hover:text-white"
              >
                Explore
              </Link>
              <Link
                href="/favorites"
                className="rounded-[6px] px-3 py-2 text-sm text-[#A3A3A3] transition-colors hover:text-white"
              >
                Favorites
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-[6px] px-3 py-2 text-sm text-[#A3A3A3] transition-colors hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/create"
                className="rounded-[6px] bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
              >
                Create Agent
              </Link>
              <NotificationBell />
              <UserMenu />
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#2A3A4E] text-[#A3A3A3] transition-colors hover:border-[#2563EB] hover:text-white md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? "Close" : "Menu"}</span>
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search agents"
              className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] py-2 pl-10 pr-4 text-sm text-white placeholder-[#6B7280] transition-all duration-150 focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="border-t border-[#2A3A4E] bg-[#000000] px-4 py-4 md:hidden"
          >
            <nav className="flex flex-col gap-3">
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#A3A3A3] hover:text-white">Explore</Link>
              <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#A3A3A3] hover:text-white">Favorites</Link>
              <Link
                href="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-[6px] bg-[#2563EB] px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:bg-[#1D4ED8]"
              >
                Create Agent
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-[6px] border border-[#2A3A4E] px-4 py-2.5 text-center text-sm font-medium text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27]"
              >
                Sign In
              </Link>
              <div className="pt-2 border-t border-[#2A3A4E]">
                <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#A3A3A3] hover:text-white">Explore Agents</Link>
                <Link href="/creator/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#A3A3A3] hover:text-white">Creator Dashboard</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
