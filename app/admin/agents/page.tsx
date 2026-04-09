"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface AdminAgent {
  id: string;
  name: string;
  category: string;
  status: string;
  is_public: boolean;
  is_featured: boolean;
  usage_count: number;
  rating: number;
  created_at: string;
  creator: { id: string; name: string; email: string };
  _count: { executions: number; reviews: number; favorites: number };
}

const STATUS_OPTIONS = ["all", "published", "draft", "archived"];

export default function AdminAgentsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); }
  }, [status, router]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    const res = await fetch(`/api/admin/agents${params}`);
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json() as { agents: AdminAgent[]; total: number };
    setAgents(data.agents ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    if (status === "authenticated") fetchAgents();
  }, [status, fetchAgents]);

  const updateAgent = async (id: string, patch: Partial<AdminAgent>) => {
    setUpdating(id);
    const res = await fetch("/api/admin/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    }
    setUpdating(null);
  };

  if (forbidden) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Access Denied</h1>
        <Link href="/admin" className="mt-4 text-[#2563EB] text-sm">← Admin Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-[#6B7280] hover:text-white text-sm transition-colors">Admin</Link>
              <span className="text-[#6B7280]">/</span>
              <span className="text-white text-sm">Agents</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">Manage Agents</h1>
            <p className="text-sm text-[#6B7280] mt-1">{total} total agents</p>
          </div>
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filterStatus === s
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#1A2332] border border-[#2A3A4E] text-[#A3A3A3] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-24 text-[#6B7280]">No agents found.</div>
        ) : (
          <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-[#2A3A4E]">
                    <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium">Agent</th>
                    <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium hidden sm:table-cell">Creator</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium">Status</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium">Featured</th>
                    <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium hidden md:table-cell">Uses</th>
                    <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3A4E]/50">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-[#0D1535] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/agent/${agent.id}`} className="text-white hover:text-[#00D9FF] font-medium transition-colors">
                          {agent.name}
                        </Link>
                        <p className="text-xs text-[#6B7280]">{agent.category}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-[#A3A3A3]">{agent.creator?.name}</p>
                        <p className="text-xs text-[#6B7280]">{agent.creator?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === "published" ? "bg-[#10B981]/20 text-[#10B981]" :
                          agent.status === "draft" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                          "bg-[#EF4444]/20 text-[#EF4444]"
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateAgent(agent.id, { is_featured: !agent.is_featured })}
                          disabled={updating === agent.id}
                          aria-label={agent.is_featured ? "Remove from featured" : "Mark as featured"}
                          className={`text-lg transition-opacity ${updating === agent.id ? "opacity-40" : "hover:opacity-80"}`}
                        >
                          {agent.is_featured ? "⭐" : "☆"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3] hidden md:table-cell">
                        {(agent.usage_count ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {agent.status !== "published" && (
                            <button
                              onClick={() => updateAgent(agent.id, { status: "published" })}
                              disabled={updating === agent.id}
                              className="text-xs text-[#10B981] hover:text-white transition-colors disabled:opacity-40"
                            >
                              Publish
                            </button>
                          )}
                          {agent.status === "published" && (
                            <button
                              onClick={() => updateAgent(agent.id, { status: "archived" })}
                              disabled={updating === agent.id}
                              className="text-xs text-[#EF4444] hover:text-white transition-colors disabled:opacity-40"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
