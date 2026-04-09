"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface AgentEntry {
  id: string;
  name: string;
  category: string;
  usage_count: number;
  rating: number;
  is_featured: boolean;
  creator: { id: string; name: string; avatar_url: string | null; is_verified: boolean };
  _count: { executions: number; reviews: number };
}

interface CreatorEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  total_earned: number;
  executions: number;
  _count: { agents: number };
}

const PERIODS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }) {
  if (src) return <Image src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />;
  return (
    <div
      className="rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"agents" | "creators">("agents");
  const [period, setPeriod] = useState("all");
  const [entries, setEntries] = useState<(AgentEntry | CreatorEntry)[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/leaderboard?type=${tab}&period=${period}&limit=25`);
    const data = await res.json() as { entries: (AgentEntry | CreatorEntry)[] };
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [tab, period]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-[#6B7280] text-sm">Top agents and creators on Shipyard</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center justify-between">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-[#0A0E27] border border-[#2A3A4E] rounded-xl p-1">
            {(["agents", "creators"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  tab === t ? "bg-[#2563EB] text-white" : "text-[#6B7280] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Period pills */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p.value
                    ? "bg-[#1A2332] border border-[#2563EB] text-white"
                    : "border border-[#2A3A4E] text-[#6B7280] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 text-[#6B7280]">No data yet for this period.</div>
        ) : tab === "agents" ? (
          <div className="space-y-2">
            {(entries as AgentEntry[]).map((agent, i) => (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                className="flex items-center gap-4 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] p-4 hover:border-[#2563EB] transition-colors group"
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{MEDAL[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-[#4B5563]">#{i + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white group-hover:text-[#00D9FF] transition-colors truncate">
                      {agent.name}
                    </p>
                    {agent.is_featured && <span className="text-xs">⭐</span>}
                    <span className="text-[10px] border border-[#2A3A4E] text-[#6B7280] rounded px-1.5 py-0.5">
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5 truncate">by {agent.creator?.name}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 flex-shrink-0 text-right">
                  <div>
                    <p className="text-sm font-bold text-[#00D9FF]">{(agent.usage_count ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-[#4B5563]">runs</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#F59E0B]">{(agent.rating ?? 0).toFixed(1)}</p>
                    <p className="text-[10px] text-[#4B5563]">rating</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(entries as CreatorEntry[]).map((creator, i) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-4 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] p-4 hover:border-[#2563EB] transition-colors group"
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{MEDAL[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-[#4B5563]">#{i + 1}</span>
                  )}
                </div>

                <Avatar src={creator.avatar_url} name={creator.name} size={36} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white group-hover:text-[#00D9FF] transition-colors truncate">
                      {creator.name}
                    </p>
                    {creator.is_verified && (
                      <svg className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280]">{creator._count?.agents ?? 0} agents</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 flex-shrink-0 text-right">
                  <div>
                    <p className="text-sm font-bold text-[#10B981]">${(creator.total_earned ?? 0).toFixed(0)}</p>
                    <p className="text-[10px] text-[#4B5563]">earned</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#00D9FF]">{(creator.executions ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-[#4B5563]">runs</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
