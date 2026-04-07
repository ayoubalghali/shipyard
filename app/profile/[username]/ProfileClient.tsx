"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AgentCard from "@/components/agents/AgentCard";
import { Agent } from "@/lib/types";

interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  total_earned: number;
  joined: string;
  agentCount: number;
  totalUses: number;
  averageRating: number;
}

interface ProfileData {
  creator: Creator;
  agents: Agent[];
}

interface ProfileClientProps {
  initialData: { creator: unknown; agents: unknown[] } | null;
  username: string;
}

export default function ProfileClient({ initialData, username }: ProfileClientProps) {
  const [data, setData]       = useState<ProfileData | null>(initialData as ProfileData | null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      fetch(`/api/creators/${encodeURIComponent(username)}`)
        .then((r) => {
          if (!r.ok) throw new Error("Creator not found");
          return r.json() as Promise<ProfileData>;
        })
        .then(setData)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [username, initialData]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="flex animate-pulse flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-[#0A0E27]" />
            <div className="flex flex-col gap-2">
              <div className="h-6 w-40 rounded bg-[#0A0E27]" />
              <div className="h-4 w-64 rounded bg-[#0A0E27]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-[8px] bg-[#0A0E27]" />)}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-52 rounded-[8px] bg-[#0A0E27]" />)}
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">👤</p>
          <p className="mt-3 text-lg font-medium text-white">Creator not found</p>
          <p className="mt-1 text-sm text-[#A3A3A3]">{error ?? "This creator doesn't exist."}</p>
          <Link href="/explore" className="mt-4 inline-block text-sm text-[#2563EB] hover:underline">
            Browse agents →
          </Link>
        </div>
      </main>
    );
  }

  const { creator, agents } = data;
  const joinYear = new Date(creator.joined).getFullYear();

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      {/* Creator header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start"
      >
        {/* Avatar */}
        <div className="shrink-0">
          {creator.avatar_url ? (
            <Image
              src={creator.avatar_url}
              alt={creator.name}
              width={80}
              height={80}
              className="rounded-full border-2 border-[#2A3A4E]"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-2xl font-bold text-white">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[28px] font-semibold leading-none text-white">{creator.name}</h1>
            {creator.is_verified && (
              <span title="Verified creator" aria-label="Verified">
                <svg className="h-5 w-5 text-[#2563EB]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          {creator.bio && (
            <p className="mt-2 max-w-lg text-sm text-[#A3A3A3]">{creator.bio}</p>
          )}
          <p className="mt-2 text-xs text-[#6B7280]">Member since {joinYear}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Agents", value: creator.agentCount.toString() },
          { label: "Total Uses", value: fmt(creator.totalUses) },
          { label: "Avg Rating", value: creator.averageRating > 0 ? `${creator.averageRating} ⭐` : "—" },
          { label: "Total Earned", value: creator.total_earned > 0 ? `$${creator.total_earned.toLocaleString()}` : "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4 text-center">
            <p className="text-xl font-semibold text-white">{stat.value}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agent grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Agents <span className="text-sm font-normal text-[#6B7280]">({agents.length})</span>
        </h2>

        {agents.length === 0 ? (
          <div className="rounded-[8px] border border-[#2A3A4E] py-16 text-center">
            <p className="text-3xl">🤖</p>
            <p className="mt-2 text-sm text-[#6B7280]">No public agents yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {(agents as Agent[]).map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
