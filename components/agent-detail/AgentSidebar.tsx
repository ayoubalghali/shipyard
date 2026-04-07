"use client";

import Link from "next/link";
import { Agent, Creator } from "@/lib/types";
import { useState } from "react";

interface AgentSidebarProps {
  agent: Agent;
  creator: Creator;
  related: Agent[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "text-[#F59E0B]" : "text-[#2A3A4E]"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
      <span className="text-xs text-[#6B7280]">(128 reviews)</span>
    </div>
  );
}

export default function AgentSidebar({ agent, creator, related }: AgentSidebarProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleSave = () => {
    setSaved((prev) => !prev);
  };

  return (
    <aside className="flex flex-col gap-6" aria-label="Agent information">
      {/* Agent icon + name */}
      <div>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#2563EB] to-[#00D9FF] text-2xl font-bold text-white shadow-lg">
          {agent.name.charAt(0)}
        </div>
        <h1 className="text-[24px] font-semibold leading-[1.3] text-white">{agent.name}</h1>
        <Link
          href={`/creator/${creator.id}`}
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#00D9FF] transition-colors hover:underline"
        >
          @{creator.name.toLowerCase().replace(" ", "_")}
          {creator.isVerified && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB]"
              title="Verified Creator"
              aria-label="Verified creator"
            >
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4">
        <StarRating rating={agent.rating} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Used</p>
            <p className="mt-0.5 text-base font-semibold text-white">
              {agent.usageCount.toLocaleString()}×
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Category</p>
            <span className="mt-0.5 inline-block rounded-full border border-[#2A3A4E] bg-[#1A2332] px-2.5 py-0.5 text-xs text-[#A3A3A3]">
              {agent.category}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          About
        </h2>
        <p className="text-sm leading-relaxed text-[#A3A3A3]">{agent.description}</p>
        {agent.tags && agent.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#2A3A4E] bg-[#0A0E27] px-2.5 py-0.5 text-[11px] text-[#6B7280]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border border-[#2A3A4E] px-3 py-2 text-sm text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27]"
          aria-label="Copy link to share"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied ? "Copied!" : "Share"}
        </button>
        <button
          onClick={handleSave}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[6px] border px-3 py-2 text-sm transition-all ${
            saved
              ? "border-[#2563EB] bg-[#0A0E27] text-[#00D9FF]"
              : "border-[#2A3A4E] text-[#A3A3A3] hover:border-[#2563EB] hover:text-[#00D9FF]"
          }`}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save to list"}
        >
          <svg className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Related Agents */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Related Agents
          </h2>
          <div className="flex flex-col gap-2">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/agent/${rel.id}`}
                className="flex items-center gap-3 rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-3 transition-all hover:border-[#2563EB]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1A2332] text-sm font-semibold text-[#00D9FF]">
                  {rel.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{rel.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg className="h-3 w-3 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[11px] text-[#6B7280]">{rel.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
