"use client";

import { useRef } from "react";
import Link from "next/link";
import { TRENDING_AGENTS } from "@/lib/mockData";

function formatUsageCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export default function TrendingCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.3] text-white">
              Trending This Week
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">Most used agents right now</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A3A4E] bg-[#0A0E27] text-[#A3A3A3] transition-all hover:border-[#2563EB] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A3A4E] bg-[#0A0E27] text-[#A3A3A3] transition-all hover:border-[#2563EB] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
          role="list"
          aria-label="Trending agents carousel"
        >
          {TRENDING_AGENTS.map((agent, index) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.id}`}
              role="listitem"
              className="group flex w-[280px] shrink-0 flex-col rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
              aria-label={`${agent.name} — trending #${index + 1}`}
            >
              {/* Rank badge */}
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A2332] text-xs font-semibold text-[#00D9FF]">
                  {index + 1}
                </span>
                <span className="rounded-full border border-[#2A3A4E] bg-[#1A2332] px-2 py-0.5 text-[11px] text-[#6B7280]">
                  {agent.category}
                </span>
              </div>

              {/* Agent name */}
              <h3 className="text-[15px] font-semibold leading-snug text-white group-hover:text-[#00D9FF] transition-colors duration-150">
                {agent.name}
              </h3>

              {/* Description */}
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[#A3A3A3] line-clamp-2">
                {agent.description}
              </p>

              {/* Stats */}
              <div className="mt-3 flex items-center gap-3 text-[12px]">
                <div className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[#A3A3A3]">{agent.rating.toFixed(1)}</span>
                </div>
                <span className="text-[#4B5563]">·</span>
                <span className="text-[#A3A3A3]">{formatUsageCount(agent.usageCount)} uses</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
