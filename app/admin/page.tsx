"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalExecutions: number;
  totalEarningsUsd: string;
}

interface TopAgent {
  id: string;
  name: string;
  category: string;
  usage_count: number;
  rating: number;
  creator: { name: string };
}

interface RecentExecution {
  id: string;
  status: string;
  created_at: string;
  execution_time_ms: number;
  agent: { name: string; category: string };
  user: { name: string; email: string };
}

const STAT_CARDS: Array<{
  key: keyof Stats;
  label: string;
  icon: string;
  color: string;
  prefix?: string;
}> = [
  { key: "totalUsers", label: "Total Users", icon: "👥", color: "text-[#00D9FF]" },
  { key: "totalAgents", label: "Published Agents", icon: "🤖", color: "text-[#2563EB]" },
  { key: "totalExecutions", label: "Total Executions", icon: "⚡", color: "text-[#10B981]" },
  { key: "totalEarningsUsd", label: "Platform Earnings", icon: "💰", color: "text-[#F59E0B]", prefix: "$" },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [topAgents, setTopAgents] = useState<TopAgent[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch("/api/admin/stats")
      .then(async (res) => {
        if (res.status === 403) { setForbidden(true); return; }
        const data = await res.json() as { stats: Stats; topAgents: TopAgent[]; recentExecutions: RecentExecution[] };
        setStats(data.stats);
        setTopAgents(data.topAgents ?? []);
        setRecentExecutions(data.recentExecutions ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-2xl font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-[#6B7280] text-sm">You don&apos;t have admin privileges.</p>
          <Link href="/" className="mt-6 text-[#2563EB] hover:text-[#00D9FF] text-sm transition-colors">← Back to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-sm text-[#6B7280] mt-1">Platform management & oversight</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/agents"
              className="px-4 py-2 bg-[#1A2332] border border-[#2A3A4E] hover:border-[#2563EB] rounded-lg text-sm text-[#A3A3A3] hover:text-white transition-colors"
            >
              Manage Agents
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-[#1A2332] border border-[#2A3A4E] hover:border-[#2563EB] rounded-lg text-sm text-[#A3A3A3] hover:text-white transition-colors"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {STAT_CARDS.map(({ key, label, icon, color, prefix }) => (
              <div key={key} className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">{label}</span>
                </div>
                <p className={`text-2xl font-bold ${color}`}>
                  {prefix ?? ""}{stats[key as keyof Stats]}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Agents */}
          <section aria-labelledby="top-agents-heading">
            <h2 id="top-agents-heading" className="text-sm font-medium text-[#6B7280] uppercase tracking-wider mb-4">
              Top Agents by Usage
            </h2>
            <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl overflow-hidden">
              {topAgents.length === 0 ? (
                <p className="text-center py-10 text-[#6B7280] text-sm">No agents yet.</p>
              ) : (
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-[#2A3A4E]">
                      <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium">Agent</th>
                      <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium">Uses</th>
                      <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAgents.map((agent, i) => (
                      <tr key={agent.id} className={i < topAgents.length - 1 ? "border-b border-[#2A3A4E]/50" : ""}>
                        <td className="px-4 py-3">
                          <Link href={`/agent/${agent.id}`} className="text-white hover:text-[#00D9FF] transition-colors font-medium">
                            {agent.name}
                          </Link>
                          <p className="text-xs text-[#6B7280]">{agent.creator?.name}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-[#A3A3A3]">
                          {(agent.usage_count ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-[#A3A3A3]">
                          {(agent.rating ?? 0).toFixed(1)} ★
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Recent Executions */}
          <section aria-labelledby="recent-exec-heading">
            <h2 id="recent-exec-heading" className="text-sm font-medium text-[#6B7280] uppercase tracking-wider mb-4">
              Recent Executions
            </h2>
            <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl overflow-hidden">
              {recentExecutions.length === 0 ? (
                <p className="text-center py-10 text-[#6B7280] text-sm">No executions yet.</p>
              ) : (
                <div className="divide-y divide-[#2A3A4E]/50">
                  {recentExecutions.map((exec) => (
                    <div key={exec.id} className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        exec.status === "success" ? "bg-[#10B981]" :
                        exec.status === "error" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{exec.agent?.name}</p>
                        <p className="text-xs text-[#6B7280] truncate">{exec.user?.email}</p>
                      </div>
                      <span className="text-xs text-[#4B5563] flex-shrink-0">
                        {exec.execution_time_ms}ms
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
