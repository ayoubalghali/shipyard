"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  onUseClick?: (agent: Agent) => void;
}

function formatUsageCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <svg
        className="h-3.5 w-3.5 text-[#F59E0B]"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-[12px] text-[#A3A3A3]">{rating.toFixed(1)}</span>
    </span>
  );
}

function CreatorAvatar({ initials, isVerified }: { initials: string; isVerified: boolean }) {
  return (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A3A4E] text-xs font-semibold text-[#00D9FF]">
        {initials}
      </div>
      {isVerified && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2563EB]"
          title="Verified Creator"
          aria-label="Verified creator"
        >
          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function AgentCard({ agent, onUseClick }: AgentCardProps) {
  const handleUseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onUseClick?.(agent);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="animate-gpu"
    >
      <Link
        href={`/agent/${agent.id}`}
        className="group flex h-full flex-col rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_16px_rgba(0,217,255,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`Use ${agent.name} agent by ${agent.creator.name}`}
      >
        {/* Creator row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <CreatorAvatar
              initials={agent.creator.avatar}
              isVerified={agent.creator.isVerified}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {agent.name}
              </p>
              <p className="truncate text-[12px] text-[#6B7280]">
                @{agent.creator.name.toLowerCase().replace(" ", "_")}
              </p>
            </div>
          </div>
          <span className="ml-2 shrink-0 rounded-full border border-[#2A3A4E] bg-[#1A2332] px-2 py-0.5 text-[11px] text-[#6B7280]">
            {agent.category}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3">
          <StarRating rating={agent.rating} />
          <span className="text-[#4B5563]">·</span>
          <span className="text-[12px] text-[#A3A3A3]">
            Used {formatUsageCount(agent.usageCount)}×
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#A3A3A3] line-clamp-2">
          {agent.description}
        </p>

        {/* CTA button */}
        <button
          onClick={handleUseClick}
          className="mt-4 w-full rounded-[6px] bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#1D4ED8] active:bg-[#1E40AF] group-hover:bg-[#1D4ED8]"
          aria-label={`Use ${agent.name}`}
        >
          Use Agent →
        </button>
      </Link>
    </motion.div>
  );
}
